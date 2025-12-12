"""
Script to seed regulatory rule templates into database
Run this to populate initial compliance rules
"""
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent.parent))

from app.services.regulatory_templates import get_all_regulatory_templates
from app.utils.supabase_client import get_supabase_client
from datetime import datetime
import uuid

def seed_regulatory_rules(organization_id: str):
    """
    Seed regulatory rule templates for an organization
    """
    try:
        supabase = get_supabase_client()
        templates = get_all_regulatory_templates()
        
        seeded_count = 0
        
        for regulation, rules in templates.items():
            for rule_template in rules:
                # Check if rule already exists
                existing = supabase.table('compliance_rules')\
                    .select('id')\
                    .eq('organization_id', organization_id)\
                    .eq('rule_name', rule_template['rule_name'])\
                    .execute()
                
                if existing.data:
                    print(f"⏭️  Rule already exists: {rule_template['rule_name']}")
                    continue
                
                # Create rule
                rule_data = {
                    'id': str(uuid.uuid4()),
                    'organization_id': organization_id,
                    'rule_type': rule_template['rule_type'],
                    'rule_name': rule_template['rule_name'],
                    'rule_definition': rule_template['rule_definition'],
                    'industry': rule_template.get('industry'),
                    'severity': rule_template['severity'],
                    'is_active': True,
                    'created_at': datetime.utcnow().isoformat(),
                    'updated_at': datetime.utcnow().isoformat()
                }
                
                result = supabase.table('compliance_rules').insert(rule_data).execute()
                
                if result.data:
                    print(f"✅ Seeded: {rule_template['rule_name']}")
                    seeded_count += 1
                else:
                    print(f"❌ Failed to seed: {rule_template['rule_name']}")
        
        print(f"\n✅ Seeded {seeded_count} regulatory rules")
        return seeded_count
        
    except Exception as e:
        print(f"❌ Error seeding rules: {str(e)}")
        return 0

if __name__ == "__main__":
    print("🌱 Seeding Regulatory Rule Templates")
    print("=" * 50)
    
    # You would provide actual organization_id
    organization_id = input("Enter organization_id (or press Enter to skip): ").strip()
    
    if organization_id:
        seed_regulatory_rules(organization_id)
    else:
        print("Skipping seed. Provide organization_id to seed rules.")

