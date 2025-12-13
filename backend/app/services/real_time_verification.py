"""
Real-Time Verification Service
Verifies factual claims against real-time sources: Wikipedia, DuckDuckGo, and NewsAPI
"""
import httpx
import logging
import os
from typing import Dict, Any, Optional
import re
from urllib.parse import quote

logger = logging.getLogger(__name__)

# Get NewsAPI key from environment (optional)
NEWSAPI_KEY = os.getenv("NEWSAPI_KEY", "")

# Cache for API responses (simple in-memory cache)
_verification_cache: Dict[str, Dict[str, Any]] = {}


def extract_claim_predicate(claim_lower: str) -> str:
    """
    Extract what the claim says the subject IS (the predicate)
    Example: "React is a body part" -> "body part"
    Example: "Python is a programming language" -> "programming language"
    """
    # Patterns to extract predicate
    patterns = [
        r'is\s+(?:a|an|the)?\s*([^.]+)',  # "X is a Y"
        r'are\s+(?:a|an|the)?\s*([^.]+)',  # "X are Y"
        r'was\s+(?:a|an|the)?\s*([^.]+)',  # "X was a Y"
        r'were\s+(?:a|an|the)?\s*([^.]+)',  # "X were Y"
    ]
    
    for pattern in patterns:
        match = re.search(pattern, claim_lower)
        if match:
            predicate = match.group(1).strip()
            # Remove trailing punctuation and common words
            predicate = re.sub(r'[.,;:!?]+$', '', predicate)
            # Take first few words (the main description)
            words = predicate.split()[:5]
            return ' '.join(words)
    
    return ''


def extract_article_description(summary_lower: str, title_lower: str) -> str:
    """
    Extract what the article says the subject IS
    Example: "React is a JavaScript library" -> "javascript library"
    """
    # Try to extract from first sentence of summary
    first_sentence = summary_lower.split('.')[0] if '.' in summary_lower else summary_lower[:200]
    
    # Look for "is a", "is an", "are", etc.
    patterns = [
        r'is\s+(?:a|an|the)?\s*([^.,;]+)',  # "X is a Y"
        r'are\s+(?:a|an|the)?\s*([^.,;]+)',  # "X are Y"
    ]
    
    for pattern in patterns:
        match = re.search(pattern, first_sentence)
        if match:
            description = match.group(1).strip()
            # Take first few words
            words = description.split()[:5]
            return ' '.join(words)
    
    # Fallback: extract key descriptive words from summary
    # Look for common descriptive terms
    descriptive_keywords = []
    tech_keywords = ['programming', 'code', 'language', 'software', 'framework', 'library', 'javascript', 'react', 'vue', 'angular', 'web', 'development']
    body_keywords = ['body part', 'body', 'organ', 'anatomy', 'physical', 'human']
    food_keywords = ['fruit', 'food', 'eat', 'cooking']
    animal_keywords = ['snake', 'animal', 'reptile', 'genus', 'species']
    
    text_to_check = f"{title_lower} {first_sentence}"
    
    if any(kw in text_to_check for kw in tech_keywords):
        descriptive_keywords.append('programming/software')
    if any(kw in text_to_check for kw in body_keywords):
        descriptive_keywords.append('body part')
    if any(kw in text_to_check for kw in food_keywords):
        descriptive_keywords.append('food')
    if any(kw in text_to_check for kw in animal_keywords):
        descriptive_keywords.append('animal')
    
    return ' '.join(descriptive_keywords) if descriptive_keywords else first_sentence[:50]


def extract_search_terms(claim: str, max_terms: int = 5) -> str:
    """
    Extract key search terms from a claim for API queries
    Removes common stop words and focuses on important terms
    Also handles "X is Y" patterns to extract the main subject (X)
    """
    # Common stop words to remove
    stop_words = {
        'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
        'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
        'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'should',
        'could', 'may', 'might', 'must', 'can', 'this', 'that', 'these', 'those'
    }
    
    # Try to extract main subject from "X is Y" or "X are Y" patterns
    # Example: "Python is web development language" -> extract "Python"
    is_pattern = re.search(r'^([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s+is\s+', claim, re.IGNORECASE)
    if is_pattern:
        main_subject = is_pattern.group(1).strip()
        # Use the main subject as primary search term
        return main_subject
    
    # Extract words (alphanumeric only)
    words = re.findall(r'\b[a-zA-Z]+\b', claim.lower())
    
    # Filter out stop words and short words
    important_words = [w for w in words if w not in stop_words and len(w) > 2]
    
    # Prioritize capitalized words (likely proper nouns)
    capitalized_words = re.findall(r'\b[A-Z][a-z]+\b', claim)
    if capitalized_words:
        # Use capitalized words first
        important_words = [w.lower() for w in capitalized_words] + [w for w in important_words if w not in [cw.lower() for cw in capitalized_words]]
    
    # Take first max_terms important words
    search_terms = important_words[:max_terms]
    
    return " ".join(search_terms) if search_terms else claim[:50]


async def verify_via_wikipedia(claim: str, query_context: Optional[str] = None) -> Dict[str, Any]:
    """
    Verify claim using Wikipedia REST API (free, no key required)
    
    Args:
        claim: The factual claim to verify
        
    Returns:
        Dict with status, confidence, source, and details
    """
    cache_key = f"wiki:{claim.lower().strip()}"
    if cache_key in _verification_cache:
        logger.debug(f"Cache hit for Wikipedia: {claim[:50]}...")
        return _verification_cache[cache_key]
    
    try:
        # Extract key terms for Wikipedia search
        # If query context is provided, use it to disambiguate (e.g., "python in programming" -> "Python programming language")
        search_terms = extract_search_terms(claim, max_terms=3)
        
        # Use query context to improve search terms
        if query_context:
            context_lower = query_context.lower()
            claim_lower = claim.lower()
            
            # Check for context keywords that help disambiguate
            is_programming_context = any(kw in context_lower for kw in ['programming', 'code', 'language', 'software', 'framework', 'library', 'javascript', 'react', 'vue', 'angular'])
            is_animal_context = any(kw in context_lower for kw in ['snake', 'animal', 'reptile', 'genus', 'species'])
            is_food_context = any(kw in context_lower for kw in ['fruit', 'food', 'eat', 'cooking', 'recipe'])
            
            # Programming context - search for programming-related articles
            if is_programming_context:
                main_term = extract_search_terms(claim, max_terms=1)
                if main_term.lower() in ['python', 'java', 'react', 'vue', 'angular', 'node', 'javascript', 'typescript']:
                    # Add programming context to search
                    if 'python' in main_term.lower():
                        search_terms = "Python programming language"
                    elif 'react' in main_term.lower():
                        search_terms = "React (JavaScript library)"
                    elif 'java' in main_term.lower() and 'javascript' not in context_lower:
                        search_terms = "Java (programming language)"
                    else:
                        search_terms = f"{main_term} programming"
            elif is_animal_context:
                main_term = extract_search_terms(claim, max_terms=1)
                if 'python' in main_term.lower():
                    search_terms = "Python (genus)"
            elif is_food_context:
                # Food context - keep original search terms
                pass
        
        # Try to find Wikipedia page using search API first
        search_url = "https://en.wikipedia.org/api/rest_v1/page/summary"
        
        # Wikipedia API accepts page titles, so we'll try the search terms directly
        # For better results, we could use the search endpoint first, but this is simpler
        page_title = search_terms.replace(" ", "_")
        
        async with httpx.AsyncClient(timeout=5.0) as client:
            try:
                # Try direct page lookup
                response = await client.get(
                    f"{search_url}/{page_title}",
                    headers={"User-Agent": "TruthGuard/1.0 (https://truthguard.ai)"}
                )
                
                if response.status_code == 200:
                    data = response.json()
                    summary = data.get('extract', '')
                    title = data.get('title', '')
                    
                    if summary:
                        # Check if claim keywords appear in summary
                        claim_lower = claim.lower()
                        summary_lower = summary.lower()
                        
                        # Count matching keywords
                        claim_words = set(re.findall(r'\b[a-zA-Z]{3,}\b', claim_lower))
                        summary_words = set(re.findall(r'\b[a-zA-Z]{3,}\b', summary_lower))
                        
                        # Extract main subject from claim (first capitalized word or important word)
                        main_subject = extract_search_terms(claim, max_terms=1).lower()
                        
                        # Calculate overlap
                        matching_words = claim_words.intersection(summary_words)
                        overlap_ratio = len(matching_words) / len(claim_words) if claim_words else 0
                        
                        # Check if main subject appears in summary (more lenient matching)
                        main_subject_in_summary = main_subject in summary_lower or any(
                            word in summary_lower for word in main_subject.split() if len(word) > 3
                        )
                        
                        # SEMANTIC VERIFICATION: Check if claim's meaning matches article's meaning
                        # Extract what the claim says the subject IS (the predicate)
                        claim_contradicts_article = False
                        claim_predicate = ""
                        article_description = ""
                        
                        try:
                            claim_predicate = extract_claim_predicate(claim_lower)
                            article_description = extract_article_description(summary_lower, title.lower())
                        except NameError as e:
                            # Function not defined - log and skip semantic check
                            logger.warning(f"Semantic verification functions not available: {str(e)}")
                            claim_predicate = ""
                            article_description = ""
                        
                        # Check for semantic contradictions
                        if claim_predicate and article_description:
                            # Programming/tech vs non-tech contradictions
                            if any(kw in claim_predicate for kw in ['body part', 'body', 'organ', 'anatomy', 'physical', 'human', 'fruit', 'food', 'snake', 'animal', 'reptile']):
                                if any(kw in article_description for kw in ['programming', 'code', 'language', 'software', 'framework', 'library', 'javascript', 'react', 'vue', 'angular', 'web', 'development', 'computer', 'technology']):
                                    claim_contradicts_article = True
                                    logger.warning(f"Semantic contradiction: Claim says '{claim_predicate}' but article says '{article_description}'")
                            
                            # Non-tech vs programming/tech contradictions
                            elif any(kw in claim_predicate for kw in ['programming', 'code', 'language', 'software', 'framework', 'library', 'javascript']):
                                if any(kw in article_description for kw in ['body part', 'body', 'organ', 'fruit', 'food', 'snake', 'animal']):
                                    claim_contradicts_article = True
                                    logger.warning(f"Semantic contradiction: Claim says '{claim_predicate}' but article says '{article_description}'")
                            
                            # Food vs non-food contradictions
                            elif any(kw in claim_predicate for kw in ['fruit', 'food', 'eat']):
                                if any(kw in article_description for kw in ['programming', 'code', 'software', 'snake', 'animal', 'body part']):
                                    claim_contradicts_article = True
                            
                            # Animal vs non-animal contradictions
                            elif any(kw in claim_predicate for kw in ['snake', 'animal', 'reptile']):
                                if any(kw in article_description for kw in ['programming', 'code', 'software', 'fruit', 'food', 'body part']):
                                    claim_contradicts_article = True
                        
                        # Check if the article matches the context (critical for disambiguation)
                        context_mismatch = False
                        claim_contradicts_context = False
                        
                        if query_context:
                            context_lower = query_context.lower()
                            summary_lower_check = summary_lower
                            claim_lower_check = claim_lower
                            
                            # Detect context type
                            is_programming_context = any(kw in context_lower for kw in ['programming', 'code', 'language', 'software', 'framework', 'library', 'javascript', 'react', 'vue', 'angular'])
                            is_animal_context = any(kw in context_lower for kw in ['snake', 'animal', 'reptile', 'genus', 'species'])
                            is_food_context = any(kw in context_lower for kw in ['fruit', 'food', 'eat', 'cooking', 'recipe'])
                            
                            # Check if CLAIM contradicts context (e.g., "React is a fruit" when context is programming)
                            if is_programming_context:
                                # Context is programming - claim should NOT mention food/animal
                                if any(kw in claim_lower_check for kw in ['fruit', 'food', 'eat', 'snake', 'animal', 'reptile']):
                                    claim_contradicts_context = True
                                    logger.warning(f"Claim contradicts context: Query about programming but claim mentions non-programming: {claim}")
                            
                            if is_animal_context:
                                # Context is animal - claim should NOT mention programming/food
                                if any(kw in claim_lower_check for kw in ['programming', 'code', 'language', 'software', 'fruit', 'food']):
                                    claim_contradicts_context = True
                                    logger.warning(f"Claim contradicts context: Query about animal but claim mentions non-animal: {claim}")
                            
                            if is_food_context:
                                # Context is food - claim should NOT mention programming/animal
                                if any(kw in claim_lower_check for kw in ['programming', 'code', 'language', 'software', 'snake', 'animal']):
                                    claim_contradicts_context = True
                                    logger.warning(f"Claim contradicts context: Query about food but claim mentions non-food: {claim}")
                            
                            # Check if ARTICLE contradicts context
                            if is_programming_context:
                                # Context is programming - article should be about programming
                                has_programming_keywords = any(kw in summary_lower_check for kw in ['programming', 'code', 'language', 'software', 'framework', 'library', 'javascript', 'react', 'vue', 'angular', 'web', 'development'])
                                has_non_programming_keywords = any(kw in summary_lower_check for kw in ['snake', 'reptile', 'genus', 'species', 'fruit', 'food', 'eat', 'cooking'])
                                
                                if has_non_programming_keywords and not has_programming_keywords:
                                    context_mismatch = True
                                    logger.warning(f"Context mismatch: Query about programming but found article about non-programming: {title}")
                            
                            elif is_animal_context:
                                # Context is animal - article should be about animal
                                has_animal_keywords = any(kw in summary_lower_check for kw in ['snake', 'reptile', 'genus', 'species', 'animal'])
                                has_non_animal_keywords = any(kw in summary_lower_check for kw in ['programming', 'code', 'language', 'software', 'fruit', 'food'])
                                
                                if has_non_animal_keywords and not has_animal_keywords:
                                    context_mismatch = True
                                    logger.warning(f"Context mismatch: Query about animal but found article about non-animal: {title}")
                            
                            elif is_food_context:
                                # Context is food - article should be about food
                                has_food_keywords = any(kw in summary_lower_check for kw in ['fruit', 'food', 'eat', 'cooking', 'recipe', 'nutrition'])
                                has_non_food_keywords = any(kw in summary_lower_check for kw in ['programming', 'code', 'language', 'software', 'snake', 'animal'])
                                
                                if has_non_food_keywords and not has_food_keywords:
                                    context_mismatch = True
                                    logger.warning(f"Context mismatch: Query about food but found article about non-food: {title}")
                        
                        # If significant overlap OR main subject found, consider verified
                        # BUT: If context mismatch OR claim contradicts context OR claim contradicts article, mark as incorrect
                        if context_mismatch or claim_contradicts_context or claim_contradicts_article:
                            # Context mismatch or claim contradicts context/article - this is WRONG
                            if claim_contradicts_article:
                                reason = f"claim contradicts article content. Claim says '{claim_predicate}' but article describes it as '{article_description}'"
                            elif claim_contradicts_context:
                                reason = "claim contradicts query context"
                            else:
                                reason = "article doesn't match query context"
                            
                            result = {
                                'status': 'false',  # Mark as false because it's the wrong interpretation
                                'confidence': 0.9,  # Very high confidence that it's wrong
                                'source': 'wikipedia',
                                'details': f"INCORRECT: Found Wikipedia article: {title}, but {reason}. Article says: {summary[:150]}...",
                                'url': data.get('content_urls', {}).get('desktop', {}).get('page', '')
                            }
                            _verification_cache[cache_key] = result
                            return result
                        elif overlap_ratio > 0.2 or main_subject_in_summary or any(word in summary_lower for word in claim_words if len(word) > 4):
                            result = {
                                'status': 'verified',
                                'confidence': min(0.7 + (overlap_ratio * 0.2), 0.9),
                                'source': 'wikipedia',
                                'details': f"Found in Wikipedia article: {title}. {summary[:200]}...",
                                'url': data.get('content_urls', {}).get('desktop', {}).get('page', '')
                            }
                            _verification_cache[cache_key] = result
                            return result
                
                # If direct lookup failed, try search API
                search_api_url = "https://en.wikipedia.org/api/rest_v1/page/search"
                search_response = await client.get(
                    search_api_url,
                    params={"q": search_terms, "limit": 5},  # Get more results to find the right one
                    headers={"User-Agent": "TruthGuard/1.0 (https://truthguard.ai)"}
                )
                
                if search_response.status_code == 200:
                    search_data = search_response.json()
                    pages = search_data.get('pages', [])
                    
                    if pages:
                        # Check all results to find the best match considering context
                        best_match = None
                        best_score = 0
                        
                        for page in pages:
                            snippet = page.get('snippet', '').lower()
                            title = page.get('title', '').lower()
                            full_text = f"{title} {snippet}".lower()
                            
                            claim_lower = claim.lower()
                            claim_words = set(re.findall(r'\b[a-zA-Z]{3,}\b', claim_lower))
                            text_words = set(re.findall(r'\b[a-zA-Z]{3,}\b', full_text))
                            
                            matching_words = claim_words.intersection(text_words)
                            overlap_ratio = len(matching_words) / len(claim_words) if claim_words else 0
                            
                            # SEMANTIC VERIFICATION: Check if claim's meaning matches article's meaning
                            claim_contradicts_article_search = False
                            claim_predicate_search = ""
                            article_description_search = ""
                            
                            try:
                                claim_predicate_search = extract_claim_predicate(claim_lower)
                                article_description_search = extract_article_description(full_text, title)
                            except NameError:
                                # Function not defined - skip semantic check
                                claim_predicate_search = ""
                                article_description_search = ""
                            
                            if claim_predicate_search and article_description_search:
                                # Check for semantic contradictions
                                if any(kw in claim_predicate_search for kw in ['body part', 'body', 'organ', 'anatomy', 'physical', 'human', 'fruit', 'food', 'snake', 'animal']):
                                    if any(kw in article_description_search for kw in ['programming', 'code', 'language', 'software', 'framework', 'library', 'javascript', 'react', 'vue', 'angular', 'web', 'development']):
                                        claim_contradicts_article_search = True
                                elif any(kw in claim_predicate_search for kw in ['programming', 'code', 'language', 'software', 'framework', 'library', 'javascript']):
                                    if any(kw in article_description_search for kw in ['body part', 'body', 'organ', 'fruit', 'food', 'snake', 'animal']):
                                        claim_contradicts_article_search = True
                            
                            # Check context match
                            context_match_score = 0
                            context_mismatch = False
                            claim_contradicts_context = False
                            
                            if query_context:
                                context_lower = query_context.lower()
                                claim_lower_check = claim_lower
                                
                                is_programming_context = any(kw in context_lower for kw in ['programming', 'code', 'language', 'software', 'framework', 'library', 'javascript', 'react', 'vue', 'angular'])
                                is_animal_context = any(kw in context_lower for kw in ['snake', 'animal', 'reptile', 'genus', 'species'])
                                is_food_context = any(kw in context_lower for kw in ['fruit', 'food', 'eat', 'cooking', 'recipe'])
                                
                                # Check if claim contradicts context
                                if is_programming_context:
                                    if any(kw in claim_lower_check for kw in ['fruit', 'food', 'eat', 'snake', 'animal']):
                                        claim_contradicts_context = True
                                elif is_animal_context:
                                    if any(kw in claim_lower_check for kw in ['programming', 'code', 'language', 'fruit', 'food']):
                                        claim_contradicts_context = True
                                elif is_food_context:
                                    if any(kw in claim_lower_check for kw in ['programming', 'code', 'language', 'snake', 'animal']):
                                        claim_contradicts_context = True
                                
                                # Check if article matches context
                                if is_programming_context:
                                    has_programming = any(kw in full_text for kw in ['programming', 'code', 'language', 'software', 'framework', 'library', 'javascript', 'react', 'vue', 'angular', 'web'])
                                    has_non_programming = any(kw in full_text for kw in ['snake', 'reptile', 'genus', 'fruit', 'food'])
                                    if has_programming:
                                        context_match_score = 0.5
                                    elif has_non_programming and not has_programming:
                                        context_mismatch = True
                                elif is_animal_context:
                                    has_animal = any(kw in full_text for kw in ['snake', 'reptile', 'genus', 'species', 'animal'])
                                    has_non_animal = any(kw in full_text for kw in ['programming', 'code', 'language', 'fruit', 'food'])
                                    if has_animal:
                                        context_match_score = 0.5
                                    elif has_non_animal and not has_animal:
                                        context_mismatch = True
                                elif is_food_context:
                                    has_food = any(kw in full_text for kw in ['fruit', 'food', 'eat', 'cooking', 'recipe'])
                                    has_non_food = any(kw in full_text for kw in ['programming', 'code', 'language', 'snake', 'animal'])
                                    if has_food:
                                        context_match_score = 0.5
                                    elif has_non_food and not has_food:
                                        context_mismatch = True
                            
                            if context_mismatch or claim_contradicts_context or claim_contradicts_article_search:
                                continue  # Skip this result (contradicts context or article)
                            
                            # Calculate total score
                            total_score = overlap_ratio + context_match_score
                            
                            if total_score > best_score:
                                best_score = total_score
                                best_match = page
                        
                        if best_match and best_score > 0.15:
                            snippet = best_match.get('snippet', '')
                            title = best_match.get('title', '')
                            full_text_check = f"{title} {snippet}".lower()
                            
                            # Final semantic check on best match
                            claim_predicate_final = ""
                            article_description_final = ""
                            
                            try:
                                claim_predicate_final = extract_claim_predicate(claim.lower())
                                article_description_final = extract_article_description(full_text_check, title.lower())
                            except NameError:
                                # Function not defined - skip semantic check
                                claim_predicate_final = ""
                                article_description_final = ""
                            
                            claim_contradicts_final = False
                            if claim_predicate_final and article_description_final:
                                if any(kw in claim_predicate_final for kw in ['body part', 'body', 'organ', 'anatomy', 'physical', 'human', 'fruit', 'food', 'snake', 'animal']):
                                    if any(kw in article_description_final for kw in ['programming', 'code', 'language', 'software', 'framework', 'library', 'javascript', 'react', 'vue', 'angular', 'web', 'development']):
                                        claim_contradicts_final = True
                                elif any(kw in claim_predicate_final for kw in ['programming', 'code', 'language', 'software', 'framework', 'library', 'javascript']):
                                    if any(kw in article_description_final for kw in ['body part', 'body', 'organ', 'fruit', 'food', 'snake', 'animal']):
                                        claim_contradicts_final = True
                            
                            if claim_contradicts_final:
                                # Best match contradicts claim - mark as false
                                result = {
                                    'status': 'false',
                                    'confidence': 0.9,
                                    'source': 'wikipedia',
                                    'details': f"INCORRECT: Found Wikipedia article: {title}, but claim contradicts article content. Claim says '{claim_predicate_final}' but article describes it as '{article_description_final}'. {snippet[:150]}...",
                                    'url': f"https://en.wikipedia.org/wiki/{quote(title.replace(' ', '_'))}"
                                }
                                _verification_cache[cache_key] = result
                                return result
                            
                            result = {
                                'status': 'verified',
                                'confidence': min(0.6 + (best_score * 0.2), 0.8),
                                'source': 'wikipedia',
                                'details': f"Found in Wikipedia search: {title}. {snippet[:200]}...",
                                'url': f"https://en.wikipedia.org/wiki/{quote(title.replace(' ', '_'))}"
                            }
                            _verification_cache[cache_key] = result
                            return result
                
            except httpx.TimeoutException:
                logger.warning(f"Wikipedia API timeout for: {claim[:50]}...")
            except httpx.HTTPStatusError as e:
                if e.response.status_code != 404:
                    logger.warning(f"Wikipedia API error {e.response.status_code}: {claim[:50]}...")
        
        # Not found in Wikipedia
        result = {
            'status': 'unverified',
            'confidence': 0.3,
            'source': 'wikipedia',
            'details': 'Not found in Wikipedia'
        }
        _verification_cache[cache_key] = result
        return result
        
    except Exception as e:
        logger.error(f"Wikipedia verification error: {str(e)}")
        return {
            'status': 'unverified',
            'confidence': 0.3,
            'source': None,
            'details': f'Error: {str(e)}'
        }


async def verify_via_duckduckgo(claim: str, query_context: Optional[str] = None) -> Dict[str, Any]:
    """
    Verify claim using DuckDuckGo Instant Answer API (free, no key required)
    
    Args:
        claim: The factual claim to verify
        
    Returns:
        Dict with status, confidence, source, and details
    """
    cache_key = f"ddg:{claim.lower().strip()}"
    if cache_key in _verification_cache:
        logger.debug(f"Cache hit for DuckDuckGo: {claim[:50]}...")
        return _verification_cache[cache_key]
    
    try:
        # DuckDuckGo Instant Answer API
        url = "https://api.duckduckgo.com/"
        params = {
            'q': claim,
            'format': 'json',
            'no_html': '1',
            'skip_disambig': '1'
        }
        
        async with httpx.AsyncClient(timeout=5.0) as client:
            try:
                response = await client.get(url, params=params)
                
                if response.status_code == 200:
                    data = response.json()
                    
                    # Check AbstractText (main answer)
                    abstract = data.get('AbstractText', '')
                    if abstract:
                        # Check if claim matches abstract
                        claim_lower = claim.lower()
                        abstract_lower = abstract.lower()
                        
                        claim_words = set(re.findall(r'\b[a-zA-Z]{3,}\b', claim_lower))
                        abstract_words = set(re.findall(r'\b[a-zA-Z]{3,}\b', abstract_lower))
                        matching_words = claim_words.intersection(abstract_words)
                        overlap_ratio = len(matching_words) / len(claim_words) if claim_words else 0
                        
                        if overlap_ratio > 0.2:
                            result = {
                                'status': 'verified',
                                'confidence': min(0.6 + (overlap_ratio * 0.2), 0.8),
                                'source': 'duckduckgo',
                                'details': abstract[:300]
                            }
                            _verification_cache[cache_key] = result
                            return result
                    
                    # Check Answer (direct answer)
                    answer = data.get('Answer', '')
                    if answer:
                        result = {
                            'status': 'verified',
                            'confidence': 0.7,
                            'source': 'duckduckgo',
                            'details': answer
                        }
                        _verification_cache[cache_key] = result
                        return result
                    
                    # Check RelatedTopics
                    related_topics = data.get('RelatedTopics', [])
                    if related_topics:
                        # Check first related topic
                        first_topic = related_topics[0]
                        topic_text = first_topic.get('Text', '').lower()
                        claim_lower = claim.lower()
                        
                        if any(word in topic_text for word in claim_lower.split()[:3] if len(word) > 3):
                            result = {
                                'status': 'verified',
                                'confidence': 0.6,
                                'source': 'duckduckgo',
                                'details': first_topic.get('Text', '')[:300]
                            }
                            _verification_cache[cache_key] = result
                            return result
                            
            except httpx.TimeoutException:
                logger.warning(f"DuckDuckGo API timeout for: {claim[:50]}...")
            except httpx.HTTPStatusError as e:
                logger.warning(f"DuckDuckGo API error {e.response.status_code}: {claim[:50]}...")
        
        # Not found
        result = {
            'status': 'unverified',
            'confidence': 0.3,
            'source': 'duckduckgo',
            'details': 'No instant answer available'
        }
        _verification_cache[cache_key] = result
        return result
        
    except Exception as e:
        logger.error(f"DuckDuckGo verification error: {str(e)}")
        return {
            'status': 'unverified',
            'confidence': 0.3,
            'source': None,
            'details': f'Error: {str(e)}'
        }


async def verify_via_newsapi(claim: str, query_context: Optional[str] = None) -> Dict[str, Any]:
    """
    Verify claim using NewsAPI (free tier: 100 requests/day)
    Requires NEWSAPI_KEY environment variable
    
    Args:
        claim: The factual claim to verify
        
    Returns:
        Dict with status, confidence, source, and details
    """
    if not NEWSAPI_KEY:
        return {
            'status': 'unverified',
            'confidence': 0.0,
            'source': None,
            'details': 'NewsAPI key not configured'
        }
    
    cache_key = f"news:{claim.lower().strip()}"
    if cache_key in _verification_cache:
        logger.debug(f"Cache hit for NewsAPI: {claim[:50]}...")
        return _verification_cache[cache_key]
    
    try:
        # Extract key terms for search
        search_terms = extract_search_terms(claim, max_terms=3)
        
        url = "https://newsapi.org/v2/everything"
        params = {
            'q': search_terms,
            'apiKey': NEWSAPI_KEY,
            'sortBy': 'relevancy',
            'pageSize': 3,
            'language': 'en'
        }
        
        async with httpx.AsyncClient(timeout=5.0) as client:
            try:
                response = await client.get(url, params=params)
                
                if response.status_code == 200:
                    data = response.json()
                    articles = data.get('articles', [])
                    
                    if articles:
                        # Check if claim is mentioned in articles
                        claim_lower = claim.lower()
                        claim_words = set(re.findall(r'\b[a-zA-Z]{3,}\b', claim_lower))
                        
                        best_match = None
                        best_overlap = 0
                        
                        for article in articles[:2]:  # Check first 2 articles
                            title = article.get('title', '').lower()
                            description = article.get('description', '').lower()
                            content = f"{title} {description}"
                            
                            content_words = set(re.findall(r'\b[a-zA-Z]{3,}\b', content))
                            matching_words = claim_words.intersection(content_words)
                            overlap_ratio = len(matching_words) / len(claim_words) if claim_words else 0
                            
                            if overlap_ratio > best_overlap:
                                best_overlap = overlap_ratio
                                best_match = article
                        
                        if best_match and best_overlap > 0.2:
                            result = {
                                'status': 'verified',
                                'confidence': min(0.6 + (best_overlap * 0.2), 0.8),
                                'source': 'newsapi',
                                'details': f"Found in news: {best_match.get('title', '')}. {best_match.get('description', '')[:200]}...",
                                'url': best_match.get('url', '')
                            }
                            _verification_cache[cache_key] = result
                            return result
                
                elif response.status_code == 429:
                    logger.warning("NewsAPI rate limit reached (100 requests/day)")
                    return {
                        'status': 'unverified',
                        'confidence': 0.0,
                        'source': None,
                        'details': 'NewsAPI rate limit reached'
                    }
                else:
                    error_data = response.json() if response.headers.get('content-type', '').startswith('application/json') else {}
                    logger.warning(f"NewsAPI error {response.status_code}: {error_data.get('message', 'Unknown error')}")
                    
            except httpx.TimeoutException:
                logger.warning(f"NewsAPI timeout for: {claim[:50]}...")
            except httpx.HTTPStatusError as e:
                logger.warning(f"NewsAPI HTTP error {e.response.status_code}: {claim[:50]}...")
        
        # Not found
        result = {
            'status': 'unverified',
            'confidence': 0.3,
            'source': 'newsapi',
            'details': 'No relevant news articles found'
        }
        _verification_cache[cache_key] = result
        return result
        
    except Exception as e:
        logger.error(f"NewsAPI verification error: {str(e)}")
        return {
            'status': 'unverified',
            'confidence': 0.3,
            'source': None,
            'details': f'Error: {str(e)}'
        }


async def verify_claim_realtime(claim: str, use_all_sources: bool = True, query_context: Optional[str] = None) -> Dict[str, Any]:
    """
    Verify a claim using all available real-time sources
    Tries sources in order: Wikipedia -> DuckDuckGo -> NewsAPI
    
    Args:
        claim: The factual claim to verify
        use_all_sources: If True, tries all sources; if False, stops at first verified result
        
    Returns:
        Dict with status, confidence, source, and details
    """
    if not claim or len(claim.strip()) < 3:
        return {
            'status': 'unverified',
            'confidence': 0.0,
            'source': None,
            'details': 'Claim too short'
        }
    
    results = []
    
    # Try Wikipedia first (best for general facts)
    wiki_result = await verify_via_wikipedia(claim, query_context=query_context)
    results.append(('wikipedia', wiki_result))
    
    # If Wikipedia marked it as false (context mismatch), return immediately
    if wiki_result['status'] == 'false':
        return wiki_result
    
    if wiki_result['status'] == 'verified' and not use_all_sources:
        return wiki_result
    
    # Try DuckDuckGo (good for current info)
    ddg_result = await verify_via_duckduckgo(claim, query_context=query_context)
    results.append(('duckduckgo', ddg_result))
    
    if ddg_result['status'] == 'verified' and not use_all_sources:
        return ddg_result
    
    # Try NewsAPI (good for news/events)
    news_result = await verify_via_newsapi(claim, query_context=query_context)
    results.append(('newsapi', news_result))
    
    if news_result['status'] == 'verified' and not use_all_sources:
        return news_result
    
    # Aggregate results
    verified_results = [r for _, r in results if r['status'] == 'verified']
    
    if verified_results:
        # Return the result with highest confidence
        best_result = max(verified_results, key=lambda x: x['confidence'])
        
        # If multiple sources verified, increase confidence slightly
        if len(verified_results) > 1:
            best_result['confidence'] = min(best_result['confidence'] + 0.1, 0.95)
            best_result['details'] += f" (Also verified by {len(verified_results)-1} other source(s))"
        
        return best_result
    
    # No sources verified - return best unverified result
    unverified_results = [r for _, r in results if r['status'] == 'unverified']
    if unverified_results:
        # Return the one with highest confidence (even if unverified)
        best_unverified = max(unverified_results, key=lambda x: x['confidence'])
        return best_unverified
    
    # Fallback
    return {
        'status': 'unverified',
        'confidence': 0.3,
        'source': None,
        'details': 'Could not verify against any available sources'
    }

