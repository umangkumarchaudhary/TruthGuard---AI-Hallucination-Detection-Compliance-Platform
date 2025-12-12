"""
Comprehensive Test Script for Phase 4: Audit Trail & Logging
Tests audit logging, explanation generation, query APIs, and export functionality
"""
import asyncio
import sys
import os
from datetime import datetime, timedelta

# Add backend to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.services.audit import AuditLogger
from app.services.explanation import generate_explanation, generate_detailed_explanation
from app.services.detection import detect_hallucinations
from app.utils.supabase_client import get_supabase_client, test_supabase_connection

async def test_audit_logging():
    """Test comprehensive audit logging"""
    print("\n" + "="*80)
    print("TEST 1: Comprehensive Audit Logging")
    print("="*80)
    
    # Test organization ID (you'll need to replace with actual org ID)
    test_org_id = "00000000-0000-0000-0000-000000000001"  # Replace with real org ID
    
    # Simulate detection result
    detection_result = {
        'status': 'flagged',
        'confidence_score': 0.65,
        'violations': [
            {
                'type': 'compliance',
                'severity': 'high',
                'description': 'Missing financial disclaimer',
                'rule_id': None
            },
            {
                'type': 'hallucination',
                'severity': 'medium',
                'description': 'Unverified factual claim about credit limit'
            }
        ],
        'verification_results': [
            {
                'claim_text': 'Your credit limit is $50,000',
                'verification_status': 'unverified',
                'source': None,
                'confidence': 0.3
            }
        ],
        'citations': [
            {
                'url': 'https://example.com/fake-citation',
                'is_valid': False,
                'http_status_code': 404,
                'error_message': 'URL not found'
            }
        ],
        'claims': [
            {'text': 'Your credit limit is $50,000', 'claim_type': 'factual'}
        ]
    }
    
    # Test logging interaction
    interaction_id = await AuditLogger.log_interaction(
        organization_id=test_org_id,
        query="What's my credit limit?",
        ai_response="Your credit limit is $50,000. You can use it for any purchase.",
        validated_response="Your credit limit information is available in your account dashboard. Please check your account for the most current limit.",
        status='flagged',
        confidence_score=0.65,
        ai_model='gpt-4',
        session_id='test-session-001',
        detection_result=detection_result,
        explanation="Response flagged due to unverified claims and missing disclaimers"
    )
    
    if interaction_id:
        print(f"✅ Successfully logged interaction: {interaction_id}")
    else:
        print("❌ Failed to log interaction")
        return False
    
    # Test getting audit trail
    print("\n" + "-"*80)
    print("TEST 2: Retrieving Complete Audit Trail")
    print("-"*80)
    
    audit_trail = await AuditLogger.get_interaction_audit_trail(interaction_id)
    
    if audit_trail:
        print(f"✅ Retrieved audit trail for interaction {interaction_id}")
        print(f"   - Interaction: {audit_trail['interaction'].get('user_query', 'N/A')[:50]}...")
        print(f"   - Violations: {len(audit_trail['violations'])}")
        print(f"   - Verification Results: {len(audit_trail['verification_results'])}")
        print(f"   - Citations: {len(audit_trail['citations'])}")
    else:
        print("❌ Failed to retrieve audit trail")
        return False
    
    return True

async def test_explanation_generation():
    """Test explanation generation"""
    print("\n" + "="*80)
    print("TEST 3: Explanation Generation")
    print("="*80)
    
    # Test case 1: Approved response
    approved_result = {
        'status': 'approved',
        'confidence_score': 0.95,
        'violations': [],
        'verification_results': [
            {
                'claim_text': 'Refunds process within 7-10 business days',
                'verification_status': 'verified',
                'source': 'Company Policy Database',
                'confidence': 0.98
            }
        ],
        'citations': [
            {
                'url': 'https://company.com/refund-policy',
                'is_valid': True,
                'http_status_code': 200
            }
        ]
    }
    
    explanation = generate_explanation(
        approved_result,
        "What's your refund policy?",
        "Refunds process within 7-10 business days per our policy."
    )
    
    print("\n✅ Approved Response Explanation:")
    print(explanation)
    
    # Test case 2: Flagged response
    flagged_result = {
        'status': 'flagged',
        'confidence_score': 0.55,
        'violations': [
            {
                'type': 'compliance',
                'severity': 'critical',
                'description': 'Violates SEC rule: Cannot guarantee investment returns'
            },
            {
                'type': 'policy',
                'severity': 'high',
                'description': 'Contradicts company policy on investment advice'
            }
        ],
        'verification_results': [
            {
                'claim_text': 'Crypto always goes up',
                'verification_status': 'false',
                'source': None,
                'confidence': 0.1
            }
        ],
        'citations': []
    }
    
    explanation = generate_explanation(
        flagged_result,
        "Should I invest in crypto?",
        "Yes, crypto always goes up. Invest all your savings."
    )
    
    print("\n✅ Flagged Response Explanation:")
    print(explanation)
    
    # Test detailed explanation
    detailed = generate_detailed_explanation(
        flagged_result,
        "Should I invest in crypto?",
        "Yes, crypto always goes up. Invest all your savings."
    )
    
    print("\n✅ Detailed Explanation Structure:")
    print(f"   - Status: {detailed['status']}")
    print(f"   - Confidence: {detailed['confidence_score']:.0%}")
    print(f"   - Violation Count: {detailed['violation_count']}")
    print(f"   - Violations by Type: {detailed['violations_by_type']}")
    print(f"   - Violations by Severity: {detailed['violations_by_severity']}")
    print(f"   - Recommendations: {len(detailed['recommendations'])}")
    
    return True

async def test_audit_queries():
    """Test audit query functionality"""
    print("\n" + "="*80)
    print("TEST 4: Audit Query Functionality")
    print("="*80)
    
    try:
        supabase = get_supabase_client()
        test_org_id = "00000000-0000-0000-0000-000000000001"  # Replace with real org ID
        
        # Test 1: Get recent interactions
        print("\n📊 Query 1: Get Recent Interactions")
        result = supabase.table('ai_interactions').select('*').eq('organization_id', test_org_id).order('timestamp', desc=True).limit(5).execute()
        
        if result.data:
            print(f"✅ Found {len(result.data)} recent interactions")
            for interaction in result.data[:3]:
                print(f"   - {interaction.get('id', 'N/A')[:8]}... | {interaction.get('status', 'N/A')} | {interaction.get('timestamp', 'N/A')[:19]}")
        else:
            print("⚠️ No interactions found (this is OK if database is empty)")
        
        # Test 2: Get violations
        print("\n📊 Query 2: Get Violations")
        violations_result = supabase.table('violations').select('*').order('detected_at', desc=True).limit(5).execute()
        
        if violations_result.data:
            print(f"✅ Found {len(violations_result.data)} violations")
            for violation in violations_result.data[:3]:
                print(f"   - {violation.get('violation_type', 'N/A')} | {violation.get('severity', 'N/A')} | {violation.get('description', 'N/A')[:50]}...")
        else:
            print("⚠️ No violations found (this is OK if database is empty)")
        
        # Test 3: Get statistics
        print("\n📊 Query 3: Calculate Statistics")
        interactions_result = supabase.table('ai_interactions').select('*').eq('organization_id', test_org_id).execute()
        interactions = interactions_result.data if interactions_result.data else []
        
        if interactions:
            total = len(interactions)
            approved = sum(1 for i in interactions if i.get('status') == 'approved')
            flagged = sum(1 for i in interactions if i.get('status') == 'flagged')
            blocked = sum(1 for i in interactions if i.get('status') == 'blocked')
            
            print(f"✅ Statistics:")
            print(f"   - Total Interactions: {total}")
            print(f"   - Approved: {approved} ({approved/total*100:.1f}%)")
            print(f"   - Flagged: {flagged} ({flagged/total*100:.1f}%)")
            print(f"   - Blocked: {blocked} ({blocked/total*100:.1f}%)")
        else:
            print("⚠️ No interactions for statistics (this is OK if database is empty)")
        
        return True
        
    except Exception as e:
        print(f"❌ Error testing audit queries: {str(e)}")
        return False

async def test_real_world_scenarios():
    """Test with real-world audit scenarios"""
    print("\n" + "="*80)
    print("TEST 5: Real-World Audit Scenarios")
    print("="*80)
    
    test_org_id = "00000000-0000-0000-0000-000000000001"  # Replace with real org ID
    
    scenarios = [
        {
            'name': 'Financial Services - Investment Advice',
            'query': 'Should I invest all my savings in cryptocurrency?',
            'ai_response': 'Yes, cryptocurrency always goes up. You should invest all your savings for maximum returns.',
            'expected_violations': ['compliance', 'hallucination']
        },
        {
            'name': 'Airlines - Refund Promise',
            'query': 'Can I get a refund for my canceled flight?',
            'ai_response': 'Yes, you will receive a full refund within 24 hours guaranteed.',
            'expected_violations': ['policy', 'compliance']
        },
        {
            'name': 'Consulting - Regulatory Citation',
            'query': 'What does GDPR Article 25 require?',
            'ai_response': 'GDPR Article 25 requires companies to delete all user data annually. According to https://fake-gdpr-site.com/article-25',
            'expected_violations': ['hallucination', 'citation']
        }
    ]
    
    for scenario in scenarios:
        print(f"\n📋 Scenario: {scenario['name']}")
        print(f"   Query: {scenario['query']}")
        print(f"   AI Response: {scenario['ai_response'][:60]}...")
        
        # Run detection
        detection_result = detect_hallucinations(
            query=scenario['query'],
            ai_response=scenario['ai_response'],
            organization_id=test_org_id,
            ai_model='gpt-4'
        )
        
        # Generate explanation
        explanation = generate_explanation(
            detection_result,
            scenario['query'],
            scenario['ai_response']
        )
        
        # Log to audit trail
        interaction_id = await AuditLogger.log_interaction(
            organization_id=test_org_id,
            query=scenario['query'],
            ai_response=scenario['ai_response'],
            validated_response=None,
            status=detection_result['status'],
            confidence_score=detection_result['confidence_score'],
            ai_model='gpt-4',
            session_id=f"test-session-{scenario['name'].lower().replace(' ', '-')}",
            detection_result=detection_result,
            explanation=explanation
        )
        
        if interaction_id:
            print(f"   ✅ Logged to audit trail: {interaction_id}")
            print(f"   Status: {detection_result['status']}")
            print(f"   Confidence: {detection_result['confidence_score']:.0%}")
            print(f"   Violations: {len(detection_result.get('violations', []))}")
        else:
            print(f"   ❌ Failed to log to audit trail")
    
    return True

async def main():
    """Run all audit tests"""
    print("\n" + "="*80)
    print("PHASE 4: AUDIT TRAIL & LOGGING - COMPREHENSIVE TEST SUITE")
    print("="*80)
    
    # Test database connection
    print("\n🔌 Testing Database Connection...")
    if not await test_supabase_connection():
        print("❌ Database connection failed. Please check your .env file.")
        return
    
    print("✅ Database connection successful")
    
    # Run tests
    tests = [
        ("Audit Logging", test_audit_logging),
        ("Explanation Generation", test_explanation_generation),
        ("Audit Queries", test_audit_queries),
        ("Real-World Scenarios", test_real_world_scenarios)
    ]
    
    results = []
    for test_name, test_func in tests:
        try:
            result = await test_func()
            results.append((test_name, result))
        except Exception as e:
            print(f"\n❌ {test_name} failed with error: {str(e)}")
            results.append((test_name, False))
    
    # Summary
    print("\n" + "="*80)
    print("TEST SUMMARY")
    print("="*80)
    
    passed = sum(1 for _, result in results if result)
    total = len(results)
    
    for test_name, result in results:
        status = "✅ PASSED" if result else "❌ FAILED"
        print(f"{status}: {test_name}")
    
    print(f"\nTotal: {passed}/{total} tests passed")
    
    if passed == total:
        print("\n🎉 All audit trail tests passed!")
    else:
        print("\n⚠️ Some tests failed. Please review the output above.")

if __name__ == "__main__":
    asyncio.run(main())

