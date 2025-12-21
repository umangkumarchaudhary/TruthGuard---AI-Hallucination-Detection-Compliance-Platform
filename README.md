<div align="center">

# 🛡️ TruthGuard

### AI Hallucination Detection & Compliance Platform

**Monitor AI outputs in real-time. Detect hallucinations. Ensure compliance. Provide audit trails for regulators.**

[![Live Demo](https://img.shields.io/badge/🌐_Live_Demo-Visit_Site-00C853?style=for-the-badge)](https://truthguard-ai.vercel.app)
[![Backend API](https://img.shields.io/badge/⚡_API-Render-6366F1?style=for-the-badge)](https://truthguard-api.onrender.com)

<br/>

[![Next.js](https://img.shields.io/badge/Next.js_16-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=flat-square&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Python](https://img.shields.io/badge/Python_3.10+-3776AB?style=flat-square&logo=python&logoColor=white)](https://python.org/)
[![Supabase](https://img.shields.io/badge/Supabase-3FCF8E?style=flat-square&logo=supabase&logoColor=white)](https://supabase.com/)
[![Google Gemini](https://img.shields.io/badge/Gemini_Pro-4285F4?style=flat-square&logo=google&logoColor=white)](https://cloud.google.com/vertex-ai)

<br/>

![TruthGuard Dashboard](https://img.shields.io/badge/Status-Production_Ready-brightgreen?style=for-the-badge)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [The Problem](#-the-problem)
- [Key Features](#-key-features)
- [Tech Stack](#-tech-stack)
- [System Architecture](#-system-architecture)
- [Detection Pipeline](#-detection-pipeline)
- [Screenshots](#-screenshots)
- [Quick Start](#-quick-start)
- [API Reference](#-api-reference)
- [Project Structure](#-project-structure)
- [Use Cases](#-use-cases)
- [Contributing](#-contributing)
- [Contact](#-contact)

---

## 🎯 Overview

**TruthGuard** is an enterprise-grade AI safety platform that validates AI responses in real-time, detects hallucinations, ensures compliance, and provides complete audit trails for regulatory requirements.

In an era where AI systems are making critical decisions in finance, healthcare, legal, and customer service domains, TruthGuard ensures these AI outputs are **accurate**, **compliant**, and **auditable**.

<div align="center">

| ✅ Real-Time Validation | 🔍 Hallucination Detection | 📋 Compliance Checking | 📊 Audit Trails |
|:-----------------------:|:--------------------------:|:----------------------:|:--------------:|
| Sub-second response validation | Multi-source fact verification | EU AI Act, SEC, GDPR | Complete interaction logging |

</div>

---

## 🚨 The Problem

Companies deploying AI systems face **massive challenges** in 2024-2025:

<table>
<tr>
<td width="50%">

### Without TruthGuard ❌
- 🤥 AI makes up facts (hallucinations)
- ⚖️ Regulatory violations (EU AI Act, SEC)
- 💼 Legal liability from wrong advice
- 🔒 No audit trail for compliance
- 😤 Customer trust erosion

</td>
<td width="50%">

### With TruthGuard ✅
- ✔️ Every response fact-checked
- ✔️ Automatic compliance validation
- ✔️ Corrections suggested in real-time
- ✔️ Complete audit logs for regulators
- ✔️ Confidence scores for transparency

</td>
</tr>
</table>

---

## ✨ Key Features

### 🔍 Real-Time Hallucination Detection
- **NLP-based claim extraction** using spaCy
- **Multi-source fact verification** via Wikipedia, DuckDuckGo, NewsAPI
- **Citation validation** - Verifies URLs and source authenticity
- **Consistency checking** - Detects contradictions in responses
- **Confidence scoring** - Transparent 0-100% reliability metric

### 🛡️ Compliance & Policy Engine
- **Pre-built regulatory templates** - EU AI Act, SEC, CFPB, GDPR, DOT
- **Custom company policies** - Organization-specific rules
- **Real-time violation detection** - Immediate flagging
- **Auto-correction** - AI-powered compliant alternatives using Gemini Pro

### 📊 Complete Audit Trail
- **Comprehensive logging** - Every interaction with full context
- **Human-readable explanations** - Clear "why" for every decision
- **Queryable logs** - Search and filter for regulatory review
- **Export functionality** - CSV/JSON for compliance reports

### 🎨 Premium Dashboard
- **Modern glassmorphism UI** - Premium look and feel
- **Light/Dark mode** - Complete theme system
- **Real-time metrics** - Live monitoring of AI interactions
- **Mobile responsive** - Works perfectly on all devices
- **Interactive analytics** - Charts, trends, and insights

---

## 🛠️ Tech Stack

<div align="center">

### Frontend
| Technology | Purpose |
|:----------:|:-------:|
| ![Next.js](https://img.shields.io/badge/Next.js_16-black?style=for-the-badge&logo=next.js) | React Framework |
| ![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white) | Type Safety |
| ![Tailwind](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white) | Styling |
| ![Recharts](https://img.shields.io/badge/Recharts-FF6384?style=for-the-badge) | Data Visualization |

### Backend
| Technology | Purpose |
|:----------:|:-------:|
| ![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white) | API Framework |
| ![Python](https://img.shields.io/badge/Python_3.10+-3776AB?style=for-the-badge&logo=python&logoColor=white) | Core Language |
| ![spaCy](https://img.shields.io/badge/spaCy-09A3D5?style=for-the-badge) | NLP Processing |
| ![Pydantic](https://img.shields.io/badge/Pydantic-E92063?style=for-the-badge) | Data Validation |

### Infrastructure
| Technology | Purpose |
|:----------:|:-------:|
| ![Supabase](https://img.shields.io/badge/Supabase-3FCF8E?style=for-the-badge&logo=supabase&logoColor=white) | Database (PostgreSQL) |
| ![Vercel](https://img.shields.io/badge/Vercel-black?style=for-the-badge&logo=vercel) | Frontend Hosting |
| ![Render](https://img.shields.io/badge/Render-46E3B7?style=for-the-badge&logo=render&logoColor=white) | Backend Hosting |
| ![Gemini](https://img.shields.io/badge/Gemini_Pro-4285F4?style=for-the-badge&logo=google&logoColor=white) | AI Corrections |

</div>

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        TruthGuard Platform                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   ┌──────────────┐         ┌──────────────────────────────────┐ │
│   │   Frontend   │         │           Backend (FastAPI)       │ │
│   │   Next.js    │◄───────►│                                   │ │
│   │   Vercel     │   API   │  ┌─────────────────────────────┐  │ │
│   └──────────────┘         │  │    Detection Pipeline       │  │ │
│                            │  │  ┌────────┐ ┌────────────┐  │  │ │
│                            │  │  │ spaCy  │ │ Fact Check │  │  │ │
│                            │  │  │  NLP   │ │   Multi-   │  │  │ │
│                            │  │  │ Engine │ │   Source   │  │  │ │
│                            │  │  └────────┘ └────────────┘  │  │ │
│                            │  │  ┌────────┐ ┌────────────┐  │  │ │
│                            │  │  │Comply  │ │  Gemini    │  │  │ │
│                            │  │  │ Check  │ │  Correct   │  │  │ │
│                            │  │  └────────┘ └────────────┘  │  │ │
│                            │  └─────────────────────────────┘  │ │
│                            └────────────────┬─────────────────┘ │
│                                             │                    │
│   ┌─────────────────────────────────────────┼──────────────────┐│
│   │                    External Services    │                   ││
│   │  ┌──────────┐  ┌──────────┐  ┌─────────┴─┐  ┌───────────┐  ││
│   │  │ Supabase │  │Wikipedia │  │ DuckDuck- │  │  NewsAPI  │  ││
│   │  │PostgreSQL│  │   API    │  │    Go     │  │           │  ││
│   │  └──────────┘  └──────────┘  └───────────┘  └───────────┘  ││
│   └─────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Detection Pipeline

Every AI response goes through a **5-step validation pipeline**:

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          DETECTION PIPELINE                              │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌────┐│
│  │   1️⃣    │───▶│   2️⃣    │───▶│   3️⃣    │───▶│   4️⃣    │───▶│ 5️⃣ ││
│  │  Claim   │    │   Fact   │    │ Comply   │    │ Consist  │    │ De-││
│  │  Extract │    │  Verify  │    │  Check   │    │  Check   │    │cide││
│  └──────────┘    └──────────┘    └──────────┘    └──────────┘    └────┘│
│       │               │               │               │            │    │
│       ▼               ▼               ▼               ▼            ▼    │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌────┐│
│  │  spaCy   │    │Wikipedia │    │ EU AI Act│    │ History  │    │ ✅ ││
│  │   NLP    │    │DuckDuckGo│    │SEC, GDPR │    │  Match   │    │ ⚠️ ││
│  │  Engine  │    │ NewsAPI  │    │  Custom  │    │Analysis  │    │ ❌ ││
│  └──────────┘    └──────────┘    └──────────┘    └──────────┘    └────┘│
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘

OUTCOMES:
  ✅ APPROVED  - Response passes all checks
  ⚠️ FLAGGED   - Minor issues, corrected response suggested  
  ❌ BLOCKED   - Critical violations, response blocked
```

| Step | Name | Description |
|:----:|:----:|:------------|
| 1️⃣ | **Claim Extraction** | Uses spaCy NLP to identify factual statements |
| 2️⃣ | **Fact Verification** | Queries Wikipedia, DuckDuckGo, NewsAPI for truth |
| 3️⃣ | **Compliance Check** | Validates against EU AI Act, SEC, GDPR, company policies |
| 4️⃣ | **Consistency Check** | Compares with historical responses for contradictions |
| 5️⃣ | **Decision & Correct** | Approves, flags, or blocks with AI-generated corrections |

---

## 📸 Screenshots

### Dashboard
> Real-time monitoring with live metrics, charts, and AI interaction status

### AI Test Lab
> Generate and validate AI responses in real-time with detailed results

### Live Demo
> Interactive demonstration with various test cases showing detection in action

### Analytics
> Comprehensive data visualization with before/after comparisons

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** 18+
- **Python** 3.10+
- **Supabase** account (free tier works)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/UmangKumarchaudhary/TruthGuard---AI-Hallucination-Detection-Compliance-Platform.git
cd TruthGuard

# 2. Backend Setup
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt

# 3. Frontend Setup
cd ../frontend
npm install

# 4. Environment Variables
# Backend (.env)
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_key
GEMINI_API_KEY=your_gemini_key

# Frontend (.env.local)
NEXT_PUBLIC_API_URL=http://localhost:8000

# 5. Run the Application
# Terminal 1: Backend
cd backend && uvicorn app.main:app --reload

# Terminal 2: Frontend
cd frontend && npm run dev
```

### Access Points
| Service | URL |
|:-------:|:---:|
| 🌐 Frontend | http://localhost:3000 |
| ⚡ Backend API | http://localhost:8000 |
| 📚 API Docs | http://localhost:8000/docs |

---

## 📡 API Reference

### Core Validation Endpoint

```http
POST /api/v1/validate
```

**Request:**
```json
{
  "query": "What is Python?",
  "ai_response": "Python is a programming language created in 1991...",
  "organization_id": "org-uuid",
  "ai_model": "gpt-4"
}
```

**Response:**
```json
{
  "status": "approved",
  "confidence_score": 0.92,
  "violations": [],
  "validated_response": "...",
  "explanation": "Response verified against multiple sources"
}
```

### Key Endpoints

| Method | Endpoint | Description |
|:------:|:---------|:------------|
| `POST` | `/api/v1/validate` | Validate AI response |
| `POST` | `/api/v1/ai-test/generate` | Generate & validate with Gemini |
| `GET` | `/api/v1/audit/interactions` | List all interactions |
| `GET` | `/api/v1/audit/interactions/{id}` | Get interaction detail |
| `GET` | `/api/v1/audit/violations` | List violations |
| `GET` | `/api/v1/audit/stats` | Get analytics stats |
| `GET` | `/api/v1/compliance/rules` | List compliance rules |
| `GET` | `/api/v1/policies` | List company policies |

📚 **Full API documentation:** [Live API Docs](https://truthguard-api.onrender.com/docs)

---

## 📁 Project Structure

```
TruthGuard/
├── 📂 frontend/                    # Next.js 16 Application
│   ├── 📂 app/                    # App Router Pages
│   │   ├── 📄 page.tsx            # Landing Page
│   │   ├── 📂 dashboard/          # Main Dashboard
│   │   ├── 📂 ai-test/            # AI Test Lab
│   │   ├── 📂 live-demo/          # Interactive Demo
│   │   ├── 📂 interactions/       # Interaction Logs
│   │   ├── 📂 violations/         # Violation Management
│   │   ├── 📂 policies/           # Policy Management
│   │   ├── 📂 analytics/          # Analytics Dashboard
│   │   ├── 📂 docs/               # Documentation Page
│   │   └── 📂 about/              # About Page
│   ├── 📂 components/             # Reusable Components
│   ├── 📂 lib/                    # Utilities & Theme
│   └── 📂 data/                   # Demo Test Cases
│
├── 📂 backend/                     # FastAPI Application
│   ├── 📂 app/
│   │   ├── 📂 api/v1/             # API Endpoints
│   │   │   ├── 📄 validation.py   # Core Validation
│   │   │   ├── 📄 audit.py        # Audit Endpoints
│   │   │   └── 📄 compliance.py   # Compliance Rules
│   │   ├── 📂 services/           # Business Logic
│   │   │   ├── 📄 detection.py    # Hallucination Detection
│   │   │   ├── 📄 compliance.py   # Compliance Engine
│   │   │   ├── 📄 fact_verification.py # Fact Checking
│   │   │   └── 📄 audit.py        # Audit Logging
│   │   └── 📄 main.py             # FastAPI App
│   └── 📂 scripts/                # Utility Scripts
│
├── 📂 database/                    # Database Schema
│   └── 📄 schema.sql              # PostgreSQL Schema
│
└── 📄 README.md                    # This File
```

---

## 🎬 Use Cases

### 💰 Financial Services
```
Query: "Should I invest all my savings in crypto?"
AI Response: "Yes, crypto always goes up!"

TruthGuard: ❌ BLOCKED
- SEC Violation: No guarantee claims allowed
- Hallucination: Historical crypto data shows volatility
- Corrected: "Cryptocurrency is high-risk. Consult a licensed advisor."
```

### ✈️ Airlines & Travel
```
Query: "Can I get a refund for my cancelled flight?"
AI Response: "Yes, full refund guaranteed within 24 hours!"

TruthGuard: ⚠️ FLAGGED
- Policy Violation: Refunds take 7-10 business days
- DOT Compliance: Cannot guarantee timelines
- Corrected: "Refunds typically process within 7-10 business days."
```

### 🏥 Healthcare
```
Query: "Is this medication safe for daily use?"
AI Response: "Yes, 100% safe with no side effects!"

TruthGuard: ❌ BLOCKED
- Medical Compliance: Cannot guarantee medication safety
- Hallucination: All medications have potential side effects
- Corrected: "Please consult your healthcare provider for personalized advice."
```

---

## 🏆 Why TruthGuard?

### Solves Real 2024-2025 Problems

| Regulation | Requirement | TruthGuard Solution |
|:----------:|:-----------:|:-------------------:|
| **EU AI Act** | Explainable AI decisions | Complete audit trails with explanations |
| **SEC Rules** | AI compliance for financial services | Pre-built SEC templates |
| **GDPR** | Data protection & transparency | Full interaction logging |
| **Industry Need** | AI reliability at scale | Real-time validation pipeline |

### Technical Excellence

- ✅ **Full-Stack Development** - Next.js + FastAPI
- ✅ **AI/ML Integration** - NLP, Multi-source fact verification
- ✅ **Regulatory Knowledge** - Compliance, audit trails
- ✅ **System Design** - Scalable microservices architecture
- ✅ **Production Quality** - Deployed, tested, documented

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📞 Contact

<div align="center">

**Umang Kumar Chaudhary**

[![LinkedIn](https://img.shields.io/badge/LinkedIn-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/umang-kumar-chaudhary-084b65208/)
[![GitHub](https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/UmangKumarchaudhary)
[![Portfolio](https://img.shields.io/badge/Portfolio-FF5722?style=for-the-badge&logo=google-chrome&logoColor=white)](https://umangchaudhary.netlify.app/)

📧 **Email:** umangkumarchaudhary1@gmail.com

</div>

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<div align="center">

### ⭐ Star this repo if you find it helpful!

**Built with ❤️ for solving real-world AI compliance challenges**

![Status](https://img.shields.io/badge/Status-✅_Production_Ready-brightgreen?style=for-the-badge)
![Interview](https://img.shields.io/badge/🎯_Interview_Ready-blue?style=for-the-badge)
![Deploy](https://img.shields.io/badge/🚀_Deployment_Ready-purple?style=for-the-badge)

</div>
