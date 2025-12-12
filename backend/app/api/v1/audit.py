"""
Audit Trail API Endpoints
Query and export audit logs for regulatory compliance
"""
from fastapi import APIRouter, HTTPException, Query, Depends
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime, timedelta
from app.utils.supabase_client import get_supabase_client
from app.utils.auth import validate_api_key
from app.services.audit import AuditLogger
from app.services.explanation import generate_detailed_explanation
import logging
import csv
import json
from io import StringIO

logger = logging.getLogger(__name__)

router = APIRouter()

class InteractionResponse(BaseModel):
    """Interaction response model"""
    id: str
    organization_id: str
    user_query: str
    ai_response: str
    validated_response: Optional[str]
    status: str
    confidence_score: float
    ai_model: Optional[str]
    session_id: Optional[str]
    timestamp: str
    violation_count: int = 0

class ViolationResponse(BaseModel):
    """Violation response model"""
    id: str
    interaction_id: str
    violation_type: str
    severity: str
    description: str
    rule_id: Optional[str]
    policy_id: Optional[str]
    detected_at: str

class AuditStatsResponse(BaseModel):
    """Audit statistics response"""
    total_interactions: int
    approved_count: int
    flagged_count: int
    blocked_count: int
    total_violations: int
    violations_by_type: Dict[str, int]
    violations_by_severity: Dict[str, int]
    avg_confidence_score: float
    interactions_by_model: Dict[str, int]
    date_range: Dict[str, str]

@router.get("/interactions", response_model=List[InteractionResponse])
async def get_interactions(
    organization_id: Optional[str] = Query(None, description="Filter by organization ID"),
    start_date: Optional[str] = Query(None, description="Start date (ISO format)"),
    end_date: Optional[str] = Query(None, description="End date (ISO format)"),
    status: Optional[str] = Query(None, description="Filter by status (approved, flagged, blocked)"),
    ai_model: Optional[str] = Query(None, description="Filter by AI model"),
    session_id: Optional[str] = Query(None, description="Filter by session ID"),
    limit: int = Query(100, ge=1, le=1000, description="Maximum number of results"),
    offset: int = Query(0, ge=0, description="Offset for pagination"),
    auth_data: dict = Depends(validate_api_key)
):
    """
    Get AI interactions with filtering and pagination
    
    Query Parameters:
    - organization_id: Filter by organization (uses API key org if not provided)
    - start_date: Start date filter (ISO format: 2024-01-01T00:00:00)
    - end_date: End date filter (ISO format)
    - status: approved, flagged, or blocked
    - ai_model: Filter by AI model name
    - session_id: Filter by session ID
    - limit: Results per page (1-1000, default 100)
    - offset: Pagination offset (default 0)
    """
    try:
        supabase = get_supabase_client()
        
        # Use organization_id from auth if not provided
        org_id = organization_id or auth_data.get('organization_id')
        if not org_id:
            raise HTTPException(status_code=400, detail="organization_id is required")
        
        # Build query
        query = supabase.table('ai_interactions').select('*')
        
        # Apply filters
        if org_id:
            query = query.eq('organization_id', org_id)
        if status:
            query = query.eq('status', status)
        if ai_model:
            query = query.eq('ai_model', ai_model)
        if session_id:
            query = query.eq('session_id', session_id)
        if start_date:
            query = query.gte('timestamp', start_date)
        if end_date:
            query = query.lte('timestamp', end_date)
        
        # Order by timestamp descending (newest first)
        query = query.order('timestamp', desc=True)
        
        # Apply pagination
        query = query.range(offset, offset + limit - 1)
        
        # Execute query
        result = query.execute()
        
        if not result.data:
            return []
        
        # Get violation counts for each interaction
        interactions = []
        for interaction in result.data:
            # Count violations
            violations_result = supabase.table('violations').select('id', count='exact').eq('interaction_id', interaction['id']).execute()
            violation_count = len(violations_result.data) if violations_result.data else 0
            
            interactions.append({
                **interaction,
                'violation_count': violation_count
            })
        
        return interactions
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching interactions: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error fetching interactions: {str(e)}")

@router.get("/interactions/{interaction_id}")
async def get_interaction_detail(interaction_id: str, auth_data: dict = Depends(validate_api_key)):
    """
    Get complete details for a specific interaction including full audit trail
    """
    try:
        # Get complete audit trail
        audit_trail = await AuditLogger.get_interaction_audit_trail(interaction_id)
        
        if not audit_trail:
            raise HTTPException(status_code=404, detail="Interaction not found")
        
        # Verify organization access
        org_id = auth_data.get('organization_id')
        if org_id and audit_trail['interaction'].get('organization_id') != org_id:
            raise HTTPException(status_code=403, detail="Access denied")
        
        # Generate detailed explanation
        interaction = audit_trail['interaction']
        detection_result = {
            'status': interaction.get('status', 'approved'),
            'confidence_score': interaction.get('confidence_score', 1.0),
            'violations': audit_trail['violations'],
            'verification_results': audit_trail['verification_results'],
            'citations': audit_trail['citations']
        }
        
        explanation = generate_detailed_explanation(
            detection_result,
            interaction.get('user_query', ''),
            interaction.get('ai_response', '')
        )
        
        return {
            'interaction': interaction,
            'violations': audit_trail['violations'],
            'verification_results': audit_trail['verification_results'],
            'citations': audit_trail['citations'],
            'explanation': explanation
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching interaction detail: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error fetching interaction: {str(e)}")

@router.get("/violations", response_model=List[ViolationResponse])
async def get_violations(
    organization_id: Optional[str] = Query(None),
    interaction_id: Optional[str] = Query(None),
    violation_type: Optional[str] = Query(None),
    severity: Optional[str] = Query(None),
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    limit: int = Query(100, ge=1, le=1000),
    offset: int = Query(0, ge=0),
    auth_data: dict = Depends(validate_api_key)
):
    """
    Get violations with filtering
    
    Query Parameters:
    - organization_id: Filter by organization
    - interaction_id: Filter by specific interaction
    - violation_type: Filter by type (hallucination, citation, compliance, policy)
    - severity: Filter by severity (low, medium, high, critical)
    - start_date: Start date filter
    - end_date: End date filter
    - limit: Results per page
    - offset: Pagination offset
    """
    try:
        supabase = get_supabase_client()
        
        org_id = organization_id or auth_data.get('organization_id')
        
        # Build query - need to join with interactions to filter by organization
        if interaction_id:
            query = supabase.table('violations').select('*').eq('interaction_id', interaction_id)
        else:
            # Get interaction IDs for organization first
            interactions_query = supabase.table('ai_interactions').select('id')
            if org_id:
                interactions_query = interactions_query.eq('organization_id', org_id)
            interactions_result = interactions_query.execute()
            interaction_ids = [i['id'] for i in (interactions_result.data or [])]
            
            if not interaction_ids:
                return []
            
            query = supabase.table('violations').select('*').in_('interaction_id', interaction_ids)
        
        # Apply filters
        if violation_type:
            query = query.eq('violation_type', violation_type)
        if severity:
            query = query.eq('severity', severity)
        if start_date:
            query = query.gte('detected_at', start_date)
        if end_date:
            query = query.lte('detected_at', end_date)
        
        # Order by detected_at descending
        query = query.order('detected_at', desc=True)
        
        # Pagination
        query = query.range(offset, offset + limit - 1)
        
        result = query.execute()
        
        return result.data if result.data else []
        
    except Exception as e:
        logger.error(f"Error fetching violations: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error fetching violations: {str(e)}")

@router.get("/stats", response_model=AuditStatsResponse)
async def get_audit_stats(
    organization_id: Optional[str] = Query(None),
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    auth_data: dict = Depends(validate_api_key)
):
    """
    Get aggregated audit statistics
    
    Returns:
    - Total interactions
    - Status breakdown (approved, flagged, blocked)
    - Violation statistics
    - Average confidence score
    - Interactions by AI model
    """
    try:
        supabase = get_supabase_client()
        
        org_id = organization_id or auth_data.get('organization_id')
        if not org_id:
            raise HTTPException(status_code=400, detail="organization_id is required")
        
        # Build query for interactions
        query = supabase.table('ai_interactions').select('*')
        query = query.eq('organization_id', org_id)
        
        if start_date:
            query = query.gte('timestamp', start_date)
        if end_date:
            query = query.lte('timestamp', end_date)
        
        result = query.execute()
        interactions = result.data if result.data else []
        
        # Calculate statistics
        total_interactions = len(interactions)
        approved_count = sum(1 for i in interactions if i.get('status') == 'approved')
        flagged_count = sum(1 for i in interactions if i.get('status') == 'flagged')
        blocked_count = sum(1 for i in interactions if i.get('status') == 'blocked')
        
        # Get all violations for these interactions
        interaction_ids = [i['id'] for i in interactions]
        violations_query = supabase.table('violations').select('*')
        if interaction_ids:
            violations_query = violations_query.in_('interaction_id', interaction_ids)
        violations_result = violations_query.execute()
        violations = violations_result.data if violations_result.data else []
        
        # Violations by type
        violations_by_type = {}
        for v in violations:
            v_type = v.get('violation_type', 'unknown')
            violations_by_type[v_type] = violations_by_type.get(v_type, 0) + 1
        
        # Violations by severity
        violations_by_severity = {}
        for v in violations:
            severity = v.get('severity', 'medium')
            violations_by_severity[severity] = violations_by_severity.get(severity, 0) + 1
        
        # Average confidence score
        confidence_scores = [i.get('confidence_score', 0) for i in interactions if i.get('confidence_score')]
        avg_confidence = sum(confidence_scores) / len(confidence_scores) if confidence_scores else 0.0
        
        # Interactions by model
        interactions_by_model = {}
        for i in interactions:
            model = i.get('ai_model', 'unknown')
            interactions_by_model[model] = interactions_by_model.get(model, 0) + 1
        
        # Date range
        timestamps = [i.get('timestamp') for i in interactions if i.get('timestamp')]
        date_range = {
            'start': min(timestamps) if timestamps else None,
            'end': max(timestamps) if timestamps else None
        }
        
        return {
            'total_interactions': total_interactions,
            'approved_count': approved_count,
            'flagged_count': flagged_count,
            'blocked_count': blocked_count,
            'total_violations': len(violations),
            'violations_by_type': violations_by_type,
            'violations_by_severity': violations_by_severity,
            'avg_confidence_score': avg_confidence,
            'interactions_by_model': interactions_by_model,
            'date_range': date_range
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching audit stats: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error fetching stats: {str(e)}")

@router.get("/export")
async def export_audit_data(
    organization_id: Optional[str] = Query(None),
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    format: str = Query("csv", regex="^(csv|json)$"),
    auth_data: dict = Depends(validate_api_key)
):
    """
    Export audit data in CSV or JSON format
    
    Query Parameters:
    - organization_id: Filter by organization
    - start_date: Start date filter
    - end_date: End date filter
    - format: Export format (csv or json)
    """
    try:
        from fastapi.responses import StreamingResponse
        
        org_id = organization_id or auth_data.get('organization_id')
        if not org_id:
            raise HTTPException(status_code=400, detail="organization_id is required")
        
        supabase = get_supabase_client()
        
        # Get interactions
        interactions_query = supabase.table('ai_interactions').select('*')
        interactions_query = interactions_query.eq('organization_id', org_id)
        if start_date:
            interactions_query = interactions_query.gte('timestamp', start_date)
        if end_date:
            interactions_query = interactions_query.lte('timestamp', end_date)
        interactions_result = interactions_query.execute()
        interactions = interactions_result.data if interactions_result.data else []
        
        if format == "csv":
            # Generate CSV
            output = StringIO()
            writer = csv.DictWriter(output, fieldnames=[
                'id', 'timestamp', 'user_query', 'ai_response', 'validated_response',
                'status', 'confidence_score', 'ai_model', 'session_id'
            ])
            writer.writeheader()
            for interaction in interactions:
                writer.writerow({
                    'id': interaction.get('id', ''),
                    'timestamp': interaction.get('timestamp', ''),
                    'user_query': interaction.get('user_query', ''),
                    'ai_response': interaction.get('ai_response', ''),
                    'validated_response': interaction.get('validated_response', ''),
                    'status': interaction.get('status', ''),
                    'confidence_score': interaction.get('confidence_score', ''),
                    'ai_model': interaction.get('ai_model', ''),
                    'session_id': interaction.get('session_id', '')
                })
            
            output.seek(0)
            return StreamingResponse(
                iter([output.getvalue()]),
                media_type="text/csv",
                headers={"Content-Disposition": f"attachment; filename=audit_export_{datetime.now().strftime('%Y%m%d')}.csv"}
            )
        
        else:  # JSON
            return {
                'export_date': datetime.utcnow().isoformat(),
                'organization_id': org_id,
                'total_records': len(interactions),
                'data': interactions
            }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error exporting audit data: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error exporting data: {str(e)}")

