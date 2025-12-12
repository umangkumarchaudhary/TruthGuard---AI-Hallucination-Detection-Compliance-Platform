"""
Regulatory Rule Templates
Pre-defined compliance rules for common regulations
"""
from typing import Dict, Any, List

def get_eu_ai_act_rules() -> List[Dict[str, Any]]:
    """
    EU AI Act compliance rules
    """
    return [
        {
            'rule_name': 'EU AI Act - Explainability Required',
            'rule_type': 'regulatory',
            'rule_definition': {
                'type': 'required_text',
                'required_text': ['explain', 'explanation', 'reason', 'because'],
                'action': 'flag',
                'message': 'EU AI Act requires AI systems to provide explanations for decisions'
            },
            'industry': None,  # Applies to all
            'severity': 'high'
        },
        {
            'rule_name': 'EU AI Act - Transparency',
            'rule_type': 'regulatory',
            'rule_definition': {
                'type': 'forbidden_text',
                'forbidden_text': ['cannot explain', 'black box', 'proprietary algorithm'],
                'action': 'block',
                'message': 'EU AI Act requires transparency - cannot claim inability to explain'
            },
            'industry': None,
            'severity': 'critical'
        }
    ]

def get_sec_rules() -> List[Dict[str, Any]]:
    """
    SEC (Securities and Exchange Commission) compliance rules
    """
    return [
        {
            'rule_name': 'SEC - No Financial Guarantees',
            'rule_type': 'regulatory',
            'rule_definition': {
                'type': 'keyword_match',
                'keywords': ['guarantee', 'guaranteed', 'always profitable', 'risk-free', 'sure thing', 'cannot lose'],
                'action': 'block',
                'message': 'SEC prohibits guarantees of investment returns'
            },
            'industry': 'finance',
            'severity': 'critical'
        },
        {
            'rule_name': 'SEC - Required Risk Disclaimer',
            'rule_type': 'regulatory',
            'rule_definition': {
                'type': 'required_text',
                'required_text': ['risk', 'disclaimer', 'past performance'],
                'action': 'flag',
                'message': 'SEC requires risk disclosure for financial advice'
            },
            'industry': 'finance',
            'severity': 'high'
        },
        {
            'rule_name': 'SEC - No Specific Investment Advice',
            'rule_type': 'regulatory',
            'rule_definition': {
                'type': 'pattern_match',
                'patterns': [r'buy\s+\w+\s+stock', r'invest\s+in\s+\w+', r'you should\s+buy'],
                'action': 'flag',
                'message': 'SEC requires registered advisor for specific investment recommendations'
            },
            'industry': 'finance',
            'severity': 'high'
        }
    ]

def get_cfpb_rules() -> List[Dict[str, Any]]:
    """
    CFPB (Consumer Financial Protection Bureau) compliance rules
    """
    return [
        {
            'rule_name': 'CFPB - No False Promises',
            'rule_type': 'regulatory',
            'rule_definition': {
                'type': 'keyword_match',
                'keywords': ['guaranteed approval', 'definitely approved', '100% approved', 'cannot be denied'],
                'action': 'block',
                'message': 'CFPB prohibits false promises of loan/credit approval'
            },
            'industry': 'finance',
            'severity': 'critical'
        },
        {
            'rule_name': 'CFPB - Clear Terms Required',
            'rule_type': 'regulatory',
            'rule_definition': {
                'type': 'forbidden_text',
                'forbidden_text': ['hidden fees', 'fine print', 'terms not disclosed'],
                'action': 'flag',
                'message': 'CFPB requires clear disclosure of all terms and fees'
            },
            'industry': 'finance',
            'severity': 'high'
        }
    ]

def get_gdpr_rules() -> List[Dict[str, Any]]:
    """
    GDPR (General Data Protection Regulation) compliance rules
    """
    return [
        {
            'rule_name': 'GDPR - Data Deletion Rights',
            'rule_type': 'regulatory',
            'rule_definition': {
                'type': 'required_text',
                'required_text': ['right to delete', 'data deletion', 'right to erasure'],
                'action': 'flag',
                'message': 'GDPR requires acknowledgment of data deletion rights'
            },
            'industry': None,
            'severity': 'medium'
        },
        {
            'rule_name': 'GDPR - No False Data Claims',
            'rule_type': 'regulatory',
            'rule_definition': {
                'type': 'keyword_match',
                'keywords': ['we never delete', 'data stored forever', 'permanent storage'],
                'action': 'block',
                'message': 'GDPR requires data deletion capability - cannot claim permanent storage'
            },
            'industry': None,
            'severity': 'critical'
        }
    ]

def get_airline_rules() -> List[Dict[str, Any]]:
    """
    Airline/DOT (Department of Transportation) compliance rules
    """
    return [
        {
            'rule_name': 'DOT - Accurate Refund Information',
            'rule_type': 'regulatory',
            'rule_definition': {
                'type': 'forbidden_text',
                'forbidden_text': ['instant refund', 'immediate refund', 'refund in 24 hours'],
                'action': 'flag',
                'message': 'DOT requires accurate refund processing times'
            },
            'industry': 'airline',
            'severity': 'high'
        },
        {
            'rule_name': 'DOT - No False Compensation Promises',
            'rule_type': 'regulatory',
            'rule_definition': {
                'type': 'keyword_match',
                'keywords': ['guaranteed compensation', 'automatic refund', 'always refund'],
                'action': 'block',
                'message': 'DOT prohibits false promises about compensation'
            },
            'industry': 'airline',
            'severity': 'critical'
        }
    ]

def get_all_regulatory_templates() -> Dict[str, List[Dict[str, Any]]]:
    """
    Get all regulatory rule templates organized by regulation
    """
    return {
        'EU AI Act': get_eu_ai_act_rules(),
        'SEC': get_sec_rules(),
        'CFPB': get_cfpb_rules(),
        'GDPR': get_gdpr_rules(),
        'DOT': get_airline_rules()
    }

def create_regulatory_rule_template(regulation: str, organization_id: str) -> Dict[str, Any]:
    """
    Create a regulatory rule from template for an organization
    """
    templates = get_all_regulatory_templates()
    
    if regulation not in templates:
        raise ValueError(f"Unknown regulation: {regulation}")
    
    # Return first rule from regulation (in production, would allow selection)
    rule_template = templates[regulation][0]
    
    return {
        'organization_id': organization_id,
        **rule_template
    }

