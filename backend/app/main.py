from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
import logging
from dotenv import load_dotenv
from pathlib import Path

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Load environment variables
# Try to load from backend/.env first, then fallback to root .env
backend_env = Path(__file__).parent.parent / ".env"
root_env = Path(__file__).parent.parent.parent / ".env"

if backend_env.exists():
    load_dotenv(backend_env)
    logger.info(f"✅ Loaded .env from: {backend_env}")
    print(f"✅ Loaded .env from: {backend_env}")
elif root_env.exists():
    load_dotenv(root_env)
    logger.info(f"✅ Loaded .env from: {root_env}")
    print(f"✅ Loaded .env from: {root_env}")
else:
    load_dotenv()  # Try default locations
    logger.warning("⚠️ No .env file found, using system environment variables")

app = FastAPI(
    title="TruthGuard API",
    description="AI Hallucination Detection & Compliance Platform",
    version="1.0.0"
)

# CORS middleware
# Get allowed origins from environment or use defaults
allowed_origins = os.getenv(
    "CORS_ORIGINS",
    "http://localhost:3000,https://truthguard-ai-hallucination-detector.netlify.app"
).split(",")

# Clean up origins (remove whitespace)
allowed_origins = [origin.strip() for origin in allowed_origins if origin.strip()]

logger.info(f"🌐 CORS allowed origins: {allowed_origins}")

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Import database utilities after app creation
from app.utils.supabase_client import get_supabase_client, test_connection
from app.api.v1 import router as v1_router

@app.on_event("startup")
async def startup_event():
    """Initialize database connection on startup"""
    logger.info("🚀 Starting TruthGuard API...")
    print("🚀 Starting TruthGuard API...")
    
    try:
        # Test database connection on startup
        connection_result = test_connection()
        if connection_result["status"] == "connected":
            logger.info("✅ Database connection established on startup")
            print("✅ Database connection established on startup")
        else:
            logger.warning(f"⚠️ Database connection issue: {connection_result.get('message')}")
            print(f"⚠️ Database connection issue: {connection_result.get('message')}")
    except Exception as e:
        logger.error(f"❌ Failed to initialize database connection: {str(e)}")
        print(f"❌ Failed to initialize database connection: {str(e)}")

@app.get("/")
async def root():
    return {
        "message": "TruthGuard API",
        "status": "running",
        "version": "1.0.0"
    }

@app.get("/health")
async def health():
    return {"status": "healthy"}

@app.get("/test-db")
async def test_db():
    """
    Test database connection endpoint
    Returns connection status and test results
    """
    result = test_connection()
    return result

# Include API v1 router
app.include_router(v1_router)

