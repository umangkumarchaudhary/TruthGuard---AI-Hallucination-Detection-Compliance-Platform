"""
Auto-Correction Service
Generates corrected responses that address violations
"""
import logging
from typing import Dict, Any, List, Optional
import os

logger = logging.getLogger(__name__)

def suggest_correction(
    original_response: str,
    violations: List[Dict[str, Any]],
    query: str
) -> Dict[str, Any]:
    """
    Suggest corrected response that addresses all violations
    """
    if not violations:
        return {
            'corrected_response': original_response,
            'changes_made': [],
            'confidence': 1.0
        }
    
    try:
        # Group violations by type
        compliance_violations = [v for v in violations if v.get('type') in ['compliance', 'regulatory']]
        policy_violations = [v for v in violations if v.get('type') == 'policy']
        hallucination_violations = [v for v in violations if v.get('type') == 'hallucination']
        
        corrected_response = original_response
        changes_made = []
        
        # Fix compliance violations (add disclaimers, remove prohibited text)
        for violation in compliance_violations:
            fix = fix_compliance_violation(corrected_response, violation)
            if fix['changed']:
                corrected_response = fix['response']
                changes_made.append(fix['change_description'])
        
        # Fix policy violations (align with company policy)
        for violation in policy_violations:
            fix = fix_policy_violation(corrected_response, violation)
            if fix['changed']:
                corrected_response = fix['response']
                changes_made.append(fix['change_description'])
        
        # Fix hallucination violations (remove unverified claims)
        for violation in hallucination_violations:
            fix = fix_hallucination(corrected_response, violation)
            if fix['changed']:
                corrected_response = fix['response']
                changes_made.append(fix['change_description'])
        
        # Use LLM for advanced corrections (if OpenAI key available)
        if os.getenv('OPENAI_API_KEY'):
            try:
                llm_correction = suggest_correction_with_llm(
                    query,
                    original_response,
                    corrected_response,
                    violations
                )
                if llm_correction:
                    corrected_response = llm_correction
                    changes_made.append("LLM-enhanced correction applied")
            except Exception as e:
                logger.warning(f"LLM correction failed: {str(e)}")
        
        return {
            'corrected_response': corrected_response,
            'changes_made': changes_made,
            'confidence': 0.8 if changes_made else 1.0,
            'original_response': original_response
        }
        
    except Exception as e:
        logger.error(f"Error suggesting correction: {str(e)}")
        return {
            'corrected_response': original_response,
            'changes_made': [],
            'confidence': 0.5,
            'error': str(e)
        }

def fix_compliance_violation(response: str, violation: Dict[str, Any]) -> Dict[str, Any]:
    """
    Fix compliance violation by modifying response
    """
    description = violation.get('description', '')
    rule_name = violation.get('rule_name', '')
    
    # Remove prohibited keywords
    if 'prohibited keywords' in description.lower():
        # Extract keywords from description
        # In production, would parse more carefully
        response_fixed = response
        changes = []
        
        # Add required disclaimers for financial advice
        if 'financial' in rule_name.lower() or 'sec' in rule_name.lower():
            if 'disclaimer' not in response.lower() and 'risk' not in response.lower():
                disclaimer = "\n\nNote: This is not financial advice. Please consult a licensed financial advisor. Past performance does not guarantee future results."
                response_fixed = response + disclaimer
                changes.append("Added financial disclaimer")
        
        # Remove guarantees
        guarantee_words = ['guarantee', 'guaranteed', 'always', 'never fails', 'risk-free']
        for word in guarantee_words:
            if word in response_fixed.lower():
                response_fixed = response_fixed.replace(word, 'may')
                changes.append(f"Removed guarantee: '{word}'")
        
        return {
            'changed': len(changes) > 0,
            'response': response_fixed,
            'change_description': '; '.join(changes) if changes else None
        }
    
    return {
        'changed': False,
        'response': response,
        'change_description': None
    }

def fix_policy_violation(response: str, violation: Dict[str, Any]) -> Dict[str, Any]:
    """
    Fix policy violation by aligning with company policy
    """
    deviation = violation.get('deviation', '')
    policy_name = violation.get('policy_name', '')
    
    response_fixed = response
    changes = []
    
    # Fix time promises (refund policies)
    if 'days' in deviation.lower() or 'hours' in deviation.lower():
        # Extract correct time from policy
        # In production, would parse policy content
        # For now, add generic correction
        if '24 hours' in response.lower() or 'immediate' in response.lower():
            response_fixed = response_fixed.replace('24 hours', '7-10 business days')
            response_fixed = response_fixed.replace('immediate', 'within 7-10 business days')
            changes.append("Adjusted time promise to match policy")
    
    # Remove false promises
    if 'guarantee' in deviation.lower() or 'promise' in deviation.lower():
        response_fixed = response_fixed.replace('guaranteed', 'typically')
        response_fixed = response_fixed.replace('guarantee', 'typically')
        changes.append("Removed guarantee language")
    
    return {
        'changed': len(changes) > 0,
        'response': response_fixed,
        'change_description': '; '.join(changes) if changes else None
    }

def fix_hallucination(response: str, violation: Dict[str, Any]) -> Dict[str, Any]:
    """
    Fix hallucination by removing or correcting false claims
    """
    description = violation.get('description', '')
    
    response_fixed = response
    changes = []
    
    # Remove unverified claims (simplified)
    if 'unverified' in description.lower() or 'could not verify' in description.lower():
        # In production, would identify and remove specific claims
        # For now, add disclaimer
        if 'unverified' not in response_fixed.lower():
            response_fixed += "\n\nNote: Some information may require verification."
            changes.append("Added verification disclaimer")
    
    return {
        'changed': len(changes) > 0,
        'response': response_fixed,
        'change_description': '; '.join(changes) if changes else None
    }

def suggest_correction_with_llm(
    query: str,
    original_response: str,
    corrected_response: str,
    violations: List[Dict[str, Any]]
) -> Optional[str]:
    """
    Use LLM (OpenAI) to suggest better corrections
    """
    try:
        from openai import OpenAI
        
        api_key = os.getenv('OPENAI_API_KEY')
        if not api_key:
            return None
        
        client = OpenAI(api_key=api_key)
        
        violations_summary = "\n".join([f"- {v.get('description', '')}" for v in violations])
        
        prompt = f"""You are a compliance assistant. Correct the following AI response to address violations while preserving the original intent.

Original Query: {query}

Original Response: {original_response}

Violations to Fix:
{violations_summary}

Requirements:
1. Address all violations
2. Preserve the original intent and helpfulness
3. Add required disclaimers if needed
4. Remove or correct false information
5. Keep the response natural and professional

Corrected Response:"""
        
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are a compliance assistant that corrects AI responses to fix violations."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=500,
            temperature=0.3
        )
        
        corrected = response.choices[0].message.content.strip()
        return corrected
        
    except Exception as e:
        logger.warning(f"LLM correction error: {str(e)}")
        return None

