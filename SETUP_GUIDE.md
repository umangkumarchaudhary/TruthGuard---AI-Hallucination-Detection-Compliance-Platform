# 🚀 TruthGuard Setup Guide

## ✅ What's Already Done:
1. ✅ Project structure created
2. ✅ Frontend (Next.js) initialized
3. ✅ Backend (FastAPI) structure created
4. ✅ Environment variables documented

## 📋 Step-by-Step Setup:

### Step 1: Set Up Database (5 minutes)

1. **Open Supabase Dashboard:**
   - Go to: https://supabase.com/dashboard
   - Select your project

2. **Run SQL Schema:**
   - Click "SQL Editor" in left sidebar
   - Click "New Query"
   - Open `database/schema.sql` file
   - Copy entire file (Ctrl+A, Ctrl+C)
   - Paste into SQL Editor
   - Click "Run" or press Ctrl+Enter
   - ✅ Verify: You should see "Success. No rows returned"

3. **Verify Tables Created:**
   - Go to "Table Editor" in left sidebar
   - You should see 9 tables:
     - organizations
     - users
     - api_keys
     - compliance_rules
     - company_policies
     - ai_interactions
     - violations
     - verification_results
     - citations

---

### Step 2: Set Up Frontend Environment (2 minutes)

1. **Navigate to frontend folder:**
   ```bash
   cd frontend
   ```

2. **Create `.env.local` file:**
   - Create new file: `frontend/.env.local`
   - Add this content:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://dufausqnubtmnsfhdlty.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR1ZmF1c3FudWJ0bW5zZmhkbHR5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU1MzkzMzMsImV4cCI6MjA4MTExNTMzM30.A4ZvVF88e22yVwW2cBPq9ldMC_kCgCa2NXNRi2VKkkU
   ```
   - ⚠️ **Important:** Use `NEXT_PUBLIC_` prefix for frontend env vars

3. **Install Supabase client:**
   ```bash
   npm install @supabase/supabase-js
   ```

4. **Test frontend:**
   ```bash
   npm run dev
   ```
   - Open: http://localhost:3000
   - Should see Next.js welcome page

---

### Step 3: Set Up Backend Environment (5 minutes)

1. **Navigate to backend folder:**
   ```bash
   cd backend
   ```

2. **Create Python virtual environment:**
   ```bash
   # Windows
   python -m venv venv
   venv\Scripts\activate

   # Mac/Linux
   python3 -m venv venv
   source venv/bin/activate
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Update root `.env` file:**
   - Make sure your root `.env` has:
   ```env
   SUPABASE_URL=https://dufausqnubtmnsfhdlty.supabase.co
   SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR1ZmF1c3FudWJ0bW5zZmhkbHR5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU1MzkzMzMsImV4cCI6MjA4MTExNTMzM30.A4ZvVF88e22yVwW2cBPq9ldMC_kCgCa2NXNRi2VKkkU
   SUPABASE_SERVICE_ROLE_KEY=sb_secret_u4zPxk0GCLq524RrHBoI1g_B8MQpp7p
   ```

5. **Test backend:**
   ```bash
   uvicorn app.main:app --reload
   ```
   - Open: http://localhost:8000
   - Should see: `{"message":"TruthGuard API","status":"running","version":"1.0.0"}`
   - Open: http://localhost:8000/docs
   - Should see FastAPI Swagger UI

---

### Step 4: Test Database Connection (3 minutes)

#### Test from Frontend:

1. **Create test file:** `frontend/app/test-db/page.tsx`
   ```tsx
   'use client'
   import { supabase } from '@/lib/supabase'
   import { useEffect, useState } from 'react'

   export default function TestDB() {
     const [data, setData] = useState<any[]>([])
     const [error, setError] = useState<string | null>(null)

     useEffect(() => {
       async function testConnection() {
         try {
           const { data, error } = await supabase
             .from('organizations')
             .select('*')
           
           if (error) throw error
           setData(data || [])
         } catch (err: any) {
           setError(err.message)
         }
       }
       testConnection()
     }, [])

     return (
       <div className="p-8">
         <h1 className="text-2xl font-bold mb-4">Database Connection Test</h1>
         {error && <p className="text-red-500">Error: {error}</p>}
         {data.length === 0 && !error && <p>No organizations found (this is OK - table is empty)</p>}
         <pre>{JSON.stringify(data, null, 2)}</pre>
       </div>
     )
   }
   ```

2. **Visit:** http://localhost:3000/test-db
   - Should see: "No organizations found" (empty table is OK)
   - If you see error, check your `.env.local` file

#### Test from Backend:

1. **Update:** `backend/app/main.py` - Add test endpoint:
   ```python
   from supabase import create_client
   from app.config import settings

   @app.get("/test-db")
   async def test_db():
       try:
           supabase = create_client(
               settings.SUPABASE_URL,
               settings.SUPABASE_SERVICE_ROLE_KEY
           )
           result = supabase.table('organizations').select('*').execute()
           return {
               "status": "connected",
               "tables": "organizations",
               "count": len(result.data) if result.data else 0,
               "data": result.data
           }
       except Exception as e:
           return {"status": "error", "message": str(e)}
   ```

2. **Visit:** http://localhost:8000/test-db
   - Should see: `{"status":"connected","tables":"organizations","count":0}`

---

## ✅ Verification Checklist:

- [ ] Database schema run successfully (9 tables created)
- [ ] Frontend `.env.local` file created with correct keys
- [ ] Frontend runs: `npm run dev` works
- [ ] Backend virtual environment created and activated
- [ ] Backend dependencies installed
- [ ] Backend runs: `uvicorn app.main:app --reload` works
- [ ] Frontend can connect to Supabase (test-db page works)
- [ ] Backend can connect to Supabase (test-db endpoint works)

---

## 🎯 Next Steps After Setup:

1. **Start Phase 1 Development:**
   - Follow `DEVELOPMENT_PHASES.md`
   - Begin with Day 1-2 tasks

2. **Create First Organization:**
   - Test inserting data into database
   - Verify RLS policies work

3. **Build Authentication:**
   - Set up Supabase Auth
   - Create login/signup pages

---

## 🐛 Troubleshooting:

### Frontend Issues:
- **Error: "Missing Supabase environment variables"**
  - Check `frontend/.env.local` exists
  - Verify `NEXT_PUBLIC_` prefix on variables
  - Restart dev server after adding env vars

### Backend Issues:
- **Error: "Module not found"**
  - Make sure virtual environment is activated
  - Run `pip install -r requirements.txt`

### Database Issues:
- **Error: "relation does not exist"**
  - Make sure you ran `database/schema.sql`
  - Check Supabase Table Editor to verify tables exist

---

## 📞 Need Help?

- Check `NEXT_STEPS.md` for quick reference
- Review `DEVELOPMENT_PHASES.md` for detailed tasks
- Check Supabase Dashboard for connection issues

