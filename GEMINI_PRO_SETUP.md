# 🚀 Gemini Pro API Integration Setup Guide

## Overview

This guide explains how to integrate Google Gemini Pro API into TruthGuard for automatic AI response generation. This will allow users to select a company, enter queries, and get real AI-generated responses that TruthGuard then validates.

---

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [API Key Setup](#api-key-setup)
3. [Installation](#installation)
4. [Configuration](#configuration)
5. [Workflow Architecture](#workflow-architecture)
6. [Implementation Plan](#implementation-plan)
7. [Testing](#testing)
8. [Security Notes](#security-notes)

---

## Prerequisites

- ✅ Google Gemini Pro subscription (you have this!)
- ✅ Gemini Pro API key (provided)
- ✅ Python 3.8+ installed
- ✅ Backend server running

---

## API Key Setup

### Step 1: Store API Key Securely

**⚠️ IMPORTANT: Never commit API keys to git!**

1. Open `backend/.env` file (create if it doesn't exist)
2. Add your Gemini API key:

```env
# Google Gemini Pro API

```

3. **Verify `.env` is in `.gitignore`**:
   ```bash
   # Check if .env is ignored
   cat .gitignore | grep .env
   ```

4. If not, add to `.gitignore`:
   ```
   # Environment variables
   .env
   backend/.env
   ```

### Step 2: Use Setup Script (Recommended)

Run the setup script:

```bash
cd backend
python scripts/setup_gemini.py
```

This will:
- Create/update `.env` file
- Add your API key securely
- Test the API key immediately

**Or manually:**

1. Open `backend/.env` file
2. Add: `GEMINI_API_KEY=AIzaSyBqcOpysqlk_wcyUZJJbBS4IY5syq8kshI`
3. Save file

### Step 3: Verify API Key

Test your API key works:

```bash
cd backend
python scripts/setup_gemini.py test
```

Or use the test script:

```python
# Test script: backend/scripts/test_gemini.py
import google.generativeai as genai
import os
from dotenv import load_dotenv

load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")
if not api_key:
    print("❌ GEMINI_API_KEY not found in .env")
    exit(1)

genai.configure(api_key=api_key)
model = genai.GenerativeModel('gemini-pro')

response = model.generate_content("Say hello in one sentence")
print(f"✅ Gemini API working! Response: {response.text}")
```

---

## Installation

### Step 1: Install Google Generative AI SDK

```bash
cd backend
pip install google-generativeai
```

Or add to `requirements.txt`:

```txt
google-generativeai>=0.3.0
```

Then:

```bash
pip install -r requirements.txt
```

### Step 2: Verify Installation

```python
import google.generativeai as genai
print("✅ Google Generative AI SDK installed")
```

---

## Configuration

### Update `backend/app/config.py`

Add Gemini API key to settings:

```python
class Settings:
    # ... existing settings ...
    
    # Google Gemini Pro API
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    
    def validate(self) -> bool:
        # ... existing validation ...
        
        # Optional: Validate Gemini key (only if using AI generation)
        # if not self.GEMINI_API_KEY:
        #     print("⚠️  Warning: GEMINI_API_KEY not set (AI generation will be disabled)")
        
        return True
```

---

## Workflow Architecture

### High-Level Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    User Interface                            │
│  - Select Company (AmEx, United, KPMG)                      │
│  - Enter Query                                              │
│  - Choose Mode (Demo or Live AI)                            │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│              Company Context Loader                         │
│  - Load company policies                                    │
│  - Load compliance rules                                    │
│  - Load product information                                │
│  - Load industry regulations                                │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│            Gemini Pro API Service                           │
│  - Build company-specific prompt                            │
│  - Include context (policies, rules)                        │
│  - Generate AI response                                     │
│  - Return response                                          │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│          TruthGuard Validation Pipeline                     │
│  - Extract claims                                           │
│  - Verify facts (Wikipedia, DuckDuckGo)                    │
│  - Check compliance                                         │
│  - Check policies                                           │
│  - Check citations                                          │
│  - Calculate confidence                                     │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│              Results Display                                │
│  - Status (Approved/Flagged/Blocked)                        │
│  - Violations                                               │
│  - Verification results                                     │
│  - Corrected response (if needed)                           │
└─────────────────────────────────────────────────────────────┘
```

### Detailed Component Flow

#### 1. User Input
```
User Action:
  - Selects: "American Express"
  - Enters Query: "Should I invest all my savings in cryptocurrency?"
  - Clicks: "Generate & Validate"
```

#### 2. Company Context Loading
```
System Action:
  - Loads AmEx policies from database
  - Loads financial services compliance rules
  - Loads SEC regulations
  - Prepares context for AI prompt
```

#### 3. Gemini Pro Generation
```
System Action:
  - Builds prompt with:
    * Company context
    * User query
    * Role instructions
    * Compliance requirements
  - Calls Gemini Pro API
  - Receives AI response
```

#### 4. TruthGuard Validation
```
System Action:
  - Runs detection pipeline
  - Checks for violations
  - Verifies facts
  - Generates confidence score
  - Creates corrections (if needed)
```

#### 5. Results Display
```
System Action:
  - Shows validation results
  - Displays violations
  - Shows source verification
  - Provides explanations
```

---

## Implementation Plan

### Phase 1: Core Gemini Service (Day 1)

**File: `backend/app/services/ai_generation.py`**

```python
"""
AI Response Generation Service
Uses Google Gemini Pro to generate company-specific AI responses
"""

import google.generativeai as genai
from app.config import settings
from typing import Dict, Any, Optional
import logging

logger = logging.getLogger(__name__)

class AIGenerationService:
    def __init__(self):
        if settings.GEMINI_API_KEY:
            genai.configure(api_key=settings.GEMINI_API_KEY)
            self.model = genai.GenerativeModel('gemini-pro')
            self.enabled = True
        else:
            self.enabled = False
            logger.warning("Gemini API key not configured - AI generation disabled")
    
    async def generate_company_response(
        self,
        company_name: str,
        company_context: Dict[str, Any],
        user_query: str,
        industry: str = None
    ) -> Dict[str, Any]:
        """
        Generate AI response for a company-specific query
        
        Args:
            company_name: Name of the company
            company_context: Company policies, rules, products
            user_query: User's question
            industry: Industry type (financial_services, airline, etc.)
        
        Returns:
            Dict with 'response', 'model', 'tokens_used', etc.
        """
        if not self.enabled:
            return {
                'error': 'AI generation not enabled - API key missing',
                'response': None
            }
        
        # Build prompt
        prompt = self._build_company_prompt(
            company_name,
            company_context,
            user_query,
            industry
        )
        
        try:
            # Generate response
            response = self.model.generate_content(
                prompt,
                generation_config={
                    "temperature": 0.7,  # Balanced creativity
                    "top_p": 0.8,
                    "max_output_tokens": 500,
                }
            )
            
            return {
                'response': response.text,
                'model': 'gemini-pro',
                'success': True
            }
            
        except Exception as e:
            logger.error(f"Error generating AI response: {str(e)}")
            return {
                'error': str(e),
                'response': None,
                'success': False
            }
    
    def _build_company_prompt(
        self,
        company_name: str,
        context: Dict[str, Any],
        query: str,
        industry: str
    ) -> str:
        """Build company-specific prompt for Gemini"""
        
        policies_text = "\n".join([
            f"- {p.get('name', 'Policy')}: {p.get('content', '')[:200]}"
            for p in context.get('policies', [])[:5]
        ])
        
        rules_text = "\n".join([
            f"- {r.get('name', 'Rule')}: {r.get('description', '')}"
            for r in context.get('compliance_rules', [])[:5]
        ])
        
        prompt = f"""You are a customer service agent for {company_name}.

COMPANY INFORMATION:
Industry: {industry or 'General'}
Products/Services: {', '.join(context.get('products', []))}

COMPANY POLICIES:
{policies_text if policies_text else 'No specific policies provided.'}

COMPLIANCE RULES:
{rules_text if rules_text else 'No specific rules provided.'}

USER QUERY:
{query}

INSTRUCTIONS:
1. Answer the user's query accurately and helpfully
2. Follow company policies strictly
3. Include required compliance disclaimers when needed
4. Be professional and courteous
5. If you're unsure about something, say so rather than guessing
6. Do NOT make promises that violate company policies

Provide your response:"""
        
        return prompt
```

### Phase 2: Company Context Service (Day 1-2)

**File: `backend/app/services/company_context.py`**

```python
"""
Company Context Service
Loads company-specific data for AI generation
"""

from app.utils.supabase_client import get_supabase_client
from typing import Dict, Any, Optional
import logging

logger = logging.getLogger(__name__)

class CompanyContextService:
    @staticmethod
    async def load_company_context(company_id: str) -> Dict[str, Any]:
        """
        Load all context for a company
        
        Returns:
            Dict with policies, compliance_rules, products, industry
        """
        try:
            supabase = get_supabase_client()
            
            # Load company info
            company_result = supabase.table('organizations').select('*').eq('id', company_id).execute()
            company = company_result.data[0] if company_result.data else {}
            
            # Load policies
            policies_result = supabase.table('company_policies').select('*').eq('organization_id', company_id).execute()
            policies = policies_result.data if policies_result.data else []
            
            # Load compliance rules
            rules_result = supabase.table('compliance_rules').select('*').eq('organization_id', company_id).execute()
            rules = rules_result.data if rules_result.data else []
            
            return {
                'company_name': company.get('name', 'Unknown Company'),
                'industry': company.get('industry', 'general'),
                'policies': policies,
                'compliance_rules': rules,
                'products': company.get('products', []),
            }
            
        except Exception as e:
            logger.error(f"Error loading company context: {str(e)}")
            return {
                'company_name': 'Unknown',
                'industry': 'general',
                'policies': [],
                'compliance_rules': [],
                'products': [],
            }
```

### Phase 3: API Endpoint (Day 2)

**File: `backend/app/api/v1/ai_test.py`** (new file)

```python
"""
AI Testing API Endpoint
Generate AI responses and validate them
"""

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, Field
from app.services.ai_generation import AIGenerationService
from app.services.company_context import CompanyContextService
from app.services.detection import detect_hallucinations
from app.utils.auth import validate_api_key
from typing import Optional
import logging

logger = logging.getLogger(__name__)

router = APIRouter()

class AITestRequest(BaseModel):
    company_id: str = Field(..., description="Company/Organization ID")
    user_query: str = Field(..., description="User's question/query")
    ai_model: str = Field("gemini-pro", description="AI model to use")

class AITestResponse(BaseModel):
    ai_response: str
    validation_result: dict
    company_context: dict

@router.post("/ai-test/generate", response_model=AITestResponse)
async def generate_and_validate(
    request: AITestRequest,
    auth_data: dict = Depends(validate_api_key)
):
    """
    Generate AI response for a company and validate it
    
    1. Load company context
    2. Generate AI response using Gemini Pro
    3. Validate response with TruthGuard
    4. Return results
    """
    try:
        # Step 1: Load company context
        context_service = CompanyContextService()
        company_context = await context_service.load_company_context(request.company_id)
        
        # Step 2: Generate AI response
        ai_service = AIGenerationService()
        generation_result = await ai_service.generate_company_response(
            company_name=company_context['company_name'],
            company_context=company_context,
            user_query=request.user_query,
            industry=company_context.get('industry')
        )
        
        if not generation_result.get('success'):
            raise HTTPException(
                status_code=500,
                detail=f"AI generation failed: {generation_result.get('error')}"
            )
        
        ai_response = generation_result['response']
        
        # Step 3: Validate with TruthGuard
        validation_result = await detect_hallucinations(
            query=request.user_query,
            ai_response=ai_response,
            organization_id=request.company_id,
            ai_model=request.ai_model
        )
        
        return AITestResponse(
            ai_response=ai_response,
            validation_result=validation_result,
            company_context={
                'name': company_context['company_name'],
                'industry': company_context['industry']
            }
        )
        
    except Exception as e:
        logger.error(f"Error in AI test: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Error: {str(e)}"
        )
```

### Phase 4: Frontend Integration (Day 2-3)

**File: `frontend/app/ai-test/page.tsx`** (new page)

```typescript
// AI Testing Page
// - Company selector
// - Query input
// - Generate & Validate button
// - Results display
```

---

## Testing

### Test 1: API Key Verification

```bash
cd backend
python scripts/test_gemini.py
```

Expected output:
```
✅ Gemini API working! Response: Hello! How can I help you today?
```

### Test 2: Company Response Generation

```python
# Test script
from app.services.ai_generation import AIGenerationService
from app.services.company_context import CompanyContextService

# Load context
context = await CompanyContextService.load_company_context("amex-company-id")

# Generate response
ai_service = AIGenerationService()
result = await ai_service.generate_company_response(
    company_name="American Express",
    company_context=context,
    user_query="Should I invest all my savings in crypto?",
    industry="financial_services"
)

print(result['response'])
```

### Test 3: Full Pipeline

```bash
# Test via API
curl -X POST http://localhost:8000/api/v1/ai-test/generate \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your_key" \
  -d '{
    "company_id": "amex-company-id",
    "user_query": "Should I invest all my savings in crypto?",
    "ai_model": "gemini-pro"
  }'
```

---

## Security Notes

### ⚠️ Important Security Practices

1. **Never commit API keys to git**
   - Use `.env` file
   - Add `.env` to `.gitignore`
   - Use environment variables in production

2. **Rotate keys if exposed**
   - If key is accidentally committed, rotate it immediately
   - Revoke old key in Google Cloud Console

3. **Limit API usage**
   - Monitor API calls
   - Set rate limits
   - Use quotas if available

4. **Validate inputs**
   - Sanitize user queries
   - Limit prompt length
   - Validate company IDs

5. **Error handling**
   - Don't expose API keys in error messages
   - Log errors securely
   - Handle API failures gracefully

---

## Environment Variables

### Required

```env
# Google Gemini Pro API
GEMINI_API_KEY=AIzaSyBqcOpysqlk_wcyUZJJbBS4IY5syq8kshI
```

### Optional

```env
# Gemini Model Configuration
GEMINI_MODEL=gemini-pro  # or gemini-1.5-pro
GEMINI_TEMPERATURE=0.7
GEMINI_MAX_TOKENS=500
```

---

## Next Steps

1. ✅ **Set up API key** (this guide)
2. ⏭️ **Install SDK** (`pip install google-generativeai`)
3. ⏭️ **Create AI generation service** (`ai_generation.py`)
4. ⏭️ **Create company context service** (`company_context.py`)
5. ⏭️ **Create API endpoint** (`ai_test.py`)
6. ⏭️ **Create frontend page** (`ai-test/page.tsx`)
7. ⏭️ **Test end-to-end**

---

## Troubleshooting

### Issue: "API key not found"
- Check `.env` file exists in `backend/` directory
- Verify key is set: `GEMINI_API_KEY=your_key`
- Restart backend server after adding key

### Issue: "API quota exceeded"
- Check Google Cloud Console for quota limits
- Wait for quota reset (usually daily)
- Consider upgrading plan if needed

### Issue: "Model not found"
- Verify model name: `gemini-pro` or `gemini-1.5-pro`
- Check if model is available in your region
- Try different model name

---

## Resources

- [Google Gemini API Docs](https://ai.google.dev/docs)
- [Python SDK Documentation](https://github.com/google/generative-ai-python)
- [API Key Management](https://makersuite.google.com/app/apikey)

---

**Status**: ✅ **Setup Guide Complete**

Ready to implement! Follow the phases in order for best results.

