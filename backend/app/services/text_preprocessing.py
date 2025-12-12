"""
Text Preprocessing Utilities
Cleans and normalizes text for NLP processing
"""
import re
import logging

logger = logging.getLogger(__name__)

def clean_text(text: str) -> str:
    """
    Clean text by removing extra whitespace and normalizing
    """
    if not text:
        return ""
    
    # Remove extra whitespace
    text = re.sub(r'\s+', ' ', text)
    
    # Remove leading/trailing whitespace
    text = text.strip()
    
    return text

def segment_sentences(text: str) -> list[str]:
    """
    Split text into sentences
    Simple sentence segmentation
    """
    if not text:
        return []
    
    # Split on sentence-ending punctuation
    sentences = re.split(r'[.!?]+', text)
    
    # Clean and filter empty sentences
    sentences = [s.strip() for s in sentences if s.strip()]
    
    return sentences

def normalize_claim(claim: str) -> str:
    """
    Normalize a claim for comparison
    - Lowercase
    - Remove extra whitespace
    - Remove punctuation (optional)
    """
    claim = claim.lower()
    claim = clean_text(claim)
    
    return claim

def extract_numbers(text: str) -> list[dict]:
    """
    Extract numerical values from text
    Returns list of {value, unit, context}
    """
    numbers = []
    
    # Pattern for numbers (integers, decimals, percentages, currency)
    patterns = [
        (r'\$[\d,]+\.?\d*', 'currency'),
        (r'[\d,]+\.?\d*\s*%', 'percentage'),
        (r'[\d,]+\.?\d+', 'decimal'),
        (r'\d+', 'integer'),
    ]
    
    for pattern, num_type in patterns:
        matches = re.finditer(pattern, text)
        for match in matches:
            numbers.append({
                'value': match.group(),
                'type': num_type,
                'position': match.start(),
                'context': text[max(0, match.start()-20):match.end()+20]
            })
    
    return numbers

def extract_dates(text: str) -> list[dict]:
    """
    Extract date references from text
    Returns list of {date, format, context}
    """
    dates = []
    
    # Common date patterns
    patterns = [
        (r'\d{4}-\d{2}-\d{2}', 'iso'),
        (r'\d{1,2}/\d{1,2}/\d{4}', 'us'),
        (r'\d{1,2}-\d{1,2}-\d{4}', 'us-dash'),
        (r'(January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},?\s+\d{4}', 'long'),
    ]
    
    for pattern, date_format in patterns:
        matches = re.finditer(pattern, text, re.IGNORECASE)
        for match in matches:
            dates.append({
                'date': match.group(),
                'format': date_format,
                'position': match.start(),
                'context': text[max(0, match.start()-20):match.end()+20]
            })
    
    return dates

def is_factual_statement(text: str) -> bool:
    """
    Heuristic to identify if a statement is factual vs opinion
    Returns True if likely factual
    """
    # Opinion indicators
    opinion_words = ['think', 'believe', 'feel', 'opinion', 'prefer', 'should', 'might', 'could']
    
    text_lower = text.lower()
    
    # Check for opinion words
    for word in opinion_words:
        if word in text_lower:
            return False
    
    # Check for factual indicators
    factual_indicators = ['is', 'are', 'was', 'were', 'has', 'have', 'according to', 'data shows']
    for indicator in factual_indicators:
        if indicator in text_lower:
            return True
    
    # Default: assume factual if no opinion words
    return True

