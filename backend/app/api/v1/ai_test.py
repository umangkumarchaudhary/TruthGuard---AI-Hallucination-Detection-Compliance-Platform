"""
AI Testing API Endpoint
Generate AI responses using Gemini Pro and validate them with TruthGuard
"""
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from app.services.ai_generation import AIGenerationService
from app.services.company_context import CompanyContextService
from app.services.detection import detect_hallucinations
from app.services.correction import suggest_correction
from app.services.audit import AuditLogger
from app.services.explanation import generate_explanation
from app.utils.auth import validate_api_key
import logging

logger = logging.getLogger(__name__)

router = APIRouter()

class AITestRequest(BaseModel):
    """Request model for AI test endpoint"""
    company_id: str = Field(..., description="Company/Organization ID")
    user_query: str = Field(..., description="User's question/query")
    ai_model: str = Field("gemini-pro", description="AI model to use (default: gemini-pro)")
    session_id: Optional[str] = Field(None, description="Session ID for grouping related interactions")

class Violation(BaseModel):
    """Violation model"""
    type: str
    severity: str
    description: str

class VerificationResult(BaseModel):
    """Verification result model"""
    claim_text: str
    verification_status: str
    confidence: float
    source: Optional[str] = None
    details: Optional[str] = None
    url: Optional[str] = None

class Citation(BaseModel):
    """Citation model"""
    url: str
    is_valid: bool
    http_status_code: Optional[int] = None
    error_message: Optional[str] = None

class ConfidenceBreakdown(BaseModel):
    """Confidence score breakdown component"""
    score: float
    weight: float
    weighted_score: float
    label: str
    description: str
    details: Dict[str, Any]

class AITestResponse(BaseModel):
    """Response model for AI test endpoint"""
    ai_response: str
    validation_result: Dict[str, Any]
    company_context: Dict[str, Any]
    interaction_id: Optional[str] = None
    correction_suggested: bool = False
    corrected_response: Optional[str] = None
    changes_made: Optional[List[str]] = None

@router.post("/generate", response_model=AITestResponse)
async def generate_and_validate(
    request: AITestRequest,
    auth_data: dict = Depends(validate_api_key)
):
    """
    Generate AI response for a company and validate it with TruthGuard
    
    Flow:
    1. Load company context (policies, rules, products)
    2. Generate AI response using Gemini Pro
    3. Validate response with TruthGuard
    4. Generate corrections if needed
    5. Log interaction to audit trail
    6. Return combined results
    
    This endpoint is separate from /validate to preserve manual testing functionality.
    Users can choose: manual input (use /validate) or AI generation (use this endpoint).
    """
    try:
        # Get organization_id from auth or request
        organization_id = request.company_id or auth_data.get('organization_id')
        
        if not organization_id:
            raise HTTPException(
                status_code=400,
                detail="company_id is required"
            )
        
        logger.info(f"AI Test request for company {organization_id}: {request.user_query[:50]}...")
        
        # Step 1: Load company context
        logger.info("Loading company context...")
        context_service = CompanyContextService()
        company_context = await context_service.load_company_context(organization_id)
        
        if not company_context or company_context.get('company_name') == 'Unknown Company':
            raise HTTPException(
                status_code=404,
                detail=f"Company with ID {organization_id} not found"
            )
        
        # Step 2: Generate AI response using Gemini Pro
        logger.info("Generating AI response with Gemini Pro...")
        ai_service = AIGenerationService()
        
        if not ai_service.is_enabled():
            raise HTTPException(
                status_code=503,
                detail="AI generation not available - GEMINI_API_KEY not configured. Please set GEMINI_API_KEY in .env file."
            )
        
        generation_result = await ai_service.generate_company_response(
            company_name=company_context['company_name'],
            company_context=company_context,
            user_query=request.user_query,
            industry=company_context.get('industry')
        )
        
        if not generation_result.get('success'):
            error_msg = generation_result.get('error', 'Unknown error')
            logger.error(f"AI generation failed: {error_msg}")
            raise HTTPException(
                status_code=500,
                detail=f"AI generation failed: {error_msg}"
            )
        
        ai_response = generation_result['response']
        
        # Validate response is not empty or too short
        if not ai_response or len(ai_response.strip()) < 10:
            logger.error(f"❌ Generated response is too short or empty: '{ai_response}'")
            raise HTTPException(
                status_code=500,
                detail=f"AI generation returned incomplete response. Please try again."
            )
        
        logger.info(f"✅ Generated AI response ({len(ai_response)} chars)")
        logger.debug(f"Response preview: {ai_response[:200]}...")
        
        # Step 3: Validate with TruthGuard
        logger.info("Validating response with TruthGuard...")
        detection_result = await detect_hallucinations(
            query=request.user_query,
            ai_response=ai_response,
            organization_id=organization_id,
            ai_model=request.ai_model
        )
        
        # Step 4: Generate correction if needed
        corrected_response = None
        changes_made = None
        correction_suggested = False
        
        # Generate correction if there are violations (flagged or blocked)
        if detection_result.get('violations'):
            logger.info(f"Generating correction for {len(detection_result['violations'])} violation(s)...")
            correction = suggest_correction(  # Not async
                original_response=ai_response,
                violations=detection_result.get('violations', []),
                query=request.user_query
            )
            corrected_response = correction.get('corrected_response')
            changes_made = correction.get('changes_made', [])
            
            # Check if correction actually changed the response
            if corrected_response and corrected_response.strip() != ai_response.strip():
                correction_suggested = True
                logger.info(f"✅ Correction generated with {len(changes_made)} change(s)")
            else:
                # If correction didn't change anything, still mark as suggested but log warning
                correction_suggested = len(changes_made) > 0
                if not correction_suggested:
                    logger.warning("⚠️ Correction attempted but no changes were made")
                else:
                    logger.warning("⚠️ Correction made changes but response text is identical (may be formatting only)")
        
        # Step 5: Generate explanation
        explanation = generate_explanation(
            detection_result,
            request.user_query,
            ai_response
        )
        detection_result['explanation'] = explanation
        
        # Step 6: Determine validated_response
        # Set validated_response: use corrected version if available, otherwise use original if approved
        validated_response = None
        if corrected_response and corrected_response.strip() != ai_response.strip():
            # Use corrected response if it's different
            validated_response = corrected_response
        elif detection_result['status'] == 'approved':
            # If approved and no correction, use original
            validated_response = ai_response
        # If flagged/blocked and no correction, leave as None (needs manual review)
        
        # Step 7: Comprehensive audit logging
        logger.info("Logging interaction to audit trail...")
        interaction_id = await AuditLogger.log_interaction(
            organization_id=organization_id,
            query=request.user_query,
            ai_response=ai_response,
            validated_response=validated_response,
            status=detection_result['status'],
            confidence_score=detection_result['confidence_score'],
            ai_model=request.ai_model,
            session_id=request.session_id,
            detection_result=detection_result,
            explanation=explanation
        )
        
        # Step 8: Prepare response
        response = AITestResponse(
            ai_response=ai_response,
            validation_result={
                'status': detection_result['status'],
                'confidence_score': detection_result['confidence_score'],
                'violations': detection_result.get('violations', []),
                'verification_results': detection_result.get('verification_results', []),
                'citations': detection_result.get('citations', []),
                'claims': detection_result.get('claims', []),
                'explanation': explanation
            },
            company_context={
                'name': company_context['company_name'],
                'industry': company_context.get('industry', 'general'),
                'policies_count': len(company_context.get('policies', [])),
                'rules_count': len(company_context.get('compliance_rules', []))
            },
            interaction_id=interaction_id,
            correction_suggested=correction_suggested,
            corrected_response=corrected_response,
            changes_made=changes_made
        )
        
        logger.info(f"✅ AI test complete - Status: {detection_result['status']}, Confidence: {detection_result['confidence_score']:.0%}")
        
        return response
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in AI test endpoint: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=500,
            detail=f"Error: {str(e)}"
        )

@router.get("/companies")
async def get_companies(
    auth_data: dict = Depends(validate_api_key)
):
    """
    Get list of available companies for AI testing
    
    Returns list of companies with their IDs, names, and industries
    """
    try:
        context_service = CompanyContextService()
        companies = await context_service.get_company_list()
        
        return {
            'companies': companies,
            'total': len(companies)
        }
        
    except Exception as e:
        logger.error(f"Error getting company list: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Error: {str(e)}"
        )

@router.get("/status")
async def get_ai_status(
    auth_data: dict = Depends(validate_api_key)
):
    """
    Check if AI generation is available
    
    Returns status of Gemini Pro API configuration
    """
    try:
        ai_service = AIGenerationService()
        
        return {
            'enabled': ai_service.is_enabled(),
            'model': 'gemini-pro' if ai_service.is_enabled() else None,
            'message': 'AI generation available' if ai_service.is_enabled() else 'AI generation not available - GEMINI_API_KEY not configured'
        }
        
    except Exception as e:
        logger.error(f"Error checking AI status: {str(e)}")
        return {
            'enabled': False,
            'model': None,
            'message': f'Error: {str(e)}'
        }

