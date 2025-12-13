"""
Test script for Gemini Pro integration
Tests AI generation service with company context
"""
import asyncio
import sys
from pathlib import Path

# Add backend to path
backend_path = Path(__file__).parent.parent
sys.path.insert(0, str(backend_path))

from app.services.ai_generation import AIGenerationService
from app.services.company_context import CompanyContextService
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv(backend_path / ".env")

async def test_gemini_api():
    """Test basic Gemini API connection"""
    print("\n" + "="*60)
    print("Test 1: Gemini API Connection")
    print("="*60)
    
    service = AIGenerationService()
    
    if not service.is_enabled():
        print("❌ Gemini API not enabled")
        print("   Check GEMINI_API_KEY in .env file")
        return False
    
    print("✅ Gemini API enabled")
    
    # Simple test
    result = await service.generate_company_response(
        company_name="Test Company",
        company_context={
            'policies': [],
            'compliance_rules': [],
            'products': ['Test Product']
        },
        user_query="Say hello in one sentence.",
        industry="general"
    )
    
    if result['success']:
        print(f"✅ API working!")
        print(f"   Response: {result['response']}")
        return True
    else:
        print(f"❌ API test failed: {result.get('error')}")
        return False

async def test_company_context():
    """Test company context loading"""
    print("\n" + "="*60)
    print("Test 2: Company Context Loading")
    print("="*60)
    
    # Use default test organization ID
    test_org_id = "00000000-0000-0000-0000-000000000001"
    
    context = await CompanyContextService.load_company_context(test_org_id)
    
    print(f"Company: {context['company_name']}")
    print(f"Industry: {context['industry']}")
    print(f"Policies: {len(context['policies'])}")
    print(f"Compliance Rules: {len(context['compliance_rules'])}")
    print(f"Products: {context['products']}")
    
    return True

async def test_full_pipeline():
    """Test full pipeline: context + AI generation"""
    print("\n" + "="*60)
    print("Test 3: Full Pipeline (Context + AI Generation)")
    print("="*60)
    
    # Load context
    test_org_id = "00000000-0000-0000-0000-000000000001"
    context = await CompanyContextService.load_company_context(test_org_id)
    
    print(f"Loaded context for: {context['company_name']}")
    
    # Generate AI response
    ai_service = AIGenerationService()
    
    if not ai_service.is_enabled():
        print("⚠️  Gemini API not enabled - skipping AI generation test")
        return False
    
    test_query = "What is your refund policy?"
    
    print(f"\nGenerating response for query: '{test_query}'")
    
    result = await ai_service.generate_company_response(
        company_name=context['company_name'],
        company_context=context,
        user_query=test_query,
        industry=context['industry']
    )
    
    if result['success']:
        print(f"\n✅ AI Response Generated:")
        print(f"   {result['response']}")
        print(f"\n   Model: {result['model']}")
        return True
    else:
        print(f"\n❌ Generation failed: {result.get('error')}")
        return False

async def test_company_list():
    """Test getting company list"""
    print("\n" + "="*60)
    print("Test 4: Company List")
    print("="*60)
    
    companies = await CompanyContextService.get_company_list()
    
    if companies:
        print(f"✅ Found {len(companies)} companies:")
        for company in companies[:5]:  # Show first 5
            print(f"   - {company.get('name', 'Unknown')} ({company.get('industry', 'general')})")
    else:
        print("⚠️  No companies found (this is okay if database is empty)")
    
    return True

async def main():
    """Run all tests"""
    print("\n" + "="*60)
    print("Gemini Pro Integration Test Suite")
    print("="*60)
    print("\nTesting Phase 1: Backend Core Services")
    
    results = []
    
    # Test 1: API Connection
    results.append(await test_gemini_api())
    
    # Test 2: Company Context
    results.append(await test_company_context())
    
    # Test 3: Full Pipeline
    results.append(await test_full_pipeline())
    
    # Test 4: Company List
    results.append(await test_company_list())
    
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
    
    print("\n" + "="*60)

if __name__ == "__main__":
    asyncio.run(main())

