"""
Test script for AI Test API endpoint
Tests the full pipeline: company context → AI generation → validation
"""
import asyncio
import sys
import httpx
from pathlib import Path

# Add backend to path
backend_path = Path(__file__).parent.parent
sys.path.insert(0, str(backend_path))

async def test_ai_status():
    """Test AI status endpoint"""
    print("\n" + "="*60)
    print("Test 1: AI Status Endpoint")
    print("="*60)
    
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(
                "http://localhost:8000/api/v1/ai-test/status",
                headers={"X-API-Key": "test" if True else ""}  # Will use DEV_BYPASS_AUTH if enabled
            )
            
            if response.status_code == 200:
                data = response.json()
                print(f"✅ Status: {data.get('enabled')}")
                print(f"   Model: {data.get('model')}")
                print(f"   Message: {data.get('message')}")
                return data.get('enabled', False)
            else:
                print(f"❌ Status check failed: {response.status_code}")
                print(f"   {response.text}")
                return False
                
        except Exception as e:
            print(f"❌ Error: {str(e)}")
            print("   Make sure backend server is running on http://localhost:8000")
            return False

async def test_companies_list():
    """Test companies list endpoint"""
    print("\n" + "="*60)
    print("Test 2: Companies List Endpoint")
    print("="*60)
    
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(
                "http://localhost:8000/api/v1/ai-test/companies",
                headers={"X-API-Key": "test"}
            )
            
            if response.status_code == 200:
                data = response.json()
                companies = data.get('companies', [])
                print(f"✅ Found {len(companies)} companies")
                
                if companies:
                    print("\n   Companies:")
                    for company in companies[:5]:
                        print(f"   - {company.get('name', 'Unknown')} (ID: {company.get('id', 'N/A')[:8]}...)")
                    return companies[0].get('id') if companies else None
                else:
                    print("   ⚠️  No companies found - using default test ID")
                    return "00000000-0000-0000-0000-000000000001"
            else:
                print(f"❌ Failed: {response.status_code}")
                return None
                
        except Exception as e:
            print(f"❌ Error: {str(e)}")
            return None

async def test_generate_and_validate(company_id: str):
    """Test full generate and validate endpoint"""
    print("\n" + "="*60)
    print("Test 3: Generate & Validate Endpoint")
    print("="*60)
    
    test_query = "Should I invest all my savings in cryptocurrency?"
    
    print(f"Company ID: {company_id}")
    print(f"Query: {test_query}")
    print("\n   Generating AI response and validating...")
    
    async with httpx.AsyncClient(timeout=30.0) as client:
        try:
            response = await client.post(
                "http://localhost:8000/api/v1/ai-test/generate",
                headers={
                    "Content-Type": "application/json",
                    "X-API-Key": "test"
                },
                json={
                    "company_id": company_id,
                    "user_query": test_query,
                    "ai_model": "gemini-pro"
                }
            )
            
            if response.status_code == 200:
                data = response.json()
                
                print(f"\n✅ Success!")
                print(f"\n   AI Response:")
                print(f"   {data.get('ai_response', 'N/A')[:200]}...")
                
                validation = data.get('validation_result', {})
                print(f"\n   Validation Status: {validation.get('status', 'N/A')}")
                print(f"   Confidence: {validation.get('confidence_score', 0):.0%}")
                print(f"   Violations: {len(validation.get('violations', []))}")
                print(f"   Verified Claims: {sum(1 for v in validation.get('verification_results', []) if v.get('verification_status') == 'verified')}")
                
                if data.get('correction_suggested'):
                    print(f"\n   ✅ Correction suggested")
                    print(f"   Corrected Response: {data.get('corrected_response', '')[:200]}...")
                
                return True
            else:
                error_data = response.json() if response.headers.get('content-type', '').startswith('application/json') else {}
                print(f"❌ Failed: {response.status_code}")
                print(f"   Error: {error_data.get('detail', response.text)}")
                return False
                
        except httpx.TimeoutException:
            print("❌ Request timeout (took too long)")
            return False
        except Exception as e:
            print(f"❌ Error: {str(e)}")
            return False

async def main():
    """Run all tests"""
    print("\n" + "="*60)
    print("AI Test API Endpoint Test Suite")
    print("="*60)
    print("\n⚠️  Make sure backend server is running on http://localhost:8000")
    print("⚠️  Make sure GEMINI_API_KEY is set in backend/.env")
    
    results = []
    
    # Test 1: AI Status
    ai_enabled = await test_ai_status()
    
    if not ai_enabled:
        print("\n⚠️  AI generation not enabled - some tests will be skipped")
        print("   Set GEMINI_API_KEY in backend/.env to enable")
        return
    
    # Test 2: Companies List
    company_id = await test_companies_list()
    
    if not company_id:
        print("\n⚠️  No companies found - cannot test generation")
        return
    
    # Test 3: Generate & Validate
    results.append(await test_generate_and_validate(company_id))
    
    # Summary
    print("\n" + "="*60)
    print("Test Summary")
    print("="*60)
    
    passed = sum(results)
    total = len(results)
    
    print(f"Passed: {passed}/{total}")
    
    if passed == total:
        print("✅ All tests passed!")
    else:
        print("⚠️  Some tests failed - check errors above")

if __name__ == "__main__":
    asyncio.run(main())

