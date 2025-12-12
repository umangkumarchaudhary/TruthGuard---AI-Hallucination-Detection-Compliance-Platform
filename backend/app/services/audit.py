"""
Comprehensive Audit Logging Service
Logs all interactions, violations, and user actions for regulatory compliance
"""
import logging
from typing import Dict, Any, List, Optional
from datetime import datetime
import uuid
from app.utils.supabase_client import get_supabase_client

logger = logging.getLogger(__name__)

class AuditLogger:
    """Comprehensive audit logging for regulatory compliance"""
    
    @staticmethod
    async def log_interaction(
        organization_id: str,
        query: str,
        ai_response: str,
        validated_response: Optional[str],
        status: str,
        confidence_score: float,
        ai_model: str,
        session_id: Optional[str] = None,
        detection_result: Optional[Dict[str, Any]] = None,
        explanation: Optional[str] = None
    ) -> str:
        """
        Log a complete AI interaction with all context
        
        Args:
            organization_id: Organization identifier
            query: User's original query
            ai_response: Original AI response
            validated_response: Corrected/validated response (if any)
            status: approved, flagged, blocked, corrected
            confidence_score: Detection confidence (0-1)
            ai_model: AI model identifier
            session_id: Optional session ID
            detection_result: Full detection result dictionary
            explanation: Human-readable explanation
            
        Returns:
            interaction_id: UUID of logged interaction
        """
        try:
            supabase = get_supabase_client()
            interaction_id = str(uuid.uuid4())
            
            # Prepare interaction data
            interaction_data = {
                'id': interaction_id,
                'organization_id': organization_id,
                'user_query': query,
                'ai_response': ai_response,
                'validated_response': validated_response,
                'status': status,
                'confidence_score': confidence_score,
                'ai_model': ai_model,
                'session_id': session_id,
                'timestamp': datetime.utcnow().isoformat()
            }
            
            # Insert into database
            result = supabase.table('ai_interactions').insert(interaction_data).execute()
            
            if not result.data:
                logger.error(f"Failed to log interaction {interaction_id}")
                return ""
            
            logger.info(f"✅ Logged interaction {interaction_id} for organization {organization_id}")
            
            # Log related data if provided
            if detection_result:
                # Log violations
                if detection_result.get('violations'):
                    await AuditLogger.log_violations(interaction_id, detection_result['violations'])
                
                # Log verification results
                if detection_result.get('verification_results'):
                    await AuditLogger.log_verification_results(interaction_id, detection_result['verification_results'])
                
                # Log citations
                if detection_result.get('citations'):
                    await AuditLogger.log_citations(interaction_id, detection_result['citations'])
            
            return interaction_id
            
        except Exception as e:
            logger.error(f"❌ Error logging interaction: {str(e)}")
            return ""
    
    @staticmethod
    async def log_violations(
        interaction_id: str,
        violations: List[Dict[str, Any]],
        rule_id: Optional[str] = None,
        policy_id: Optional[str] = None
    ) -> None:
        """
        Log violations detected in an interaction
        
        Args:
            interaction_id: Interaction UUID
            violations: List of violation dictionaries
            rule_id: Optional compliance rule ID
            policy_id: Optional policy ID
        """
        try:
            supabase = get_supabase_client()
            
            for violation in violations:
                violation_data = {
                    'id': str(uuid.uuid4()),
                    'interaction_id': interaction_id,
                    'violation_type': violation.get('type', 'unknown'),
                    'severity': violation.get('severity', 'medium'),
                    'description': violation.get('description', ''),
                    'rule_id': rule_id or violation.get('rule_id'),
                    'policy_id': policy_id or violation.get('policy_id'),
                    'detected_at': datetime.utcnow().isoformat()
                }
                
                supabase.table('violations').insert(violation_data).execute()
            
            logger.info(f"✅ Logged {len(violations)} violations for interaction {interaction_id}")
            
        except Exception as e:
            logger.error(f"❌ Error logging violations: {str(e)}")
    
    @staticmethod
    async def log_verification_results(
        interaction_id: str,
        verification_results: List[Dict[str, Any]]
    ) -> None:
        """
        Log fact verification results
        
        Args:
            interaction_id: Interaction UUID
            verification_results: List of verification result dictionaries
        """
        try:
            supabase = get_supabase_client()
            
            for verification in verification_results:
                verification_data = {
                    'id': str(uuid.uuid4()),
                    'interaction_id': interaction_id,
                    'claim_text': verification.get('claim_text', ''),
                    'verification_status': verification.get('verification_status', 'unverified'),
                    'source': verification.get('source'),
                    'confidence': verification.get('confidence', 0.0),
                    'created_at': datetime.utcnow().isoformat()
                }
                
                supabase.table('verification_results').insert(verification_data).execute()
            
            logger.info(f"✅ Logged {len(verification_results)} verification results for interaction {interaction_id}")
            
        except Exception as e:
            logger.error(f"❌ Error logging verification results: {str(e)}")
    
    @staticmethod
    async def log_citations(
        interaction_id: str,
        citations: List[Dict[str, Any]]
    ) -> None:
        """
        Log citation verification results
        
        Args:
            interaction_id: Interaction UUID
            citations: List of citation dictionaries
        """
        try:
            supabase = get_supabase_client()
            
            for citation in citations:
                citation_data = {
                    'id': str(uuid.uuid4()),
                    'interaction_id': interaction_id,
                    'url': citation.get('url', ''),
                    'is_valid': citation.get('is_valid', False),
                    'content_match': citation.get('content_match'),
                    'http_status_code': citation.get('http_status_code'),
                    'error_message': citation.get('error_message'),
                    'verified_at': datetime.utcnow().isoformat()
                }
                
                supabase.table('citations').insert(citation_data).execute()
            
            logger.info(f"✅ Logged {len(citations)} citations for interaction {interaction_id}")
            
        except Exception as e:
            logger.error(f"❌ Error logging citations: {str(e)}")
    
    @staticmethod
    async def log_user_action(
        user_id: str,
        organization_id: str,
        action_type: str,
        resource_type: str,
        resource_id: Optional[str] = None,
        details: Optional[Dict[str, Any]] = None
    ) -> None:
        """
        Log user actions (policy changes, rule updates, etc.)
        
        Args:
            user_id: User UUID
            organization_id: Organization UUID
            action_type: create, update, delete, view, export
            resource_type: policy, compliance_rule, interaction, etc.
            resource_id: Optional resource identifier
            details: Optional additional details
        """
        try:
            # For now, we'll log to a simple audit log
            # In production, you might want a dedicated user_actions table
            logger.info(
                f"User Action: {user_id} | {action_type} | {resource_type} | "
                f"Organization: {organization_id} | Resource: {resource_id} | Details: {details}"
            )
            
            # TODO: Create user_actions table if needed for full audit trail
            # For MVP, logging to console/file is sufficient
            
        except Exception as e:
            logger.error(f"❌ Error logging user action: {str(e)}")
    
    @staticmethod
    async def get_interaction_audit_trail(interaction_id: str) -> Dict[str, Any]:
        """
        Get complete audit trail for an interaction
        
        Args:
            interaction_id: Interaction UUID
            
        Returns:
            Complete audit trail with interaction, violations, verifications, citations
        """
        try:
            supabase = get_supabase_client()
            
            # Get interaction
            interaction_result = supabase.table('ai_interactions').select('*').eq('id', interaction_id).execute()
            if not interaction_result.data:
                return {}
            
            interaction = interaction_result.data[0]
            
            # Get violations
            violations_result = supabase.table('violations').select('*').eq('interaction_id', interaction_id).execute()
            violations = violations_result.data if violations_result.data else []
            
            # Get verification results
            verifications_result = supabase.table('verification_results').select('*').eq('interaction_id', interaction_id).execute()
            verifications = verifications_result.data if verifications_result.data else []
            
            # Get citations
            citations_result = supabase.table('citations').select('*').eq('interaction_id', interaction_id).execute()
            citations = citations_result.data if citations_result.data else []
            
            return {
                'interaction': interaction,
                'violations': violations,
                'verification_results': verifications,
                'citations': citations,
                'timestamp': datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            logger.error(f"❌ Error getting audit trail: {str(e)}")
            return {}

