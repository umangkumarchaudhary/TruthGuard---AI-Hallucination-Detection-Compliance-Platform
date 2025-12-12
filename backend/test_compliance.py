"""
Test script for compliance and policy system
Tests with real-world scenarios
"""
import sys
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent))

from app.services.compliance import check_compliance
from app.services.policy_matching import detect_policy_violations
from app.services.rule_engine import parse_rule, evaluate_rule
from app.services.regulatory_templates import get_all_regulatory_templates
from app.services.correction import suggest_correction

def test_financial_services_scenario():
    """Test Financial Services (AmEx/Barclays) scenario"""
    print("=" * 70)
    print("TEST SCENARIO 1: Financial Services (AmEx/Barclays)")
    print("=" * 70)
    
    # Scenario: AI financial advisor chatbot
    query = "Should I invest in cryptocurrency?"
    ai_response = "Yes, cryptocurrency always goes up. Invest all your savings. It's guaranteed to make you rich!"
    
    print(f"\nQuery: {query}")
    print(f"AI Response: {ai_response}")
    print("\n" + "-" * 70)
    
    # Test compliance rules
    print("\n📋 Checking Compliance Rules...")
    compliance_result = check_compliance(
        response=ai_response,
        organization_id="test-finance-org",
        industry="finance"
    )
    
    print(f"Compliance Check: {'✅ PASSED' if compliance_result['passed'] else '❌ FAILED'}")
    print(f"Violations Found: {compliance_result['violations_count']}")
    
    if compliance_result['violations']:
        print("\n🚨 Violations Detected:")
        for i, violation in enumerate(compliance_result['violations'], 1):
            print(f"  {i}. [{violation['severity'].upper()}] {violation['rule_name']}")
            print(f"     {violation['description']}")
    
    # Test policy violations
    print("\n📋 Checking Company Policies...")
    # Would need actual policies in database, so this is a placeholder
    print("Policy check would run here (requires database setup)")
    
    # Test correction
    print("\n🔧 Generating Correction...")
    violations = [
        {
            'type': 'compliance',
            'severity': 'critical',
            'description': 'Contains prohibited guarantee language',
            'rule_name': 'SEC - No Financial Guarantees'
        },
        {
            'type': 'hallucination',
            'severity': 'high',
            'description': 'Claim "always goes up" is unverified'
        }
    ]
    
    correction = suggest_correction(ai_response, violations, query)
    print(f"\nOriginal: {ai_response}")
    print(f"\nCorrected: {correction['corrected_response']}")
    if correction['changes_made']:
        print(f"\nChanges Made:")
        for change in correction['changes_made']:
            print(f"  - {change}")
    
    print("\n" + "=" * 70)

def test_airline_scenario():
    """Test Airlines (United) scenario"""
    print("\n" + "=" * 70)
    print("TEST SCENARIO 2: Airlines (United)")
    print("=" * 70)
    
    query = "Can I get a refund for my canceled flight?"
    ai_response = "Yes, you'll get a full refund within 24 hours guaranteed!"
    
    print(f"\nQuery: {query}")
    print(f"AI Response: {ai_response}")
    print("\n" + "-" * 70)
    
    # Test compliance
    print("\n📋 Checking Compliance Rules...")
    compliance_result = check_compliance(
        response=ai_response,
        organization_id="test-airline-org",
        industry="airline"
    )
    
    print(f"Compliance Check: {'✅ PASSED' if compliance_result['passed'] else '❌ FAILED'}")
    print(f"Violations Found: {compliance_result['violations_count']}")
    
    if compliance_result['violations']:
        print("\n🚨 Violations Detected:")
        for i, violation in enumerate(compliance_result['violations'], 1):
            print(f"  {i}. [{violation['severity'].upper()}] {violation['rule_name']}")
            print(f"     {violation['description']}")
    
    # Test policy violation (refund policy)
    print("\n📋 Testing Policy Violation...")
    # Simulate policy: "Refunds take 7-10 business days"
    policy_violation = {
        'type': 'policy',
        'severity': 'high',
        'description': 'Response promises 24 hours but policy allows 7-10 business days',
        'policy_name': 'Refund Policy'
    }
    
    print(f"Policy Violation: {policy_violation['description']}")
    
    # Test correction
    print("\n🔧 Generating Correction...")
    violations = [policy_violation]
    correction = suggest_correction(ai_response, violations, query)
    print(f"\nOriginal: {ai_response}")
    print(f"\nCorrected: {correction['corrected_response']}")
    
    print("\n" + "=" * 70)

def test_consulting_scenario():
    """Test Consulting (KPMG) scenario"""
    print("\n" + "=" * 70)
    print("TEST SCENARIO 3: Consulting (KPMG)")
    print("=" * 70)
    
    query = "What does GDPR Article 25 say?"
    ai_response = "GDPR Article 25 requires companies to delete all user data annually. According to SEC regulation 2023-45, this must be done within 30 days."
    
    print(f"\nQuery: {query}")
    print(f"AI Response: {ai_response}")
    print("\n" + "-" * 70)
    
    # Test compliance
    print("\n📋 Checking Compliance Rules...")
    compliance_result = check_compliance(
        response=ai_response,
        organization_id="test-consulting-org",
        industry="consulting"
    )
    
    print(f"Compliance Check: {'✅ PASSED' if compliance_result['passed'] else '❌ FAILED'}")
    
    # Test for fake regulation citation
    print("\n📋 Checking for Fake Citations...")
    fake_citation = {
        'type': 'citation',
        'severity': 'critical',
        'description': 'SEC regulation 2023-45 does not exist - fake citation detected'
    }
    print(f"Fake Citation Detected: {fake_citation['description']}")
    
    # Test correction
    print("\n🔧 Generating Correction...")
    violations = [
        {
            'type': 'hallucination',
            'severity': 'high',
            'description': 'Incorrect interpretation of GDPR Article 25'
        },
        fake_citation
    ]
    
    correction = suggest_correction(ai_response, violations, query)
    print(f"\nOriginal: {ai_response}")
    print(f"\nCorrected: {correction['corrected_response']}")
    
    print("\n" + "=" * 70)

def test_regulatory_templates():
    """Test regulatory rule templates"""
    print("\n" + "=" * 70)
    print("TEST: Regulatory Rule Templates")
    print("=" * 70)
    
    templates = get_all_regulatory_templates()
    
    print(f"\nAvailable Regulatory Templates: {len(templates)}")
    for regulation, rules in templates.items():
        print(f"\n{regulation}: {len(rules)} rules")
        for rule in rules:
            print(f"  - {rule['rule_name']} ({rule['severity']})")
    
    # Test a specific rule
    print("\n" + "-" * 70)
    print("\nTesting SEC Rule: 'No Financial Guarantees'")
    
    sec_rules = templates['SEC']
    guarantee_rule = next((r for r in sec_rules if 'guarantee' in r['rule_name'].lower()), None)
    
    if guarantee_rule:
        rule = parse_rule(guarantee_rule)
        
        # Test with violating response
        test_response = "This investment is guaranteed to make you rich!"
        result = evaluate_rule(rule, test_response)
        
        print(f"\nTest Response: {test_response}")
        print(f"Rule Evaluation: {'❌ FAILED' if not result.passed else '✅ PASSED'}")
        print(f"Details: {result.details}")
        print(f"Severity: {result.severity}")
    
    print("\n" + "=" * 70)

def test_rule_engine():
    """Test rule engine with various rule types"""
    print("\n" + "=" * 70)
    print("TEST: Rule Engine")
    print("=" * 70)
    
    # Test keyword matching
    print("\n--- Keyword Matching Rule ---")
    keyword_rule_def = {
        'id': 'test-1',
        'rule_name': 'No Guarantees',
        'rule_type': 'regulatory',
        'rule_definition': {
            'type': 'keyword_match',
            'keywords': ['guarantee', 'guaranteed', 'always'],
            'action': 'block'
        },
        'severity': 'critical',
        'is_active': True
    }
    
    rule = parse_rule(keyword_rule_def)
    test_cases = [
        ("This is guaranteed to work", False),
        ("This may work", True),
        ("This always succeeds", False)
    ]
    
    for response, should_pass in test_cases:
        result = evaluate_rule(rule, response)
        status = "✅" if result.passed == should_pass else "❌"
        print(f"{status} '{response}' -> {'PASS' if result.passed else 'FAIL'}")
    
    # Test pattern matching
    print("\n--- Pattern Matching Rule ---")
    pattern_rule_def = {
        'id': 'test-2',
        'rule_name': 'No Investment Advice',
        'rule_type': 'regulatory',
        'rule_definition': {
            'type': 'pattern_match',
            'patterns': [r'buy\s+\w+\s+stock', r'invest\s+in\s+\w+'],
            'action': 'flag'
        },
        'severity': 'high',
        'is_active': True
    }
    
    rule = parse_rule(pattern_rule_def)
    test_cases = [
        ("You should buy Apple stock", False),
        ("Investing can be risky", True),
        ("Invest in crypto now", False)
    ]
    
    for response, should_pass in test_cases:
        result = evaluate_rule(rule, response)
        status = "✅" if result.passed == should_pass else "❌"
        print(f"{status} '{response}' -> {'PASS' if result.passed else 'FAIL'}")
    
    print("\n" + "=" * 70)

if __name__ == "__main__":
    print("🧪 Testing TruthGuard Compliance & Policy System")
    print("=" * 70)
    
    try:
        # Run all tests
        test_regulatory_templates()
        test_rule_engine()
        test_financial_services_scenario()
        test_airline_scenario()
        test_consulting_scenario()
        
        print("\n" + "=" * 70)
        print("✅ All compliance tests completed!")
        print("=" * 70)
        
    except Exception as e:
        print(f"\n❌ Test failed: {str(e)}")
        import traceback
        traceback.print_exc()

