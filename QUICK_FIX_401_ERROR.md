# 🔧 Quick Fix: 401 Unauthorized Error

## What API Key Is Being Asked For?

The system is asking for a **TruthGuard API Key** - this is NOT your Supabase keys. It's a custom API key for authenticating requests to the TruthGuard backend API.

---

## ✅ Solution: Enable Development Bypass (Easiest)

**Add this line to `backend/.env`:**

```env
DEV_BYPASS_AUTH=true
```

**Steps:**
1. Open `backend/.env` file
2. Add this line at the end: `DEV_BYPASS_AUTH=true`
3. Save the file
4. **Restart your backend server** (stop and start `uvicorn`)

After restarting, the 401 errors will disappear! 🎉

---

## 🔑 Alternative: Create a Real API Key

If you want to test with real API keys:

1. **Create a test API key:**
   ```bash
   cd backend
   python scripts/create_test_api_key.py
   ```

2. **Copy the API key** that's displayed

3. **Set it in browser console:**
   ```javascript
   localStorage.setItem('api_key', 'your-api-key-here')
   ```

4. **Refresh the page**

---

## 📝 What's Happening?

- **Frontend** → Makes API calls to `http://localhost:8000/api/v1/audit/...`
- **Backend** → Requires API key in `X-API-Key` header
- **Without API key** → Returns 401 Unauthorized
- **With `DEV_BYPASS_AUTH=true`** → Backend bypasses auth check for development

---

## ✅ Recommended: Use Development Bypass

For local development, just add `DEV_BYPASS_AUTH=true` to `backend/.env` and restart the server. This is the simplest solution!

