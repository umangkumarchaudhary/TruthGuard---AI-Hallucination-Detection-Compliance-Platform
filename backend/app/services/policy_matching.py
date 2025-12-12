"""
Policy Matching Service
Checks AI responses against company-specific policies
"""
import logging
from typing import Dict, Any, List, Optional
from app.utils.supabase_client import get_supabase_client
import re

logger = logging.getLogger(__name__)

class PolicyMatch:
    """Result of policy matching"""
    def __init__(self, policy_id: str, policy_name: str, matched: bool, deviation: Optional[str] = None):
        self.policy_id = policy_id
        self.policy_name = policy_name
        self.matched = matched
        self.deviation = deviation

def load_policies(organization_id: str) -> List[Dict[str, Any]]:
    """
    Load company policies from database
    """
    try:
        supabase = get_supabase_client()
        
        result = supabase.table('company_policies')\
            .select('*')\
            .eq('organization_id', organization_id)\
            .eq('is_active', True)\
            .execute()
        
        policies = result.data if result.data else []
        logger.info(f"Loaded {len(policies)} policies for organization {organization_id}")
        return policies
        
    except Exception as e:
        logger.error(f"Error loading policies: {str(e)}")
        return []

def match_policies(response: str, policies: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    Check response against company policies
    Returns list of policy matches and deviations
    """
    matches = []
    
    for policy in policies:
        policy_content = policy.get('policy_content', '').lower()
        policy_name = policy.get('policy_name', '')
        category = policy.get('category', '')
        
        # Simple matching: check if response contradicts policy
        # In production, would use semantic similarity
        
        match_result = check_policy_match(response, policy_content, policy_name, category)
        matches.append({
            'policy_id': policy.get('id'),
            'policy_name': policy_name,
            'category': category,
            'matched': match_result['matched'],
            'deviation': match_result.get('deviation'),
            'confidence': match_result.get('confidence', 0.5)
        })
    
    return matches

def check_policy_match(response: str, policy_content: str, policy_name: str, category: str) -> Dict[str, Any]:
    """
    Check if response matches policy
    Returns match result with deviation details
    """
    response_lower = response.lower()
    policy_lower = policy_content.lower()
    
    # Extract key terms from policy
    policy_keywords = extract_key_terms(policy_content)
    response_keywords = extract_key_terms(response)
    
    # Check for contradictions
    contradictions = find_contradictions(policy_keywords, response_keywords, policy_content, response)
    
    if contradictions:
        return {
            'matched': False,
            'deviation': f"Response contradicts policy '{policy_name}': {contradictions[0]}",
            'confidence': 0.8
        }
    
    # Check for policy compliance (simplified)
    # In production, would use semantic similarity
    
    # For refund policies, check for time promises
    if 'refund' in category.lower():
        time_pattern = r'(\d+)\s*(day|hour|minute|week)'
        policy_times = re.findall(time_pattern, policy_content)
        response_times = re.findall(time_pattern, response)
        
        if policy_times and response_times:
            # Compare time promises
            policy_days = extract_days(policy_times)
            response_days = extract_days(response_times)
            
            if response_days and policy_days:
                if response_days[0] < policy_days[0]:  # Response promises faster than policy
                    return {
                        'matched': False,
                        'deviation': f"Response promises {response_days[0]} days but policy allows {policy_days[0]} days",
                        'confidence': 0.9
                    }
    
    # Default: assume compliant
    return {
        'matched': True,
        'deviation': None,
        'confidence': 0.7
    }

def extract_key_terms(text: str) -> List[str]:
    """
    Extract key terms from text (simplified)
    In production, would use NLP
    """
    # Remove common words
    stop_words = {'the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'to', 'of', 'and', 'or', 'but', 'in', 'on', 'at', 'for', 'with', 'this', 'that', 'these', 'those'}
    
    words = text.lower().split()
    key_terms = [w for w in words if w not in stop_words and len(w) > 3]
    
    return key_terms

def find_contradictions(policy_terms: List[str], response_terms: List[str], policy: str, response: str) -> List[str]:
    """
    Find contradictions between policy and response
    """
    contradictions = []
    
    # Check for opposite keywords
    opposite_pairs = [
        ('always', 'never'),
        ('guaranteed', 'cannot guarantee'),
        ('immediate', 'within'),
        ('free', 'charge'),
    ]
    
    for word1, word2 in opposite_pairs:
        if word1 in policy.lower() and word2 in response.lower():
            contradictions.append(f"Policy uses '{word1}' but response uses '{word2}'")
        elif word2 in policy.lower() and word1 in response.lower():
            contradictions.append(f"Policy uses '{word2}' but response uses '{word1}'")
    
    return contradictions

def extract_days(time_tuples: List[tuple]) -> List[int]:
    """
    Extract days from time tuples
    """
    days = []
    for value, unit in time_tuples:
        value = int(value)
        if unit.lower() in ['day', 'days']:
            days.append(value)
        elif unit.lower() in ['hour', 'hours']:
            days.append(value / 24)
        elif unit.lower() in ['week', 'weeks']:
            days.append(value * 7)
    return days

def detect_policy_violations(response: str, organization_id: str) -> List[Dict[str, Any]]:
    """
    Detect policy violations in response
    """
    policies = load_policies(organization_id)
    matches = match_policies(response, policies)
    
    violations = []
    for match in matches:
        if not match['matched']:
            violations.append({
                'policy_id': match['policy_id'],
                'policy_name': match['policy_name'],
                'category': match['category'],
                'severity': 'high' if match['confidence'] > 0.8 else 'medium',
                'description': match['deviation'],
                'type': 'policy'
            })
    
    return violations

