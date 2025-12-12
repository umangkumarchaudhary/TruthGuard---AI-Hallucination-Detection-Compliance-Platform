// Database Types
export interface Organization {
  id: string
  name: string
  industry?: string
  created_at: string
  updated_at: string
}

export interface User {
  id: string
  email: string
  organization_id: string
  role: 'admin' | 'compliance_officer' | 'viewer'
  full_name?: string
  created_at: string
}

export interface AIInteraction {
  id: string
  organization_id: string
  user_query: string
  ai_response: string
  validated_response?: string
  status: 'approved' | 'flagged' | 'blocked' | 'corrected'
  confidence_score?: number
  ai_model?: string
  session_id?: string
  timestamp: string
}

export interface Violation {
  id: string
  interaction_id: string
  violation_type: 'hallucination' | 'citation' | 'compliance' | 'policy'
  severity: 'low' | 'medium' | 'high' | 'critical'
  description: string
  detected_at: string
}

export interface ComplianceRule {
  id: string
  organization_id: string
  rule_type: 'regulatory' | 'policy' | 'custom'
  rule_name: string
  rule_definition: Record<string, any>
  industry?: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface CompanyPolicy {
  id: string
  organization_id: string
  policy_name: string
  policy_content: string
  category?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

