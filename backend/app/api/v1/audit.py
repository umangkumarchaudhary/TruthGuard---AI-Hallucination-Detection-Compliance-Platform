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
    date_range: Dict[str, str]  # start and end as strings (empty string if no data)

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
            'start': min(timestamps) if timestamps else '',
            'end': max(timestamps) if timestamps else ''
        }
        
        return AuditStatsResponse(
            total_interactions=total_interactions,
            approved_count=approved_count,
            flagged_count=flagged_count,
            blocked_count=blocked_count,
            total_violations=len(violations),
            violations_by_type=violations_by_type,
            violations_by_severity=violations_by_severity,
            avg_confidence_score=avg_confidence,
            interactions_by_model=interactions_by_model,
            date_range=date_range
        )
        
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
    format: str = Query("csv", regex="^(csv|json|pdf)$"),
    include_violations: bool = Query(True, description="Include violations in export"),
    include_verification: bool = Query(True, description="Include verification results in export"),
    auth_data: dict = Depends(validate_api_key)
):
    """
    Export comprehensive audit data in CSV, JSON, or PDF format
    
    Query Parameters:
    - organization_id: Filter by organization
    - start_date: Start date filter
    - end_date: End date filter
    - format: Export format (csv, json, or pdf)
    - include_violations: Include violation details
    - include_verification: Include verification results
    """
    try:
        from fastapi.responses import StreamingResponse, Response
        
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
        interactions_query = interactions_query.order('timestamp', desc=True)
        interactions_result = interactions_query.execute()
        interactions = interactions_result.data if interactions_result.data else []
        
        # Get violations if requested
        violations_by_interaction = {}
        if include_violations and interactions:
            interaction_ids = [i['id'] for i in interactions]
            violations_query = supabase.table('violations').select('*')
            violations_query = violations_query.in_('interaction_id', interaction_ids)
            violations_result = violations_query.execute()
            violations = violations_result.data if violations_result.data else []
            
            for v in violations:
                interaction_id = v.get('interaction_id')
                if interaction_id not in violations_by_interaction:
                    violations_by_interaction[interaction_id] = []
                violations_by_interaction[interaction_id].append(v)
        
        # Get verification results if requested
        verification_by_interaction = {}
        if include_verification and interactions:
            interaction_ids = [i['id'] for i in interactions]
            verification_query = supabase.table('verification_results').select('*')
            verification_query = verification_query.in_('interaction_id', interaction_ids)
            verification_result = verification_query.execute()
            verifications = verification_result.data if verification_result.data else []
            
            for vr in verifications:
                interaction_id = vr.get('interaction_id')
                if interaction_id not in verification_by_interaction:
                    verification_by_interaction[interaction_id] = []
                verification_by_interaction[interaction_id].append(vr)
        
        if format == "csv":
            # Enhanced CSV with violations and verification
            output = StringIO()
            fieldnames = [
                'id', 'timestamp', 'user_query', 'ai_response', 'validated_response',
                'status', 'confidence_score', 'ai_model', 'session_id'
            ]
            if include_violations:
                fieldnames.append('violations_count')
                fieldnames.append('violations')
            if include_verification:
                fieldnames.append('verification_status')
            
            writer = csv.DictWriter(output, fieldnames=fieldnames)
            writer.writeheader()
            
            for interaction in interactions:
                interaction_id = interaction.get('id', '')
                row = {
                    'id': interaction_id,
                    'timestamp': interaction.get('timestamp', ''),
                    'user_query': interaction.get('user_query', '')[:200] + '...' if len(interaction.get('user_query', '')) > 200 else interaction.get('user_query', ''),
                    'ai_response': interaction.get('ai_response', '')[:200] + '...' if len(interaction.get('ai_response', '')) > 200 else interaction.get('ai_response', ''),
                    'validated_response': interaction.get('validated_response', '')[:200] + '...' if len(interaction.get('validated_response', '')) > 200 else interaction.get('validated_response', ''),
                    'status': interaction.get('status', ''),
                    'confidence_score': interaction.get('confidence_score', ''),
                    'ai_model': interaction.get('ai_model', ''),
                    'session_id': interaction.get('session_id', '')
                }
                
                if include_violations:
                    violations = violations_by_interaction.get(interaction_id, [])
                    row['violations_count'] = len(violations)
                    row['violations'] = '; '.join([f"{v.get('violation_type', '')}: {v.get('description', '')[:50]}" for v in violations])
                
                if include_verification:
                    verifications = verification_by_interaction.get(interaction_id, [])
                    verified = sum(1 for v in verifications if v.get('verification_status') == 'verified')
                    row['verification_status'] = f"{verified}/{len(verifications)} verified" if verifications else "N/A"
                
                writer.writerow(row)
            
            output.seek(0)
            filename = f"truthguard_audit_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"
            return StreamingResponse(
                iter([output.getvalue()]),
                media_type="text/csv",
                headers={"Content-Disposition": f"attachment; filename={filename}"}
            )
        
        elif format == "pdf":
            # PDF export using reportlab (if available) or return HTML for browser print
            try:
                from reportlab.lib.pagesizes import letter
                from reportlab.lib import colors
                from reportlab.lib.units import inch
                from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, PageBreak
                from reportlab.lib.styles import getSampleStyleSheet
                from io import BytesIO
                
                buffer = BytesIO()
                doc = SimpleDocTemplate(buffer, pagesize=letter)
                elements = []
                styles = getSampleStyleSheet()
                
                # Title
                elements.append(Paragraph("TruthGuard Audit Report", styles['Title']))
                elements.append(Spacer(1, 0.2*inch))
                
                # Metadata
                metadata = [
                    ['Organization ID', org_id],
                    ['Export Date', datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S UTC')],
                    ['Total Interactions', str(len(interactions))],
                    ['Date Range', f"{start_date or 'All'} to {end_date or 'All'}"]
                ]
                metadata_table = Table(metadata, colWidths=[2*inch, 4*inch])
                metadata_table.setStyle(TableStyle([
                    ('BACKGROUND', (0, 0), (0, -1), colors.grey),
                    ('TEXTCOLOR', (0, 0), (-1, -1), colors.black),
                    ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                    ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
                    ('FONTSIZE', (0, 0), (-1, -1), 10),
                    ('BOTTOMPADDING', (0, 0), (-1, -1), 12),
                    ('GRID', (0, 0), (-1, -1), 1, colors.black)
                ]))
                elements.append(metadata_table)
                elements.append(Spacer(1, 0.3*inch))
                
                # Interactions table
                for idx, interaction in enumerate(interactions[:100], 1):  # Limit to 100 for PDF
                    if idx > 1:
                        elements.append(PageBreak())
                    
                    interaction_id = interaction.get('id', '')
                    elements.append(Paragraph(f"Interaction #{idx}: {interaction_id[:8]}...", styles['Heading2']))
                    elements.append(Spacer(1, 0.1*inch))
                    
                    interaction_data = [
                        ['Field', 'Value'],
                        ['Timestamp', interaction.get('timestamp', 'N/A')],
                        ['Status', interaction.get('status', 'N/A').upper()],
                        ['Confidence Score', f"{(interaction.get('confidence_score', 0) * 100):.1f}%"],
                        ['AI Model', interaction.get('ai_model', 'N/A')],
                        ['User Query', interaction.get('user_query', 'N/A')[:200]],
                        ['AI Response', interaction.get('ai_response', 'N/A')[:500]],
                    ]
                    
                    if interaction.get('validated_response'):
                        interaction_data.append(['Validated Response', interaction.get('validated_response', '')[:500]])
                    
                    interaction_table = Table(interaction_data, colWidths=[2*inch, 4*inch])
                    interaction_table.setStyle(TableStyle([
                        ('BACKGROUND', (0, 0), (0, -1), colors.lightgrey),
                        ('TEXTCOLOR', (0, 0), (-1, -1), colors.black),
                        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                        ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
                        ('FONTSIZE', (0, 0), (-1, -1), 9),
                        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
                        ('GRID', (0, 0), (-1, -1), 1, colors.black),
                        ('VALIGN', (0, 0), (-1, -1), 'TOP')
                    ]))
                    elements.append(interaction_table)
                    
                    # Add violations if requested
                    if include_violations and interaction_id in violations_by_interaction:
                        violations = violations_by_interaction[interaction_id]
                        if violations:
                            elements.append(Spacer(1, 0.1*inch))
                            elements.append(Paragraph("Violations:", styles['Heading3']))
                            violation_data = [['Type', 'Severity', 'Description']]
                            for v in violations:
                                violation_data.append([
                                    v.get('violation_type', 'N/A'),
                                    v.get('severity', 'N/A'),
                                    v.get('description', 'N/A')[:100]
                                ])
                            violation_table = Table(violation_data, colWidths=[1.5*inch, 1*inch, 3.5*inch])
                            violation_table.setStyle(TableStyle([
                                ('BACKGROUND', (0, 0), (-1, 0), colors.darkgrey),
                                ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                                ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                                ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
                                ('FONTSIZE', (0, 0), (-1, -1), 8),
                                ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
                                ('GRID', (0, 0), (-1, -1), 1, colors.black)
                            ]))
                            elements.append(violation_table)
                
                doc.build(elements)
                buffer.seek(0)
                filename = f"truthguard_audit_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf"
                return Response(
                    content=buffer.getvalue(),
                    media_type="application/pdf",
                    headers={"Content-Disposition": f"attachment; filename={filename}"}
                )
            except ImportError:
                # Fallback: Return JSON if reportlab not available
                logger.warning("reportlab not installed, falling back to JSON export")
                format = "json"
        
        # JSON export (default or fallback)
        export_data = {
            'export_date': datetime.utcnow().isoformat(),
            'organization_id': org_id,
            'total_records': len(interactions),
            'date_range': {
                'start': start_date or 'all',
                'end': end_date or 'all'
            },
            'interactions': []
        }
        
        for interaction in interactions:
            interaction_id = interaction.get('id', '')
            interaction_export = {
                'id': interaction_id,
                'timestamp': interaction.get('timestamp', ''),
                'user_query': interaction.get('user_query', ''),
                'ai_response': interaction.get('ai_response', ''),
                'validated_response': interaction.get('validated_response', ''),
                'status': interaction.get('status', ''),
                'confidence_score': interaction.get('confidence_score', ''),
                'ai_model': interaction.get('ai_model', ''),
                'session_id': interaction.get('session_id', '')
            }
            
            if include_violations and interaction_id in violations_by_interaction:
                interaction_export['violations'] = violations_by_interaction[interaction_id]
            
            if include_verification and interaction_id in verification_by_interaction:
                interaction_export['verification_results'] = verification_by_interaction[interaction_id]
            
            export_data['interactions'].append(interaction_export)
        
        return export_data
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error exporting audit data: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error exporting data: {str(e)}")

class BusinessImpactResponse(BaseModel):
    """Business impact metrics response"""
    hallucinations_blocked: int
    critical_violations_prevented: int
    legal_risk_savings: float
    brand_damage_savings: float
    total_savings: float
    period: str
    config: Dict[str, float]  # Risk values used in calculation

@router.get("/business-impact", response_model=BusinessImpactResponse)
async def get_business_impact(
    organization_id: Optional[str] = Query(None),
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    # Configurable risk values (defaults based on industry standards)
    lawsuit_cost: float = Query(50000.0, description="Cost per potential lawsuit (default: $50,000)"),
    brand_incident_cost: float = Query(25000.0, description="Cost per brand damage incident (default: $25,000)"),
    auth_data: dict = Depends(validate_api_key)
):
    """
    Calculate business impact metrics based on REAL data
    
    Uses actual blocked/flagged interactions and violations from the database.
    Applies configurable risk formulas to calculate estimated savings.
    
    Returns:
    - Hallucinations blocked (real count)
    - Critical violations prevented (real count)
    - Estimated savings (calculated from real data)
    """
    try:
        supabase = get_supabase_client()
        
        org_id = organization_id or auth_data.get('organization_id')
        if not org_id:
            raise HTTPException(status_code=400, detail="organization_id is required")
        
        # Get blocked and flagged interactions (these would have reached users without TruthGuard)
        query = supabase.table('ai_interactions').select('*')
        query = query.eq('organization_id', org_id)
        query = query.in_('status', ['blocked', 'flagged'])
        
        if start_date:
            query = query.gte('timestamp', start_date)
        if end_date:
            query = query.lte('timestamp', end_date)
        
        result = query.execute()
        blocked_interactions = result.data if result.data else []
        
        # Count hallucinations blocked
        hallucinations_blocked = len(blocked_interactions)
        
        # Get critical violations from these interactions
        interaction_ids = [i['id'] for i in blocked_interactions]
        critical_violations_count = 0
        
        if interaction_ids:
            violations_query = supabase.table('violations').select('*')
            violations_query = violations_query.in_('interaction_id', interaction_ids)
            violations_query = violations_query.eq('severity', 'critical')
            violations_result = violations_query.execute()
            critical_violations_count = len(violations_result.data) if violations_result.data else 0
        
        # Calculate estimated savings based on REAL data
        # Each critical violation could lead to a lawsuit
        legal_risk_savings = critical_violations_count * lawsuit_cost
        
        # Each blocked interaction prevents potential brand damage
        brand_damage_savings = hallucinations_blocked * brand_incident_cost
        
        total_savings = legal_risk_savings + brand_damage_savings
        
        # Determine period
        if start_date and end_date:
            period = f"{start_date} to {end_date}"
        elif start_date:
            period = f"Since {start_date}"
        else:
            period = "All time"
        
        return BusinessImpactResponse(
            hallucinations_blocked=hallucinations_blocked,
            critical_violations_prevented=critical_violations_count,
            legal_risk_savings=legal_risk_savings,
            brand_damage_savings=brand_damage_savings,
            total_savings=total_savings,
            period=period,
            config={
                'lawsuit_cost': lawsuit_cost,
                'brand_incident_cost': brand_incident_cost
            }
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error calculating business impact: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error calculating business impact: {str(e)}")

class TrendDataPoint(BaseModel):
    """Single data point in a trend"""
    date: str
    total_interactions: int
    approved: int
    flagged: int
    blocked: int
    violations: int
    avg_confidence: float

class HistoricalTrendsResponse(BaseModel):
    """Historical trends response"""
    trends: List[TrendDataPoint]
    period: str
    total_days: int

@router.get("/trends", response_model=HistoricalTrendsResponse)
async def get_historical_trends(
    organization_id: Optional[str] = Query(None),
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    group_by: str = Query("day", regex="^(day|week|month)$", description="Group data by day, week, or month"),
    auth_data: dict = Depends(validate_api_key)
):
    """
    Get historical trends data for analytics charts
    
    Returns time-series data grouped by day, week, or month showing:
    - Total interactions per period
    - Status breakdown (approved, flagged, blocked)
    - Violations count
    - Average confidence score
    
    Uses REAL data from database - no mock data.
    """
    try:
        from datetime import datetime, timedelta
        from collections import defaultdict
        
        supabase = get_supabase_client()
        
        org_id = organization_id or auth_data.get('organization_id')
        if not org_id:
            raise HTTPException(status_code=400, detail="organization_id is required")
        
        # Build query for interactions
        query = supabase.table('ai_interactions').select('*')
        query = query.eq('organization_id', org_id)
        
        # Set default date range if not provided (last 30 days)
        if not end_date:
            end_date = datetime.utcnow().isoformat()
        if not start_date:
            start_date = (datetime.utcnow() - timedelta(days=30)).isoformat()
        
        query = query.gte('timestamp', start_date)
        query = query.lte('timestamp', end_date)
        
        result = query.execute()
        interactions = result.data if result.data else []
        
        # Get violations for these interactions
        interaction_ids = [i['id'] for i in interactions]
        violations_query = supabase.table('violations').select('*')
        if interaction_ids:
            violations_query = violations_query.in_('interaction_id', interaction_ids)
        violations_result = violations_query.execute()
        violations = violations_result.data if violations_result.data else []
        
        # Group violations by interaction_id and date
        violations_by_interaction = defaultdict(list)
        for v in violations:
            violations_by_interaction[v.get('interaction_id')].append(v)
        
        # Group interactions by date based on group_by parameter
        trends_by_date = defaultdict(lambda: {
            'total': 0,
            'approved': 0,
            'flagged': 0,
            'blocked': 0,
            'violations': 0,
            'confidence_scores': []
        })
        
        for interaction in interactions:
            timestamp_str = interaction.get('timestamp', '')
            if not timestamp_str:
                continue
                
            try:
                timestamp = datetime.fromisoformat(timestamp_str.replace('Z', '+00:00'))
            except:
                continue
            
            # Group by day, week, or month
            if group_by == 'day':
                date_key = timestamp.strftime('%Y-%m-%d')
            elif group_by == 'week':
                # Get Monday of the week
                days_since_monday = timestamp.weekday()
                monday = timestamp - timedelta(days=days_since_monday)
                date_key = monday.strftime('%Y-%m-%d')
            else:  # month
                date_key = timestamp.strftime('%Y-%m')
            
            status = interaction.get('status', 'approved')
            trends_by_date[date_key]['total'] += 1
            
            if status == 'approved':
                trends_by_date[date_key]['approved'] += 1
            elif status == 'flagged':
                trends_by_date[date_key]['flagged'] += 1
            elif status == 'blocked':
                trends_by_date[date_key]['blocked'] += 1
            
            # Count violations for this interaction
            interaction_id = interaction.get('id')
            if interaction_id in violations_by_interaction:
                trends_by_date[date_key]['violations'] += len(violations_by_interaction[interaction_id])
            
            # Collect confidence scores
            confidence = interaction.get('confidence_score')
            if confidence is not None:
                trends_by_date[date_key]['confidence_scores'].append(confidence)
        
        # Convert to list of TrendDataPoint
        trends = []
        for date_key in sorted(trends_by_date.keys()):
            data = trends_by_date[date_key]
            avg_confidence = sum(data['confidence_scores']) / len(data['confidence_scores']) if data['confidence_scores'] else 0.0
            
            trends.append(TrendDataPoint(
                date=date_key,
                total_interactions=data['total'],
                approved=data['approved'],
                flagged=data['flagged'],
                blocked=data['blocked'],
                violations=data['violations'],
                avg_confidence=avg_confidence
            ))
        
        # Determine period string
        if start_date and end_date:
            period = f"{start_date[:10]} to {end_date[:10]}"
        else:
            period = "All time"
        
        return HistoricalTrendsResponse(
            trends=trends,
            period=period,
            total_days=len(trends)
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching historical trends: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error fetching trends: {str(e)}")

