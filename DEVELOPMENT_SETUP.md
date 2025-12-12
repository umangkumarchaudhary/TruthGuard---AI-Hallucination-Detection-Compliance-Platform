# 🔧 Development Setup Guide

**Quick guide to get TruthGuard running in development mode**

---

## 🚀 Quick Start

### 1. Backend Setup

**Start the backend:**
```bash
cd backend
uvicorn app.main:app --reload
```

**Enable Development Mode (Bypass Auth):**

Add to `backend/.env`:
```env
DEV_BYPASS_AUTH=true
```

This allows API calls without API keys for local development.

---

### 2. Frontend Setup

**Start the frontend:**
```bash
cd frontend
npm run dev
```

**Access:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

---

## 🔑 API Key Setup (Optional)

If you want to test with real API keys:

### Option 1: Create Test API Key

```bash
cd backend
python scripts/create_test_api_key.py
```

This will:
1. Create a test organization
2. Generate an API key
3. Show you the key to use

**Then set it in browser console:**
```javascript
localStorage.setItem('api_key', 'your-api-key-here')
```

**Or add to `frontend/.env.local`:**
```env
NEXT_PUBLIC_API_KEY=your-api-key-here
```

### Option 2: Use Development Bypass

Just set `DEV_BYPASS_AUTH=true` in `backend/.env` - no API key needed!

---

## 🐛 Troubleshooting

### 401 Unauthorized Errors

**Solution 1:** Enable development bypass
```env
# backend/.env
DEV_BYPASS_AUTH=true
```

**Solution 2:** Create and set API key
```bash
# Create key
python backend/scripts/create_test_api_key.py

# Set in browser console
localStorage.setItem('api_key', 'your-key')
```

### Database Connection Errors

1. Check `backend/.env` has correct Supabase credentials
2. Verify database schema is created (run `database/schema.sql`)
3. Test connection: `curl http://localhost:8000/test-db`

### Frontend Not Loading

1. Check `frontend/.env.local` has Supabase keys
2. Verify backend is running on port 8000
3. Check browser console for errors

---

## ✅ Verification

**Test Backend:**
```bash
curl http://localhost:8000/health
# Should return: {"status": "healthy"}
```

**Test Frontend:**
- Visit http://localhost:3000
- Should see dashboard (may show empty data if no API key)

**Test with API Key:**
```bash
curl -H "X-API-Key: your-key" http://localhost:8000/api/v1/audit/stats?organization_id=00000000-0000-0000-0000-000000000001
```

---

## 📝 Environment Variables

### Backend (`backend/.env`)
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
DEV_BYPASS_AUTH=true  # For development
```

### Frontend (`frontend/.env.local`)
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

**Ready to develop! 🚀**

