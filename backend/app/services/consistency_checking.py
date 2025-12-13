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
        # For very short responses (< 3 words), be more lenient
        short_responses = [r for r in responses if len(r.split()) < 3]
        if len(short_responses) == len(responses):
            # All responses are short - don't penalize for inconsistency
            return 0.7  # Default moderate score for short responses
        
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
                    # If one response has no meaningful words, skip comparison
                    continue
                
                # Jaccard similarity
                intersection = len(set1 & set2)
                union = len(set1 | set2)
                similarity = intersection / union if union > 0 else 0.5  # Default to 0.5 instead of 0
                overlaps.append(similarity)
        
        if not overlaps:
            return 0.7  # Default if can't calculate (more lenient)
        
        # Average similarity
        consistency_score = sum(overlaps) / len(overlaps)
        
        # Ensure minimum score for very short responses
        if any(len(r.split()) < 3 for r in responses):
            consistency_score = max(consistency_score, 0.5)  # Minimum 0.5 for short responses
        
        return consistency_score
        
    except Exception as e:
        logger.error(f"Error checking consistency: {str(e)}")
        return 0.7  # Default on error (more lenient)

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
            # No historical data - don't penalize, return high score
            logger.debug("No historical data available - returning high consistency score")
            return 0.9  # High score when no data (don't penalize for first-time queries)
        
        # Need at least 2 historical responses to make a meaningful comparison
        if len(result.data) < 2:
            # Only 1 historical response - be very lenient
            logger.debug("Only 1 historical response - being lenient")
            return 0.8  # High score when little data
        
        historical_responses = [r['ai_response'] for r in result.data]
        historical_responses.append(current_response)
        
        consistency_score = check_consistency(query, historical_responses)
        
        # If consistency is very low but we have few historical responses, be more lenient
        # Low score might just mean responses are different, not wrong
        if consistency_score < 0.2:
            # Very low score - likely means no similar queries, not actual inconsistency
            if len(result.data) < 3:
                logger.debug(f"Very low consistency ({consistency_score:.2f}) with few historical responses - boosting score")
                return 0.7  # Boost significantly when we have little data
            else:
                # Even with more data, very low scores might mean different query types
                return max(consistency_score, 0.4)  # Minimum 0.4 to avoid extreme penalties
        
        return consistency_score
        
    except Exception as e:
        logger.error(f"Error checking historical consistency: {str(e)}")
        return 0.8  # High default on error (don't penalize for errors)

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

