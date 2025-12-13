# ⚡ Quick Start: Gemini Pro Integration

## 🚀 5-Minute Setup

### Step 1: Add API Key to .env

```bash
cd backend
```

Open `backend/.env` (create if it doesn't exist) and add:

```env
GEMINI_API_KEY=AIzaSyBqcOpysqlk_wcyUZJJbBS4IY5syq8kshI
```

### Step 2: Install SDK

```bash
pip install google-generativeai
```

Or:

```bash
pip install -r requirements.txt
```

### Step 3: Test It

```bash
python scripts/setup_gemini.py test
```

Expected output:
```
✅ Gemini API working!
   Response: Hello from Gemini
```

### Step 4: Verify .env is Ignored

```bash
# Check .gitignore
cat .gitignore | grep .env
```

Should show `.env` - if not, your key might be committed!

---

## ✅ That's It!

Your Gemini Pro API is now configured. 

**Next Steps:**
- Read `GEMINI_PRO_SETUP.md` for detailed setup
- Read `GEMINI_WORKFLOW_PLAN.md` for implementation plan
- Start implementing the services

---

## 🔒 Security Reminder

⚠️ **Never commit your API key to git!**

- ✅ `.env` is already in `.gitignore`
- ✅ Key is stored in `.env` file
- ❌ Don't add key to code files
- ❌ Don't commit `.env` file

---

## 🧪 Quick Test

Test the API works:

```python
import google.generativeai as genai
import os
from dotenv import load_dotenv

load_dotenv()

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
model = genai.GenerativeModel('gemini-pro')
response = model.generate_content("Hello!")
print(response.text)
```

---

**Status**: ✅ **Ready to Use!**

