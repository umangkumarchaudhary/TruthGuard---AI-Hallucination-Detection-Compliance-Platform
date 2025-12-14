# CORS Error Fix Guide

## 🔴 Current Error

```
Access to fetch at 'https://truthguard-ai-hallucination-detection.onrender.com/api/v1/...' 
from origin 'https://truthguard-ai-hallucination-detector.netlify.app' 
has been blocked by CORS policy: Response to preflight request doesn't pass access control check: 
No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

## ✅ Solution Steps

### Step 1: Set CORS_ORIGINS on Render

1. Go to **Render Dashboard**
2. Select your backend service (`truthguard-ai-hallucination-detection`)
3. Go to **Environment** tab
4. Add new environment variable:

   **Key:** `CORS_ORIGINS`  
   **Value:** `http://localhost:3000,https://truthguard-ai-hallucination-detector.netlify.app`

5. **Click "Save Changes"**

### Step 2: Restart Backend Service

**CRITICAL:** After setting the environment variable, you MUST restart the service:

1. In Render Dashboard, go to **Manual Deploy** or **Settings**
2. Click **"Clear build cache & deploy"** or **"Restart"**
3. Wait for the service to restart (usually 1-2 minutes)

### Step 3: Verify CORS is Working

Test the CORS configuration:

1. Visit: `https://truthguard-ai-hallucination-detection.onrender.com/cors-test`
2. You should see:
   ```json
   {
     "message": "CORS is working!",
     "allowed_origins": [
       "http://localhost:3000",
       "https://truthguard-ai-hallucination-detector.netlify.app"
     ],
     "cors_origins_env": "http://localhost:3000,https://truthguard-ai-hallucination-detector.netlify.app"
   }
   ```

### Step 4: Test from Browser Console

Open browser console on your Netlify site and run:

```javascript
fetch('https://truthguard-ai-hallucination-detection.onrender.com/cors-test')
  .then(r => r.json())
  .then(console.log)
  .catch(console.error)
```

If CORS is working, you should see the response. If not, you'll see the CORS error.

## 🔍 Troubleshooting

### Issue: Still getting CORS errors after restart

**Check 1:** Verify environment variable is set
- Go to Render → Environment tab
- Confirm `CORS_ORIGINS` is listed

**Check 2:** Check backend logs
- Go to Render → Logs
- Look for: `🌐 CORS allowed origins: [...]`
- Should show your Netlify domain

**Check 3:** Verify exact domain match
- Make sure the domain in `CORS_ORIGINS` exactly matches your Netlify URL
- No trailing slashes
- Include `https://`
- Check for typos

### Issue: Backend not reading environment variable

**Solution:** The backend code reads `CORS_ORIGINS` from environment. If it's not working:
1. Make sure you saved the environment variable in Render
2. Make sure you restarted the service
3. Check Render logs to see what origins are being used

### Issue: Preflight (OPTIONS) requests failing

**Solution:** FastAPI's CORSMiddleware should handle OPTIONS automatically. If not:
1. Make sure `allow_methods` includes `"OPTIONS"`
2. Make sure middleware is added before routes

## 📝 Code Changes Made

### Backend (`backend/app/main.py`)

```python
# CORS middleware - reads from CORS_ORIGINS environment variable
cors_origins_env = os.getenv(
    "CORS_ORIGINS",
    "http://localhost:3000,https://truthguard-ai-hallucination-detector.netlify.app"
)

allowed_origins = [origin.strip() for origin in cors_origins_env.split(",") if origin.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allow_headers=["*"],
    expose_headers=["*"],
    max_age=3600,
)
```

### Frontend (`frontend/lib/api-client.ts`)

- Automatically uses hosted backend: `https://truthguard-ai-hallucination-detection.onrender.com`
- Falls back to localhost for local development

## ✅ Success Criteria

After following these steps:
- ✅ No CORS errors in browser console
- ✅ API calls from Netlify site work
- ✅ Dashboard loads data successfully
- ✅ `/cors-test` endpoint shows correct origins

---

**If you're still having issues after following these steps, check:**
1. Render service is running
2. Environment variable is saved
3. Service was restarted after adding env var
4. Backend logs show the correct CORS origins

