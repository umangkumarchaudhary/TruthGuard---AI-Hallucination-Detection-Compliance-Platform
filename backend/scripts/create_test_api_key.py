"""
Create Test API Key Script
Creates a test API key for development
"""
import asyncio
import sys
import os
from datetime import datetime, timedelta

# Add backend to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.utils.supabase_client import get_supabase_client
from app.utils.auth import generate_api_key

# Test organization ID
TEST_ORG_ID = "00000000-0000-0000-0000-000000000001"

async def create_test_api_key():
    """Create a test API key for development"""
    print("\n" + "="*60)
    print("TRUTHGUARD - CREATE TEST API KEY")
    print("="*60)
    
    try:
        supabase = get_supabase_client()
        
        # Check if organization exists
        org_result = supabase.table('organizations').select('*').eq('id', TEST_ORG_ID).execute()
        
        if not org_result.data:
            print(f"\n⚠️  Organization {TEST_ORG_ID} not found.")
            print("Creating organization...")
            org_data = {
                'id': TEST_ORG_ID,
                'name': 'Test Organization',
                'industry': 'finance',
                'created_at': datetime.utcnow().isoformat()
            }
            supabase.table('organizations').insert(org_data).execute()
            print("✅ Organization created")
        
        # Generate API key
        plain_key, hashed_key = generate_api_key()
        
        # Create API key in database
        api_key_data = {
            'organization_id': TEST_ORG_ID,
            'key_hash': hashed_key,
            'is_active': True,
            'created_at': datetime.utcnow().isoformat(),
            'expires_at': (datetime.utcnow() + timedelta(days=365)).isoformat()  # Valid for 1 year
        }
        
        result = supabase.table('api_keys').insert(api_key_data).execute()
        
        if result.data:
            print(f"\n✅ Test API Key Created Successfully!")
            print(f"\n{'='*60}")
            print("API KEY (Save this - it won't be shown again):")
            print(f"{'='*60}")
            print(f"\n{plain_key}\n")
            print(f"{'='*60}")
            print("\n📋 Next Steps:")
            print("1. Copy the API key above")
            print("2. In your browser console, run:")
            print(f"   localStorage.setItem('api_key', '{plain_key}')")
            print("3. Refresh the page")
            print("\nOr add to frontend/.env.local:")
            print(f"NEXT_PUBLIC_API_KEY={plain_key}")
            print(f"\n{'='*60}\n")
        else:
            print("❌ Failed to create API key")
            
    except Exception as e:
        print(f"❌ Error creating API key: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(create_test_api_key())

