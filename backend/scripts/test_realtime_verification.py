"""
Test script for real-time verification APIs
Tests Wikipedia, DuckDuckGo, and NewsAPI integrations
"""
import asyncio
import sys
from pathlib import Path

# Add backend to path
backend_path = Path(__file__).parent.parent
sys.path.insert(0, str(backend_path))

from app.services.real_time_verification import (
    verify_via_wikipedia,
    verify_via_duckduckgo,
    verify_via_newsapi,
    verify_claim_realtime
)


async def test_wikipedia():
    """Test Wikipedia API"""
    print("\n" + "="*60)
    print("Testing Wikipedia API")
    print("="*60)
    
    test_claims = [
        "Python is a programming language",
        "The capital of France is Paris",
        "Barack Obama was the 44th President of the United States"
    ]
    
    for claim in test_claims:
        print(f"\nClaim: {claim}")
        result = await verify_via_wikipedia(claim)
        print(f"  Status: {result['status']}")
        print(f"  Confidence: {result['confidence']:.2f}")
        print(f"  Source: {result.get('source', 'N/A')}")
        print(f"  Details: {result.get('details', 'N/A')[:100]}...")


async def test_duckduckgo():
    """Test DuckDuckGo API"""
    print("\n" + "="*60)
    print("Testing DuckDuckGo API")
    print("="*60)
    
    test_claims = [
        "What is artificial intelligence?",
        "The speed of light is 299,792,458 meters per second",
        "Mount Everest is the highest mountain"
    ]
    
    for claim in test_claims:
        print(f"\nClaim: {claim}")
        result = await verify_via_duckduckgo(claim)
        print(f"  Status: {result['status']}")
        print(f"  Confidence: {result['confidence']:.2f}")
        print(f"  Source: {result.get('source', 'N/A')}")
        print(f"  Details: {result.get('details', 'N/A')[:100]}...")


async def test_newsapi():
    """Test NewsAPI (if key is configured)"""
    print("\n" + "="*60)
    print("Testing NewsAPI")
    print("="*60)
    
    import os
    if not os.getenv("NEWSAPI_KEY"):
        print("⚠️  NewsAPI_KEY not set - skipping NewsAPI tests")
        print("   To test NewsAPI, set NEWSAPI_KEY in your .env file")
        return
    
    test_claims = [
        "Bitcoin price",
        "Climate change",
        "Artificial intelligence news"
    ]
    
    for claim in test_claims:
        print(f"\nClaim: {claim}")
        result = await verify_via_newsapi(claim)
        print(f"  Status: {result['status']}")
        print(f"  Confidence: {result['confidence']:.2f}")
        print(f"  Source: {result.get('source', 'N/A')}")
        print(f"  Details: {result.get('details', 'N/A')[:100]}...")


async def test_combined():
    """Test combined real-time verification"""
    print("\n" + "="*60)
    print("Testing Combined Real-Time Verification")
    print("="*60)
    
    test_claims = [
        "Python is a programming language created by Guido van Rossum",
        "The Earth orbits around the Sun",
        "Machine learning is a subset of artificial intelligence"
    ]
    
    for claim in test_claims:
        print(f"\nClaim: {claim}")
        result = await verify_claim_realtime(claim, use_all_sources=True)
        print(f"  Status: {result['status']}")
        print(f"  Confidence: {result['confidence']:.2f}")
        print(f"  Source: {result.get('source', 'N/A')}")
        print(f"  Details: {result.get('details', 'N/A')[:150]}...")


async def main():
    """Run all tests"""
    print("\n" + "="*60)
    print("Real-Time Verification API Test Suite")
    print("="*60)
    print("\nThis script tests Wikipedia, DuckDuckGo, and NewsAPI integrations")
    print("Note: NewsAPI requires an API key (free tier: 100 requests/day)")
    
    try:
        await test_wikipedia()
        await test_duckduckgo()
        await test_newsapi()
        await test_combined()
        
        print("\n" + "="*60)
        print("✅ All tests completed!")
        print("="*60)
        
    except Exception as e:
        print(f"\n❌ Error during testing: {str(e)}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    asyncio.run(main())

