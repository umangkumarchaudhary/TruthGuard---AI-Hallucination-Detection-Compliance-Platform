"""
Company Context Service
Loads company-specific data for AI generation and validation
"""
from app.utils.supabase_client import get_supabase_client
from typing import Dict, Any, Optional, List
import logging

logger = logging.getLogger(__name__)

class CompanyContextService:
    """
    Service for loading company-specific context data
    """
    
    @staticmethod
    async def load_company_context(company_id: str) -> Dict[str, Any]:
        """
        Load all context for a company
        
        Args:
            company_id: Company/Organization UUID
        
        Returns:
            Dict with:
                - company_name: Name of the company
                - industry: Industry type
                - policies: List of company policies
                - compliance_rules: List of compliance rules
                - products: List of products/services
        """
        try:
            supabase = get_supabase_client()
            
            # Load company/organization info
            company_result = supabase.table('organizations').select('*').eq('id', company_id).execute()
            
            if not company_result.data:
                logger.warning(f"Company {company_id} not found in database")
                return CompanyContextService._get_default_context(company_id)
            
            company = company_result.data[0]
            company_name = company.get('name', 'Unknown Company')
            industry = company.get('industry', 'general')
            
            # Load company policies
            policies_result = supabase.table('company_policies').select('*').eq('organization_id', company_id).execute()
            policies = policies_result.data if policies_result.data else []
            
            # Load compliance rules
            rules_result = supabase.table('compliance_rules').select('*').eq('organization_id', company_id).execute()
            rules = rules_result.data if rules_result.data else []
            
            # Extract products from company data (if available)
            # For now, we'll use a default based on industry
            products = CompanyContextService._get_default_products(industry)
            
            logger.info(f"✅ Loaded context for {company_name}: {len(policies)} policies, {len(rules)} rules")
            
            return {
                'company_name': company_name,
                'industry': industry,
                'policies': policies,
                'compliance_rules': rules,
                'products': products,
            }
            
        except Exception as e:
            logger.error(f"❌ Error loading company context: {str(e)}")
            return CompanyContextService._get_default_context(company_id)
    
    @staticmethod
    def _get_default_context(company_id: str) -> Dict[str, Any]:
        """Return default context when company not found"""
        return {
            'company_name': 'Unknown Company',
            'industry': 'general',
            'policies': [],
            'compliance_rules': [],
            'products': [],
        }
    
    @staticmethod
    def _get_default_products(industry: str) -> List[str]:
        """Get default products based on industry"""
        industry_products = {
            'financial_services': ['Credit Cards', 'Banking Services', 'Investment Products'],
            'airline': ['Flight Booking', 'Travel Services', 'Loyalty Programs'],
            'consulting': ['Advisory Services', 'Audit Services', 'Tax Services'],
            'technology': ['Software Solutions', 'Cloud Services', 'Consulting'],
            'general': ['Products', 'Services']
        }
        
        return industry_products.get(industry, industry_products['general'])
    
    @staticmethod
    async def get_company_list() -> List[Dict[str, Any]]:
        """
        Get list of all companies/organizations
        
        Returns:
            List of companies with id, name, industry
        """
        try:
            supabase = get_supabase_client()
            result = supabase.table('organizations').select('id, name, industry').execute()
            
            companies = result.data if result.data else []
            return companies
            
        except Exception as e:
            logger.error(f"Error loading company list: {str(e)}")
            return []

