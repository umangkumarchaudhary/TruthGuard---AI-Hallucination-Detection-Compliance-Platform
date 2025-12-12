# TruthGuard Backend

FastAPI backend for TruthGuard - AI Hallucination Detection & Compliance Platform

## Environment Variables

Create a `.env` file in the `backend/` folder with the following variables:

```env
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
NODE_ENV=development
PORT=8000
```

### Where to put .env file?

**Option 1 (Recommended):** Put `.env` in `backend/` folder
- ✅ Keeps backend config separate
- ✅ Better for deployment
- ✅ More secure

**Option 2:** Put `.env` in root folder
- ✅ Single file for all services
- ⚠️ Less organized
- The code will automatically find it in root if not found in backend/

## Setup

1. **Create virtual environment:**
   ```bash
   python -m venv venv
   venv\Scripts\activate  # Windows
   # or
   source venv/bin/activate  # Mac/Linux
   ```

2. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Create .env file:**
   ```bash
   cp .env.example .env
   # Edit .env with your Supabase credentials
   ```

4. **Run the server:**
   ```bash
   uvicorn app.main:app --reload
   ```

## Test Database Connection

Visit: http://localhost:8000/test-db

You should see:
```json
{
  "status": "connected",
  "message": "Successfully connected to Supabase database",
  "tables_accessible": true,
  "test_query": "organizations table accessible"
}
```

## API Endpoints

- `GET /` - API info
- `GET /health` - Health check
- `GET /test-db` - Test database connection
- `GET /docs` - Swagger UI documentation

