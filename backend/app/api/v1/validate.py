"""
Validation API Endpoint
Main endpoint for validating AI responses
"""
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from app.services.detection import detect_hallucinations
from app.utils.supabase_client import get_supabase_client
from app.utils.auth import validate_api_key
import logging
from datetime import datetime
import uuid

logger = logging.getLogger(__name__)

router = APIRouter()

class ValidationRequest(BaseModel):
    """Request model for validation endpoint"""
    query: str = Field(..., description="User's original query")
    ai_response: str = Field(..., description="AI system's response to validate")
    ai_model: str = Field(..., description="AI model identifier (e.g., 'gpt-4', 'claude-3')")
    organization_id: Optional[str] = Field(None, description="Organization ID (optional if using API key)")
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

class Citation(BaseModel):
    """Citation model"""
    url: str
    is_valid: bool
    http_status_code: Optional[int] = None
    error_message: Optional[str] = None

class ValidationResponse(BaseModel):
    """Response model for validation endpoint"""
    status: str  # approved, flagged, blocked
    validated_response: Optional[str] = None
    confidence_score: float
    violations: List[Violation]
    verification_results: List[VerificationResult]
    citations: List[Citation]
    claims: List[Dict[str, Any]]
    explanation: str
    interaction_id: Optional[str] = None

@router.post("/validate", response_model=ValidationResponse)
async def validate_ai_response(
    request: ValidationRequest,
    auth_data: dict = Depends(validate_api_key)
):
    """
    Validate an AI response for hallucinations, fake citations, and compliance issues
    
    - **query**: User's original question
    - **ai_response**: AI system's response to validate
    - **ai_model**: AI model identifier
    - **organization_id**: Will use from API key if not provided
    - **session_id**: Optional session identifier
    """
    try:
        # Get organization_id from auth or request
        organization_id = request.organization_id or auth_data.get('organization_id')
        
        if not organization_id:
            raise HTTPException(
                status_code=400,
                detail="organization_id is required (provide in request or via API key)"
            )
        
        logger.info(f"Validating AI response for organization {organization_id}")
        
        # Run detection pipeline
        detection_result = detect_hallucinations(
            query=request.query,
            ai_response=request.ai_response,
            organization_id=organization_id,
            ai_model=request.ai_model
        )
        
        # Save to database
        interaction_id = await save_detection_results(
            organization_id=organization_id,
            query=request.query,
            ai_response=request.ai_response,
            detection_result=detection_result,
            ai_model=request.ai_model,
            session_id=request.session_id
        )
        
        # Prepare response
        response = ValidationResponse(
            status=detection_result['status'],
            validated_response=request.ai_response if detection_result['status'] == 'approved' else None,
            confidence_score=detection_result['confidence_score'],
            violations=[Violation(**v) for v in detection_result.get('violations', [])],
            verification_results=[VerificationResult(**r) for r in detection_result.get('verification_results', [])],
            citations=[Citation(**c) for c in detection_result.get('citations', [])],
            claims=detection_result.get('claims', []),
            explanation=detection_result.get('explanation', ''),
            interaction_id=interaction_id
        )
        
        return response
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error validating AI response: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Error validating response: {str(e)}"
        )

async def save_detection_results(
    organization_id: str,
    query: str,
    ai_response: str,
    detection_result: Dict[str, Any],
    ai_model: str,
    session_id: Optional[str] = None
) -> str:
    """
    Save detection results to database
    Returns interaction_id
    """
    try:
        supabase = get_supabase_client()
        
        # Generate interaction ID
        interaction_id = str(uuid.uuid4())
        
        # Save main interaction
        interaction_data = {
            'id': interaction_id,
            'organization_id': organization_id,
            'user_query': query,
            'ai_response': ai_response,
            'validated_response': ai_response if detection_result['status'] == 'approved' else None,
            'status': detection_result['status'],
            'confidence_score': detection_result['confidence_score'],
            'ai_model': ai_model,
            'session_id': session_id,
            'timestamp': datetime.utcnow().isoformat()
        }
        
        result = supabase.table('ai_interactions').insert(interaction_data).execute()
        
        if not result.data:
            raise Exception("Failed to save interaction")
        
        # Save violations
        for violation in detection_result.get('violations', []):
            violation_data = {
                'interaction_id': interaction_id,
                'violation_type': violation['type'],
                'severity': violation['severity'],
                'description': violation['description'],
                'detected_at': datetime.utcnow().isoformat()
            }
            supabase.table('violations').insert(violation_data).execute()
        
        # Save verification results
        for verification in detection_result.get('verification_results', []):
            verification_data = {
                'interaction_id': interaction_id,
                'claim_text': verification['claim_text'],
                'verification_status': verification['verification_status'],
                'source': verification.get('source'),
                'confidence': verification.get('confidence', 0.0),
                'created_at': datetime.utcnow().isoformat()
            }
            supabase.table('verification_results').insert(verification_data).execute()
        
        # Save citations
        for citation in detection_result.get('citations', []):
            citation_data = {
                'interaction_id': interaction_id,
                'url': citation.get('url', ''),
                'is_valid': citation.get('is_valid', False),
                'content_match': None,  # Would be set after content comparison
                'http_status_code': citation.get('http_status_code'),
                'verified_at': datetime.utcnow().isoformat()
            }
            supabase.table('citations').insert(citation_data).execute()
        
        logger.info(f"Saved detection results for interaction {interaction_id}")
        return interaction_id
        
    except Exception as e:
        logger.error(f"Error saving detection results: {str(e)}")
        # Don't fail the request if saving fails
        return interaction_id if 'interaction_id' in locals() else ""

