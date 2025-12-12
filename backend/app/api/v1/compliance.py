"""
Compliance Rules API Endpoints
CRUD operations for compliance rules
"""
from fastapi import APIRouter, HTTPException, Depends, Query
from pydantic import BaseModel, Field
from typing import Optional, List
from app.utils.supabase_client import get_supabase_client
from app.utils.auth import validate_api_key
from app.services.rule_engine import parse_rule, evaluate_rule
import logging
from datetime import datetime
import uuid

logger = logging.getLogger(__name__)

router = APIRouter()

class ComplianceRuleCreate(BaseModel):
    """Request model for creating compliance rule"""
    rule_type: str = Field(..., description="Type: regulatory, policy, or custom")
    rule_name: str = Field(..., description="Name of the rule")
    rule_definition: dict = Field(..., description="Rule definition (JSON)")
    industry: Optional[str] = Field(None, description="Industry this rule applies to")
    severity: str = Field("medium", description="Severity: low, medium, high, critical")
    description: Optional[str] = None

class ComplianceRuleUpdate(BaseModel):
    """Request model for updating compliance rule"""
    rule_name: Optional[str] = None
    rule_definition: Optional[dict] = None
    industry: Optional[str] = None
    severity: Optional[str] = None
    is_active: Optional[bool] = None
    description: Optional[str] = None

class ComplianceRuleResponse(BaseModel):
    """Response model for compliance rule"""
    id: str
    organization_id: str
    rule_type: str
    rule_name: str
    rule_definition: dict
    industry: Optional[str]
    severity: str
    is_active: bool
    created_at: str
    updated_at: str

@router.get("/compliance/rules", response_model=List[ComplianceRuleResponse])
async def get_compliance_rules(
    organization_id: Optional[str] = Query(None),
    industry: Optional[str] = Query(None),
    is_active: Optional[bool] = Query(None),
    auth_data: dict = Depends(validate_api_key)
):
    """
    Get compliance rules
    Filter by organization, industry, or active status
    """
    try:
        supabase = get_supabase_client()
        
        # Use organization_id from auth if not provided
        org_id = organization_id or auth_data.get('organization_id')
        
        query = supabase.table('compliance_rules').select('*')
        
        if org_id:
            query = query.eq('organization_id', org_id)
        if industry:
            query = query.eq('industry', industry)
        if is_active is not None:
            query = query.eq('is_active', is_active)
        
        result = query.execute()
        
        return result.data if result.data else []
        
    except Exception as e:
        logger.error(f"Error fetching compliance rules: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/compliance/rules", response_model=ComplianceRuleResponse)
async def create_compliance_rule(
    rule: ComplianceRuleCreate,
    auth_data: dict = Depends(validate_api_key)
):
    """
    Create a new compliance rule
    """
    try:
        supabase = get_supabase_client()
        organization_id = auth_data.get('organization_id')
        
        if not organization_id:
            raise HTTPException(status_code=400, detail="organization_id required")
        
        rule_data = {
            'id': str(uuid.uuid4()),
            'organization_id': organization_id,
            'rule_type': rule.rule_type,
            'rule_name': rule.rule_name,
            'rule_definition': rule.rule_definition,
            'industry': rule.industry,
            'severity': rule.severity,
            'is_active': True,
            'created_at': datetime.utcnow().isoformat(),
            'updated_at': datetime.utcnow().isoformat()
        }
        
        result = supabase.table('compliance_rules').insert(rule_data).execute()
        
        if not result.data:
            raise HTTPException(status_code=500, detail="Failed to create rule")
        
        return result.data[0]
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating compliance rule: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/compliance/rules/{rule_id}", response_model=ComplianceRuleResponse)
async def update_compliance_rule(
    rule_id: str,
    rule_update: ComplianceRuleUpdate,
    auth_data: dict = Depends(validate_api_key)
):
    """
    Update a compliance rule
    """
    try:
        supabase = get_supabase_client()
        organization_id = auth_data.get('organization_id')
        
        # Verify rule belongs to organization
        existing = supabase.table('compliance_rules')\
            .select('*')\
            .eq('id', rule_id)\
            .eq('organization_id', organization_id)\
            .execute()
        
        if not existing.data:
            raise HTTPException(status_code=404, detail="Rule not found")
        
        # Build update data
        update_data = {'updated_at': datetime.utcnow().isoformat()}
        if rule_update.rule_name is not None:
            update_data['rule_name'] = rule_update.rule_name
        if rule_update.rule_definition is not None:
            update_data['rule_definition'] = rule_update.rule_definition
        if rule_update.industry is not None:
            update_data['industry'] = rule_update.industry
        if rule_update.severity is not None:
            update_data['severity'] = rule_update.severity
        if rule_update.is_active is not None:
            update_data['is_active'] = rule_update.is_active
        
        result = supabase.table('compliance_rules')\
            .update(update_data)\
            .eq('id', rule_id)\
            .execute()
        
        if not result.data:
            raise HTTPException(status_code=500, detail="Failed to update rule")
        
        return result.data[0]
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating compliance rule: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/compliance/rules/{rule_id}")
async def delete_compliance_rule(
    rule_id: str,
    auth_data: dict = Depends(validate_api_key)
):
    """
    Delete a compliance rule
    """
    try:
        supabase = get_supabase_client()
        organization_id = auth_data.get('organization_id')
        
        # Verify rule belongs to organization
        existing = supabase.table('compliance_rules')\
            .select('id')\
            .eq('id', rule_id)\
            .eq('organization_id', organization_id)\
            .execute()
        
        if not existing.data:
            raise HTTPException(status_code=404, detail="Rule not found")
        
        supabase.table('compliance_rules')\
            .delete()\
            .eq('id', rule_id)\
            .execute()
        
        return {"message": "Rule deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting compliance rule: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/compliance/violations")
async def get_compliance_violations(
    organization_id: Optional[str] = Query(None),
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    severity: Optional[str] = Query(None),
    auth_data: dict = Depends(validate_api_key)
):
    """
    Get compliance violations
    Filter by organization, date range, severity
    """
    try:
        supabase = get_supabase_client()
        org_id = organization_id or auth_data.get('organization_id')
        
        # Get violations from interactions
        query = supabase.table('violations')\
            .select('*, ai_interactions!inner(organization_id, timestamp)')\
            .eq('ai_interactions.organization_id', org_id)
        
        if severity:
            query = query.eq('severity', severity)
        if start_date:
            query = query.gte('detected_at', start_date)
        if end_date:
            query = query.lte('detected_at', end_date)
        
        result = query.order('detected_at', desc=True).limit(100).execute()
        
        return result.data if result.data else []
        
    except Exception as e:
        logger.error(f"Error fetching violations: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/compliance/rules/{rule_id}/test")
async def test_compliance_rule(
    rule_id: str,
    test_response: str = Field(..., description="Response text to test"),
    auth_data: dict = Depends(validate_api_key)
):
    """
    Test a compliance rule against sample text
    """
    try:
        supabase = get_supabase_client()
        organization_id = auth_data.get('organization_id')
        
        # Get rule
        result = supabase.table('compliance_rules')\
            .select('*')\
            .eq('id', rule_id)\
            .eq('organization_id', organization_id)\
            .execute()
        
        if not result.data:
            raise HTTPException(status_code=404, detail="Rule not found")
        
        rule_data = result.data[0]
        rule = parse_rule(rule_data)
        rule_result = evaluate_rule(rule, test_response)
        
        return {
            'rule_id': rule_id,
            'rule_name': rule.name,
            'test_response': test_response,
            'passed': rule_result.passed,
            'details': rule_result.details,
            'severity': rule_result.severity
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error testing rule: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

