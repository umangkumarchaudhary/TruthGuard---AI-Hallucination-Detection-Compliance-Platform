"""
Authentication utilities
Handles API key authentication and JWT token validation
"""
from fastapi import HTTPException, Security
from fastapi.security import APIKeyHeader
from supabase import Client
from app.utils.supabase_client import get_supabase_client
import hashlib
import secrets
import logging

logger = logging.getLogger(__name__)

# API Key header
api_key_header = APIKeyHeader(name="X-API-Key", auto_error=False)

def generate_api_key() -> tuple[str, str]:
    """
    Generate a new API key
    Returns: (plain_key, hashed_key)
    """
    # Generate random API key
    plain_key = f"tg_live_{secrets.token_urlsafe(32)}"
    
    # Hash the key for storage
    hashed_key = hashlib.sha256(plain_key.encode()).hexdigest()
    
    return plain_key, hashed_key

async def validate_api_key(api_key: str = Security(api_key_header)) -> dict:
    """
    Validate API key from request header
    Returns organization_id if valid
    """
    # Development mode: Allow requests without API key (for local testing)
    import os
    dev_bypass = os.getenv("DEV_BYPASS_AUTH", "false").lower() == "true"
    
    if not api_key:
        if dev_bypass:
            # Return default organization for development
            logger.warning("⚠️  Development mode: Bypassing API key authentication")
            return {
                "organization_id": "00000000-0000-0000-0000-000000000001",
                "api_key_id": None
            }
        raise HTTPException(
            status_code=401,
            detail="API key is required. Provide it in X-API-Key header. For development, set DEV_BYPASS_AUTH=true in backend/.env"
        )
    
    try:
        supabase: Client = get_supabase_client()
        
        # Hash the provided key
        hashed_key = hashlib.sha256(api_key.encode()).hexdigest()
        
        # Check if key exists in database
        result = supabase.table('api_keys')\
            .select('id, organization_id, is_active, expires_at')\
            .eq('key_hash', hashed_key)\
            .eq('is_active', True)\
            .execute()
        
        if not result.data or len(result.data) == 0:
            raise HTTPException(
                status_code=401,
                detail="Invalid API key"
            )
        
        api_key_data = result.data[0]
        
        # Check expiration
        if api_key_data.get('expires_at'):
            from datetime import datetime
            expires_at = datetime.fromisoformat(api_key_data['expires_at'].replace('Z', '+00:00'))
            if datetime.now(expires_at.tzinfo) > expires_at:
                raise HTTPException(
                    status_code=401,
                    detail="API key has expired"
                )
        
        return {
            "organization_id": api_key_data['organization_id'],
            "api_key_id": api_key_data['id']
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error validating API key: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Error validating API key"
        )

