"""
Test script for detection system
Run this to test the detection pipeline
"""
import sys
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent))

from app.services.detection import detect_hallucinations
from app.services.claim_extraction import extract_claims
from app.services.fact_verification import verify_claim
from app.services.citation_verification import extract_and_validate_citations

def test_claim_extraction():
    """Test claim extraction"""
    print("=" * 50)
    print("Testing Claim Extraction")
    print("=" * 50)
    
    test_text = """
    Your credit limit is $50,000. According to our records, 
    you can make purchases up to this amount. The interest rate 
    is 18.5% annually. This information was last updated on 
    January 15, 2024.
    """
    
    claims = extract_claims(test_text)
    print(f"\nExtracted {len(claims)} claims:")
    for i, claim in enumerate(claims, 1):
        print(f"\n{i}. {claim['text']}")
        print(f"   Type: {claim['claim_type']}")
        print(f"   Confidence: {claim['confidence']:.2f}")
        if claim['numbers']:
            print(f"   Numbers: {[n['value'] for n in claim['numbers']]}")
    
    return claims

def test_fact_verification():
    """Test fact verification"""
    print("\n" + "=" * 50)
    print("Testing Fact Verification")
    print("=" * 50)
    
    test_claims = [
        "The Earth is round",
        "Bitcoin always goes up in value",
        "According to research, exercise improves health"
    ]
    
    for claim in test_claims:
        result = verify_claim(claim)
        print(f"\nClaim: {claim}")
        print(f"Status: {result['status']}")
        print(f"Confidence: {result['confidence']:.2f}")
        if result.get('details'):
            print(f"Details: {result['details']}")

def test_citation_verification():
    """Test citation verification"""
    print("\n" + "=" * 50)
    print("Testing Citation Verification")
    print("=" * 50)
    
    test_text = """
    According to SEC regulation 2023-45, all financial advisors 
    must disclose conflicts of interest. You can read more at 
    https://www.sec.gov/rules/final/2023/34-98765.pdf. 
    Source: Financial Times article from January 2024.
    """
    
    results = extract_and_validate_citations(test_text)
    print(f"\nTotal citations found: {results['total_citations']}")
    print(f"Valid citations: {results['valid_citations']}")
    print(f"Fake citations: {results['fake_citations']}")
    
    if results.get('urls'):
        print("\nURLs:")
        for url_result in results['urls']:
            print(f"  {url_result['url']}: {'Valid' if url_result['is_valid'] else 'Invalid'}")

def test_full_detection():
    """Test full detection pipeline"""
    print("\n" + "=" * 50)
    print("Testing Full Detection Pipeline")
    print("=" * 50)
    
    # Test case 1: Clear hallucination
    print("\n--- Test Case 1: Clear Hallucination ---")
    query1 = "What's my credit limit?"
    response1 = "Your credit limit is $50,000. You can spend this amount immediately."
    
    result1 = detect_hallucinations(
        query=query1,
        ai_response=response1,
        organization_id="test-org-id",
        ai_model="gpt-4"
    )
    
    print(f"Status: {result1['status']}")
    print(f"Confidence: {result1['confidence_score']:.2f}")
    print(f"Violations: {len(result1['violations'])}")
    print(f"Explanation: {result1['explanation']}")
    
    # Test case 2: Factual response
    print("\n--- Test Case 2: Factual Response ---")
    query2 = "What is the capital of France?"
    response2 = "The capital of France is Paris. Paris is located in the north-central part of the country."
    
    result2 = detect_hallucinations(
        query=query2,
        ai_response=response2,
        organization_id="test-org-id",
        ai_model="gpt-4"
    )
    
    print(f"Status: {result2['status']}")
    print(f"Confidence: {result2['confidence_score']:.2f}")
    print(f"Violations: {len(result2['violations'])}")
    
    # Test case 3: Fake citation
    print("\n--- Test Case 3: Fake Citation ---")
    query3 = "What does GDPR say?"
    response3 = "According to GDPR Article 25, companies must delete all user data annually. Source: https://fake-url-that-does-not-exist.com/gdpr"
    
    result3 = detect_hallucinations(
        query=query3,
        ai_response=response3,
        organization_id="test-org-id",
        ai_model="gpt-4"
    )
    
    print(f"Status: {result3['status']}")
    print(f"Confidence: {result3['confidence_score']:.2f}")
    print(f"Violations: {len(result3['violations'])}")
    if result3['violations']:
        for v in result3['violations']:
            print(f"  - {v['type']}: {v['description']}")

if __name__ == "__main__":
    print("🧪 Testing TruthGuard Detection System")
    print("=" * 50)
    
    try:
        # Run tests
        test_claim_extraction()
        test_fact_verification()
        test_citation_verification()
        test_full_detection()
        
        print("\n" + "=" * 50)
        print("✅ All tests completed!")
        print("=" * 50)
        
    except Exception as e:
        print(f"\n❌ Test failed: {str(e)}")
        import traceback
        traceback.print_exc()

