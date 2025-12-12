"""
Demo Data Seeding Script
Creates sample data for demo scenarios
"""
import asyncio
import sys
import os
import uuid
from datetime import datetime, timedelta

# Add backend to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.utils.supabase_client import get_supabase_client
from app.services.detection import detect_hallucinations
from app.services.audit import AuditLogger

# Demo organization ID
DEMO_ORG_ID = "00000000-0000-0000-0000-000000000001"

# Demo scenarios
DEMO_SCENARIOS = [
    {
        "name": "Financial Services - Investment Advice",
        "query": "Should I invest all my savings in cryptocurrency?",
        "ai_response": "Yes, cryptocurrency always goes up. You should invest all your savings for maximum returns.",
        "expected_status": "blocked",
        "industry": "finance"
    },
    {
        "name": "Airlines - Refund Promise",
        "query": "Can I get a refund for my canceled flight?",
        "ai_response": "Yes, you will receive a full refund within 24 hours guaranteed.",
        "expected_status": "flagged",
        "industry": "airline"
    },
    {
        "name": "Consulting - Regulatory Citation",
        "query": "What does GDPR Article 25 require?",
        "ai_response": "GDPR Article 25 requires companies to delete all user data annually. According to https://fake-gdpr-site.com/article-25",
        "expected_status": "flagged",
        "industry": "consulting"
    },
    {
        "name": "Financial Services - Credit Limit",
        "query": "What's my credit limit?",
        "ai_response": "Your credit limit is $50,000. You can use it for any purchase.",
        "expected_status": "flagged",
        "industry": "finance"
    },
    {
        "name": "Airlines - Flight Information",
        "query": "What time does my flight depart?",
        "ai_response": "Your flight departs at 3:45 PM from Gate 12. Please arrive 2 hours early.",
        "expected_status": "approved",
        "industry": "airline"
    },
    {
        "name": "Financial Services - Approved Response",
        "query": "What are your refund policies?",
        "ai_response": "Refunds typically process within 7-10 business days per our policy. Please check your account for specific details.",
        "expected_status": "approved",
        "industry": "finance"
    }
]

async def create_demo_organization():
    """Create demo organization if it doesn't exist"""
    supabase = get_supabase_client()
    
    try:
        # Check if organization exists
        result = supabase.table('organizations').select('*').eq('id', DEMO_ORG_ID).execute()
        
        if not result.data:
            # Create organization
            org_data = {
                'id': DEMO_ORG_ID,
                'name': 'Demo Organization',
                'industry': 'finance',
                'created_at': datetime.utcnow().isoformat()
            }
            supabase.table('organizations').insert(org_data).execute()
            print(f"✅ Created demo organization: {DEMO_ORG_ID}")
        else:
            print(f"✅ Demo organization already exists")
    except Exception as e:
        print(f"⚠️  Error creating organization: {str(e)}")

async def seed_demo_interactions():
    """Create demo interactions"""
    print("\n📊 Seeding demo interactions...")
    
    created = 0
    for i, scenario in enumerate(DEMO_SCENARIOS):
        try:
            # Run detection
            detection_result = detect_hallucinations(
                query=scenario['query'],
                ai_response=scenario['ai_response'],
                organization_id=DEMO_ORG_ID,
                ai_model='gpt-4'
            )
            
            # Generate corrected response if needed
            validated_response = None
            if detection_result['status'] != 'approved':
                validated_response = f"[Corrected] {scenario['ai_response']}"
            
            # Log interaction
            interaction_id = await AuditLogger.log_interaction(
                organization_id=DEMO_ORG_ID,
                query=scenario['query'],
                ai_response=scenario['ai_response'],
                validated_response=validated_response,
                status=detection_result['status'],
                confidence_score=detection_result['confidence_score'],
                ai_model='gpt-4',
                session_id=f"demo-session-{i+1}",
                detection_result=detection_result,
                explanation=f"Demo scenario: {scenario['name']}"
            )
            
            if interaction_id:
                created += 1
                print(f"  ✅ Created: {scenario['name']} ({detection_result['status']})")
            else:
                print(f"  ⚠️  Failed: {scenario['name']}")
                
        except Exception as e:
            print(f"  ❌ Error creating {scenario['name']}: {str(e)}")
    
    print(f"\n✅ Created {created}/{len(DEMO_SCENARIOS)} demo interactions")

async def seed_demo_policies():
    """Create demo policies"""
    print("\n📋 Seeding demo policies...")
    
    supabase = get_supabase_client()
    
    policies = [
        {
            'policy_name': 'Refund Policy',
            'policy_content': 'Refunds process within 7-10 business days. No refunds after 30 days.',
            'category': 'customer_service',
            'organization_id': DEMO_ORG_ID
        },
        {
            'policy_name': 'Investment Advice Policy',
            'policy_content': 'Never guarantee investment returns. Always include risk disclaimers.',
            'category': 'financial_advice',
            'organization_id': DEMO_ORG_ID
        },
        {
            'policy_name': 'Data Privacy Policy',
            'policy_content': 'User data is protected under GDPR. No data sharing without consent.',
            'category': 'privacy',
            'organization_id': DEMO_ORG_ID
        }
    ]
    
    created = 0
    for policy in policies:
        try:
            result = supabase.table('company_policies').insert(policy).execute()
            if result.data:
                created += 1
                print(f"  ✅ Created: {policy['policy_name']}")
        except Exception as e:
            print(f"  ⚠️  Error creating {policy['policy_name']}: {str(e)}")
    
    print(f"\n✅ Created {created}/{len(policies)} demo policies")

async def main():
    """Main seeding function"""
    print("\n" + "="*60)
    print("TRUTHGUARD - DEMO DATA SEEDING")
    print("="*60)
    
    # Create organization
    await create_demo_organization()
    
    # Seed policies
    await seed_demo_policies()
    
    # Seed interactions
    await seed_demo_interactions()
    
    print("\n" + "="*60)
    print("✅ Demo data seeding complete!")
    print("="*60)
    print("\nYou can now:")
    print("  1. View interactions in the dashboard")
    print("  2. Test compliance checking")
    print("  3. Review violations")
    print("  4. Run demo scenarios")

if __name__ == "__main__":
    asyncio.run(main())

