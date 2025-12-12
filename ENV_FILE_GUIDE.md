# 📁 Where to Put .env File - Guide

## Quick Answer

**You have 2 options:**

### Option 1: Backend Folder (Recommended) ✅
```
TruthGuard/
├── backend/
│   ├── .env          ← Put it here (recommended)
│   ├── app/
│   └── requirements.txt
└── frontend/
```

**Why?**
- ✅ Keeps backend config separate from frontend
- ✅ Better for deployment
- ✅ More organized
- ✅ Backend code automatically finds it here first

### Option 2: Root Folder (Also Works)
```
TruthGuard/
├── .env              ← Or put it here (also works)
├── backend/
└── frontend/
```

**Why?**
- ✅ Single file for all services
- ✅ Easier to manage one file
- ⚠️ Less organized (mixes frontend and backend config)

## How It Works

The code automatically checks both locations:
1. First checks: `backend/.env`
2. If not found, checks: `root/.env`
3. If not found, uses system environment variables

## Your Current Setup

Based on your setup, you have `.env` in the **root folder**. That's fine! The code will find it.

**But I recommend:**
1. Copy your root `.env` to `backend/.env`
2. Keep backend-specific variables in `backend/.env`
3. Keep frontend variables in `frontend/.env.local`

## Example .env Files

### backend/.env
```env
SUPABASE_URL=https://dufausqnubtmnsfhdlty.supabase.co
SUPABASE_SERVICE_ROLE_KEY=sb_secret_u4zPxk0GCLq524RrHBoI1g_B8MQpp7p
NODE_ENV=development
PORT=8000
```

### frontend/.env.local
```env
NEXT_PUBLIC_SUPABASE_URL=https://dufausqnubtmnsfhdlty.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

## Summary

- **Current:** Your `.env` is in root → ✅ Works fine
- **Recommended:** Move backend vars to `backend/.env` → ✅ Better organization
- **Code:** Automatically finds .env in both locations → ✅ No changes needed

