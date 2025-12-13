"""
AI Response Generation Service
Uses Google Gemini Pro to generate company-specific AI responses
"""
import google.generativeai as genai
import logging
from typing import Dict, Any, Optional
from app.config import settings
import os
from dotenv import load_dotenv
from pathlib import Path

# Initialize logger first
logger = logging.getLogger(__name__)

# Load environment variables - try backend/.env first, then root .env
# __file__ is: backend/app/services/ai_generation.py
# backend/.env is: backend/.env (parent.parent.parent)
backend_env = Path(__file__).parent.parent.parent / ".env"
# root .env is: .env (parent.parent.parent.parent)
root_env = Path(__file__).parent.parent.parent.parent / ".env"

if backend_env.exists():
    load_dotenv(backend_env)
    logger.debug(f"Loaded .env from: {backend_env}")
elif root_env.exists():
    load_dotenv(root_env)
    logger.debug(f"Loaded .env from: {root_env}")
else:
    load_dotenv()  # Try default locations
    logger.warning("Using default .env location")

class AIGenerationService:
    """
    Service for generating AI responses using Google Gemini Pro
    """
    
    def __init__(self):
        """Initialize Gemini API client"""
        # Try multiple sources for API key
        self.api_key = (
            os.getenv("GEMINI_API_KEY") or 
            (settings.GEMINI_API_KEY if hasattr(settings, 'GEMINI_API_KEY') and settings.GEMINI_API_KEY else None)
        )
        self.model = None
        self.enabled = False
        
        if self.api_key:
            try:
                genai.configure(api_key=self.api_key)
                # Use actual available model names (with models/ prefix)
                # Based on list_models() output, these are the available models
                model_names = [
                    'models/gemini-2.5-flash',  # Fast, recommended
                    'models/gemini-2.5-pro',    # More powerful
                    'models/gemini-pro-latest', # Alias for latest pro
                    'models/gemini-flash-latest' # Alias for latest flash
                ]
                self.model = None
                self._current_model_name = None
                
                # Try to create model instances (don't test immediately - let actual calls handle errors)
                for model_name in model_names:
                    try:
                        # Create model instance - this doesn't make API calls yet
                        self.model = genai.GenerativeModel(model_name)
                        self._current_model_name = model_name
                        logger.info(f"✅ Gemini API configured with model: {model_name}")
                        break
                    except Exception as model_error:
                        logger.debug(f"Model {model_name} not available: {str(model_error)}")
                        continue
                
                if self.model:
                    self.enabled = True
                    logger.info(f"✅ Gemini API initialized successfully with model: {self._current_model_name}")
                else:
                    logger.error("❌ No available Gemini models found. Tried: models/gemini-2.5-flash, models/gemini-2.5-pro, etc.")
                    self.enabled = False
            except Exception as e:
                logger.error(f"❌ Failed to initialize Gemini API: {str(e)}")
                self.enabled = False
        else:
            logger.warning("⚠️  Gemini API key not configured - AI generation disabled")
            logger.info(f"GEMINI_API_KEY from env: {os.getenv('GEMINI_API_KEY', 'NOT SET')}")
            logger.info(f"GEMINI_API_KEY from settings: {getattr(settings, 'GEMINI_API_KEY', 'NOT SET')}")
    
    async def generate_company_response(
        self,
        company_name: str,
        company_context: Dict[str, Any],
        user_query: str,
        industry: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Generate AI response for a company-specific query
        
        Args:
            company_name: Name of the company (e.g., "American Express")
            company_context: Company policies, rules, products
            user_query: User's question/query
            industry: Industry type (financial_services, airline, etc.)
        
        Returns:
            Dict with:
                - 'response': Generated AI response text
                - 'model': Model used ('gemini-pro')
                - 'success': Boolean indicating success
                - 'error': Error message if failed
        """
        if not self.enabled:
            return {
                'error': 'AI generation not enabled - API key missing',
                'response': None,
                'success': False,
                'model': None
            }
        
        if not self.model:
            return {
                'error': 'Gemini model not initialized',
                'response': None,
                'success': False,
                'model': None
            }
        
        try:
            # Build company-specific prompt
            prompt = self._build_company_prompt(
                company_name=company_name,
                context=company_context,
                query=user_query,
                industry=industry
            )
            
            logger.info(f"Generating AI response for {company_name} query: {user_query[:50]}...")
            
            # Generate response
            response = self.model.generate_content(
                prompt,
                generation_config={
                    "temperature": 0.7,  # Balanced creativity (0.0-1.0)
                    "top_p": 0.8,  # Nucleus sampling
                    "max_output_tokens": 2048,  # Increased for complete responses
                }
            )
            
            # Extract full response text
            # Gemini API returns response with candidates[0].content.parts[0].text
            ai_response = ""
            try:
                if hasattr(response, 'text'):
                    # Direct text attribute (most common)
                    ai_response = response.text.strip()
                elif hasattr(response, 'candidates') and len(response.candidates) > 0:
                    # Extract from candidates (standard Gemini format)
                    candidate = response.candidates[0]
                    if hasattr(candidate, 'content') and hasattr(candidate.content, 'parts'):
                        # Extract text from all parts
                        parts_text = []
                        for part in candidate.content.parts:
                            if hasattr(part, 'text') and part.text:
                                parts_text.append(part.text)
                        ai_response = "".join(parts_text).strip()
                    elif hasattr(candidate, 'text'):
                        ai_response = candidate.text.strip()
                elif hasattr(response, 'parts'):
                    # Direct parts attribute
                    parts_text = []
                    for part in response.parts:
                        if hasattr(part, 'text') and part.text:
                            parts_text.append(part.text)
                    ai_response = "".join(parts_text).strip()
                else:
                    # Fallback: try to convert to string
                    ai_response = str(response).strip()
                    logger.warning(f"Unexpected response format, using string conversion")
            except Exception as extract_error:
                logger.error(f"Error extracting response text: {str(extract_error)}")
                # Last resort: convert entire response to string
                ai_response = str(response).strip()
            
            # Log full response for debugging
            logger.info(f"✅ Generated response ({len(ai_response)} chars)")
            logger.debug(f"Full response preview: {ai_response[:200]}...")
            
            # Check if response seems incomplete (ends mid-sentence)
            if len(ai_response) < 50:
                logger.warning(f"⚠️ Response seems very short ({len(ai_response)} chars)")
            elif not ai_response.endswith(('.', '!', '?', ':', ';')):
                # Check if it ends mid-sentence (might be truncated)
                last_sentence = ai_response.split('.')[-1] if '.' in ai_response else ai_response
                if len(last_sentence) > 100:  # Long last sentence might indicate truncation
                    logger.warning(f"⚠️ Response might be truncated (ends with long sentence)")
            
            # Get the actual model name being used (stored during initialization)
            model_name = getattr(self, '_current_model_name', 'models/gemini-2.5-flash')
            
            return {
                'response': ai_response,
                'model': model_name,
                'success': True,
                'error': None
            }
            
        except Exception as e:
            error_msg = str(e)
            logger.error(f"❌ Error generating AI response: {error_msg}")
            return {
                'error': error_msg,
                'response': None,
                'success': False,
                'model': getattr(self, '_current_model_name', 'models/gemini-2.5-flash')
            }
    
    def _build_company_prompt(
        self,
        company_name: str,
        context: Dict[str, Any],
        query: str,
        industry: Optional[str] = None
    ) -> str:
        """
        Build company-specific prompt for Gemini
        
        Args:
            company_name: Name of the company
            context: Company context (policies, rules, products)
            query: User's query
            industry: Industry type
        
        Returns:
            Formatted prompt string
        """
        # Format company policies
        policies = context.get('policies', [])
        policies_text = ""
        if policies:
            policies_list = []
            for policy in policies[:5]:  # Limit to first 5 policies
                policy_name = policy.get('policy_name', policy.get('name', 'Policy'))
                policy_content = policy.get('policy_content', policy.get('content', ''))
                # Truncate long policies
                content_preview = policy_content[:200] + "..." if len(policy_content) > 200 else policy_content
                policies_list.append(f"- {policy_name}: {content_preview}")
            policies_text = "\n".join(policies_list)
        else:
            policies_text = "No specific policies provided."
        
        # Format compliance rules
        rules = context.get('compliance_rules', [])
        rules_text = ""
        if rules:
            rules_list = []
            for rule in rules[:5]:  # Limit to first 5 rules
                rule_name = rule.get('rule_name', rule.get('name', 'Rule'))
                rule_desc = rule.get('description', '')
                rules_list.append(f"- {rule_name}: {rule_desc}")
            rules_text = "\n".join(rules_list)
        else:
            rules_text = "No specific compliance rules provided."
        
        # Format products/services
        products = context.get('products', [])
        products_text = ", ".join(products) if products else "General services"
        
        # Build the prompt
        prompt = f"""You are a customer service agent for {company_name}.

COMPANY INFORMATION:
Industry: {industry or 'General'}
Products/Services: {products_text}

COMPANY POLICIES:
{policies_text}

COMPLIANCE RULES:
{rules_text}

USER QUERY:
{query}

INSTRUCTIONS:
1. Answer the user's query accurately and helpfully
2. Follow company policies strictly - do not violate them
3. Include required compliance disclaimers when needed (especially for financial/legal advice)
4. Be professional, courteous, and clear
5. If you're unsure about something, say so rather than guessing or making up information
6. Do NOT make promises that violate company policies
7. Do NOT provide information you're not certain about
8. If the query is about investments, financial advice, or legal matters, include appropriate disclaimers

Provide your response:"""
        
        return prompt
    
    def is_enabled(self) -> bool:
        """Check if AI generation is enabled"""
        return self.enabled

