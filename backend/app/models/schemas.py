"""
Pydantic schemas for request/response models
"""
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

# Organization schemas
class OrganizationBase(BaseModel):
    name: str
    industry: Optional[str] = None

class OrganizationCreate(OrganizationBase):
    pass

class Organization(OrganizationBase):
    id: str
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

# API Key schemas
class APIKeyCreate(BaseModel):
    name: str
    expires_at: Optional[datetime] = None

class APIKeyResponse(BaseModel):
    id: str
    name: str
    key: str  # Only returned once on creation
    created_at: datetime
    expires_at: Optional[datetime] = None
    is_active: bool

# AI Interaction schemas
class AIInteractionBase(BaseModel):
    user_query: str
    ai_response: str
    ai_model: Optional[str] = None
    session_id: Optional[str] = None

class AIInteractionCreate(AIInteractionBase):
    organization_id: str

class AIInteraction(AIInteractionBase):
    id: str
    organization_id: str
    validated_response: Optional[str] = None
    status: str
    confidence_score: Optional[float] = None
    timestamp: datetime
    
    class Config:
        from_attributes = True

