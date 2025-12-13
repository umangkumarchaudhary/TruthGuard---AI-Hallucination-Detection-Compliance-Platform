"""
Fact Verification Service
Verifies factual claims against knowledge bases
Now includes real-time verification via Wikipedia, DuckDuckGo, and NewsAPI
"""
import logging
from typing import Dict, Any, Optional, List
from app.utils.supabase_client import get_supabase_client
from app.services.real_time_verification import verify_claim_realtime
import httpx

logger = logging.getLogger(__name__)

class VerificationResult:
    """Result of fact verification"""
    def __init__(self, status: str, confidence: float, source: Optional[str] = None, details: Optional[str] = None):
        self.status = status  # verified, unverified, false, partially_verified
        self.confidence = confidence  # 0.0 to 1.0
        self.source = source
        self.details = details

# In-memory cache for verified facts (simple implementation)
fact_cache: Dict[str, VerificationResult] = {}

async def verify_claim(claim: str, claim_type: str = "factual", use_realtime: bool = True, query_context: Optional[str] = None) -> Dict[str, Any]:
    """
    Verify a claim against knowledge bases
    Now uses real-time APIs (Wikipedia, DuckDuckGo, NewsAPI) for verification
    
    Args:
        claim: The claim to verify
        claim_type: Type of claim (factual, statistical, etc.)
        use_realtime: If True, uses real-time APIs; if False, uses legacy methods
        
    Returns:
        Verification result dict with status, confidence, source, and details
    """
    if not claim:
        return {
            'status': 'unverified',
            'confidence': 0.0,
            'source': None,
            'details': 'Empty claim'
        }
    
    try:
        # Check cache first
        cache_key = claim.lower().strip()
        if cache_key in fact_cache:
            cached = fact_cache[cache_key]
            logger.info(f"Cache hit for claim: {claim[:50]}...")
            return {
                'status': cached.status,
                'confidence': cached.confidence,
                'source': cached.source,
                'details': cached.details
            }
        
        # Use real-time verification (default)
        if use_realtime:
            logger.info(f"Verifying claim via real-time APIs: {claim[:50]}...")
            realtime_result = await verify_claim_realtime(claim, use_all_sources=True, query_context=query_context)
            
            # Cache the result
            fact_cache[cache_key] = VerificationResult(
                status=realtime_result['status'],
                confidence=realtime_result['confidence'],
                source=realtime_result.get('source'),
                details=realtime_result.get('details')
            )
            
            return realtime_result
        
        # Legacy path (fallback if realtime is disabled)
        # Try database lookup first (for known facts)
        db_result = verify_via_database(claim)
        if db_result and db_result['status'] == 'verified':
            # Cache the result
            fact_cache[cache_key] = VerificationResult(
                status=db_result['status'],
                confidence=db_result['confidence'],
                source=db_result.get('source'),
                details=db_result.get('details')
            )
            return db_result
        
        # Default: unverified
        result = {
            'status': 'unverified',
            'confidence': 0.5,  # Changed from 0.3 to 0.5 (less penalizing)
            'source': None,
            'details': 'Could not verify claim against available sources'
        }
        
        fact_cache[cache_key] = VerificationResult(**result)
        return result
        
    except Exception as e:
        logger.error(f"Error verifying claim: {str(e)}")
        return {
            'status': 'unverified',
            'confidence': 0.0,
            'source': None,
            'details': f'Verification error: {str(e)}'
        }

def verify_via_database(claim: str) -> Optional[Dict[str, Any]]:
    """
    Verify claim against stored verified facts in database
    """
    try:
        supabase = get_supabase_client()
        
        # Check if we have a verified_facts table (would need to be created)
        # For now, return None to use other methods
        # In production, you'd query a knowledge base table
        
        return None
        
    except Exception as e:
        logger.error(f"Database verification error: {str(e)}")
        return None

def verify_via_wikipedia(claim: str) -> Optional[Dict[str, Any]]:
    """
    Legacy Wikipedia verification (deprecated - use real_time_verification instead)
    Kept for backward compatibility
    """
    # This is now handled by real_time_verification.py
    # Keeping for backward compatibility
    return None

def verify_via_semantic_similarity(claim: str, known_facts: List[str]) -> Optional[Dict[str, Any]]:
    """
    Verify claim using semantic similarity with known facts
    Would use sentence-transformers in production
    """
    # Placeholder for semantic similarity
    # In production, use sentence-transformers to compare embeddings
    return None

async def batch_verify_claims(claims: List[str], use_realtime: bool = True) -> List[Dict[str, Any]]:
    """
    Verify multiple claims efficiently
    Now supports async real-time verification
    """
    import asyncio
    
    # Verify all claims concurrently
    tasks = [verify_claim(claim, use_realtime=use_realtime) for claim in claims]
    results = await asyncio.gather(*tasks)
    return results

