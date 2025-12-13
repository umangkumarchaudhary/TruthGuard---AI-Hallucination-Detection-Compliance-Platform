"""
Claim Extraction Service
Extracts factual claims from AI responses using NLP
"""
import logging
from typing import List, Dict, Any
from app.services.text_preprocessing import (
    clean_text, segment_sentences, normalize_claim, 
    extract_numbers, extract_dates, is_factual_statement
)

logger = logging.getLogger(__name__)

class Claim:
    """Represents an extracted claim"""
    def __init__(self, text: str, confidence: float = 0.5, claim_type: str = "factual"):
        self.text = text
        self.normalized = normalize_claim(text)
        self.confidence = confidence
        self.claim_type = claim_type
        self.numbers = extract_numbers(text)
        self.dates = extract_dates(text)
        self.is_factual = is_factual_statement(text)

def extract_claims(text: str) -> List[Dict[str, Any]]:
    """
    Extract factual claims from text
    SMART EXTRACTION: Only extracts specific factual claims, skips general statements
    
    Returns list of claim dictionaries
    """
    if not text:
        return []
    
    try:
        # Clean text
        cleaned_text = clean_text(text)
        
        # Segment into sentences
        sentences = segment_sentences(cleaned_text)
        
        claims = []
        
        for sentence in sentences:
            # Skip very short sentences
            if len(sentence) < 10:
                continue
            
            # Extract numbers and dates first (before filtering)
            numbers = extract_numbers(sentence)
            dates = extract_dates(sentence)
            
            # SMART FILTERING: Only extract claims that are verifiable
            # Skip general statements that don't need verification
            
            # Priority 1: Claims with specific data (dates, numbers, names)
            has_specific_data = len(numbers) > 0 or len(dates) > 0
            
            # Priority 2: Claims with specific names/entities (proper nouns)
            has_specific_names = has_specific_entities(sentence)
            
            # Priority 3: Claims with specific facts (not general characteristics)
            is_specific_fact = is_specific_factual_claim(sentence)
            
            # Skip general statements (opinions, characteristics, descriptions)
            is_general_statement = is_general_statement_claim(sentence)
            
            # Only extract if it has specific data OR specific names OR is a specific fact
            # AND it's not a general statement
            if is_general_statement and not (has_specific_data or has_specific_names):
                # Skip general statements like "Python is versatile" or "Python has extensive libraries"
                continue
            
            # Check if sentence contains factual information
            if not is_factual_statement(sentence):
                continue
            
            # Calculate confidence based on indicators
            confidence = calculate_claim_confidence(sentence, numbers, dates)
            
            # Only include if confidence is reasonable (has specific data or is verifiable)
            if confidence < 0.4 and not (has_specific_data or has_specific_names):
                # Skip low-confidence general statements
                continue
            
            # Determine claim type
            claim_type = determine_claim_type(sentence, numbers, dates)
            
            claim = {
                'text': sentence,
                'normalized': normalize_claim(sentence),
                'confidence': confidence,
                'claim_type': claim_type,
                'numbers': numbers,
                'dates': dates,
                'is_factual': True,
                'is_specific': has_specific_data or has_specific_names or is_specific_fact
            }
            
            claims.append(claim)
        
        logger.info(f"Extracted {len(claims)} specific factual claims from text (filtered general statements)")
        return claims
        
    except Exception as e:
        logger.error(f"Error extracting claims: {str(e)}")
        return []

def calculate_claim_confidence(text: str, numbers: List[Dict], dates: List[Dict]) -> float:
    """
    Calculate confidence score for a claim
    Higher confidence for claims with specific data
    """
    confidence = 0.5  # Base confidence
    
    # Increase confidence if has numbers
    if numbers:
        confidence += 0.2
    
    # Increase confidence if has dates
    if dates:
        confidence += 0.1
    
    # Increase confidence if has specific factual words
    factual_words = ['according to', 'data', 'research', 'study', 'report', 'statistics']
    text_lower = text.lower()
    for word in factual_words:
        if word in text_lower:
            confidence += 0.1
            break
    
    # Cap at 1.0
    return min(confidence, 1.0)

def determine_claim_type(text: str, numbers: List[Dict], dates: List[Dict]) -> str:
    """
    Determine the type of claim
    """
    if numbers:
        if any(n.get('type') == 'currency' for n in numbers):
            return "financial"
        elif any(n.get('type') == 'percentage' for n in numbers):
            return "statistical"
        else:
            return "numerical"
    elif dates:
        return "temporal"
    elif any(word in text.lower() for word in ['regulation', 'law', 'act', 'rule']):
        return "regulatory"
    else:
        return "factual"

def extract_key_entities(text: str) -> List[Dict[str, Any]]:
    """
    Extract key entities (simplified - can be enhanced with spaCy)
    """
    entities = []
    
    # Extract organizations (capitalized words)
    org_pattern = r'\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\b'
    orgs = re.findall(org_pattern, text)
    for org in orgs:
        if len(org) > 2:  # Filter out single letters
            entities.append({
                'text': org,
                'type': 'organization',
                'confidence': 0.6
            })
    
    return entities

# Add regex import
import re

def has_specific_entities(text: str) -> bool:
    """
    Check if text contains specific entities (proper nouns, names)
    """
    # Pattern for capitalized words (likely proper nouns)
    # Look for patterns like "Guido van Rossum", "Python", "Django", etc.
    proper_noun_pattern = r'\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\b'
    matches = re.findall(proper_noun_pattern, text)
    
    # Filter out common words that are capitalized at start of sentence
    common_words = {'The', 'This', 'It', 'That', 'These', 'Those', 'A', 'An'}
    matches = [m for m in matches if m not in common_words and len(m) > 2]
    
    # If we have multiple capitalized words or specific patterns, likely has entities
    if len(matches) >= 1:
        # Check for name patterns (First Last, or known entities)
        name_patterns = [
            r'\b[A-Z][a-z]+\s+[A-Z][a-z]+\b',  # First Last
            r'\b[A-Z][a-z]+\s+van\s+[A-Z][a-z]+\b',  # Guido van Rossum
            r'\b[A-Z][a-z]+\s+de\s+[A-Z][a-z]+\b',  # Spanish/Portuguese names
        ]
        for pattern in name_patterns:
            if re.search(pattern, text):
                return True
    
    return len(matches) >= 2  # Multiple proper nouns suggest specific entities

def is_specific_factual_claim(text: str) -> bool:
    """
    Check if claim is a specific factual claim (not general)
    """
    text_lower = text.lower()
    
    # Specific factual indicators
    specific_indicators = [
        'created by', 'founded by', 'released in', 'established in',
        'according to', 'data shows', 'research shows', 'study found',
        'invented by', 'developed by', 'designed by',
        'version', 'release', 'update', 'announced',
    ]
    
    for indicator in specific_indicators:
        if indicator in text_lower:
            return True
    
    return False

def is_general_statement_claim(text: str) -> bool:
    """
    Check if claim is a general statement (characteristics, opinions, descriptions)
    These don't need verification
    """
    text_lower = text.lower()
    
    # General statement patterns
    general_patterns = [
        r'\bis\s+(?:a|an|the)?\s*\w+\s+(?:that|which)',  # "is a language that"
        r'\bis\s+(?:known|famous|popular|widely)\s+for',  # "is known for"
        r'\bis\s+(?:used|commonly|often|typically)\s+',  # "is used for"
        r'\bhas\s+(?:extensive|many|various|numerous)\s+',  # "has extensive libraries"
        r'\bis\s+(?:versatile|flexible|powerful|simple|easy)',  # "is versatile"
        r'\ballows?\s+',  # "allows developers"
        r'\bis\s+(?:designed|built|made)\s+to\s+',  # "is designed to"
    ]
    
    for pattern in general_patterns:
        if re.search(pattern, text_lower):
            return True
    
    # General characteristic words
    general_words = [
        'versatile', 'flexible', 'powerful', 'simple', 'easy', 'popular',
        'extensive', 'various', 'numerous', 'many', 'common', 'typical',
        'generally', 'usually', 'often', 'commonly', 'widely'
    ]
    
    # If sentence has multiple general words, likely a general statement
    general_word_count = sum(1 for word in general_words if word in text_lower)
    if general_word_count >= 2:
        return True
    
    return False

