# TruthGuard - AI Hallucination Detection & Compliance Platform

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- Python 3.10+
- Supabase account

### Setup

1. **Clone and install dependencies:**
   ```bash
   # Frontend
   cd frontend
   npm install
   
   # Backend
   cd backend
   python -m venv venv
   venv\Scripts\activate  # Windows
   pip install -r requirements.txt
   
   # Real-time service
   cd realtime
   npm install
   ```

2. **Environment Variables:**
   - Backend: Create `backend/.env` or use root `.env`
   - Frontend: Create `frontend/.env.local`
   - See `ENV_FILE_GUIDE.md` for details

3. **Database Setup:**
   - Run `database/schema.sql` in Supabase SQL Editor

4. **Run the project:**
   ```bash
   # Backend (Terminal 1)
   cd backend
   uvicorn app.main:app --reload
   
   # Frontend (Terminal 2)
   cd frontend
   npm run dev
   
   # Real-time (Terminal 3)
   cd realtime
   npm start
   ```

## 📁 Project Structure

```
TruthGuard/
├── frontend/          # Next.js application
├── backend/           # FastAPI application
├── realtime/          # Node.js WebSocket service
├── database/          # SQL schema files
└── docs/             # Documentation
```

## 📚 Documentation

- **[Phase 1 Completion Report](./PHASE_1_COMPLETION.md)** - Complete guide for interviews
- [Project Plan](./PROJECT_PLAN.md) - Overall project plan
- [Development Phases](./DEVELOPMENT_PHASES.md) - Step-by-step development guide
- [Database Schema](./database/README.md) - Database documentation
- [Setup Guide](./SETUP_GUIDE.md) - Detailed setup instructions

## ✅ Phase 1 & 2 Status: COMPLETE

**See completion reports:**
- **[PHASE_1_COMPLETION.md](./PHASE_1_COMPLETION.md)** - Foundation & Infrastructure
- **[PHASE_2_COMPLETION.md](./PHASE_2_COMPLETION.md)** - Core Detection Engine
- **[PHASE_3_COMPLETION.md](./PHASE_3_COMPLETION.md)** - Compliance & Policy Engine

**Each includes:**
- What was built
- How it works
- Interview preparation guide
- Technical explanations

## 🎯 Current Progress

- ✅ Phase 1: Foundation & Infrastructure - **COMPLETE**
- ✅ Phase 2: Core Detection Engine - **COMPLETE**
- ✅ Phase 3: Compliance & Policy Engine - **COMPLETE**
- ⏳ Phase 4: Audit Trail & Logging - Next
- ⏳ Phase 5: Frontend Dashboard
- ⏳ Phase 6: Integration & Testing

**Overall Progress: 63% (40/64 steps)**

## 🔗 Key Endpoints

### Core API
- `GET /` - API info
- `GET /health` - Health check
- `GET /test-db` - Database connection test
- `GET /api/v1/info` - API version info
- `POST /api/v1/validate` - **Validate AI responses** (Main endpoint)

### Compliance & Policies
- `GET /api/v1/compliance/rules` - List compliance rules
- `POST /api/v1/compliance/rules` - Create rule
- `GET /api/v1/policies` - List company policies
- `POST /api/v1/policies` - Create policy

### Documentation
- `GET /docs` - Swagger UI (FastAPI)

## 🛠️ Tech Stack

- **Frontend:** Next.js 16, TypeScript, Tailwind CSS
- **Backend:** FastAPI, Python, Pydantic
- **Database:** Supabase (PostgreSQL)
- **Real-time:** Socket.io, Node.js
- **Auth:** Supabase Auth, API Keys

---

**Ready to start Phase 2? Check [DEVELOPMENT_PHASES.md](./DEVELOPMENT_PHASES.md)!**
