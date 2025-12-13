"""
Setup script for Gemini Pro API
Helps configure and test Gemini Pro API key
"""
import os
import sys
from pathlib import Path

def setup_gemini_key():
    """Setup Gemini API key in .env file"""
    
    backend_dir = Path(__file__).parent.parent
    env_file = backend_dir / ".env"
    
    print("🔧 Gemini Pro API Setup")
    print("=" * 50)
    
    # Check if .env exists
    if not env_file.exists():
        print(f"📝 Creating .env file at {env_file}")
        env_file.touch()
    
    # Read existing .env
    env_content = env_file.read_text() if env_file.exists() else ""
    
    # Check if key already exists
    if "GEMINI_API_KEY" in env_content:
        print("⚠️  GEMINI_API_KEY already exists in .env")
        response = input("Do you want to update it? (y/n): ")
        if response.lower() != 'y':
            print("✅ Keeping existing key")
            return
        
        # Remove old key
        lines = env_content.split('\n')
        lines = [line for line in lines if not line.startswith('GEMINI_API_KEY')]
        env_content = '\n'.join(lines)
    
    # Get API key
    print("\n📋 Enter your Gemini Pro API key:")
    print("   (You can find it at: https://makersuite.google.com/app/apikey)")
    api_key = input("API Key: ").strip()
    
    if not api_key:
        print("❌ API key cannot be empty")
        return
    
    # Add key to .env
    if env_content and not env_content.endswith('\n'):
        env_content += '\n'
    
    env_content += f"\n# Google Gemini Pro API\n"
    env_content += f"GEMINI_API_KEY={api_key}\n"
    
    # Write to file
    env_file.write_text(env_content)
    print(f"\n✅ API key saved to {env_file}")
    print("⚠️  Make sure .env is in .gitignore (it should be)")
    
    # Test the key
    print("\n🧪 Testing API key...")
    test_gemini_key(api_key)

def test_gemini_key(api_key: str = None):
    """Test if Gemini API key works"""
    
    if not api_key:
        # Try to load from .env
        backend_dir = Path(__file__).parent.parent
        env_file = backend_dir / ".env"
        
        if env_file.exists():
            env_content = env_file.read_text()
            for line in env_content.split('\n'):
                if line.startswith('GEMINI_API_KEY='):
                    api_key = line.split('=', 1)[1].strip()
                    break
    
    if not api_key:
        print("❌ No API key found. Run setup first.")
        return False
    
    try:
        import google.generativeai as genai
        
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel('gemini-pro')
        
        print("   Sending test request...")
        response = model.generate_content("Say 'Hello from Gemini' in one sentence.")
        
        print(f"✅ Gemini API working!")
        print(f"   Response: {response.text}")
        return True
        
    except ImportError:
        print("❌ google-generativeai not installed")
        print("   Install it: pip install google-generativeai")
        return False
    except Exception as e:
        print(f"❌ API test failed: {str(e)}")
        print("   Check your API key is correct")
        return False

if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] == "test":
        test_gemini_key()
    else:
        setup_gemini_key()

