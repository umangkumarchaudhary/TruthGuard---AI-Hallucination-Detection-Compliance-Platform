"""
List available Gemini models to find the correct model name
"""
import os
import sys
from pathlib import Path
from dotenv import load_dotenv
import google.generativeai as genai

# Load .env
backend_env = Path(__file__).parent.parent / ".env"
if backend_env.exists():
    load_dotenv(backend_env)

api_key = os.getenv("GEMINI_API_KEY")
if not api_key:
    print("ERROR: GEMINI_API_KEY not found in .env")
    sys.exit(1)

print(f"OK: API Key found: {api_key[:10]}...")

try:
    genai.configure(api_key=api_key)
    
    # Try to list models
    print("\nAttempting to list available models...")
    try:
        models = genai.list_models()
        print("\nAvailable models:")
        for model in models:
            if 'generateContent' in model.supported_generation_methods:
                print(f"  - {model.name}")
                print(f"    Display Name: {model.display_name}")
                print()
    except Exception as e:
        print(f"WARNING: Could not list models: {str(e)}")
        print("\nTrying common model names directly...")
        
        # Try common model names
        test_models = [
            'gemini-pro',
            'gemini-1.5-pro',
            'gemini-1.5-flash',
            'gemini-2.0-flash-exp',
            'models/gemini-pro',
            'models/gemini-1.5-pro',
        ]
        
        for model_name in test_models:
            try:
                model = genai.GenerativeModel(model_name)
                # Try a simple generation
                response = model.generate_content("Say hello", generation_config={"max_output_tokens": 5})
                print(f"OK: {model_name} - WORKS! Response: {response.text}")
            except Exception as e:
                print(f"FAILED: {model_name} - {str(e)[:100]}")
                
except Exception as e:
    print(f"ERROR: {str(e)}")

