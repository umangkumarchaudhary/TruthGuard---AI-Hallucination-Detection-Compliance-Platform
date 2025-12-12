"""
Compliance Checking Service
Checks AI responses against regulatory rules and compliance requirements
"""
import logging
from typing import Dict, Any, List, Optional
from app.utils.supabase_client import get_supabase_client
from app.services.rule_engine import parse_rule, evaluate_rules, get_violations, Rule

logger = logging.getLogger(__name__)

class ComplianceResult:
    """Result of compliance checking"""
    def __init__(self):
        self.passed = True
        self.violations = []
        self.applicable_rules = []
        self.severity = None  # highest severity if violations exist

def check_compliance(
    response: str,
    organization_id: str,
    industry: Optional[str] = None
) -> Dict[str, Any]:
    """
    Check response against all applicable compliance rules
    """
    try:
        supabase = get_supabase_client()
        
        # Load applicable rules
        rules = load_applicable_rules(organization_id, industry)
        
        if not rules:
            return {
                'passed': True,
                'violations': [],
                'applicable_rules_count': 0,
                'message': 'No compliance rules configured'
            }
        
        # Evaluate all rules
        rule_results = evaluate_rules(rules, response)
        
        # Extract violations
        violations = get_violations(rule_results)
        
        # Determine overall status
        passed = len(violations) == 0
        
        # Get highest severity
        severity = None
        if violations:
            severity_levels = {'low': 1, 'medium': 2, 'high': 3, 'critical': 4}
            highest = max(violations, key=lambda v: severity_levels.get(v['severity'], 0))
            severity = highest['severity']
        
        return {
            'passed': passed,
            'violations': violations,
            'applicable_rules_count': len(rules),
            'violations_count': len(violations),
            'severity': severity,
            'message': 'Compliance check completed'
        }
        
    except Exception as e:
        logger.error(f"Error checking compliance: {str(e)}")
        return {
            'passed': False,
            'violations': [{
                'rule_name': 'System Error',
                'severity': 'high',
                'description': f'Compliance check error: {str(e)}'
            }],
            'applicable_rules_count': 0,
            'violations_count': 1,
            'severity': 'high',
            'message': f'Error during compliance check: {str(e)}'
        }

def load_applicable_rules(organization_id: str, industry: Optional[str] = None) -> List[Rule]:
    """
    Load compliance rules applicable to organization and industry
    """
    try:
        supabase = get_supabase_client()
        
        # Build query
        query = supabase.table('compliance_rules')\
            .select('*')\
            .eq('is_active', True)
        
        # Filter by organization (if rule is organization-specific)
        # Or by industry (if rule applies to all organizations in industry)
        # For now, load all active rules
        # In production, would filter: .or_(f'organization_id.eq.{organization_id},industry.eq.{industry}')
        
        result = query.execute()
        
        rules = []
        for rule_data in result.data:
            try:
                rule = parse_rule(rule_data)
                # Filter by organization or industry
                if rule_data.get('organization_id') == organization_id or \
                   (industry and rule_data.get('industry') == industry) or \
                   (not rule_data.get('organization_id') and not rule_data.get('industry')):
                    rules.append(rule)
            except Exception as e:
                logger.warning(f"Error parsing rule {rule_data.get('id')}: {str(e)}")
                continue
        
        logger.info(f"Loaded {len(rules)} applicable compliance rules")
        return rules
        
    except Exception as e:
        logger.error(f"Error loading compliance rules: {str(e)}")
        return []

def get_regulatory_rules_by_industry(industry: str) -> List[Dict[str, Any]]:
    """
    Get regulatory rule templates for a specific industry
    """
    industry_rules = {
        'finance': ['SEC', 'CFPB'],
        'airline': ['DOT', 'FAA'],
        'consulting': ['GDPR', 'EU AI Act'],
        'healthcare': ['HIPAA', 'GDPR']
    }
    
    regulations = industry_rules.get(industry.lower(), [])
    
    # Return rule templates (would be loaded from database in production)
    return regulations

