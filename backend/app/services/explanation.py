"""
Explanation Generation Service
Generates human-readable explanations for AI validation decisions
"""
import logging
from typing import Dict, Any, List

logger = logging.getLogger(__name__)

def generate_explanation(
    detection_result: Dict[str, Any],
    query: str,
    ai_response: str
) -> str:
    """
    Generate human-readable explanation for validation decision
    
    Args:
        detection_result: Complete detection result dictionary
        query: User's original query
        ai_response: AI's response
        
    Returns:
        Human-readable explanation string
    """
    try:
        status = detection_result.get('status', 'approved')
        confidence_score = detection_result.get('confidence_score', 1.0)
        violations = detection_result.get('violations', [])
        verification_results = detection_result.get('verification_results', [])
        citations = detection_result.get('citations', [])
        
        explanation_parts = []
        
        # Start with overall status
        if status == 'approved':
            explanation_parts.append(
                f"✅ **Response Approved** (Confidence: {confidence_score:.0%})\n\n"
                f"The AI response was validated and approved. "
            )
        elif status == 'flagged':
            explanation_parts.append(
                f"⚠️ **Response Flagged** (Confidence: {confidence_score:.0%})\n\n"
                f"The AI response contains potential issues that require review. "
            )
        else:  # blocked
            explanation_parts.append(
                f"🚨 **Response Blocked** (Confidence: {confidence_score:.0%})\n\n"
                f"The AI response contains critical issues and was blocked. "
            )
        
        # Add confidence explanation
        if confidence_score >= 0.8:
            explanation_parts.append("High confidence in validation results.")
        elif confidence_score >= 0.6:
            explanation_parts.append("Moderate confidence in validation results.")
        else:
            explanation_parts.append("Low confidence in validation results - manual review recommended.")
        
        # Add violation details
        if violations:
            explanation_parts.append(f"\n**Issues Detected ({len(violations)}):**\n")
            
            for i, violation in enumerate(violations, 1):
                violation_type = violation.get('type', 'unknown')
                severity = violation.get('severity', 'medium')
                description = violation.get('description', '')
                
                severity_emoji = {
                    'critical': '🔴',
                    'high': '🟠',
                    'medium': '🟡',
                    'low': '🟢'
                }.get(severity, '⚪')
                
                explanation_parts.append(
                    f"{i}. {severity_emoji} **{violation_type.replace('_', ' ').title()}** "
                    f"({severity.upper()}): {description}"
                )
        
        # Add fact verification summary
        if verification_results:
            verified_count = sum(1 for v in verification_results if v.get('verification_status') == 'verified')
            unverified_count = sum(1 for v in verification_results if v.get('verification_status') == 'unverified')
            false_count = sum(1 for v in verification_results if v.get('verification_status') == 'false')
            
            explanation_parts.append(f"\n**Fact Verification:**\n")
            explanation_parts.append(f"- ✅ Verified: {verified_count}")
            explanation_parts.append(f"- ⚠️ Unverified: {unverified_count}")
            if false_count > 0:
                explanation_parts.append(f"- ❌ False: {false_count}")
        
        # Add citation summary
        if citations:
            valid_count = sum(1 for c in citations if c.get('is_valid', False))
            invalid_count = len(citations) - valid_count
            
            explanation_parts.append(f"\n**Citation Verification:**\n")
            explanation_parts.append(f"- ✅ Valid URLs: {valid_count}")
            if invalid_count > 0:
                explanation_parts.append(f"- ❌ Invalid URLs: {invalid_count}")
        
        # Add reasoning
        if status == 'approved':
            explanation_parts.append(
                "\n**Reasoning:**\n"
                "All factual claims were verified, citations are valid, "
                "and the response complies with applicable regulations and policies."
            )
        else:
            explanation_parts.append(
                "\n**Reasoning:**\n"
                "The response was flagged or blocked due to the issues listed above. "
                "A corrected version has been generated that addresses these concerns."
            )
        
        return "\n".join(explanation_parts)
        
    except Exception as e:
        logger.error(f"Error generating explanation: {str(e)}")
        return f"Explanation generation failed: {str(e)}"

def generate_detailed_explanation(
    detection_result: Dict[str, Any],
    query: str,
    ai_response: str
) -> Dict[str, Any]:
    """
    Generate detailed structured explanation
    
    Returns:
        Dictionary with structured explanation components
    """
    try:
        status = detection_result.get('status', 'approved')
        confidence_score = detection_result.get('confidence_score', 1.0)
        violations = detection_result.get('violations', [])
        
        explanation = {
            'summary': generate_explanation(detection_result, query, ai_response),
            'status': status,
            'confidence_score': confidence_score,
            'violation_count': len(violations),
            'violations_by_type': {},
            'violations_by_severity': {},
            'recommendations': []
        }
        
        # Group violations by type
        for violation in violations:
            v_type = violation.get('type', 'unknown')
            if v_type not in explanation['violations_by_type']:
                explanation['violations_by_type'][v_type] = []
            explanation['violations_by_type'][v_type].append(violation)
        
        # Group violations by severity
        for violation in violations:
            severity = violation.get('severity', 'medium')
            if severity not in explanation['violations_by_severity']:
                explanation['violations_by_severity'][severity] = []
            explanation['violations_by_severity'][severity].append(violation)
        
        # Generate recommendations
        if status != 'approved':
            explanation['recommendations'].append(
                "Review the corrected response before sending to user"
            )
            if any(v.get('type') == 'compliance' for v in violations):
                explanation['recommendations'].append(
                    "Ensure compliance team reviews regulatory violations"
                )
            if any(v.get('type') == 'policy' for v in violations):
                explanation['recommendations'].append(
                    "Update AI system to align with company policies"
                )
        
        return explanation
        
    except Exception as e:
        logger.error(f"Error generating detailed explanation: {str(e)}")
        return {
            'summary': f"Error generating explanation: {str(e)}",
            'status': 'error'
        }

