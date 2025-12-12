"""
Citation Verification Service
Extracts and validates URLs/citations from AI responses
"""
import re
import logging
from typing import List, Dict, Any, Optional
import httpx
from urllib.parse import urlparse

logger = logging.getLogger(__name__)

def extract_urls(text: str) -> List[str]:
    """
    Extract all URLs from text
    """
    if not text:
        return []
    
    # URL pattern
    url_pattern = r'https?://[^\s<>"{}|\\^`\[\]]+'
    
    urls = re.findall(url_pattern, text)
    
    # Clean URLs (remove trailing punctuation)
    cleaned_urls = []
    for url in urls:
        # Remove trailing punctuation
        url = url.rstrip('.,;:!?)')
        cleaned_urls.append(url)
    
    return cleaned_urls

def extract_citation_patterns(text: str) -> List[Dict[str, Any]]:
    """
    Extract citation patterns like "According to..." or "Source: ..."
    """
    citations = []
    
    # Pattern: "According to [source]"
    according_pattern = r'according to\s+([^.,;:!?]+)'
    matches = re.finditer(according_pattern, text, re.IGNORECASE)
    for match in matches:
        citations.append({
            'type': 'according_to',
            'source': match.group(1).strip(),
            'position': match.start(),
            'context': text[max(0, match.start()-30):match.end()+30]
        })
    
    # Pattern: "Source: [url or name]"
    source_pattern = r'source:\s*([^\n]+)'
    matches = re.finditer(source_pattern, text, re.IGNORECASE)
    for match in matches:
        citations.append({
            'type': 'source',
            'source': match.group(1).strip(),
            'position': match.start(),
            'context': text[max(0, match.start()-30):match.end()+30]
        })
    
    # Pattern: Regulation references like "SEC regulation 2023-45"
    regulation_pattern = r'(SEC|CFPB|EU|GDPR|Article\s+\d+)[\s\w-]*\d{4}[-]?\d*'
    matches = re.finditer(regulation_pattern, text, re.IGNORECASE)
    for match in matches:
        citations.append({
            'type': 'regulation',
            'source': match.group(0),
            'position': match.start(),
            'context': text[max(0, match.start()-30):match.end()+30]
        })
    
    return citations

def validate_url(url: str, timeout: int = 5) -> Dict[str, Any]:
    """
    Validate if URL is accessible and returns valid response
    """
    if not url:
        return {
            'url': url,
            'is_valid': False,
            'http_status_code': None,
            'error_message': 'Empty URL'
        }
    
    try:
        # Parse URL
        parsed = urlparse(url)
        if not parsed.scheme or not parsed.netloc:
            return {
                'url': url,
                'is_valid': False,
                'http_status_code': None,
                'error_message': 'Invalid URL format'
            }
        
        # Check URL accessibility
        with httpx.Client(timeout=timeout, follow_redirects=True) as client:
            response = client.get(url)
            
            return {
                'url': url,
                'is_valid': response.status_code == 200,
                'http_status_code': response.status_code,
                'error_message': None if response.status_code == 200 else f'HTTP {response.status_code}',
                'content_type': response.headers.get('content-type'),
                'content_length': len(response.content) if response.status_code == 200 else 0
            }
            
    except httpx.TimeoutException:
        return {
            'url': url,
            'is_valid': False,
            'http_status_code': None,
            'error_message': 'Request timeout'
        }
    except httpx.RequestError as e:
        return {
            'url': url,
            'is_valid': False,
            'http_status_code': None,
            'error_message': f'Request error: {str(e)}'
        }
    except Exception as e:
        logger.error(f"Error validating URL {url}: {str(e)}")
        return {
            'url': url,
            'is_valid': False,
            'http_status_code': None,
            'error_message': f'Validation error: {str(e)}'
        }

def verify_citation_content(url: str, claimed_content: str) -> Dict[str, Any]:
    """
    Verify if URL content matches what AI claims it says
    Simplified implementation - in production would extract and compare content
    """
    validation = validate_url(url)
    
    if not validation['is_valid']:
        return {
            'url': url,
            'content_match': False,
            'match_confidence': 0.0,
            'error': validation.get('error_message')
        }
    
    try:
        # In production, would fetch and parse content, then compare
        # For now, return that URL is valid but content matching needs implementation
        return {
            'url': url,
            'content_match': None,  # Would be True/False after content comparison
            'match_confidence': 0.5,
            'note': 'Content matching requires full implementation'
        }
    except Exception as e:
        logger.error(f"Error verifying citation content: {str(e)}")
        return {
            'url': url,
            'content_match': False,
            'match_confidence': 0.0,
            'error': str(e)
        }

def extract_and_validate_citations(text: str) -> Dict[str, Any]:
    """
    Extract all citations from text and validate them
    """
    urls = extract_urls(text)
    citation_patterns = extract_citation_patterns(text)
    
    validated_urls = []
    for url in urls:
        validation = validate_url(url)
        validated_urls.append(validation)
    
    # Check for fake citations (invalid URLs)
    fake_citations = [v for v in validated_urls if not v['is_valid']]
    
    return {
        'urls': validated_urls,
        'citation_patterns': citation_patterns,
        'total_citations': len(urls) + len(citation_patterns),
        'valid_citations': len([v for v in validated_urls if v['is_valid']]),
        'fake_citations': len(fake_citations),
        'fake_citation_details': fake_citations
    }

