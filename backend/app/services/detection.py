"""
Main Detection Service
Orchestrates all detection methods to identify hallucinations
"""
import logging
from typing import Dict, Any, List, Optional
from app.services.claim_extraction import extract_claims
from app.services.fact_verification import verify_claim, batch_verify_claims
from app.services.citation_verification import extract_and_validate_citations
from app.services.consistency_checking import check_historical_consistency
from app.services.compliance import check_compliance
from app.services.policy_matching import detect_policy_violations

logger = logging.getLogger(__name__)

class DetectionResult:
    """Result of hallucination detection"""
    def __init__(self):
        self.status = "approved"  # approved, flagged, blocked
        self.confidence_score = 1.0
        self.confidence_breakdown = {}  # Detailed breakdown of confidence calculation
        self.violations = []
        self.verification_results = []
        self.citations = []
        self.claims = []
        self.explanation = ""

async def detect_hallucinations(
    query: str,
    ai_response: str,
    organization_id: str,
    ai_model: Optional[str] = None
) -> Dict[str, Any]:
    """
    Main detection pipeline
    Combines all detection methods to identify hallucinations
    Now uses async real-time fact verification
    """
    result = DetectionResult()
    
    try:
        # Step 1: Extract claims from AI response
        logger.info("Extracting claims from AI response...")
        claims = extract_claims(ai_response)
        result.claims = [c for c in claims]  # Convert to dicts
        
        # Step 2: Verify facts using real-time APIs (async)
        logger.info(f"Verifying {len(claims)} claims via real-time APIs...")
        verification_results = []
        
        # Verify all claims concurrently for better performance
        # Pass query context to help disambiguate (e.g., "python in programming" vs "python snake")
        import asyncio
        verification_tasks = [
            verify_claim(claim['text'], claim.get('claim_type', 'factual'), use_realtime=True, query_context=query)
            for claim in claims
        ]
        verifications = await asyncio.gather(*verification_tasks)
        
        for claim, verification in zip(claims, verifications):
            verification_results.append({
                'claim_text': claim['text'],
                'verification_status': verification['status'],
                'confidence': verification['confidence'],
                'source': verification.get('source'),
                'details': verification.get('details'),
                'url': verification.get('url')
            })
            
            # If verification marked claim as false (context mismatch or incorrect), add violation
            if verification['status'] == 'false':
                result.violations.append({
                    'type': 'hallucination',
                    'severity': 'high',
                    'description': f"Claim verified as incorrect: {claim['text']}. {verification.get('details', 'Context mismatch or factually incorrect.')}"
                })
        
        result.verification_results = verification_results
        
        # Step 3: Check citations
        logger.info("Checking citations...")
        citation_results = extract_and_validate_citations(ai_response)
        result.citations = citation_results.get('urls', [])
        
        # Check for fake citations
        if citation_results.get('fake_citations', 0) > 0:
            result.violations.append({
                'type': 'citation',
                'severity': 'high',
                'description': f"Found {citation_results['fake_citations']} invalid/fake citations"
            })
        
        # Step 4: Check consistency (if we have historical data)
        # Skip consistency check for very short responses (< 3 words) as they're often valid
        consistency_score = 0.7  # Default
        try:
            # Only check consistency for responses with meaningful content
            word_count = len(ai_response.split())
            if word_count >= 3:  # Only check if response has at least 3 words
                consistency_score = check_historical_consistency(query, organization_id, ai_response)
                # Only flag consistency if EXTREMELY inconsistent (< 0.1) - likely a real contradiction
                # Very low scores (< 0.1) usually mean no similar data, not actual inconsistency
                # Don't penalize just because responses are different
                if consistency_score < 0.1:
                    # Only flag if it's a clear contradiction (very low score)
                    # But mark it as informational only - don't let it block/flag the response
                    result.violations.append({
                        'type': 'consistency',
                        'severity': 'low',  # Low severity - informational only
                        'description': f'Response differs significantly from historical responses (score: {consistency_score:.2f})'
                    })
        except Exception as e:
            logger.warning(f"Could not check consistency: {str(e)}")
        
        # Step 5: Check compliance rules
        compliance_result = {'passed': True, 'violations': []}  # Default
        try:
            logger.info("Checking compliance rules...")
            # Get industry from organization (would need to fetch)
            compliance_result = check_compliance(ai_response, organization_id, industry=None)
            if not compliance_result['passed']:
                for violation in compliance_result.get('violations', []):
                    result.violations.append({
                        'type': 'compliance',
                        'severity': violation.get('severity', 'medium'),
                        'description': violation.get('description', ''),
                        'rule_name': violation.get('rule_name', '')
                    })
        except Exception as e:
            logger.warning(f"Could not check compliance: {str(e)}")
        
        # Step 6: Check company policies
        try:
            logger.info("Checking company policies...")
            policy_violations = detect_policy_violations(ai_response, organization_id)
            for violation in policy_violations:
                result.violations.append({
                    'type': 'policy',
                    'severity': violation.get('severity', 'high'),
                    'description': violation.get('description', ''),
                    'policy_name': violation.get('policy_name', '')
                })
        except Exception as e:
            logger.warning(f"Could not check policies: {str(e)}")
        
        # Step 7: Calculate confidence score (now includes compliance and breakdown)
        confidence_data = calculate_detection_confidence(
            verification_results,
            citation_results,
            consistency_score,
            compliance_result
        )
        result.confidence_score = confidence_data['total_score']
        
        # Identify what pulled the score up or down
        breakdown = confidence_data['breakdown']
        positive_factors = []
        negative_factors = []
        
        for component_name, component_data in breakdown.items():
            score = component_data['score']
            label = component_data['label']
            
            if score >= 0.8:
                positive_factors.append(f"{label} scored high ({score:.0%})")
            elif score < 0.5:
                negative_factors.append(f"{label} scored low ({score:.0%}) - {component_data['description']}")
            elif score < 0.7:
                negative_factors.append(f"{label} could be improved ({score:.0%})")
        
        # Add contributions to breakdown
        breakdown_with_contributions = confidence_data['breakdown'].copy()
        breakdown_with_contributions['contributions'] = {
            'positive_factors': positive_factors,
            'negative_factors': negative_factors
        }
        
        result.confidence_breakdown = breakdown_with_contributions
        
        # Step 8: Determine status (consider compliance violations)
        # Critical compliance violations always block
        critical_violations = [v for v in result.violations if v.get('severity') == 'critical']
        high_severity_violations = [v for v in result.violations if v.get('severity') == 'high']
        
        # Real violations that should block: compliance, policy, citation, hallucination (not just consistency)
        real_violations = [v for v in result.violations if v.get('type') in ['compliance', 'policy', 'citation', 'hallucination']]
        # Consistency violations are informational only - don't let them block/flag
        consistency_violations = [v for v in result.violations if v.get('type') == 'consistency']
        has_only_consistency_issues = len(result.violations) == len(consistency_violations) and len(consistency_violations) > 0
        
        # CONSISTENT STATUS DETERMINATION LOGIC:
        # Priority 1: Critical violations always block
        if critical_violations:
            result.status = "blocked"
        # Priority 2: High severity real violations block
        elif high_severity_violations and real_violations:
            result.status = "blocked"
        # Priority 3: Real violations (compliance, policy, citation, hallucination) always flag
        # This ensures consistency - if there are policy violations, it's ALWAYS flagged
        elif real_violations:
            result.status = "flagged"
        # Priority 4: Only consistency issues (no real violations) - be lenient
        elif has_only_consistency_issues:
            # Consistency issues alone shouldn't block or flag - just informational
            # Only flag if confidence is very low AND there are multiple consistency issues
            if result.confidence_score < 0.3 and len(consistency_violations) > 1:
                result.status = "flagged"
            else:
                result.status = "approved"  # Approve even with consistency issues if no real violations
        # Priority 5: Very short responses (< 3 words) - be lenient
        elif len(ai_response.split()) < 3:
            # Short responses: only block if there are real violations
            if real_violations:
                result.status = "blocked"
            elif result.confidence_score < 0.3:
                result.status = "flagged"
            else:
                result.status = "approved"
        # Priority 6: Very low confidence AND real violations - block
        elif result.confidence_score < 0.3 and real_violations:
            result.status = "blocked"
        # Priority 7: Low confidence without real violations - flag
        elif result.confidence_score < 0.4:
            result.status = "flagged"
        # Priority 8: Medium-low confidence without real violations - flag
        elif result.confidence_score < 0.5:
            result.status = "flagged"
        # Priority 9: Good confidence (≥ 0.5) and no real violations - approve
        else:
            result.status = "approved"
        
        # Step 9: Generate explanation
        result.explanation = generate_explanation(result)
        
        # Convert to dict for response
        breakdown = getattr(result, 'confidence_breakdown', {})
        return {
            'status': result.status,
            'confidence_score': result.confidence_score,
            'confidence_breakdown': breakdown if breakdown else None,
            'violations': result.violations,
            'verification_results': result.verification_results,
            'citations': result.citations,
            'claims': result.claims,
            'explanation': result.explanation
        }
        
    except Exception as e:
        logger.error(f"Error in detection pipeline: {str(e)}")
        return {
            'status': 'flagged',
            'confidence_score': 0.5,
            'violations': [{
                'type': 'error',
                'severity': 'medium',
                'description': f'Detection error: {str(e)}'
            }],
            'verification_results': [],
            'citations': [],
            'claims': [],
            'explanation': f'Error during detection: {str(e)}'
        }

def calculate_detection_confidence(
    verification_results: List[Dict],
    citation_results: Dict,
    consistency_score: float,
    compliance_result: Dict = None
) -> Dict[str, Any]:
    """
    Calculate overall confidence score
    Weighted combination of all checks (updated to include compliance)
    """
    # Fact verification weight: 25%
    # SMART HANDLING: Unverified general statements don't penalize as much
    # Only specific factual claims should be verified
    fact_score = 0.7  # Default to 0.7 (positive) instead of 0.5 (neutral)
    if verification_results:
        verified_count = sum(1 for r in verification_results if r['verification_status'] == 'verified')
        false_count = sum(1 for r in verification_results if r['verification_status'] == 'false')
        unverified_count = sum(1 for r in verification_results if r['verification_status'] == 'unverified')
        total = len(verification_results)
        
        # SMART CALCULATION: Weight verified claims more, unverified less
        # Verified claims are important - use their confidence
        # Unverified claims: if they're general statements, don't penalize much (0.6 instead of 0.5)
        # False claims: heavily penalize (-1.0)
        if total > 0:
            if verified_count > 0:
                # Get average confidence of verified claims
                verified_confidences = [r.get('confidence', 0.7) for r in verification_results if r['verification_status'] == 'verified']
                avg_verified_confidence = sum(verified_confidences) / len(verified_confidences) if verified_confidences else 0.7
                # Use average confidence for verified claims
                # Unverified gets 0.6 (slightly positive) - assumes they might be general statements
                fact_score = (verified_count * avg_verified_confidence + unverified_count * 0.6 - false_count * 1.0) / total
            else:
                # No verified claims, but unverified might be general statements (not wrong)
                # Be more lenient: unverified = 0.6 (slightly positive)
                fact_score = (verified_count * 1.0 + unverified_count * 0.6 - false_count * 1.0) / total
            fact_score = max(0.0, min(1.0, fact_score))  # Clamp between 0 and 1
    fact_weighted = fact_score * 0.25  # 25% weight (verified facts are important)
    
    # Citation validity weight: 15% (reduced from 20%)
    citation_score = 0.0
    if citation_results.get('total_citations', 0) > 0:
        valid_citations = citation_results.get('valid_citations', 0)
        total_citations = citation_results.get('total_citations', 0)
        citation_score = valid_citations / total_citations if total_citations > 0 else 1.0
    citation_weighted = citation_score * 0.15
    
    # Consistency weight: 10% (reduced from 15% - consistency is less critical)
    consistency_weighted = consistency_score * 0.10
    
    # Compliance weight: 25% (NEW)
    compliance_score = 1.0
    if compliance_result:
        if compliance_result.get('passed', True):
            compliance_score = 1.0
        else:
            # Penalize based on violation severity
            violations = compliance_result.get('violations', [])
            if violations:
                severity_penalties = {'low': 0.1, 'medium': 0.3, 'high': 0.6, 'critical': 1.0}
                max_penalty = max([severity_penalties.get(v.get('severity', 'medium'), 0.3) for v in violations])
                compliance_score = 1.0 - max_penalty
    compliance_weighted = compliance_score * 0.25
    
    # Claim clarity weight: 20% (increased from 15% - clarity is important)
    clarity_score = 0.8  # Default
    clarity_weighted = clarity_score * 0.20
    
    # Total confidence
    total_confidence = fact_weighted + citation_weighted + consistency_weighted + compliance_weighted + clarity_weighted
    total_confidence = min(max(total_confidence, 0.0), 1.0)
    
    # Return detailed breakdown for transparency
    return {
        'total_score': total_confidence,
        'breakdown': {
            'fact_verification': {
                'score': fact_score,
                'weight': 0.25,
                'weighted_score': fact_weighted,
                'label': 'Fact Verification',
                'description': f'Verified {verified_count if verification_results else 0}/{len(verification_results) if verification_results else 0} claims',
                'details': {
                    'verified_count': verified_count if verification_results else 0,
                    'unverified_count': unverified_count if verification_results else 0,
                    'false_count': false_count if verification_results else 0,
                    'total_claims': len(verification_results) if verification_results else 0
                }
            },
            'citation_validity': {
                'score': citation_score,
                'weight': 0.15,
                'weighted_score': citation_weighted,
                'label': 'Citation Validity',
                'description': f'{citation_results.get("valid_citations", 0)}/{citation_results.get("total_citations", 0)} citations valid' if citation_results.get("total_citations", 0) > 0 else 'No citations provided',
                'details': {
                    'valid_citations': citation_results.get('valid_citations', 0),
                    'total_citations': citation_results.get('total_citations', 0)
                }
            },
            'consistency': {
                'score': consistency_score,
                'weight': 0.10,
                'weighted_score': consistency_weighted,
                'label': 'Consistency Check',
                'description': 'Consistency with historical responses' if consistency_score > 0.5 else 'Low consistency - may indicate new query or different response style',
                'details': {
                    'raw_score': consistency_score
                }
            },
            'compliance': {
                'score': compliance_score,
                'weight': 0.25,
                'weighted_score': compliance_weighted,
                'label': 'Compliance & Policies',
                'description': 'Compliance check passed' if compliance_score >= 1.0 else f'Compliance issues detected',
                'details': {
                    'passed': compliance_result.get('passed', True) if compliance_result else True,
                    'violations_count': len(compliance_result.get('violations', [])) if compliance_result else 0
                }
            },
            'response_clarity': {
                'score': clarity_score,
                'weight': 0.20,
                'weighted_score': clarity_weighted,
                'label': 'Response Clarity',
                'description': 'Response is clear and well-structured',
                'details': {
                    'clarity_score': clarity_score
                }
            }
        },
        'contributions': {
            'positive_factors': [],
            'negative_factors': []
        }
    }

def generate_explanation(result: DetectionResult) -> str:
    """
    Generate human-readable explanation of detection result
    """
    explanation_parts = []
    
    explanation_parts.append(f"Confidence Score: {result.confidence_score:.0%}")
    
    if result.status == "approved":
        explanation_parts.append("Response approved - no issues detected.")
    elif result.status == "flagged":
        explanation_parts.append("Response flagged for review - some concerns detected.")
    else:
        explanation_parts.append("Response blocked - significant issues detected.")
    
    if result.violations:
        explanation_parts.append(f"Found {len(result.violations)} violation(s):")
        for violation in result.violations:
            explanation_parts.append(f"- {violation['type']}: {violation['description']}")
    
    if result.verification_results:
        verified = sum(1 for r in result.verification_results if r['verification_status'] == 'verified')
        explanation_parts.append(f"Verified {verified}/{len(result.verification_results)} claims.")
    
    if result.citations:
        valid = sum(1 for c in result.citations if c.get('is_valid', False))
        explanation_parts.append(f"Validated {valid}/{len(result.citations)} citations.")
    
    return " ".join(explanation_parts)

