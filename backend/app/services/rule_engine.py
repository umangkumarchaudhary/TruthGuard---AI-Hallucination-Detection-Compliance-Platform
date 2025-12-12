"""
Rule Engine Service
Evaluates AI responses against compliance rules and policies
"""
import re
import logging
from typing import Dict, Any, List, Optional
from enum import Enum

logger = logging.getLogger(__name__)

class RuleType(Enum):
    """Types of rules"""
    REGULATORY = "regulatory"  # EU AI Act, SEC, CFPB, GDPR
    POLICY = "policy"  # Company-specific policies
    CUSTOM = "custom"  # User-defined rules

class RuleAction(Enum):
    """Actions when rule is violated"""
    BLOCK = "block"  # Block the response
    FLAG = "flag"  # Flag for review
    WARN = "warn"  # Warning only
    REWRITE = "rewrite"  # Suggest correction

class Rule:
    """Represents a compliance rule"""
    def __init__(self, rule_definition: Dict[str, Any]):
        self.id = rule_definition.get('id')
        self.name = rule_definition.get('rule_name', '')
        self.type = RuleType(rule_definition.get('rule_type', 'custom'))
        self.definition = rule_definition.get('rule_definition', {})
        self.severity = rule_definition.get('severity', 'medium')
        self.industry = rule_definition.get('industry')
        self.is_active = rule_definition.get('is_active', True)
        
        # Parse rule definition
        self.match_type = self.definition.get('type', 'keyword_match')
        self.patterns = self.definition.get('keywords', []) or self.definition.get('patterns', [])
        self.action = RuleAction(self.definition.get('action', 'flag'))
        self.message = self.definition.get('message', f'Violates rule: {self.name}')
        self.required_text = self.definition.get('required_text', [])  # Text that must be present
        self.forbidden_text = self.definition.get('forbidden_text', [])  # Text that must not be present

class RuleResult:
    """Result of rule evaluation"""
    def __init__(self, rule: Rule, passed: bool, details: str = ""):
        self.rule = rule
        self.passed = passed
        self.details = details
        self.severity = rule.severity if not passed else None

def parse_rule(rule_definition: Dict[str, Any]) -> Rule:
    """
    Parse rule definition from database into Rule object
    """
    try:
        return Rule(rule_definition)
    except Exception as e:
        logger.error(f"Error parsing rule: {str(e)}")
        raise

def evaluate_rule(rule: Rule, response: str) -> RuleResult:
    """
    Evaluate a response against a rule
    Returns RuleResult with pass/fail status
    """
    if not rule.is_active:
        return RuleResult(rule, passed=True, details="Rule is inactive")
    
    response_lower = response.lower()
    
    try:
        # Check for forbidden text first (most restrictive)
        if rule.forbidden_text:
            for forbidden in rule.forbidden_text:
                if forbidden.lower() in response_lower:
                    return RuleResult(
                        rule,
                        passed=False,
                        details=f"Response contains forbidden text: '{forbidden}'"
                    )
        
        # Check for required text
        if rule.required_text:
            missing_required = []
            for required in rule.required_text:
                if required.lower() not in response_lower:
                    missing_required.append(required)
            
            if missing_required:
                return RuleResult(
                    rule,
                    passed=False,
                    details=f"Response missing required text: {', '.join(missing_required)}"
                )
        
        # Evaluate based on match type
        if rule.match_type == 'keyword_match':
            return evaluate_keyword_match(rule, response_lower)
        elif rule.match_type == 'pattern_match':
            return evaluate_pattern_match(rule, response_lower)
        elif rule.match_type == 'semantic_match':
            return evaluate_semantic_match(rule, response_lower)
        elif rule.match_type == 'custom':
            return evaluate_custom_rule(rule, response_lower)
        else:
            logger.warning(f"Unknown match type: {rule.match_type}")
            return RuleResult(rule, passed=True, details="Unknown rule type")
            
    except Exception as e:
        logger.error(f"Error evaluating rule {rule.name}: {str(e)}")
        return RuleResult(rule, passed=True, details=f"Evaluation error: {str(e)}")

def evaluate_keyword_match(rule: Rule, response_lower: str) -> RuleResult:
    """
    Evaluate rule using keyword matching
    """
    if not rule.patterns:
        return RuleResult(rule, passed=True, details="No keywords to match")
    
    matched_keywords = []
    for keyword in rule.patterns:
        if keyword.lower() in response_lower:
            matched_keywords.append(keyword)
    
    if matched_keywords:
        return RuleResult(
            rule,
            passed=False,
            details=f"Response contains prohibited keywords: {', '.join(matched_keywords)}"
        )
    
    return RuleResult(rule, passed=True, details="No prohibited keywords found")

def evaluate_pattern_match(rule: Rule, response_lower: str) -> RuleResult:
    """
    Evaluate rule using regex pattern matching
    """
    if not rule.patterns:
        return RuleResult(rule, passed=True, details="No patterns to match")
    
    matched_patterns = []
    for pattern in rule.patterns:
        try:
            if re.search(pattern, response_lower, re.IGNORECASE):
                matched_patterns.append(pattern)
        except re.error as e:
            logger.warning(f"Invalid regex pattern {pattern}: {str(e)}")
    
    if matched_patterns:
        return RuleResult(
            rule,
            passed=False,
            details=f"Response matches prohibited patterns: {', '.join(matched_patterns)}"
        )
    
    return RuleResult(rule, passed=True, details="No prohibited patterns found")

def evaluate_semantic_match(rule: Rule, response_lower: str) -> RuleResult:
    """
    Evaluate rule using semantic similarity
    In production, would use sentence-transformers
    For now, uses keyword-based approximation
    """
    # Simplified semantic matching - in production use embeddings
    # For now, fall back to keyword matching
    return evaluate_keyword_match(rule, response_lower)

def evaluate_custom_rule(rule: Rule, response_lower: str) -> RuleResult:
    """
    Evaluate custom rule logic
    Can be extended with custom Python code
    """
    # Custom rules can have custom logic in rule_definition
    custom_logic = rule.definition.get('custom_logic')
    
    if custom_logic:
        # In production, would safely execute custom logic
        # For now, use keyword matching as fallback
        return evaluate_keyword_match(rule, response_lower)
    
    return RuleResult(rule, passed=True, details="No custom logic defined")

def evaluate_rules(rules: List[Rule], response: str) -> List[RuleResult]:
    """
    Evaluate multiple rules against a response
    Returns list of rule results
    """
    results = []
    for rule in rules:
        result = evaluate_rule(rule, response)
        results.append(result)
    return results

def get_violations(rule_results: List[RuleResult]) -> List[Dict[str, Any]]:
    """
    Extract violations from rule results
    """
    violations = []
    for result in rule_results:
        if not result.passed:
            violations.append({
                'rule_id': result.rule.id,
                'rule_name': result.rule.name,
                'rule_type': result.rule.type.value,
                'severity': result.severity,
                'action': result.rule.action.value,
                'description': result.details,
                'message': result.rule.message
            })
    return violations

