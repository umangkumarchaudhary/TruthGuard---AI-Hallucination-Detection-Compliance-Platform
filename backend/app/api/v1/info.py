from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()

class APIInfo(BaseModel):
    name: str
    version: str
    status: str
    description: str

@router.get("/info", response_model=APIInfo)
async def get_api_info():
    """Get API information"""
    return APIInfo(
        name="TruthGuard API",
        version="1.0.0",
        status="running",
        description="AI Hallucination Detection & Compliance Platform"
    )

