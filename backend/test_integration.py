"""
Integration Test Suite for TruthGuard
Tests complete user flows and API integration
"""
import asyncio
import sys
import os
from datetime import datetime

# Add backend to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.utils.supabase_client import get_supabase_client, test_supabase_connection
from app.services.detection import detect_hallucinations
from app.services.compliance import check_compliance
from app.services.policy_matching import detect_policy_violations
from app.services.audit import AuditLogger
import httpx

# Test organization ID (replace with actual)
TEST_ORG_ID = "00000000-0000-0000-0000-000000000001"
API_BASE_URL = "http://localhost:8000"

class Colors:
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    RESET = '\033[0m'

def print_test(name: str):
    print(f"\n{Colors.BLUE}━━━ Testing: {name} ━━━{Colors.RESET}")

def print_success(message: str):
    print(f"{Colors.GREEN}✅ {message}{Colors.RESET}")

def print_error(message: str):
    print(f"{Colors.RED}❌ {message}{Colors.RESET}")

def print_warning(message: str):
    print(f"{Colors.YELLOW}⚠️  {message}{Colors.RESET}")

async def test_database_connection():
    """Test 1: Database Connection"""
    print_test("Database Connection")
    try:
        if await test_supabase_connection():
            print_success("Database connection successful")
            return True
        else:
            print_error("Database connection failed")
            return False
    except Exception as e:
        print_error(f"Database connection error: {str(e)}")
        return False

async def test_detection_pipeline():
    """Test 2: Detection Pipeline"""
    print_test("Detection Pipeline")
    try:
        result = detect_hallucinations(
            query="What's my credit limit?",
            ai_response="Your credit limit is $50,000. You can use it for any purchase.",
            organization_id=TEST_ORG_ID,
            ai_model="gpt-4"
        )
        
        if result and 'status' in result:
            print_success(f"Detection pipeline working - Status: {result['status']}")
            print_success(f"Confidence: {result.get('confidence_score', 0):.0%}")
            print_success(f"Violations: {len(result.get('violations', []))}")
            return True
        else:
            print_error("Detection pipeline returned invalid result")
            return False
    except Exception as e:
        print_error(f"Detection pipeline error: {str(e)}")
        return False

async def test_compliance_checking():
    """Test 3: Compliance Checking"""
    print_test("Compliance Checking")
    try:
        result = check_compliance(
            ai_response="Yes, crypto always goes up. Invest all your savings for maximum returns.",
            organization_id=TEST_ORG_ID,
            industry="finance"
        )
        
        if result and 'passed' in result:
            print_success(f"Compliance checking working - Passed: {result['passed']}")
            print_success(f"Violations: {len(result.get('violations', []))}")
            return True
        else:
            print_error("Compliance checking returned invalid result")
            return False
    except Exception as e:
        print_error(f"Compliance checking error: {str(e)}")
        return False

async def test_policy_matching():
    """Test 4: Policy Matching"""
    print_test("Policy Matching")
    try:
        violations = detect_policy_violations(
            ai_response="Yes, full refund within 24 hours guaranteed.",
            organization_id=TEST_ORG_ID
        )
        
        print_success(f"Policy matching working - Violations: {len(violations)}")
        return True
    except Exception as e:
        print_error(f"Policy matching error: {str(e)}")
        return False

async def test_audit_logging():
    """Test 5: Audit Logging"""
    print_test("Audit Logging")
    try:
        detection_result = {
            'status': 'flagged',
            'confidence_score': 0.65,
            'violations': [{
                'type': 'compliance',
                'severity': 'high',
                'description': 'Test violation'
            }],
            'verification_results': [],
            'citations': []
        }
        
        interaction_id = await AuditLogger.log_interaction(
            organization_id=TEST_ORG_ID,
            query="Test query",
            ai_response="Test response",
            validated_response="Test validated",
            status='flagged',
            confidence_score=0.65,
            ai_model='gpt-4',
            detection_result=detection_result,
            explanation="Test explanation"
        )
        
        if interaction_id:
            print_success(f"Audit logging working - Interaction ID: {interaction_id[:8]}...")
            return True
        else:
            print_error("Audit logging failed")
            return False
    except Exception as e:
        print_error(f"Audit logging error: {str(e)}")
        return False

async def test_api_endpoints():
    """Test 6: API Endpoints"""
    print_test("API Endpoints")
    
    # Note: This requires the FastAPI server to be running
    # We'll test if server is available
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            # Test health endpoint
            try:
                response = await client.get(f"{API_BASE_URL}/health")
                if response.status_code == 200:
                    print_success("Health endpoint working")
                else:
                    print_warning(f"Health endpoint returned {response.status_code}")
            except httpx.ConnectError:
                print_warning("API server not running - start with: uvicorn app.main:app --reload")
                return None
            
            # Test root endpoint
            try:
                response = await client.get(f"{API_BASE_URL}/")
                if response.status_code == 200:
                    print_success("Root endpoint working")
            except:
                pass
            
            return True
    except Exception as e:
        print_warning(f"API endpoint test skipped: {str(e)}")
        return None

async def test_validation_endpoint():
    """Test 7: Validation Endpoint (requires API key)"""
    print_test("Validation Endpoint")
    print_warning("This test requires API server running and valid API key")
    print_warning("Manual test required - see TESTING_GUIDE.md")
    return None

async def test_complete_flow():
    """Test 8: Complete User Flow"""
    print_test("Complete User Flow")
    
    try:
        # Step 1: Detection
        detection_result = detect_hallucinations(
            query="Should I invest in crypto?",
            ai_response="Yes, crypto always goes up. Invest all your savings.",
            organization_id=TEST_ORG_ID,
            ai_model="gpt-4"
        )
        
        # Step 2: Compliance
        compliance_result = check_compliance(
            ai_response="Yes, crypto always goes up. Invest all your savings.",
            organization_id=TEST_ORG_ID,
            industry="finance"
        )
        
        # Step 3: Policy
        policy_violations = detect_policy_violations(
            ai_response="Yes, crypto always goes up. Invest all your savings.",
            organization_id=TEST_ORG_ID
        )
        
        # Step 4: Audit Logging
        interaction_id = await AuditLogger.log_interaction(
            organization_id=TEST_ORG_ID,
            query="Should I invest in crypto?",
            ai_response="Yes, crypto always goes up. Invest all your savings.",
            validated_response="Cryptocurrency is high-risk. Consult a licensed advisor.",
            status=detection_result['status'],
            confidence_score=detection_result['confidence_score'],
            ai_model='gpt-4',
            detection_result=detection_result,
            explanation="Response flagged due to compliance violations"
        )
        
        if interaction_id:
            print_success("Complete flow working")
            print_success(f"  - Detection: {detection_result['status']}")
            print_success(f"  - Compliance: {'Passed' if compliance_result['passed'] else 'Failed'}")
            print_success(f"  - Policy Violations: {len(policy_violations)}")
            print_success(f"  - Logged: {interaction_id[:8]}...")
            return True
        else:
            print_error("Complete flow failed at audit logging")
            return False
            
    except Exception as e:
        print_error(f"Complete flow error: {str(e)}")
        return False

async def main():
    """Run all integration tests"""
    print(f"\n{Colors.BLUE}{'='*60}")
    print("TRUTHGUARD - INTEGRATION TEST SUITE")
    print(f"{'='*60}{Colors.RESET}\n")
    
    results = []
    
    # Run tests
    tests = [
        ("Database Connection", test_database_connection),
        ("Detection Pipeline", test_detection_pipeline),
        ("Compliance Checking", test_compliance_checking),
        ("Policy Matching", test_policy_matching),
        ("Audit Logging", test_audit_logging),
        ("API Endpoints", test_api_endpoints),
        ("Complete Flow", test_complete_flow),
    ]
    
    for test_name, test_func in tests:
        try:
            result = await test_func()
            results.append((test_name, result))
        except Exception as e:
            print_error(f"{test_name} failed with exception: {str(e)}")
            results.append((test_name, False))
    
    # Summary
    print(f"\n{Colors.BLUE}{'='*60}")
    print("TEST SUMMARY")
    print(f"{'='*60}{Colors.RESET}\n")
    
    passed = sum(1 for _, result in results if result is True)
    failed = sum(1 for _, result in results if result is False)
    skipped = sum(1 for _, result in results if result is None)
    total = len(results)
    
    for test_name, result in results:
        if result is True:
            print_success(f"{test_name}")
        elif result is False:
            print_error(f"{test_name}")
        else:
            print_warning(f"{test_name} (skipped)")
    
    print(f"\n{Colors.BLUE}Results: {passed} passed, {failed} failed, {skipped} skipped out of {total} tests{Colors.RESET}\n")
    
    if failed == 0:
        print_success("🎉 All automated tests passed!")
    else:
        print_warning("⚠️  Some tests failed. Review errors above.")

if __name__ == "__main__":
    asyncio.run(main())

