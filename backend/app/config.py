import os
from dotenv import load_dotenv
from pathlib import Path

# Try to load .env from backend folder first, then root
backend_env = Path(__file__).parent.parent / ".env"
root_env = Path(__file__).parent.parent.parent / ".env"

if backend_env.exists():
    load_dotenv(backend_env)
elif root_env.exists():
    load_dotenv(root_env)
else:
    load_dotenv()  # Try default locations

class Settings:
    # Supabase Configuration
    SUPABASE_URL: str = os.getenv("SUPABASE_URL", "")
    SUPABASE_SERVICE_ROLE_KEY: str = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")
    
    # Application Configuration
    ENVIRONMENT: str = os.getenv("NODE_ENV", "development")
    
    @property
    def is_development(self) -> bool:
        return self.ENVIRONMENT == "development"
    
    def validate(self) -> bool:
        """Validate that required environment variables are set"""
        if not self.SUPABASE_URL:
            print("❌ Error: SUPABASE_URL is not set")
            return False
        if not self.SUPABASE_SERVICE_ROLE_KEY:
            print("❌ Error: SUPABASE_SERVICE_ROLE_KEY is not set")
            return False
        return True

settings = Settings()

