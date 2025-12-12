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
            
            # Check if sentence contains factual information
            if not is_factual_statement(sentence):
                continue
            
            # Extract numbers and dates
            numbers = extract_numbers(sentence)
            dates = extract_dates(sentence)
            
            # Calculate confidence based on indicators
            confidence = calculate_claim_confidence(sentence, numbers, dates)
            
            # Determine claim type
            claim_type = determine_claim_type(sentence, numbers, dates)
            
            claim = {
                'text': sentence,
                'normalized': normalize_claim(sentence),
                'confidence': confidence,
                'claim_type': claim_type,
                'numbers': numbers,
                'dates': dates,
                'is_factual': True
            }
            
            claims.append(claim)
        
        logger.info(f"Extracted {len(claims)} claims from text")
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

