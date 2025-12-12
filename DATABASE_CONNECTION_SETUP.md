# 🔌 Database Connection Setup Guide

## ✅ What's Been Done

1. ✅ Created `backend/app/utils/supabase_client.py` - Database connection utility
2. ✅ Updated `backend/app/main.py` - Added connection test on startup
3. ✅ Added logging for successful connections
4. ✅ Created test endpoint `/test-db`
5. ✅ Auto-detects .env file in both backend/ and root folders

## 📋 Step-by-Step Setup

### Step 1: Check Your .env File Location

**Option A: If .env is in root folder** (your current setup)
```
TruthGuard/
├── .env              ← Your current location
├── backend/
└── frontend/
```
✅ **This works!** The code will find it automatically.

**Option B: Move to backend folder** (recommended)
```
TruthGuard/
├── backend/
│   ├── .env          ← Move it here (better organization)
│   └── app/
└── frontend/
```

### Step 2: Verify .env File Contents

Make sure your `.env` file has:
```env
SUPABASE_URL=https://dufausqnubtmnsfhdlty.supabase.co
SUPABASE_SERVICE_ROLE_KEY=sb_secret_u4zPxk0GCLq524RrHBoI1g_B8MQpp7p
```

### Step 3: Test Database Connection

**Method 1: Quick Test Script**
```bash
cd backend
python test_connection.py
```

**Method 2: Start Server and Test**
```bash
cd backend
uvicorn app.main:app --reload
```

Then visit: http://localhost:8000/test-db

**Method 3: Check Startup Logs**
When you start the server, you'll see:
```
✅ Loaded .env from: C:\Users\...\TruthGuard\.env
🚀 Starting TruthGuard API...
✅ Supabase client created successfully
✅ Database connection test successful
✅ Database connection established on startup
```

## 🎯 What You'll See

### ✅ Success (Console Output)
```
✅ Loaded .env from: [path]
🚀 Starting TruthGuard API...
✅ Supabase client created successfully
✅ Database connection test successful
✅ Database connection established on startup
INFO:     Uvicorn running on http://127.0.0.1:8000
```

### ✅ Success (API Response)
Visit: http://localhost:8000/test-db
```json
{
  "status": "connected",
  "message": "Successfully connected to Supabase database",
  "tables_accessible": true,
  "test_query": "organizations table accessible"
}
```

### ❌ Error (If Something's Wrong)
```
❌ Failed to create Supabase client: SUPABASE_URL is not set in environment variables
```
or
```
❌ Database connection test failed: [error message]
```

## 🔍 Troubleshooting

### Problem: "SUPABASE_URL is not set"
**Solution:**
1. Check your .env file exists
2. Verify variable names are correct (no typos)
3. Make sure .env is in backend/ or root folder
4. Restart the server after changing .env

### Problem: "Failed to connect to database"
**Solution:**
1. Verify your Supabase URL is correct
2. Check your SERVICE_ROLE_KEY (not anon key)
3. Make sure Supabase project is active
4. Check internet connection

### Problem: "Table does not exist"
**Solution:**
1. Make sure you ran `database/schema.sql` in Supabase
2. Verify all 9 tables were created
3. Check Supabase Table Editor

## 📝 Next Steps After Connection Works

1. ✅ Database connection working
2. ⏳ Test API endpoints
3. ⏳ Set up authentication
4. ⏳ Continue with Phase 1 development

## 🎉 Success Indicators

You'll know it's working when you see:
- ✅ Green checkmarks in console
- ✅ "connected" status in /test-db endpoint
- ✅ No error messages on startup

---

**Ready to test?** Run:
```bash
cd backend
python test_connection.py
```

