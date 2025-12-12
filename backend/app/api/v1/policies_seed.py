"""
Script to seed sample company policies
Run this to populate initial policies for testing
"""
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent.parent))

from app.utils.supabase_client import get_supabase_client
from datetime import datetime
import uuid

def seed_sample_policies(organization_id: str, industry: str = "finance"):
    """
    Seed sample policies based on industry
    """
    try:
        supabase = get_supabase_client()
        
        policies = []
        
        if industry == "finance":
            policies = [
                {
                    'policy_name': 'Refund Policy',
                    'policy_content': 'Refunds are processed within 7-10 business days. No refunds after 30 days from purchase date.',
                    'category': 'refund'
                },
                {
                    'policy_name': 'Credit Limit Disclosure',
                    'policy_content': 'Credit limits are determined based on creditworthiness and cannot be guaranteed. Actual limits may vary.',
                    'category': 'credit'
                }
            ]
        elif industry == "airline":
            policies = [
                {
                    'policy_name': 'Refund Processing Time',
                    'policy_content': 'Refunds for canceled flights are processed within 7-10 business days. Processing begins after cancellation request is received.',
                    'category': 'refund'
                },
                {
                    'policy_name': 'Flight Change Policy',
                    'policy_content': 'Flight changes are subject to availability and fees. Changes must be made at least 24 hours before departure.',
                    'category': 'changes'
                }
            ]
        elif industry == "consulting":
            policies = [
                {
                    'policy_name': 'Service Delivery Timeline',
                    'policy_content': 'Consulting services are delivered within agreed timelines. Rush requests may incur additional fees.',
                    'category': 'delivery'
                }
            ]
        
        seeded_count = 0
        
        for policy_template in policies:
            # Check if policy already exists
            existing = supabase.table('company_policies')\
                .select('id')\
                .eq('organization_id', organization_id)\
                .eq('policy_name', policy_template['policy_name'])\
                .execute()
            
            if existing.data:
                print(f"⏭️  Policy already exists: {policy_template['policy_name']}")
                continue
            
            # Create policy
            policy_data = {
                'id': str(uuid.uuid4()),
                'organization_id': organization_id,
                'policy_name': policy_template['policy_name'],
                'policy_content': policy_template['policy_content'],
                'category': policy_template['category'],
                'is_active': True,
                'created_at': datetime.utcnow().isoformat(),
                'updated_at': datetime.utcnow().isoformat()
            }
            
            result = supabase.table('company_policies').insert(policy_data).execute()
            
            if result.data:
                print(f"✅ Seeded: {policy_template['policy_name']}")
                seeded_count += 1
            else:
                print(f"❌ Failed to seed: {policy_template['policy_name']}")
        
        print(f"\n✅ Seeded {seeded_count} policies")
        return seeded_count
        
    except Exception as e:
        print(f"❌ Error seeding policies: {str(e)}")
        return 0

if __name__ == "__main__":
    print("🌱 Seeding Sample Company Policies")
    print("=" * 50)
    
    organization_id = input("Enter organization_id: ").strip()
    industry = input("Enter industry (finance/airline/consulting): ").strip() or "finance"
    
    if organization_id:
        seed_sample_policies(organization_id, industry)
    else:
        print("Organization ID required")

