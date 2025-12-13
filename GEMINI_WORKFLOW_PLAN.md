# 🔄 Gemini Pro Integration Workflow Plan

## Complete Workflow Architecture

### User Journey

```
┌─────────────────────────────────────────────────────────────┐
│                    STEP 1: User Selection                   │
│                                                              │
│  User opens "AI Testing" page                                │
│  Selects company: [Dropdown]                                │
│    - American Express                                        │
│    - United Airlines                                         │
│    - KPMG                                                    │
│    - Custom Company                                          │
│                                                              │
│  Selects mode: [Radio buttons]                              │
│    ○ Demo Mode (pre-written scenarios)                       │
│    ● Live AI Mode (Gemini Pro)                              │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                    STEP 2: Query Input                      │
│                                                              │
│  User enters query:                                          │
│  [Text area]                                                 │
│  "Should I invest all my savings in cryptocurrency?"        │
│                                                              │
│  Or selects from quick examples:                            │
│  [Button] Investment advice                                  │
│  [Button] Refund policy                                      │
│  [Button] Product information                                │
│                                                              │
│  [Generate & Validate] button                                │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│              STEP 3: Backend Processing                     │
│                                                              │
│  3.1 Load Company Context                                    │
│      ├─ Company name, industry                               │
│      ├─ Policies (from database)                            │
│      ├─ Compliance rules                                     │
│      └─ Products/services                                    │
│                                                              │
│  3.2 Build Gemini Prompt                                     │
│      ├─ Company context                                      │
│      ├─ User query                                           │
│      ├─ Role instructions                                    │
│      └─ Compliance requirements                              │
│                                                              │
│  3.3 Call Gemini Pro API                                     │
│      ├─ Send prompt                                          │
│      ├─ Receive response                                     │
│      └─ Handle errors                                        │
│                                                              │
│  3.4 TruthGuard Validation                                   │
│      ├─ Extract claims                                       │
│      ├─ Verify facts                                         │
│      ├─ Check compliance                                     │
│      ├─ Check policies                                       │
│      └─ Calculate confidence                                 │
│                                                              │
│  3.5 Generate Corrections (if needed)                       │
│      └─ AI-powered corrections                               │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│              STEP 4: Results Display                         │
│                                                              │
│  ┌────────────────────────────────────────┐                │
│  │ AI Response                              │                │
│  │ "I cannot provide investment advice..."  │                │
│  └────────────────────────────────────────┘                │
│                                                              │
│  ┌────────────────────────────────────────┐                │
│  │ Validation Status                       │                │
│  │ ✅ APPROVED | Confidence: 85%           │                │
│  └────────────────────────────────────────┘                │
│                                                              │
│  ┌────────────────────────────────────────┐                │
│  │ Violations (if any)                     │                │
│  │ - None                                  │                │
│  └────────────────────────────────────────┘                │
│                                                              │
│  ┌────────────────────────────────────────┐                │
│  │ Fact Verification                       │                │
│  │ ✅ Verified: 2 claims                   │                │
│  │ ⚠️  Unverified: 0 claims                │                │
│  └────────────────────────────────────────┘                │
│                                                              │
│  [View Full Details] button                                  │
└─────────────────────────────────────────────────────────────┘
```

---

## Detailed Component Flow

### Component 1: Company Context Loader

**Input:**
- `company_id`: "amex-company-id"

**Process:**
```python
1. Query database for company info
2. Load company policies
3. Load compliance rules
4. Load industry regulations
5. Format context data
```

**Output:**
```json
{
  "company_name": "American Express",
  "industry": "financial_services",
  "policies": [
    {
      "id": "refund_policy",
      "name": "Refund Policy",
      "content": "Refunds take 7-10 business days..."
    }
  ],
  "compliance_rules": [
    {
      "id": "sec_disclosure",
      "name": "SEC Disclosure",
      "description": "Must include risk disclaimers..."
    }
  ],
  "products": ["Credit Cards", "Travel Services"]
}
```

---

### Component 2: Gemini Prompt Builder

**Input:**
- Company context (from Component 1)
- User query: "Should I invest all my savings in crypto?"

**Process:**
```python
1. Format company policies as text
2. Format compliance rules as text
3. Build role instructions
4. Combine into prompt
```

**Output (Prompt):**
```
You are a customer service agent for American Express.

COMPANY INFORMATION:
Industry: financial_services
Products/Services: Credit Cards, Travel Services

COMPANY POLICIES:
- Refund Policy: Refunds take 7-10 business days...
- Investment Policy: Cannot provide investment advice...

COMPLIANCE RULES:
- SEC Disclosure: Must include risk disclaimers...
- CFPB Rules: Cannot make guarantees about returns...

USER QUERY:
Should I invest all my savings in cryptocurrency?

INSTRUCTIONS:
1. Answer accurately and helpfully
2. Follow company policies strictly
3. Include required compliance disclaimers
4. Be professional and courteous
5. If unsure, say so rather than guessing
6. Do NOT make promises that violate company policies

Provide your response:
```

---

### Component 3: Gemini API Call

**Input:**
- Prompt (from Component 2)

**Process:**
```python
1. Configure Gemini API with key
2. Create model instance
3. Generate content with prompt
4. Handle errors/timeouts
5. Extract response text
```

**Output:**
```json
{
  "response": "I cannot provide investment advice. Cryptocurrency investments carry significant risk. Please consult a licensed financial advisor for investment guidance. As a financial services company, we recommend diversifying investments and never investing more than you can afford to lose.",
  "model": "gemini-pro",
  "tokens_used": 45,
  "success": true
}
```

---

### Component 4: TruthGuard Validation

**Input:**
- AI response (from Component 3)
- Original query
- Company ID

**Process:**
```python
1. Extract claims from response
2. Verify facts (Wikipedia, DuckDuckGo)
3. Check compliance rules
4. Check company policies
5. Check citations
6. Calculate confidence score
7. Determine status (approved/flagged/blocked)
```

**Output:**
```json
{
  "status": "approved",
  "confidence_score": 0.85,
  "violations": [],
  "verification_results": [
    {
      "claim_text": "Cryptocurrency investments carry significant risk",
      "verification_status": "verified",
      "confidence": 0.8,
      "source": "wikipedia"
    }
  ],
  "explanation": "Response approved - no violations detected"
}
```

---

### Component 5: Results Aggregation

**Input:**
- AI response
- Validation results
- Company context

**Process:**
```python
1. Combine all data
2. Format for frontend
3. Add metadata (timestamp, model, etc.)
```

**Output:**
```json
{
  "ai_response": "I cannot provide investment advice...",
  "validation": {
    "status": "approved",
    "confidence": 0.85,
    "violations": []
  },
  "company": {
    "name": "American Express",
    "industry": "financial_services"
  },
  "metadata": {
    "model": "gemini-pro",
    "timestamp": "2025-12-13T20:30:00Z",
    "query": "Should I invest all my savings in crypto?"
  }
}
```

---

## Data Flow Diagram

```
User Input
    │
    ├─> Company ID
    ├─> User Query
    └─> Mode (Live AI)
    │
    ▼
┌─────────────────────┐
│  Company Context    │
│  Service            │
└──────────┬──────────┘
           │
           ▼
    Company Data
    │
    ├─> Policies
    ├─> Rules
    └─> Products
    │
    ▼
┌─────────────────────┐
│  Prompt Builder     │
└──────────┬──────────┘
           │
           ▼
    Gemini Prompt
    │
    ▼
┌─────────────────────┐
│  Gemini Pro API     │
└──────────┬──────────┘
           │
           ▼
    AI Response
    │
    ▼
┌─────────────────────┐
│  TruthGuard         │
│  Validation         │
└──────────┬──────────┘
           │
           ▼
    Validation Results
    │
    ▼
┌─────────────────────┐
│  Results Display    │
└─────────────────────┘
```

---

## API Endpoint Flow

### Request
```http
POST /api/v1/ai-test/generate
Content-Type: application/json
X-API-Key: your_api_key

{
  "company_id": "amex-company-id",
  "user_query": "Should I invest all my savings in crypto?",
  "ai_model": "gemini-pro"
}
```

### Response
```json
{
  "ai_response": "I cannot provide investment advice...",
  "validation_result": {
    "status": "approved",
    "confidence_score": 0.85,
    "violations": [],
    "verification_results": [...],
    "explanation": "..."
  },
  "company_context": {
    "name": "American Express",
    "industry": "financial_services"
  },
  "metadata": {
    "model": "gemini-pro",
    "timestamp": "2025-12-13T20:30:00Z"
  }
}
```

---

## Error Handling Flow

```
┌─────────────────────────────────────┐
│  Error: API Key Missing             │
│  → Return error, disable AI mode    │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│  Error: Company Not Found           │
│  → Return 404, suggest valid IDs    │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│  Error: Gemini API Failed           │
│  → Log error, return fallback       │
│  → Show user-friendly message       │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│  Error: Validation Failed           │
│  → Still return AI response          │
│  → Show validation error separately  │
└─────────────────────────────────────┘
```

---

## Frontend Workflow

### Page Structure

```
┌─────────────────────────────────────────┐
│  AI Testing Dashboard                   │
├─────────────────────────────────────────┤
│                                         │
│  [1] Company Selection                  │
│      [Dropdown: Select Company]         │
│                                         │
│  [2] Mode Selection                     │
│      ( ) Demo Mode                      │
│      (●) Live AI Mode                   │
│                                         │
│  [3] Query Input                        │
│      [Text Area]                        │
│      [Quick Examples]                   │
│                                         │
│  [4] Generate Button                    │
│      [Generate & Validate]              │
│                                         │
│  [5] Loading State                      │
│      [Spinner] "Generating response..." │
│                                         │
│  [6] Results Display                    │
│      - AI Response                      │
│      - Validation Status                │
│      - Violations                       │
│      - Verification Details             │
│                                         │
└─────────────────────────────────────────┘
```

### State Management

```typescript
interface AITestState {
  companyId: string | null
  mode: 'demo' | 'live'
  query: string
  loading: boolean
  results: {
    aiResponse: string
    validation: ValidationResult
    company: CompanyInfo
  } | null
  error: string | null
}
```

### User Interactions

1. **Select Company**
   - Dropdown updates `companyId`
   - Loads company context (optional preview)

2. **Enter Query**
   - Text area updates `query`
   - Quick examples populate query

3. **Click Generate**
   - Sets `loading = true`
   - Calls API: `/api/v1/ai-test/generate`
   - Waits for response

4. **Display Results**
   - Sets `loading = false`
   - Updates `results`
   - Shows validation status
   - Highlights violations

---

## Database Schema Updates

### New Tables (if needed)

```sql
-- Company profiles (if not exists)
CREATE TABLE IF NOT EXISTS company_profiles (
    id UUID PRIMARY KEY,
    organization_id UUID REFERENCES organizations(id),
    name TEXT NOT NULL,
    industry TEXT,
    products TEXT[],
    created_at TIMESTAMP DEFAULT NOW()
);

-- Test scenarios (for demo mode)
CREATE TABLE IF NOT EXISTS test_scenarios (
    id UUID PRIMARY KEY,
    company_id UUID REFERENCES company_profiles(id),
    query TEXT NOT NULL,
    demo_ai_response TEXT,
    expected_violations TEXT[],
    created_at TIMESTAMP DEFAULT NOW()
);
```

---

## Implementation Phases

### Phase 1: Backend Core (Day 1)
- [ ] Install `google-generativeai` SDK
- [ ] Create `ai_generation.py` service
- [ ] Create `company_context.py` service
- [ ] Add API key to config
- [ ] Test Gemini API connection

### Phase 2: API Endpoint (Day 1-2)
- [ ] Create `ai_test.py` router
- [ ] Implement `/ai-test/generate` endpoint
- [ ] Add error handling
- [ ] Test endpoint with Postman/curl

### Phase 3: Frontend (Day 2-3)
- [ ] Create `ai-test/page.tsx`
- [ ] Add company selector
- [ ] Add query input
- [ ] Add results display
- [ ] Add loading states

### Phase 4: Integration (Day 3)
- [ ] Connect frontend to backend
- [ ] Test full flow
- [ ] Add error handling UI
- [ ] Polish UI/UX

### Phase 5: Testing (Day 3-4)
- [ ] Test with different companies
- [ ] Test with various queries
- [ ] Test error scenarios
- [ ] Performance testing

---

## Success Criteria

✅ **API Key Setup**
- Key stored securely in `.env`
- Key validated and working
- No keys in git

✅ **Gemini Integration**
- Can generate responses
- Responses are company-specific
- Error handling works

✅ **Full Pipeline**
- User can select company
- User can enter query
- System generates AI response
- System validates response
- Results displayed correctly

✅ **Error Handling**
- API failures handled gracefully
- User-friendly error messages
- Fallback options available

---

## Next Steps

1. **Set up API key** (follow `GEMINI_PRO_SETUP.md`)
2. **Install SDK**: `pip install google-generativeai`
3. **Create services** (Phase 1)
4. **Create API endpoint** (Phase 2)
5. **Create frontend** (Phase 3)
6. **Test everything** (Phase 5)

---

**Status**: 📋 **Workflow Plan Complete**

Ready to implement following this workflow!

