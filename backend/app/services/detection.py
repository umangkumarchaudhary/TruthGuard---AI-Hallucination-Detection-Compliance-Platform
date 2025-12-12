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

logger = logging.getLogger(__name__)

class DetectionResult:
    """Result of hallucination detection"""
    def __init__(self):
        self.status = "approved"  # approved, flagged, blocked
        self.confidence_score = 1.0
        self.violations = []
        self.verification_results = []
        self.citations = []
        self.claims = []
        self.explanation = ""

def detect_hallucinations(
    query: str,
    ai_response: str,
    organization_id: str,
    ai_model: Optional[str] = None
) -> Dict[str, Any]:
    """
    Main detection pipeline
    Combines all detection methods to identify hallucinations
    """
    result = DetectionResult()
    
    try:
        # Step 1: Extract claims from AI response
        logger.info("Extracting claims from AI response...")
        claims = extract_claims(ai_response)
        result.claims = [c for c in claims]  # Convert to dicts
        
        # Step 2: Verify facts
        logger.info(f"Verifying {len(claims)} claims...")
        verification_results = []
        for claim in claims:
            verification = verify_claim(claim['text'], claim.get('claim_type', 'factual'))
            verification_results.append({
                'claim_text': claim['text'],
                'verification_status': verification['status'],
                'confidence': verification['confidence'],
                'source': verification.get('source'),
                'details': verification.get('details')
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
        consistency_score = 0.7  # Default
        try:
            consistency_score = check_historical_consistency(query, organization_id, ai_response)
            if consistency_score < 0.5:
                result.violations.append({
                    'type': 'consistency',
                    'severity': 'medium',
                    'description': f'Response is inconsistent with historical responses (score: {consistency_score:.2f})'
                })
        except Exception as e:
            logger.warning(f"Could not check consistency: {str(e)}")
        
        # Step 5: Calculate confidence score
        result.confidence_score = calculate_detection_confidence(
            verification_results,
            citation_results,
            consistency_score
        )
        
        # Step 6: Determine status
        if result.confidence_score < 0.6:
            result.status = "blocked"
        elif result.confidence_score < 0.8:
            result.status = "flagged"
        else:
            result.status = "approved"
        
        # Step 7: Generate explanation
        result.explanation = generate_explanation(result)
        
        # Convert to dict for response
        return {
            'status': result.status,
            'confidence_score': result.confidence_score,
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
    consistency_score: float
) -> float:
    """
    Calculate overall confidence score
    Weighted combination of all checks
    """
    # Fact verification weight: 40%
    fact_score = 0.0
    if verification_results:
        verified_count = sum(1 for r in verification_results if r['verification_status'] == 'verified')
        fact_score = verified_count / len(verification_results)
    fact_weighted = fact_score * 0.4
    
    # Citation validity weight: 20%
    citation_score = 0.0
    if citation_results.get('total_citations', 0) > 0:
        valid_citations = citation_results.get('valid_citations', 0)
        total_citations = citation_results.get('total_citations', 0)
        citation_score = valid_citations / total_citations if total_citations > 0 else 1.0
    citation_weighted = citation_score * 0.2
    
    # Consistency weight: 20%
    consistency_weighted = consistency_score * 0.2
    
    # Claim clarity weight: 20% (simplified - would use NLP in production)
    clarity_score = 0.8  # Default
    clarity_weighted = clarity_score * 0.2
    
    # Total confidence
    total_confidence = fact_weighted + citation_weighted + consistency_weighted + clarity_weighted
    
    return min(max(total_confidence, 0.0), 1.0)

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

