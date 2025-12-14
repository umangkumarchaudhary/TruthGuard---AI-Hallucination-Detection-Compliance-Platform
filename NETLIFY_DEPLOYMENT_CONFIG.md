# Netlify Deployment Configuration

## ✅ Frontend Updates Complete

The frontend has been updated to automatically use the hosted backend URL:
- **Production (Netlify)**: `https://truthguard-ai-hallucination-detection.onrender.com`
- **Local Development**: `http://localhost:8000` (auto-detected)

## 🔧 Required Configuration

### 1. Netlify Environment Variables

Go to **Netlify Dashboard → Site Settings → Environment Variables** and add:

```
NEXT_PUBLIC_API_URL=https://truthguard-ai-hallucination-detection.onrender.com
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

**Note:** The `NEXT_PUBLIC_API_URL` is already set in `netlify.toml`, but you can override it here if needed.

### 2. Backend CORS Configuration (Render) - **CRITICAL**

Go to **Render Dashboard → Your Service → Environment** and add:

```
CORS_ORIGINS=http://localhost:3000,https://truthguard-ai-hallucination-detector.netlify.app
```

**IMPORTANT:** After adding the environment variable:
1. **Save the environment variable**
2. **Redeploy/Restart your backend service** on Render
3. The backend must restart for CORS changes to take effect

This allows requests from:
- Local development (`localhost:3000`)
- Production Netlify site (`truthguard-ai-hallucination-detector.netlify.app`)

**Verify CORS is working:**
Visit: `https://truthguard-ai-hallucination-detection.onrender.com/cors-test`
You should see the allowed origins listed.

### 3. How It Works

**Frontend (`lib/api-client.ts`):**
- Checks `NEXT_PUBLIC_API_URL` environment variable first
- If not set, detects if running on `localhost` → uses `http://localhost:8000`
- Otherwise uses hosted backend: `https://truthguard-ai-hallucination-detection.onrender.com`

**Backend (`app/main.py`):**
- Reads `CORS_ORIGINS` from environment variable
- Defaults to: `http://localhost:3000,https://truthguard-ai-hallucination-detector.netlify.app`
- Allows all methods and headers

## 🧪 Testing

### Local Development
1. Start backend: `cd backend && uvicorn app.main:app --reload`
2. Start frontend: `cd frontend && npm run dev`
3. Frontend will automatically use `http://localhost:8000`

### Production (Netlify)
1. Deploy to Netlify
2. Set environment variables in Netlify dashboard
3. Set `CORS_ORIGINS` in Render backend
4. Frontend will automatically use `https://truthguard-ai-hallucination-detection.onrender.com`

## 📝 Files Updated

1. **`frontend/lib/api-client.ts`**
   - Smart URL detection (local vs production)
   - Automatic fallback to hosted backend

2. **`frontend/netlify.toml`**
   - Added `NEXT_PUBLIC_API_URL` in build environment

3. **`backend/app/main.py`**
   - CORS now reads from `CORS_ORIGINS` environment variable
   - Supports multiple origins (comma-separated)

## ✅ Verification

After deployment, check:
1. ✅ Frontend loads without CORS errors
2. ✅ API calls work from Netlify to Render backend
3. ✅ Dashboard loads data successfully
4. ✅ No console errors about API URL

---

**Next Steps:**
1. Set `CORS_ORIGINS` in Render backend environment
2. Redeploy backend (if needed) to apply CORS changes
3. Deploy frontend to Netlify
4. Test the deployed site

