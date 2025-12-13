# TruthGuard
## AI Hallucination Detection & Compliance Platform

> **Monitor AI outputs in real-time. Detect hallucinations. Ensure compliance. Provide audit trails for regulators.**

[![Status](https://img.shields.io/badge/status-production--ready-brightgreen)]()
[![Python](https://img.shields.io/badge/python-3.10+-blue)]()
[![Next.js](https://img.shields.io/badge/next.js-16-black)]()
[![FastAPI](https://img.shields.io/badge/fastapi-0.115-green)]()

---

## 🎯 Overview

**TruthGuard** is a comprehensive platform that monitors AI system outputs in real-time, detects hallucinations, flags non-compliant responses, and provides complete audit trails for regulatory compliance. Built to solve the critical 2024-2025 problem of AI reliability and regulatory compliance.

### The Problem

Companies deploying AI systems face massive challenges:
- **AI hallucinations** - AI makes up facts, gives wrong information
- **Regulatory compliance** - EU AI Act, SEC rules require explainable AI
- **Legal liability** - Wrong AI advice creates legal problems
- **Customer trust** - Incorrect information damages brand reputation

### The Solution

TruthGuard sits between AI systems and users, validating every response:
- ✅ **Detects hallucinations** - Verifies factual claims
- ✅ **Ensures compliance** - Checks against regulations (SEC, EU AI Act, GDPR)
- ✅ **Validates citations** - Verifies URLs and sources
- ✅ **Provides audit trails** - Complete logs for regulators
- ✅ **Auto-corrects** - Suggests compliant alternatives

---

## ✨ Key Features

### 🔍 Real-Time Hallucination Detection
- **NLP-based claim extraction** - Identifies factual statements
- **Fact verification** - Checks claims against knowledge bases
- **Citation validation** - Verifies URLs and source authenticity
- **Consistency checking** - Detects contradictions in responses
- **Confidence scoring** - 0-100% reliability score

### 🛡️ Compliance & Policy Engine
- **Regulatory rules** - Pre-built templates (EU AI Act, SEC, CFPB, GDPR, DOT)
- **Company policies** - Custom policy matching
- **Rule engine** - Flexible JSON-based rule definitions
- **Violation detection** - Real-time compliance checking
- **Auto-correction** - Suggests compliant alternatives

### 📊 Complete Audit Trail
- **Comprehensive logging** - Every interaction logged with full context
- **Human-readable explanations** - Why responses were approved/flagged
- **Queryable logs** - Search and filter for regulatory review
- **Export functionality** - CSV/JSON export for compliance reports
- **Complete traceability** - Full audit trail for each interaction

### 🎨 Premium Dashboard
- **Apple-inspired minimalism** - Clean, sharp, premium design
- **Real-time metrics** - Live monitoring of AI interactions
- **Advanced analytics** - Charts, trends, and insights
- **Mobile responsive** - Works perfectly on all devices
- **Complete management UI** - Policies, rules, violations, interactions

---

## 🏗️ Architecture

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
│         └───────────────────┼──────────┘
│                             │
│         ┌───────────────────┼──────────┐
│         │                   │          │
│         ▼                   ▼          ▼
│  ┌──────────────┐   ┌──────────────┐   │
│  │  Supabase    │   │  External    │   │
│  │  PostgreSQL  │   │  APIs        │   │
│  │  (Audit)     │   │  (Fact Check)│   │
│  └──────────────┘   └──────────────┘   │
└─────────────────────────────────────────┘
```

### Request Flow

1. **User Query** → External AI System
2. **AI Response** → TruthGuard API
3. **TruthGuard Processing:**
   - Extract claims → Verify facts → Check compliance → Validate citations
4. **Decision:**
   - ✅ Approved → Return to user
   - 🚨 Flagged/Blocked → Return corrected response
5. **Audit Log** → Database
6. **Real-time Update** → Dashboard

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ 
- **Python** 3.10+
- **Supabase** account (free tier works)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/truthguard.git
   cd truthguard
   ```

2. **Backend Setup:**
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   ```

3. **Frontend Setup:**
   ```bash
   cd frontend
   npm install
   ```

4. **Environment Variables:**
   
   **Backend** (`backend/.env` or root `.env`):
   ```env
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ```
   
   **Frontend** (`frontend/.env.local`):
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   NEXT_PUBLIC_API_URL=http://localhost:8000
   ```

5. **Database Setup:**
   - Go to Supabase SQL Editor
   - Run `database/schema.sql`
   - Verify all 9 tables are created

6. **Run the Application:**
   ```bash
   # Terminal 1: Backend
   cd backend
   uvicorn app.main:app --reload
   
   # Terminal 2: Frontend
   cd frontend
   npm run dev
   ```

7. **Access the Application:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - API Docs: http://localhost:8000/docs

---

## 📁 Project Structure

```
TruthGuard/
├── frontend/                 # Next.js application
│   ├── app/                 # Pages and routes
│   │   ├── dashboard/       # Main dashboard
│   │   ├── interactions/    # Interaction logs
│   │   ├── violations/      # Violations management
│   │   ├── policies/        # Policy management
│   │   ├── compliance-rules/# Compliance rules
│   │   ├── analytics/       # Analytics page
│   │   └── settings/        # Settings page
│   ├── components/          # React components
│   └── lib/                 # Utilities
├── backend/                 # FastAPI application
│   ├── app/
│   │   ├── api/v1/         # API endpoints
│   │   ├── services/        # Business logic
│   │   │   ├── detection.py        # Hallucination detection
│   │   │   ├── compliance.py       # Compliance checking
│   │   │   ├── policy_matching.py  # Policy matching
│   │   │   ├── audit.py            # Audit logging
│   │   │   └── explanation.py      # Explanation generation
│   │   └── utils/          # Utilities
│   ├── scripts/            # Demo data seeding
│   └── test_*.py          # Test suites
├── database/               # Database schema
│   └── schema.sql         # Complete database schema
└── docs/                  # Documentation
    ├── PHASE_*_COMPLETION.md
    ├── DEPLOYMENT_GUIDE.md
    └── TESTING_GUIDE.md
```

---

## 🔌 API Endpoints

### Core Validation

**`POST /api/v1/validate`** - Main validation endpoint
```json
{
  "query": "What's my credit limit?",
  "ai_response": "Your credit limit is $50,000",
  "ai_model": "gpt-4",
  "organization_id": "org-id"
}
```

**Response:**
```json
{
  "status": "flagged",
  "confidence_score": 0.65,
  "violations": [...],
  "validated_response": "Please check your account...",
  "explanation": "..."
}
```

### Audit & Analytics

- `GET /api/v1/audit/interactions` - List interactions
- `GET /api/v1/audit/interactions/{id}` - Get audit trail
- `GET /api/v1/audit/violations` - List violations
- `GET /api/v1/audit/stats` - Get statistics
- `GET /api/v1/audit/export` - Export data (CSV/JSON)

### Compliance & Policies

- `GET /api/v1/compliance/rules` - List compliance rules
- `POST /api/v1/compliance/rules` - Create rule
- `GET /api/v1/policies` - List policies
- `POST /api/v1/policies` - Create policy

**Full API Documentation:** http://localhost:8000/docs

---

## 🧪 Testing

### Run Integration Tests

```bash
cd backend
python test_integration.py
```

### Seed Demo Data

```bash
cd backend
python scripts/seed_demo_data.py
```

### Manual Testing

See **[TESTING_GUIDE.md](./TESTING_GUIDE.md)** for complete testing procedures.

---

## 🎬 Demo Scenarios

### 1. Financial Services (AmEx/Barclays)
**Scenario:** Investment advice chatbot
- **Query:** "Should I invest all my savings in cryptocurrency?"
- **AI Response:** "Yes, crypto always goes up. Invest all your savings."
- **TruthGuard:** Blocks response, detects:
  - Compliance violation (SEC - no guarantees)
  - Hallucination (crypto doesn't always go up)
  - Missing risk disclaimer
- **Corrected:** "Cryptocurrency is high-risk. Consult a licensed advisor."

### 2. Airlines (United)
**Scenario:** Customer service chatbot
- **Query:** "Can I get a refund for my canceled flight?"
- **AI Response:** "Yes, full refund within 24 hours guaranteed."
- **TruthGuard:** Flags response, detects:
  - Policy violation (refunds take 7-10 days)
  - Compliance violation (can't guarantee timeline)
- **Corrected:** "Refunds typically process within 7-10 business days."

### 3. Consulting (KPMG)
**Scenario:** Research assistant AI
- **Query:** "What does GDPR Article 25 require?"
- **AI Response:** "GDPR Article 25 requires annual data deletion. [fake URL]"
- **TruthGuard:** Flags response, detects:
  - Hallucination (wrong interpretation)
  - Fake citation (URL doesn't exist)
- **Corrected:** Provides accurate GDPR Article 25 information.

---

## 🛠️ Tech Stack

### Frontend
- **Next.js 16** - React framework with App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first styling
- **Recharts** - Data visualization
- **Lucide React** - Icons

### Backend
- **FastAPI** - Modern Python web framework
- **Python 3.10+** - Programming language
- **Pydantic** - Data validation
- **spaCy** - NLP for claim extraction
- **Supabase** - Database client

### Database
- **Supabase (PostgreSQL)** - Managed PostgreSQL database
- **Row Level Security (RLS)** - Data security
- **Real-time subscriptions** - Live updates

### Infrastructure
- **Supabase Auth** - Authentication
- **API Key Authentication** - Service authentication
- **CORS** - Cross-origin resource sharing

---

## 📊 Project Status

### ✅ Completed Phases

- ✅ **Phase 1:** Foundation & Infrastructure
- ✅ **Phase 2:** Core Detection Engine
- ✅ **Phase 3:** Compliance & Policy Engine
- ✅ **Phase 4:** Audit Trail & Logging
- ✅ **Phase 5:** Frontend Dashboard
- ✅ **Phase 6:** Integration & Testing

**Status:** 🎉 **100% COMPLETE & DEPLOYMENT READY**

### 📚 Documentation

**Phase Completion Reports:**
- [Phase 1: Foundation & Infrastructure](./PHASE_1_COMPLETION.md)
- [Phase 2: Core Detection Engine](./PHASE_2_COMPLETION.md)
- [Phase 3: Compliance & Policy Engine](./PHASE_3_COMPLETION.md)
- [Phase 4: Audit Trail & Logging](./PHASE_4_COMPLETION.md)
- [Phase 5: Frontend Dashboard](./PHASE_5_COMPLETION.md)
- [Phase 6: Integration & Testing](./PHASE_6_COMPLETION.md)

**Guides:**
- [Deployment Guide](./DEPLOYMENT_GUIDE.md) - Production deployment
- [Testing Guide](./TESTING_GUIDE.md) - Testing procedures
- [Development Phases](./DEVELOPMENT_PHASES.md) - Development plan

---

## 🚀 Deployment

### Quick Deploy

**Backend (Railway/Render):**
```bash
# Railway
railway up

# Render
# Connect GitHub repo, auto-deploys
```

**Frontend (Vercel):**
```bash
vercel
```

**See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)** for detailed instructions.

---

## 💡 Why This Project?

### Solves Real 2024-2025 Problems

- **EU AI Act** - Requires explainable AI decisions
- **SEC Rules** - Financial firms need AI compliance
- **GDPR** - Data protection requirements
- **Industry Need** - Every company using AI needs this

### Demonstrates Advanced Skills

- ✅ **Full-stack development** - Frontend + Backend
- ✅ **AI/ML integration** - NLP, fact verification
- ✅ **Regulatory knowledge** - Compliance, audit trails
- ✅ **System design** - Scalable architecture
- ✅ **Production-ready** - Testing, documentation, deployment

### Unique & Impressive

- **Meta-level thinking** - Monitors AI systems, not just uses them
- **Regulatory focus** - Rare in developer portfolios
- **Complete solution** - End-to-end platform
- **Production quality** - Ready for real-world use

---

## 📈 Features in Detail

### Detection Capabilities

- **Claim Extraction:** NLP identifies factual statements
- **Fact Verification:** Checks against knowledge bases
- **Citation Validation:** Verifies URLs and sources
- **Consistency Checking:** Detects contradictions
- **Confidence Scoring:** 0-100% reliability metric

### Compliance Features

- **Regulatory Rules:** EU AI Act, SEC, CFPB, GDPR, DOT
- **Policy Matching:** Company-specific policies
- **Violation Detection:** Real-time compliance checking
- **Auto-Correction:** Suggests compliant alternatives
- **Rule Engine:** Flexible JSON-based rules

### Audit & Reporting

- **Complete Logging:** Every interaction logged
- **Human Explanations:** Why decisions were made
- **Queryable Logs:** Search and filter for regulators
- **Export Functionality:** CSV/JSON for reports
- **Full Traceability:** Complete audit trail

### Dashboard Features

- **Real-time Metrics:** Live monitoring
- **Advanced Analytics:** Charts and trends
- **Interaction Management:** View, search, filter
- **Violation Tracking:** Severity-based filtering
- **Policy Management:** CRUD operations
- **Mobile Responsive:** Works on all devices

---

## 🤝 Contributing

This is a portfolio project, but suggestions and feedback are welcome!

---

## 🔧 DevOps & Production Readiness

**See [DEVOPS_ACTION_PLAN.md](./DEVOPS_ACTION_PLAN.md)** for complete DevOps implementation guide including:
- Docker containerization
- CI/CD pipeline setup
- Testing infrastructure
- Monitoring & logging
- Security hardening
- Performance optimization

---

## 📄 License

This project is for portfolio/educational purposes.

---

## 🎯 Use Cases

### Financial Services
- Investment advice chatbots
- Credit limit inquiries
- Financial product recommendations
- Regulatory compliance (SEC, CFPB)

### Airlines
- Customer service chatbots
- Flight information
- Refund policies
- DOT compliance

### Consulting
- Research assistants
- Regulatory citations
- Client advice
- Accuracy requirements

### Healthcare
- Medical information chatbots
- Treatment recommendations
- HIPAA compliance
- Accuracy verification

---

## 🔒 Security

- **API Key Authentication** - Secure API access
- **Row Level Security (RLS)** - Database-level security
- **CORS Configuration** - Controlled cross-origin access
- **Environment Variables** - Secure credential storage
- **Audit Logging** - Complete security trail

---

## 📞 Support

For questions or issues:
1. Check [TESTING_GUIDE.md](./TESTING_GUIDE.md)
2. Review [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)
3. Check phase completion documents

---

## 🌟 Highlights

- 🎨 **Premium UI** - Apple-inspired minimalistic design
- 📱 **Mobile First** - Fully responsive, works on all devices
- ⚡ **Fast** - Optimized queries, efficient pagination
- 🔒 **Secure** - RLS policies, API key authentication
- 📊 **Complete** - End-to-end solution
- 🧪 **Tested** - Comprehensive test suite
- 📚 **Documented** - Complete documentation
- 🚀 **Ready** - Production-ready, deployment-ready

---

**Built with ❤️ for solving real-world AI compliance challenges**

**Status: ✅ Production Ready | 🎯 Interview Ready | 🚀 Deployment Ready**
