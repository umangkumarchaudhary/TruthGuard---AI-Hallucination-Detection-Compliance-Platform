"""
Quick test script to verify database connection
Run this to test if your .env file is set up correctly
"""
import sys
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent))

from app.utils.supabase_client import test_connection

if __name__ == "__main__":
    print("=" * 50)
    print("Testing Supabase Database Connection")
    print("=" * 50)
    print()
    
    result = test_connection()
    
    print()
    print("=" * 50)
    print("Connection Test Result:")
    print("=" * 50)
    print(f"Status: {result['status']}")
    print(f"Message: {result['message']}")
    
    if result['status'] == 'connected':
        print("\n✅ SUCCESS! Database connection is working!")
        print("You can now start the FastAPI server with:")
        print("  uvicorn app.main:app --reload")
    else:
        print("\n❌ FAILED! Check your .env file:")
        print("  1. Make sure SUPABASE_URL is set")
        print("  2. Make sure SUPABASE_SERVICE_ROLE_KEY is set")
        print("  3. Check that your .env file is in backend/ or root folder")
        if 'error' in result:
            print(f"\nError details: {result['error']}")
    
    print("=" * 50)

