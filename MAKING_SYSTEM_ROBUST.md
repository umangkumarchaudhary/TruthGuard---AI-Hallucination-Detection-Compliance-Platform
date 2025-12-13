# 🚀 Making TruthGuard More Robust

**Guide to adding real-time data fetching, time awareness, and AI-powered corrections**

---

## 📋 Table of Contents

1. [Real-Time Data Fetching](#real-time-data-fetching)
2. [Time/Date Awareness](#timedate-awareness)
3. [AI-Powered Response Correction](#ai-powered-response-correction)
4. [Implementation Priority](#implementation-priority)
5. [Step-by-Step Implementation](#step-by-step-implementation)
6. [Free API Options](#free-api-options)
7. [Architecture Changes](#architecture-changes)

---

## 1. Real-Time Data Fetching

### 🎯 Goal
Verify factual claims against real-time sources instead of just marking everything as "unverified"

### ✅ Free Options

#### Option A: Wikipedia API (Recommended - Free, No Key)
**What it does:** Verifies factual claims against Wikipedia

**Implementation:**
```python
# backend/app/services/real_time_verification.py
import httpx
import logging

logger = logging.getLogger(__name__)

def verify_via_wikipedia(claim: str) -> Dict[str, Any]:
    """
    Verify claim using Wikipedia REST API (free, no key required)
    """
    try:
        # Extract key terms from claim
        # Simple approach: use first few words as search term
        search_terms = claim.split()[:3]  # First 3 words
        search_query = " ".join(search_terms)
        
        # Wikipedia REST API
        url = f"https://en.wikipedia.org/api/rest_v1/page/summary/{search_query}"
        
        async with httpx.AsyncClient() as client:
            response = await client.get(url, timeout=5.0)
            
            if response.status_code == 200:
                data = response.json()
                summary = data.get('extract', '')
                
                # Check if claim is mentioned in summary
                claim_lower = claim.lower()
                summary_lower = summary.lower()
                
                # Simple keyword matching (in production, use semantic similarity)
                if any(word in summary_lower for word in claim_lower.split()[:3]):
                    return {
                        'status': 'verified',
                        'confidence': 0.7,
                        'source': 'wikipedia',
                        'details': summary[:200]  # First 200 chars
                    }
        
        return {
            'status': 'unverified',
            'confidence': 0.3,
            'source': None,
            'details': 'Not found in Wikipedia'
        }
    except Exception as e:
        logger.error(f"Wikipedia verification error: {str(e)}")
        return {
            'status': 'unverified',
            'confidence': 0.3,
            'source': None,
            'details': f'Error: {str(e)}'
        }
```

**Pros:**
- ✅ Completely free
- ✅ No API key required
- ✅ Reliable for general facts
- ✅ Good coverage

**Cons:**
- ❌ Limited to Wikipedia content
- ❌ Not great for very specific/niche claims

---

#### Option B: DuckDuckGo Instant Answer API (Free, No Key)
**What it does:** Gets real-time answers to queries

**Implementation:**
```python
def verify_via_duckduckgo(claim: str) -> Dict[str, Any]:
    """
    Verify claim using DuckDuckGo Instant Answer API (free, no key)
    """
    try:
        # DuckDuckGo API
        url = "https://api.duckduckgo.com/"
        params = {
            'q': claim,
            'format': 'json',
            'no_html': '1',
            'skip_disambig': '1'
        }
        
        async with httpx.AsyncClient() as client:
            response = await client.get(url, params=params, timeout=5.0)
            
            if response.status_code == 200:
                data = response.json()
                
                # Check AbstractText (main answer)
                abstract = data.get('AbstractText', '')
                if abstract:
                    return {
                        'status': 'verified',
                        'confidence': 0.6,
                        'source': 'duckduckgo',
                        'details': abstract[:200]
                    }
                
                # Check Answer (direct answer)
                answer = data.get('Answer', '')
                if answer:
                    return {
                        'status': 'verified',
                        'confidence': 0.7,
                        'source': 'duckduckgo',
                        'details': answer
                    }
        
        return {
            'status': 'unverified',
            'confidence': 0.3,
            'source': None,
            'details': 'No instant answer available'
        }
    except Exception as e:
        logger.error(f"DuckDuckGo verification error: {str(e)}")
        return {
            'status': 'unverified',
            'confidence': 0.3,
            'source': None,
            'details': f'Error: {str(e)}'
        }
```

**Pros:**
- ✅ Completely free
- ✅ No API key required
- ✅ Good for current information
- ✅ Fast responses

**Cons:**
- ❌ Limited structured data
- ❌ Not always available for all queries

---

#### Option C: NewsAPI (Free Tier - 100 requests/day)
**What it does:** Get current news/articles for verification

**Setup:**
1. Sign up at https://newsapi.org (free)
2. Get API key (free tier: 100 requests/day)

**Implementation:**
```python
def verify_via_newsapi(claim: str, api_key: str) -> Dict[str, Any]:
    """
    Verify claim using NewsAPI (free tier: 100 requests/day)
    """
    try:
        # Extract key terms
        search_terms = " ".join(claim.split()[:3])
        
        url = "https://newsapi.org/v2/everything"
        params = {
            'q': search_terms,
            'apiKey': api_key,
            'sortBy': 'relevancy',
            'pageSize': 3
        }
        
        async with httpx.AsyncClient() as client:
            response = await client.get(url, params=params, timeout=5.0)
            
            if response.status_code == 200:
                data = response.json()
                articles = data.get('articles', [])
                
                if articles:
                    # Check if claim is mentioned in articles
                    for article in articles[:2]:  # Check first 2
                        title = article.get('title', '').lower()
                        description = article.get('description', '').lower()
                        claim_lower = claim.lower()
                        
                        if any(word in title or word in description 
                               for word in claim_lower.split()[:3]):
                            return {
                                'status': 'verified',
                                'confidence': 0.6,
                                'source': 'newsapi',
                                'details': article.get('title', '')
                            }
        
        return {
            'status': 'unverified',
            'confidence': 0.3,
            'source': None,
            'details': 'No relevant news articles found'
        }
    except Exception as e:
        logger.error(f"NewsAPI verification error: {str(e)}")
        return {
            'status': 'unverified',
            'confidence': 0.3,
            'source': None,
            'details': f'Error: {str(e)}'
        }
```

**Pros:**
- ✅ Current information
- ✅ Good for news/events
- ✅ Free tier available

**Cons:**
- ❌ Rate limits (100/day)
- ❌ Requires API key
- ❌ Not great for general facts

---

### 🔄 Integration with Existing System

**Update `fact_verification.py`:**
```python
from app.services.real_time_verification import (
    verify_via_wikipedia,
    verify_via_duckduckgo
)

def verify_claim(claim: str, claim_type: str = "factual") -> Dict[str, Any]:
    """
    Enhanced verification with real-time sources
    """
    # Try Wikipedia first (best for general facts)
    wiki_result = await verify_via_wikipedia(claim)
    if wiki_result['status'] == 'verified':
        return wiki_result
    
    # Try DuckDuckGo (good for current info)
    ddg_result = await verify_via_duckduckgo(claim)
    if ddg_result['status'] == 'verified':
        return ddg_result
    
    # Fallback to existing logic
    return {
        'status': 'unverified',
        'confidence': 0.3,
        'source': None,
        'details': 'Could not verify against available sources'
    }
```

---

## 2. Time/Date Awareness

### 🎯 Goal
Detect outdated information, incorrect dates, and time-sensitive claims

### ✅ Implementation

**Create `backend/app/services/time_awareness.py`:**
```python
"""
Time Awareness Service
Detects outdated information and time-sensitive issues
"""
import re
from datetime import datetime, timedelta
from typing import Dict, Any, List
import logging

logger = logging.getLogger(__name__)

def extract_dates_from_text(text: str) -> List[Dict[str, Any]]:
    """
    Extract dates and time references from text
    Returns list of date references with context
    """
    dates = []
    
    # Pattern for relative dates: "yesterday", "last week", "3 days ago"
    relative_patterns = [
        (r'\b(yesterday|today|tomorrow)\b', 'relative'),
        (r'\b(last|next)\s+(week|month|year|day)\b', 'relative'),
        (r'(\d+)\s+(days?|weeks?|months?|years?)\s+ago', 'relative'),
    ]
    
    # Pattern for absolute dates: "January 2024", "2024-01-15"
    absolute_patterns = [
        (r'\b(January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{4}\b', 'absolute'),
        (r'\b\d{4}-\d{2}-\d{2}\b', 'absolute'),
        (r'\b\d{1,2}/\d{1,2}/\d{4}\b', 'absolute'),
    ]
    
    for pattern, date_type in relative_patterns + absolute_patterns:
        matches = re.finditer(pattern, text, re.IGNORECASE)
        for match in matches:
            dates.append({
                'text': match.group(),
                'type': date_type,
                'position': match.start(),
                'context': text[max(0, match.start()-20):match.end()+20]
            })
    
    return dates

def check_time_sensitivity(response: str, query: str = "") -> Dict[str, Any]:
    """
    Check if response contains time-sensitive information
    Returns issues found
    """
    issues = []
    current_date = datetime.now()
    
    # Extract dates from response
    dates = extract_dates_from_text(response)
    
    for date_info in dates:
        date_text = date_info['text'].lower()
        
        # Check for "yesterday", "today", "recently" claims
        if 'yesterday' in date_text:
            # If response says "yesterday" but was generated days ago, flag
            # This would need to check when the interaction happened
            issues.append({
                'type': 'relative_date',
                'severity': 'low',
                'description': f'Response uses relative date "{date_info["text"]}" - verify accuracy',
                'date_text': date_info['text']
            })
        
        # Check for outdated information
        if date_info['type'] == 'absolute':
            try:
                # Try to parse the date
                # This is simplified - would need proper date parsing
                if '2023' in date_info['text'] or '2022' in date_info['text']:
                    issues.append({
                        'type': 'outdated_date',
                        'severity': 'medium',
                        'description': f'Response references potentially outdated date: {date_info["text"]}',
                        'date_text': date_info['text']
                    })
            except:
                pass
    
    # Check for "current" or "recent" claims without dates
    current_keywords = ['currently', 'recently', 'now', 'current', 'latest']
    if any(keyword in response.lower() for keyword in current_keywords):
        # Check if there's a date to support the claim
        if not dates:
            issues.append({
                'type': 'unsupported_current_claim',
                'severity': 'low',
                'description': 'Response claims information is "current" but no date provided',
            })
    
    return {
        'has_issues': len(issues) > 0,
        'issues': issues,
        'dates_found': len(dates)
    }

def validate_date_accuracy(response: str, interaction_timestamp: datetime) -> Dict[str, Any]:
    """
    Validate if dates in response are accurate relative to interaction time
    """
    issues = []
    dates = extract_dates_from_text(response)
    
    for date_info in dates:
        if 'yesterday' in date_info['text'].lower():
            # Check if interaction was actually yesterday
            yesterday = interaction_timestamp - timedelta(days=1)
            if interaction_timestamp.date() != yesterday.date():
                issues.append({
                    'type': 'incorrect_relative_date',
                    'severity': 'medium',
                    'description': f'Response says "yesterday" but interaction was not on that date',
                })
    
    return {
        'has_issues': len(issues) > 0,
        'issues': issues
    }
```

**Integration with detection:**
```python
# In detection.py
from app.services.time_awareness import check_time_sensitivity

# Add to detection pipeline
time_issues = check_time_sensitivity(ai_response, query)
if time_issues['has_issues']:
    for issue in time_issues['issues']:
        result.violations.append({
            'type': 'time_sensitivity',
            'severity': issue['severity'],
            'description': issue['description']
        })
```

---

## 3. AI-Powered Response Correction

### 🎯 Goal
Generate better, corrected responses using AI instead of just flagging issues

### ✅ Free Options

#### Option A: Groq API (Recommended - Fast, Free Tier)
**What it does:** Fast LLM API for generating corrections

**Setup:**
1. Sign up at https://console.groq.com (free)
2. Get API key
3. Free tier: Generous limits, very fast

**Implementation:**
```python
# backend/app/services/ai_correction.py
import httpx
import os
import logging

logger = logging.getLogger(__name__)

GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"

async def generate_corrected_response_with_groq(
    original_response: str,
    violations: List[Dict],
    query: str
) -> Dict[str, Any]:
    """
    Generate corrected response using Groq API (free tier)
    """
    if not GROQ_API_KEY:
        logger.warning("Groq API key not set, skipping AI correction")
        return None
    
    try:
        # Build prompt for correction
        violations_text = "\n".join([
            f"- {v.get('type', 'unknown')}: {v.get('description', '')}"
            for v in violations
        ])
        
        prompt = f"""You are a helpful assistant that corrects AI responses to fix violations.

Original User Query: {query}

Original AI Response: {original_response}

Violations Found:
{violations_text}

Please provide a corrected version of the AI response that:
1. Fixes all the violations mentioned
2. Maintains the helpful intent of the original response
3. Is accurate, compliant, and policy-aligned
4. Is clear and professional

Corrected Response:"""

        async with httpx.AsyncClient() as client:
            response = await client.post(
                GROQ_API_URL,
                headers={
                    "Authorization": f"Bearer {GROQ_API_KEY}",
                    "Content-Type": "application/json"
                },
                json={
                    "model": "llama-3.1-70b-versatile",  # Fast, free model
                    "messages": [
                        {"role": "system", "content": "You are an expert at correcting AI responses to fix compliance, policy, and accuracy issues."},
                        {"role": "user", "content": prompt}
                    ],
                    "temperature": 0.3,  # Lower temperature for more consistent corrections
                    "max_tokens": 500
                },
                timeout=10.0
            )
            
            if response.status_code == 200:
                data = response.json()
                corrected = data['choices'][0]['message']['content'].strip()
                
                return {
                    'corrected_response': corrected,
                    'model': 'groq-llama-3.1',
                    'changes_made': [
                        f"Fixed {v.get('type', 'violation')}" for v in violations
                    ]
                }
            else:
                logger.error(f"Groq API error: {response.status_code}")
                return None
                
    except Exception as e:
        logger.error(f"Error generating correction with Groq: {str(e)}")
        return None
```

**Pros:**
- ✅ Very fast (uses Groq's fast inference)
- ✅ Generous free tier
- ✅ Good quality models (Llama 3, Mixtral)
- ✅ Easy to use

**Cons:**
- ❌ Requires API key (but free)
- ❌ Rate limits on free tier

---

#### Option B: Hugging Face Inference API (Free Tier)
**What it does:** Use Hugging Face models for corrections

**Setup:**
1. Sign up at https://huggingface.co (free)
2. Get API token
3. Free tier: Limited but usable

**Implementation:**
```python
HF_API_KEY = os.getenv("HUGGINGFACE_API_KEY", "")
HF_API_URL = "https://api-inference.huggingface.co/models/meta-llama/Meta-Llama-3-8B-Instruct"

async def generate_corrected_response_with_hf(
    original_response: str,
    violations: List[Dict],
    query: str
) -> Dict[str, Any]:
    """
    Generate corrected response using Hugging Face Inference API
    """
    if not HF_API_KEY:
        logger.warning("Hugging Face API key not set, skipping AI correction")
        return None
    
    try:
        violations_text = "\n".join([
            f"- {v.get('type', 'unknown')}: {v.get('description', '')}"
            for v in violations
        ])
        
        prompt = f"""Correct this AI response to fix violations:

Query: {query}
Response: {original_response}
Violations: {violations_text}

Corrected Response:"""

        async with httpx.AsyncClient() as client:
            response = await client.post(
                HF_API_URL,
                headers={
                    "Authorization": f"Bearer {HF_API_KEY}",
                    "Content-Type": "application/json"
                },
                json={
                    "inputs": prompt,
                    "parameters": {
                        "max_new_tokens": 300,
                        "temperature": 0.3
                    }
                },
                timeout=30.0  # HF can be slower
            )
            
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list) and len(data) > 0:
                    corrected = data[0].get('generated_text', '').replace(prompt, '').strip()
                    return {
                        'corrected_response': corrected,
                        'model': 'hf-llama-3',
                        'changes_made': [f"Fixed {v.get('type')}" for v in violations]
                    }
        
        return None
    except Exception as e:
        logger.error(f"Error generating correction with HF: {str(e)}")
        return None
```

**Pros:**
- ✅ Free tier available
- ✅ Many models to choose from
- ✅ Good for experimentation

**Cons:**
- ❌ Can be slow
- ❌ Rate limits
- ❌ Some models require GPU (paid)

---

#### Option C: Local Model (Completely Free, No API)
**What it does:** Run model locally on your machine

**Setup:**
1. Install Ollama: https://ollama.ai
2. Download model: `ollama pull llama3:8b`
3. Use locally

**Implementation:**
```python
OLLAMA_URL = os.getenv("OLLAMA_URL", "http://localhost:11434")

async def generate_corrected_response_with_ollama(
    original_response: str,
    violations: List[Dict],
    query: str
) -> Dict[str, Any]:
    """
    Generate corrected response using local Ollama model
    """
    try:
        violations_text = "\n".join([
            f"- {v.get('type')}: {v.get('description')}"
            for v in violations
        ])
        
        prompt = f"""Correct this AI response:

Query: {query}
Response: {original_response}
Violations: {violations_text}

Corrected:"""

        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{OLLAMA_URL}/api/generate",
                json={
                    "model": "llama3:8b",
                    "prompt": prompt,
                    "stream": False
                },
                timeout=60.0  # Local can be slower
            )
            
            if response.status_code == 200:
                data = response.json()
                corrected = data.get('response', '').strip()
                return {
                    'corrected_response': corrected,
                    'model': 'ollama-llama3',
                    'changes_made': [f"Fixed {v.get('type')}" for v in violations]
                }
        
        return None
    except Exception as e:
        logger.error(f"Error generating correction with Ollama: {str(e)}")
        return None
```

**Pros:**
- ✅ Completely free
- ✅ No API limits
- ✅ Private (data stays local)
- ✅ No internet required

**Cons:**
- ❌ Requires GPU or good CPU
- ❌ Setup complexity
- ❌ Slower than cloud APIs

---

### 🔄 Integration with Existing Correction Service

**Update `backend/app/services/correction.py`:**
```python
from app.services.ai_correction import (
    generate_corrected_response_with_groq,
    generate_corrected_response_with_hf,
    generate_corrected_response_with_ollama
)

async def suggest_correction(
    original_response: str,
    violations: List[Dict],
    query: str
) -> Dict[str, Any]:
    """
    Enhanced correction with AI-powered suggestions
    """
    # Try Groq first (fastest)
    correction = await generate_corrected_response_with_groq(
        original_response, violations, query
    )
    
    if correction:
        return correction
    
    # Fallback to Hugging Face
    correction = await generate_corrected_response_with_hf(
        original_response, violations, query
    )
    
    if correction:
        return correction
    
    # Fallback to Ollama (if available)
    correction = await generate_corrected_response_with_ollama(
        original_response, violations, query
    )
    
    if correction:
        return correction
    
    # Fallback to rule-based correction (existing logic)
    return {
        'corrected_response': original_response,  # No change
        'changes_made': ['Could not generate AI correction']
    }
```

---

## 4. Implementation Priority

### 🥇 Phase 1: Quick Wins (1-2 days)
1. **Wikipedia API integration** (2 hours)
   - Free, no key required
   - Immediate improvement in fact verification

2. **Time/date awareness** (3 hours)
   - Extract dates from responses
   - Flag outdated information

### 🥈 Phase 2: AI Corrections (2-3 days)
3. **Groq API integration** (4 hours)
   - Fast, free tier
   - Generate corrected responses

### 🥉 Phase 3: Enhanced Features (3-5 days)
4. **DuckDuckGo integration** (2 hours)
   - Current information verification

5. **NewsAPI integration** (2 hours)
   - News/events verification

6. **Local model option** (1 day)
   - For completely free, unlimited use

---

## 5. Step-by-Step Implementation

### Step 1: Add Real-Time Verification

**File: `backend/app/services/real_time_verification.py`**
```python
# Create new file with Wikipedia + DuckDuckGo functions
# (Code provided above)
```

**Update: `backend/app/services/fact_verification.py`**
```python
# Import and use real-time verification
from app.services.real_time_verification import (
    verify_via_wikipedia,
    verify_via_duckduckgo
)
```

**Environment Variables:**
```env
# Optional - only if using NewsAPI
NEWSAPI_KEY=your_key_here
```

### Step 2: Add Time Awareness

**File: `backend/app/services/time_awareness.py`**
```python
# Create new file with time checking functions
# (Code provided above)
```

**Update: `backend/app/services/detection.py`**
```python
# Add time sensitivity check to detection pipeline
from app.services.time_awareness import check_time_sensitivity
```

### Step 3: Add AI Corrections

**File: `backend/app/services/ai_correction.py`**
```python
# Create new file with AI correction functions
# (Code provided above)
```

**Update: `backend/app/services/correction.py`**
```python
# Use AI correction instead of rule-based
from app.services.ai_correction import generate_corrected_response_with_groq
```

**Environment Variables:**
```env
# Choose one or more:
GROQ_API_KEY=your_groq_key
HUGGINGFACE_API_KEY=your_hf_key
OLLAMA_URL=http://localhost:11434  # If using local
```

### Step 4: Update Frontend

**File: `frontend/app/test/page.tsx`**
```typescript
// Show "Real-time verified" badges
// Display AI-generated corrections prominently
// Show time-sensitive warnings
```

---

## 6. Free API Options Summary

| Service | Cost | Speed | Quality | Setup |
|---------|------|-------|---------|-------|
| **Wikipedia API** | Free | Fast | Good | None |
| **DuckDuckGo API** | Free | Fast | Good | None |
| **NewsAPI** | Free (100/day) | Fast | Good | Sign up |
| **Groq API** | Free tier | Very Fast | Excellent | Sign up |
| **Hugging Face** | Free tier | Slow | Good | Sign up |
| **Ollama (Local)** | Free | Medium | Good | Install |

**Recommended Stack:**
- **Fact Checking:** Wikipedia + DuckDuckGo
- **AI Corrections:** Groq API (fast, free tier)
- **Time Awareness:** Python datetime (free)

---

## 7. Architecture Changes

### New Files to Create:
```
backend/app/services/
├── real_time_verification.py  (NEW)
├── time_awareness.py           (NEW)
└── ai_correction.py            (NEW)
```

### Files to Update:
```
backend/app/services/
├── fact_verification.py        (Add real-time sources)
├── detection.py                (Add time checks)
└── correction.py              (Add AI corrections)
```

### Dependencies to Add:
```txt
# backend/requirements.txt
httpx>=0.27.2  # Already included
# No new dependencies needed!
```

---

## 8. Testing Strategy

### Test Real-Time Verification:
```python
# Test Wikipedia
result = await verify_via_wikipedia("Python is a programming language")
assert result['status'] == 'verified'

# Test DuckDuckGo
result = await verify_via_duckduckgo("What is AI?")
assert result['status'] == 'verified'
```

### Test Time Awareness:
```python
# Test date extraction
dates = extract_dates_from_text("This happened yesterday")
assert len(dates) > 0

# Test time sensitivity
issues = check_time_sensitivity("Currently, the situation is...")
assert issues['has_issues'] == True
```

### Test AI Corrections:
```python
# Test Groq correction
violations = [{'type': 'compliance', 'description': 'Missing disclaimer'}]
correction = await generate_corrected_response_with_groq(
    "Yes, invest all your money",
    violations,
    "Should I invest?"
)
assert correction['corrected_response'] is not None
```

---

## 9. Deployment Considerations

### Environment Variables:
```env
# Real-time verification (optional)
NEWSAPI_KEY=your_key_here

# AI corrections (choose one)
GROQ_API_KEY=your_groq_key
# OR
HUGGINGFACE_API_KEY=your_hf_key
# OR
OLLAMA_URL=http://localhost:11434
```

### Rate Limiting:
- Wikipedia: No limits (but be respectful)
- DuckDuckGo: No limits (but be respectful)
- NewsAPI: 100 requests/day (free tier)
- Groq: Generous free tier
- Hugging Face: Rate limited (free tier)

### Error Handling:
- Always have fallbacks
- Cache results when possible
- Handle API failures gracefully
- Log errors for debugging

---

## 10. Next Steps

1. **Start with Wikipedia API** (easiest, no setup)
2. **Add time awareness** (pure Python, no APIs)
3. **Add Groq for corrections** (fast, free tier)
4. **Test thoroughly** with various responses
5. **Monitor API usage** to stay within free tiers

---

## 🎯 Summary

**Quick Wins (Free, No Setup):**
- ✅ Wikipedia API for fact checking
- ✅ DuckDuckGo API for current info
- ✅ Python datetime for time awareness

**AI Corrections (Free Tier):**
- ✅ Groq API (recommended - fast, free)
- ✅ Hugging Face (alternative)
- ✅ Ollama (local, completely free)

**Implementation Time:**
- Phase 1: 1-2 days
- Phase 2: 2-3 days
- Phase 3: 3-5 days

**Total Cost:** $0 (using free tiers)

---

**Ready to implement? Start with Wikipedia API - it's the easiest and gives immediate value!** 🚀

