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
   pip install -r requirements.txt
   ```

2. **Environment Variables:**
   - Copy `.env.example` to `.env`
   - Add your Supabase credentials

3. **Database Setup:**
   - Run `database/schema.sql` in Supabase SQL Editor

4. **Run the project:**
   ```bash
   # Frontend (Next.js)
   cd frontend
   npm run dev
   
   # Backend (FastAPI)
   cd backend
   uvicorn app.main:app --reload
   ```

## 📁 Project Structure

```
TruthGuard/
├── frontend/          # Next.js application
├── backend/           # FastAPI application
├── database/          # SQL schema files
└── docs/             # Documentation
```

## 📚 Documentation

- [Project Plan](./PROJECT_PLAN.md)
- [Development Phases](./DEVELOPMENT_PHASES.md)
- [Database Schema](./database/README.md)

