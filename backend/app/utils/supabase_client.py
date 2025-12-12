"""
Supabase Database Client Utility
Handles connection to Supabase PostgreSQL database
"""
from supabase import create_client, Client
from app.config import settings
import logging

# Set up logging
logger = logging.getLogger(__name__)

# Initialize Supabase client
supabase: Client | None = None

def get_supabase_client() -> Client:
    """
    Get or create Supabase client instance
    Returns singleton client instance
    """
    global supabase
    
    if supabase is None:
        try:
            # Validate environment variables
            if not settings.SUPABASE_URL:
                raise ValueError("SUPABASE_URL is not set in environment variables")
            if not settings.SUPABASE_SERVICE_ROLE_KEY:
                raise ValueError("SUPABASE_SERVICE_ROLE_KEY is not set in environment variables")
            
            # Create Supabase client
            supabase = create_client(
                settings.SUPABASE_URL,
                settings.SUPABASE_SERVICE_ROLE_KEY
            )
            
            logger.info("✅ Supabase client created successfully")
            print("✅ Supabase client created successfully")
            
            return supabase
            
        except Exception as e:
            logger.error(f"❌ Failed to create Supabase client: {str(e)}")
            print(f"❌ Failed to create Supabase client: {str(e)}")
            raise
    
    return supabase

def test_connection() -> dict:
    """
    Test database connection by querying a simple table
    Returns connection status and test result
    """
    try:
        client = get_supabase_client()
        
        # Test connection by querying organizations table
        result = client.table('organizations').select('id').limit(1).execute()
        
        logger.info("✅ Database connection test successful")
        print("✅ Database connection test successful")
        
        return {
            "status": "connected",
            "message": "Successfully connected to Supabase database",
            "tables_accessible": True,
            "test_query": "organizations table accessible"
        }
        
    except Exception as e:
        logger.error(f"❌ Database connection test failed: {str(e)}")
        print(f"❌ Database connection test failed: {str(e)}")
        
        return {
            "status": "error",
            "message": f"Failed to connect to database: {str(e)}",
            "tables_accessible": False,
            "error": str(e)
        }

