"""
Consistency Checking Service
Checks if multiple AI responses to the same query are consistent
"""
import logging
from typing import List, Dict, Any
from app.utils.supabase_client import get_supabase_client

logger = logging.getLogger(__name__)

def check_consistency(query: str, responses: List[str]) -> float:
    """
    Check consistency between multiple responses to the same query
    Returns consistency score (0.0 to 1.0)
    Higher score = more consistent
    """
    if not responses or len(responses) < 2:
        return 1.0  # Single response is always consistent
    
    try:
        # Simple consistency check based on keyword overlap
        # In production, would use embeddings for semantic similarity
        
        # Extract key terms from each response
        response_terms = []
        for response in responses:
            # Simple word extraction (in production, use NLP)
            words = set(response.lower().split())
            # Remove common words
            stop_words = {'the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'to', 'of', 'and', 'or', 'but', 'in', 'on', 'at', 'for', 'with'}
            words = words - stop_words
            response_terms.append(words)
        
        # Calculate overlap between all pairs
        overlaps = []
        for i in range(len(response_terms)):
            for j in range(i + 1, len(response_terms)):
                set1 = response_terms[i]
                set2 = response_terms[j]
                
                if not set1 or not set2:
                    continue
                
                # Jaccard similarity
                intersection = len(set1 & set2)
                union = len(set1 | set2)
                similarity = intersection / union if union > 0 else 0
                overlaps.append(similarity)
        
        if not overlaps:
            return 0.5  # Default if can't calculate
        
        # Average similarity
        consistency_score = sum(overlaps) / len(overlaps)
        
        return consistency_score
        
    except Exception as e:
        logger.error(f"Error checking consistency: {str(e)}")
        return 0.5  # Default on error

def check_historical_consistency(query: str, organization_id: str, current_response: str) -> float:
    """
    Check if current response is consistent with historical responses to similar queries
    """
    try:
        supabase = get_supabase_client()
        
        # Get recent similar queries (simplified - would use semantic search in production)
        result = supabase.table('ai_interactions')\
            .select('ai_response')\
            .eq('organization_id', organization_id)\
            .limit(5)\
            .execute()
        
        if not result.data or len(result.data) < 1:
            return 0.7  # Default if no history
        
        historical_responses = [r['ai_response'] for r in result.data]
        historical_responses.append(current_response)
        
        return check_consistency(query, historical_responses)
        
    except Exception as e:
        logger.error(f"Error checking historical consistency: {str(e)}")
        return 0.5

def detect_contradictions(responses: List[str]) -> List[Dict[str, Any]]:
    """
    Detect contradictions between responses
    Returns list of detected contradictions
    """
    contradictions = []
    
    # Simple contradiction detection (in production, use NLP)
    # Check for opposite keywords
    opposite_pairs = [
        ('yes', 'no'),
        ('true', 'false'),
        ('always', 'never'),
        ('increases', 'decreases'),
        ('higher', 'lower'),
    ]
    
    for i, response1 in enumerate(responses):
        for j, response2 in enumerate(responses[i+1:], start=i+1):
            response1_lower = response1.lower()
            response2_lower = response2.lower()
            
            for word1, word2 in opposite_pairs:
                if word1 in response1_lower and word2 in response2_lower:
                    contradictions.append({
                        'response_index_1': i,
                        'response_index_2': j,
                        'contradiction_type': 'opposite_keywords',
                        'details': f'Response {i} contains "{word1}" while response {j} contains "{word2}"'
                    })
    
    return contradictions

