# TruthGuard - AI Hallucination Detection & Compliance Platform
## Project Planning Document

---

## 1. Tech Stack Selection

### Backend
- **Python** (FastAPI) - Main API server for AI processing and business logic
- **Node.js** - Real-time services (WebSockets, webhooks, background jobs)
- **Supabase** - PostgreSQL database (audit logs, policies, user management, real-time subscriptions)
- **MongoDB** - Document store for AI interactions, conversation history, unstructured data

### AI/ML Services
- **Python** (LangChain) - LLM orchestration and prompt engineering
- **OpenAI API / Anthropic Claude** - Meta-analysis of AI responses
- **spaCy / Hugging Face** - NLP for claim extraction and text analysis
- **Embeddings** (OpenAI/Cohere) - Semantic similarity for consistency checking

### Frontend
- **Next.js** (React) - Main dashboard and admin interface
- **Tailwind CSS** - Styling (premium white/black/red/blue theme)
- **WebSockets** - Real-time monitoring updates
- **Chart.js / Recharts** - Data visualizations

### Infrastructure
- **Supabase Auth** - User authentication and authorization
- **Supabase Realtime** - Real-time database subscriptions
- **Redis** (via Supabase or separate) - Caching and rate limiting
- **REST API** - Integration endpoints for external AI systems
- **Webhooks** - Alert system for violations

---

## 2. System Architecture

### High-Level Architecture

```
┌─────────────────┐
│   AI System     │ (External - Customer's AI)
│  (Chatbot/LLM)  │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────────────┐
│         TruthGuard Platform             │
│                                         │
│  ┌──────────────┐    ┌──────────────┐  │
│  │  Next.js     │    │  FastAPI     │  │
│  │  Frontend    │◄──►│  Backend     │  │
│  │  Dashboard   │    │  (Python)    │  │
│  └──────────────┘    └──────┬───────┘  │
│         │                   │          │
│         │                   ▼          │
│         │          ┌─────────────────┐ │
│         │          │  Node.js        │ │
│         │          │  Real-time      │ │
│         │          │  Services       │ │
│         │          └─────────────────┘ │
│         │                   │          │
│         └───────────────────┼──────────┘
│                             │
│         ┌───────────────────┼───────────────────┐
│         │                   │                   │
│         ▼                   ▼                   ▼
│  ┌──────────────┐   ┌──────────────┐   ┌──────────────┐
│  │  Supabase    │   │  MongoDB     │   │  External    │
│  │  PostgreSQL  │   │  (History)   │   │  APIs        │
│  │  (Audit)     │   │              │   │  (Fact Check)│
│  └──────────────┘   └──────────────┘   └──────────────┘
└─────────────────────────────────────────┘
```

### Request Flow

1. **User Query** → External AI System
2. **AI Response** → TruthGuard API (FastAPI)
3. **TruthGuard Processing**:
   - Extract factual claims
   - Verify against knowledge base
   - Check compliance rules
   - Validate citations
   - Generate confidence score
4. **Decision**:
   - ✅ Approved → Return to user
   - 🚨 Flagged → Block/rewrite → Return corrected response
5. **Audit Log** → Supabase (PostgreSQL)
6. **Real-time Update** → Next.js Dashboard (via WebSocket)

---

## 3. Core Features Breakdown

### Feature 1: Real-Time Hallucination Detection
**Components:**
- Claim extraction module (NLP)
- Fact verification service
- Knowledge base integration
- Confidence scoring algorithm

**Data Flow:**
```
AI Response → Extract Claims → Verify Facts → Score Confidence → Decision
```

**Storage:**
- MongoDB: Raw AI responses, extracted claims
- Supabase: Verification results, confidence scores

---

### Feature 2: Source Citation Verification
**Components:**
- URL extraction from responses
- Link validation service
- Content matching algorithm
- Citation database

**Data Flow:**
```
AI Response → Extract URLs → Validate Links → Match Content → Flag Fakes
```

**Storage:**
- Supabase: Citation database, validation results
- MongoDB: Response metadata with citations

---

### Feature 3: Compliance Checking
**Components:**
- Rule engine (regulatory rules)
- Policy database
- Violation detection
- Auto-correction suggestions

**Data Flow:**
```
AI Response → Check Rules → Match Policies → Detect Violations → Suggest Fixes
```

**Storage:**
- Supabase: Compliance rules, policies, violation logs
- MongoDB: Policy documents, rule definitions

---

### Feature 4: Policy Alignment
**Components:**
- Company policy database
- Policy matching service
- Deviation detection
- Alternative suggestions

**Data Flow:**
```
AI Response → Load Policies → Compare → Flag Deviations → Suggest Alternatives
```

**Storage:**
- Supabase: Company policies, alignment scores
- MongoDB: Policy documents (unstructured)

---

### Feature 5: Audit Trail & Explainability
**Components:**
- Logging service
- Explanation generator
- Query interface for regulators
- Export functionality

**Data Flow:**
```
Every Interaction → Log → Generate Explanation → Store → Query Interface
```

**Storage:**
- Supabase: Audit logs (structured, queryable)
- MongoDB: Full conversation history

---

### Feature 6: Real-Time Dashboard
**Components:**
- WebSocket connection
- Metrics calculation
- Visualization components
- Alert system

**Data Flow:**
```
Events → WebSocket → Dashboard → Update Charts → Show Alerts
```

**Storage:**
- Supabase: Real-time subscriptions
- MongoDB: Aggregated metrics

---

## 4. Data Models

### Supabase (PostgreSQL) Schema

#### Users & Organizations
```sql
organizations (
  id UUID PRIMARY KEY,
  name TEXT,
  industry TEXT, -- finance, airline, consulting, etc.
  created_at TIMESTAMP
)

users (
  id UUID PRIMARY KEY,
  email TEXT,
  organization_id UUID REFERENCES organizations(id),
  role TEXT -- admin, compliance_officer, viewer
)

api_keys (
  id UUID PRIMARY KEY,
  organization_id UUID REFERENCES organizations(id),
  key_hash TEXT,
  created_at TIMESTAMP,
  expires_at TIMESTAMP
)
```

#### Compliance & Policies
```sql
compliance_rules (
  id UUID PRIMARY KEY,
  organization_id UUID REFERENCES organizations(id),
  rule_type TEXT, -- regulatory, policy, custom
  rule_name TEXT,
  rule_definition JSONB, -- flexible rule structure
  industry TEXT,
  created_at TIMESTAMP
)

company_policies (
  id UUID PRIMARY KEY,
  organization_id UUID REFERENCES organizations(id),
  policy_name TEXT,
  policy_content TEXT,
  category TEXT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)
```

#### Audit Logs
```sql
ai_interactions (
  id UUID PRIMARY KEY,
  organization_id UUID REFERENCES organizations(id),
  user_query TEXT,
  ai_response TEXT,
  validated_response TEXT,
  status TEXT, -- approved, flagged, blocked, corrected
  confidence_score FLOAT,
  timestamp TIMESTAMP,
  ai_model TEXT,
  session_id TEXT
)

violations (
  id UUID PRIMARY KEY,
  interaction_id UUID REFERENCES ai_interactions(id),
  violation_type TEXT, -- hallucination, citation, compliance, policy
  severity TEXT, -- low, medium, high, critical
  description TEXT,
  detected_at TIMESTAMP
)

verification_results (
  id UUID PRIMARY KEY,
  interaction_id UUID REFERENCES ai_interactions(id),
  claim_text TEXT,
  verification_status TEXT, -- verified, unverified, false
  source TEXT,
  confidence FLOAT
)
```

#### Citations
```sql
citations (
  id UUID PRIMARY KEY,
  interaction_id UUID REFERENCES ai_interactions(id),
  url TEXT,
  is_valid BOOLEAN,
  content_match BOOLEAN,
  verified_at TIMESTAMP
)
```

### MongoDB Collections

#### Conversation History
```javascript
conversations: {
  _id: ObjectId,
  organization_id: String,
  session_id: String,
  messages: [{
    role: String, // user, ai, system
    content: String,
    timestamp: Date,
    metadata: Object
  }],
  created_at: Date
}
```

#### Extracted Claims
```javascript
claims: {
  _id: ObjectId,
  interaction_id: String,
  claim_text: String,
  extracted_at: Date,
  verification_status: String,
  sources: [String]
}
```

#### Metrics & Aggregations
```javascript
metrics: {
  _id: ObjectId,
  organization_id: String,
  date: Date,
  total_interactions: Number,
  hallucination_rate: Number,
  compliance_violations: Number,
  avg_confidence_score: Number
}
```

---

## 5. API Design

### FastAPI Endpoints

#### Core Detection API
```
POST /api/v1/validate
  Request: {
    query: string,
    ai_response: string,
    ai_model: string,
    organization_id: string,
    session_id?: string
  }
  Response: {
    status: "approved" | "flagged" | "blocked",
    validated_response: string,
    confidence_score: float,
    violations: [{
      type: string,
      severity: string,
      description: string
    }],
    verification_results: [...],
    citations: [...]
  }
```

#### Compliance API
```
GET /api/v1/compliance/rules
POST /api/v1/compliance/rules
PUT /api/v1/compliance/rules/{id}
DELETE /api/v1/compliance/rules/{id}

GET /api/v1/policies
POST /api/v1/policies
PUT /api/v1/policies/{id}
```

#### Audit API
```
GET /api/v1/audit/interactions
  Query params: organization_id, start_date, end_date, status, ai_model
GET /api/v1/audit/interactions/{id}
GET /api/v1/audit/violations
GET /api/v1/audit/export
```

#### Analytics API
```
GET /api/v1/analytics/dashboard
  Response: {
    hallucination_rate: float,
    total_interactions: int,
    violations_by_type: {...},
    trends: [...],
    top_violations: [...]
  }
```

### Node.js WebSocket Service

```
WebSocket: ws://api.truthguard.com/realtime
  Events:
    - interaction_flagged
    - violation_detected
    - metrics_updated
    - alert_triggered
```

### Webhook Endpoints

```
POST /api/v1/webhooks/violations
  Triggered when critical violation detected
POST /api/v1/webhooks/daily-report
  Daily summary webhook
```

---

## 6. Frontend Structure (Next.js)

### Pages
```
/app
  /dashboard          - Main compliance dashboard
  /interactions       - AI interaction logs
  /violations         - Violation management
  /policies           - Policy management
  /compliance-rules   - Compliance rule configuration
  /analytics          - Analytics and reports
  /settings           - Organization settings
  /api-keys           - API key management
```

### Components
```
/components
  /dashboard
    - MetricsCards.tsx
    - HallucinationChart.tsx
    - ViolationTrends.tsx
    - RealTimeFeed.tsx
  /interactions
    - InteractionList.tsx
    - InteractionDetail.tsx
    - ResponseComparison.tsx
  /violations
    - ViolationList.tsx
    - ViolationDetail.tsx
    - SeverityBadge.tsx
  /policies
    - PolicyEditor.tsx
    - PolicyList.tsx
  /common
    - Layout.tsx
    - Sidebar.tsx
    - Header.tsx
    - DataTable.tsx
```

### Features
- Real-time updates via WebSocket
- Interactive charts (hallucination rates, trends)
- Search and filter interactions
- Export functionality (CSV, PDF)
- Role-based access control

---

## 7. Implementation Phases

### Phase 1: Foundation (Weeks 1-2)
**Goal:** Set up infrastructure and basic API

**Tasks:**
- [ ] Initialize Next.js project
- [ ] Set up Supabase project and database schema
- [ ] Set up MongoDB connection
- [ ] Create FastAPI backend structure
- [ ] Set up Node.js WebSocket service
- [ ] Basic authentication (Supabase Auth)
- [ ] API key generation system

**Deliverables:**
- Working database connections
- Basic API structure
- Authentication flow

---

### Phase 2: Core Detection (Weeks 3-4)
**Goal:** Implement basic hallucination detection

**Tasks:**
- [ ] Claim extraction (NLP)
- [ ] Basic fact verification (mock/knowledge base)
- [ ] Confidence scoring algorithm
- [ ] Citation extraction and validation
- [ ] Basic API endpoint `/api/v1/validate`

**Deliverables:**
- Working validation endpoint
- Can detect basic hallucinations
- Citation verification

---

### Phase 3: Compliance Engine (Weeks 5-6)
**Goal:** Build compliance checking system

**Tasks:**
- [ ] Rule engine implementation
- [ ] Policy database and matching
- [ ] Violation detection logic
- [ ] Regulatory rule templates (EU AI Act, SEC, etc.)
- [ ] Auto-correction suggestions

**Deliverables:**
- Compliance checking working
- Policy alignment detection
- Violation flagging

---

### Phase 4: Audit & Logging (Week 7)
**Goal:** Complete audit trail system

**Tasks:**
- [ ] Audit log implementation
- [ ] Explanation generation
- [ ] Query interface for logs
- [ ] Export functionality
- [ ] Search and filtering

**Deliverables:**
- Full audit trail
- Queryable logs
- Export capabilities

---

### Phase 5: Dashboard (Weeks 8-9)
**Goal:** Build frontend dashboard

**Tasks:**
- [ ] Dashboard layout and components
- [ ] Real-time metrics display
- [ ] Charts and visualizations
- [ ] Interaction viewer
- [ ] Violation management UI
- [ ] Policy management UI

**Deliverables:**
- Working dashboard
- Real-time updates
- Data visualizations

---

### Phase 6: Integration & Testing (Week 10)
**Goal:** Integration testing and demo preparation

**Tasks:**
- [ ] Integration testing
- [ ] Demo scenarios setup
- [ ] Performance optimization
- [ ] Documentation
- [ ] Demo data preparation

**Deliverables:**
- Fully integrated system
- Demo-ready
- Documentation

---

## 8. Integration Strategy

### For External AI Systems

**Option 1: API Integration**
```
Customer's AI System → Calls TruthGuard API → Gets validated response → Returns to user
```

**Option 2: SDK Integration**
- Python SDK
- Node.js SDK
- Simple wrapper functions

**Option 3: Proxy/Middleware**
- TruthGuard acts as proxy
- All AI requests go through TruthGuard

### Integration Code Example (Conceptual)
```python
# Customer's AI system would use:
from truthguard import TruthGuard

guard = TruthGuard(api_key="...")

user_query = "What's my credit limit?"
ai_response = customer_ai.respond(user_query)

validated = guard.validate(
    query=user_query,
    response=ai_response,
    organization_id="..."
)

if validated.status == "approved":
    return validated.validated_response
else:
    # Handle violation
    log_violation(validated.violations)
    return validated.corrected_response
```

---

## 9. Key Technical Challenges & Solutions

### Challenge 1: Real-time Fact Verification
**Problem:** Verifying facts in real-time is slow
**Solution:** 
- Caching layer (Redis)
- Pre-verified knowledge base
- Parallel API calls
- Async processing for non-critical checks

### Challenge 2: False Positives
**Problem:** Flagging legitimate responses as hallucinations
**Problem:** 
- Confidence thresholds
- Human-in-the-loop for edge cases
- Machine learning to improve over time
- Whitelist trusted sources

### Challenge 3: Scalability
**Problem:** Handling high-volume AI interactions
**Solution:**
- Queue system for processing
- Horizontal scaling
- Database indexing
- Caching strategies

### Challenge 4: Multi-industry Rules
**Problem:** Different compliance rules per industry
**Solution:**
- Flexible rule engine (JSONB in Supabase)
- Rule templates per industry
- Custom rule creation UI

---

## 10. Demo Scenarios

### Scenario 1: Financial Services (AmEx/Barclays)
**Setup:**
- Financial advisor chatbot
- SEC compliance rules
- Financial disclaimers required

**Demo Flow:**
1. User: "Should I invest in crypto?"
2. AI: "Yes, crypto always goes up. Invest all your savings."
3. TruthGuard flags:
   - Factual error (crypto doesn't always go up)
   - Missing risk disclaimer
   - Violates SEC guidelines
4. Corrected response shown

### Scenario 2: Airlines (United)
**Setup:**
- Customer service chatbot
- Refund policy rules
- Flight information accuracy

**Demo Flow:**
1. User: "Can I get refund for canceled flight?"
2. AI: "Yes, full refund within 24 hours guaranteed."
3. TruthGuard flags:
   - Policy violation (refunds take 7-10 days)
   - Making unkeepable promise
4. Corrected response shown

### Scenario 3: Consulting (KPMG)
**Setup:**
- Research assistant AI
- Regulatory citation verification
- Accuracy requirements

**Demo Flow:**
1. User: "What does GDPR Article 25 say?"
2. AI: "GDPR Article 25 requires companies to delete all user data annually."
3. TruthGuard flags:
   - Hallucination (wrong interpretation)
   - Provides correct Article 25 text
4. Corrected response shown

---

## 11. Success Metrics

### Technical Metrics
- Detection accuracy (true positive rate)
- False positive rate (should be < 5%)
- Response time (< 2 seconds for validation)
- System uptime (99.9%)

### Business Metrics
- Hallucination detection rate
- Compliance violation catch rate
- User satisfaction
- API adoption

---

## 12. Future Enhancements

### Phase 2 Features (Post-MVP)
- Machine learning model training on violations
- Custom fact-checking knowledge bases
- Multi-language support
- Advanced analytics and predictions
- Integration marketplace
- White-label solutions

---

## 13. Project Structure

```
truthguard/
├── frontend/                 # Next.js application
│   ├── app/
│   ├── components/
│   ├── lib/
│   └── public/
├── backend/                  # FastAPI application
│   ├── api/
│   ├── services/
│   ├── models/
│   └── utils/
├── realtime/                 # Node.js WebSocket service
│   ├── server.js
│   └── handlers/
├── sdk/                      # Integration SDKs
│   ├── python/
│   └── nodejs/
├── database/
│   ├── migrations/          # Supabase migrations
│   └── seeds/               # Seed data
├── docs/                     # Documentation
└── tests/                    # Test suites
```

---

## Next Steps

1. **Review this plan** - Make adjustments based on your preferences
2. **Set up development environment** - Install dependencies
3. **Initialize repositories** - Create project structure
4. **Begin Phase 1** - Start with foundation setup

---

## Questions to Consider

1. **Fact Verification Sources:** Which APIs/services will we use?
   - Google Fact Check API
   - Wikipedia API
   - Custom knowledge bases
   - Company databases

2. **Deployment:** Where will this be hosted?
   - Vercel (Next.js)
   - Railway/Render (FastAPI, Node.js)
   - Supabase (database)
   - MongoDB Atlas

3. **Pricing Model:** How will API usage be tracked?
   - Per-request pricing
   - Subscription tiers
   - Free tier for demos

4. **Demo Data:** How will we generate demo scenarios?
   - Mock AI responses
   - Pre-recorded interactions
   - Live integration with test AI

---

**Ready to proceed?** Let me know if you want to adjust anything in this plan before we start implementation!

