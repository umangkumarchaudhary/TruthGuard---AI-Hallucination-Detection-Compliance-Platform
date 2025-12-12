"""
Company Policies API Endpoints
CRUD operations for company policies
"""
from fastapi import APIRouter, HTTPException, Depends, Query
from pydantic import BaseModel, Field
from typing import Optional, List
from app.utils.supabase_client import get_supabase_client
from app.utils.auth import validate_api_key
from app.services.policy_matching import load_policies, match_policies
import logging
from datetime import datetime
import uuid

logger = logging.getLogger(__name__)

router = APIRouter()

class PolicyCreate(BaseModel):
    """Request model for creating policy"""
    policy_name: str = Field(..., description="Name of the policy")
    policy_content: str = Field(..., description="Full policy text")
    category: Optional[str] = Field(None, description="Policy category (e.g., refund, pricing)")

class PolicyUpdate(BaseModel):
    """Request model for updating policy"""
    policy_name: Optional[str] = None
    policy_content: Optional[str] = None
    category: Optional[str] = None
    is_active: Optional[bool] = None

class PolicyResponse(BaseModel):
    """Response model for policy"""
    id: str
    organization_id: str
    policy_name: str
    policy_content: str
    category: Optional[str]
    is_active: bool
    created_at: str
    updated_at: str

class TestPolicyRequest(BaseModel):
    """Request model for testing policy"""
    test_response: str = Field(..., description="Response text to test against the policy")

@router.get("/policies", response_model=List[PolicyResponse])
async def get_policies(
    organization_id: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    is_active: Optional[bool] = Query(None),
    auth_data: dict = Depends(validate_api_key)
):
    """
    Get company policies
    Filter by organization, category, or active status
    """
    try:
        supabase = get_supabase_client()
        org_id = organization_id or auth_data.get('organization_id')
        
        query = supabase.table('company_policies').select('*').eq('organization_id', org_id)
        
        if category:
            query = query.eq('category', category)
        if is_active is not None:
            query = query.eq('is_active', is_active)
        
        result = query.execute()
        return result.data if result.data else []
        
    except Exception as e:
        logger.error(f"Error fetching policies: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/policies", response_model=PolicyResponse)
async def create_policy(
    policy: PolicyCreate,
    auth_data: dict = Depends(validate_api_key)
):
    """
    Create a new company policy
    """
    try:
        supabase = get_supabase_client()
        organization_id = auth_data.get('organization_id')
        
        if not organization_id:
            raise HTTPException(status_code=400, detail="organization_id required")
        
        policy_data = {
            'id': str(uuid.uuid4()),
            'organization_id': organization_id,
            'policy_name': policy.policy_name,
            'policy_content': policy.policy_content,
            'category': policy.category,
            'is_active': True,
            'created_at': datetime.utcnow().isoformat(),
            'updated_at': datetime.utcnow().isoformat()
        }
        
        result = supabase.table('company_policies').insert(policy_data).execute()
        
        if not result.data:
            raise HTTPException(status_code=500, detail="Failed to create policy")
        
        return result.data[0]
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating policy: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/policies/{policy_id}", response_model=PolicyResponse)
async def update_policy(
    policy_id: str,
    policy_update: PolicyUpdate,
    auth_data: dict = Depends(validate_api_key)
):
    """
    Update a company policy
    """
    try:
        supabase = get_supabase_client()
        organization_id = auth_data.get('organization_id')
        
        # Verify policy belongs to organization
        existing = supabase.table('company_policies')\
            .select('*')\
            .eq('id', policy_id)\
            .eq('organization_id', organization_id)\
            .execute()
        
        if not existing.data:
            raise HTTPException(status_code=404, detail="Policy not found")
        
        update_data = {'updated_at': datetime.utcnow().isoformat()}
        if policy_update.policy_name is not None:
            update_data['policy_name'] = policy_update.policy_name
        if policy_update.policy_content is not None:
            update_data['policy_content'] = policy_update.policy_content
        if policy_update.category is not None:
            update_data['category'] = policy_update.category
        if policy_update.is_active is not None:
            update_data['is_active'] = policy_update.is_active
        
        result = supabase.table('company_policies')\
            .update(update_data)\
            .eq('id', policy_id)\
            .execute()
        
        if not result.data:
            raise HTTPException(status_code=500, detail="Failed to update policy")
        
        return result.data[0]
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating policy: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/policies/{policy_id}")
async def delete_policy(
    policy_id: str,
    auth_data: dict = Depends(validate_api_key)
):
    """
    Delete a company policy
    """
    try:
        supabase = get_supabase_client()
        organization_id = auth_data.get('organization_id')
        
        # Verify policy belongs to organization
        existing = supabase.table('company_policies')\
            .select('id')\
            .eq('id', policy_id)\
            .eq('organization_id', organization_id)\
            .execute()
        
        if not existing.data:
            raise HTTPException(status_code=404, detail="Policy not found")
        
        supabase.table('company_policies')\
            .delete()\
            .eq('id', policy_id)\
            .execute()
        
        return {"message": "Policy deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting policy: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/policies/{policy_id}/test")
async def test_policy(
    policy_id: str,
    request: TestPolicyRequest,
    auth_data: dict = Depends(validate_api_key)
):
    """
    Test a policy against sample text
    """
    try:
        supabase = get_supabase_client()
        organization_id = auth_data.get('organization_id')
        
        # Get policy
        result = supabase.table('company_policies')\
            .select('*')\
            .eq('id', policy_id)\
            .eq('organization_id', organization_id)\
            .execute()
        
        if not result.data:
            raise HTTPException(status_code=404, detail="Policy not found")
        
        policy = result.data[0]
        matches = match_policies(request.test_response, [policy])
        match_result = matches[0] if matches else None
        
        return {
            'policy_id': policy_id,
            'policy_name': policy['policy_name'],
            'test_response': request.test_response,
            'matched': match_result['matched'] if match_result else True,
            'deviation': match_result.get('deviation') if match_result else None
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error testing policy: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

