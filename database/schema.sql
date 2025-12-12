-- ============================================================================
-- TruthGuard Database Schema
-- AI Hallucination Detection & Compliance Platform
-- ============================================================================
-- 
-- This SQL file contains the complete database schema for TruthGuard.
-- You can copy and paste this entire file into Supabase SQL Editor.
-- 
-- Tables Created:
--   1. organizations       - Company/organization information
--   2. users               - User accounts linked to organizations
--   3. api_keys            - API keys for authentication
--   4. compliance_rules    - Regulatory and custom compliance rules
--   5. company_policies    - Company-specific policies
--   6. ai_interactions     - Log of all AI interactions
--   7. violations          - Detected violations from interactions
--   8. verification_results - Fact verification results
--   9. citations           - Citation/URL verification results
--
-- ============================================================================

-- Enable UUID extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- TABLE: organizations
-- Purpose: Stores company/organization information
-- ============================================================================
CREATE TABLE IF NOT EXISTS organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    industry TEXT, -- e.g., 'finance', 'airline', 'consulting', 'healthcare'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add comment to table
COMMENT ON TABLE organizations IS 'Stores company/organization information and metadata';

-- Add comments to columns
COMMENT ON COLUMN organizations.id IS 'Unique identifier for the organization';
COMMENT ON COLUMN organizations.name IS 'Organization/company name';
COMMENT ON COLUMN organizations.industry IS 'Industry type (finance, airline, consulting, etc.)';
COMMENT ON COLUMN organizations.created_at IS 'Timestamp when organization was created';
COMMENT ON COLUMN organizations.updated_at IS 'Timestamp when organization was last updated';

-- ============================================================================
-- TABLE: users
-- Purpose: User accounts linked to organizations with role-based access
-- Note: This extends Supabase auth.users table
-- ============================================================================
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'viewer', -- 'admin', 'compliance_officer', 'viewer'
    full_name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add comment to table
COMMENT ON TABLE users IS 'User accounts linked to organizations with role-based access control';

-- Add comments to columns
COMMENT ON COLUMN users.id IS 'References Supabase auth.users(id)';
COMMENT ON COLUMN users.email IS 'User email address (must be unique)';
COMMENT ON COLUMN users.organization_id IS 'Organization this user belongs to';
COMMENT ON COLUMN users.role IS 'User role: admin (full access), compliance_officer (compliance management), viewer (read-only)';
COMMENT ON COLUMN users.full_name IS 'User full name for display';

-- ============================================================================
-- TABLE: api_keys
-- Purpose: API keys for programmatic access to TruthGuard API
-- ============================================================================
CREATE TABLE IF NOT EXISTS api_keys (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    key_hash TEXT NOT NULL UNIQUE, -- Hashed API key (never store plain text)
    name TEXT NOT NULL, -- User-friendly name for the key
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE, -- NULL means never expires
    is_active BOOLEAN DEFAULT true,
    last_used_at TIMESTAMP WITH TIME ZONE
);

-- Add comment to table
COMMENT ON TABLE api_keys IS 'API keys for programmatic access to TruthGuard API endpoints';

-- Add comments to columns
COMMENT ON COLUMN api_keys.key_hash IS 'SHA-256 hash of the API key (never store plain text)';
COMMENT ON COLUMN api_keys.name IS 'User-friendly name to identify the key';
COMMENT ON COLUMN api_keys.expires_at IS 'Expiration timestamp (NULL = never expires)';
COMMENT ON COLUMN api_keys.is_active IS 'Whether the key is currently active';
COMMENT ON COLUMN api_keys.last_used_at IS 'Timestamp of last API call using this key';

-- ============================================================================
-- TABLE: compliance_rules
-- Purpose: Regulatory and custom compliance rules for AI responses
-- ============================================================================
CREATE TABLE IF NOT EXISTS compliance_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    rule_type TEXT NOT NULL, -- 'regulatory', 'policy', 'custom'
    rule_name TEXT NOT NULL,
    rule_definition JSONB NOT NULL, -- Flexible rule structure
    industry TEXT, -- Industry this rule applies to (NULL = all industries)
    severity TEXT NOT NULL DEFAULT 'medium', -- 'low', 'medium', 'high', 'critical'
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add comment to table
COMMENT ON TABLE compliance_rules IS 'Regulatory and custom compliance rules for validating AI responses';

-- Add comments to columns
COMMENT ON COLUMN compliance_rules.rule_type IS 'Type of rule: regulatory (EU AI Act, SEC), policy (company policy), custom (user-defined)';
COMMENT ON COLUMN compliance_rules.rule_name IS 'Human-readable name for the rule';
COMMENT ON COLUMN compliance_rules.rule_definition IS 'JSON structure defining the rule logic and conditions';
COMMENT ON COLUMN compliance_rules.industry IS 'Industry this rule applies to (NULL = all industries)';
COMMENT ON COLUMN compliance_rules.severity IS 'Severity level if rule is violated: low, medium, high, critical';
COMMENT ON COLUMN compliance_rules.is_active IS 'Whether this rule is currently active';

-- Example rule_definition structure:
-- {
--   "type": "keyword_match",
--   "keywords": ["guarantee", "always", "never fails"],
--   "action": "flag",
--   "message": "Avoid absolute statements in financial advice"
-- }

-- ============================================================================
-- TABLE: company_policies
-- Purpose: Company-specific policies that AI responses must align with
-- ============================================================================
CREATE TABLE IF NOT EXISTS company_policies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    policy_name TEXT NOT NULL,
    policy_content TEXT NOT NULL, -- Full policy text
    category TEXT, -- e.g., 'refund', 'pricing', 'terms', 'support'
    priority INTEGER DEFAULT 0, -- Higher priority = checked first
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add comment to table
COMMENT ON TABLE company_policies IS 'Company-specific policies that AI responses must align with';

-- Add comments to columns
COMMENT ON COLUMN company_policies.policy_name IS 'Short name/title of the policy';
COMMENT ON COLUMN company_policies.policy_content IS 'Full text content of the policy';
COMMENT ON COLUMN company_policies.category IS 'Policy category for organization (refund, pricing, terms, support, etc.)';
COMMENT ON COLUMN company_policies.priority IS 'Priority level (higher = checked first, default 0)';
COMMENT ON COLUMN company_policies.is_active IS 'Whether this policy is currently active';

-- ============================================================================
-- TABLE: ai_interactions
-- Purpose: Log of all AI interactions and their validation results
-- ============================================================================
CREATE TABLE IF NOT EXISTS ai_interactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_query TEXT NOT NULL, -- Original user query/question
    ai_response TEXT NOT NULL, -- Original AI system response
    validated_response TEXT, -- Corrected/validated response (if flagged)
    status TEXT NOT NULL, -- 'approved', 'flagged', 'blocked', 'corrected'
    confidence_score FLOAT, -- 0.0 to 1.0 (0-100%)
    ai_model TEXT, -- e.g., 'gpt-4', 'claude-3', 'custom-model'
    session_id TEXT, -- For grouping related interactions
    processing_time_ms INTEGER, -- Time taken to process (milliseconds)
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add comment to table
COMMENT ON TABLE ai_interactions IS 'Log of all AI interactions and their validation results';

-- Add comments to columns
COMMENT ON COLUMN ai_interactions.user_query IS 'Original user question/query';
COMMENT ON COLUMN ai_interactions.ai_response IS 'Original response from the AI system';
COMMENT ON COLUMN ai_interactions.validated_response IS 'Corrected/validated response if original was flagged or blocked';
COMMENT ON COLUMN ai_interactions.status IS 'Validation status: approved (passed), flagged (needs review), blocked (rejected), corrected (auto-fixed)';
COMMENT ON COLUMN ai_interactions.confidence_score IS 'Confidence score from 0.0 to 1.0 (0% to 100%)';
COMMENT ON COLUMN ai_interactions.ai_model IS 'AI model identifier (gpt-4, claude-3, custom-model, etc.)';
COMMENT ON COLUMN ai_interactions.session_id IS 'Session identifier for grouping related interactions';
COMMENT ON COLUMN ai_interactions.processing_time_ms IS 'Time taken to process validation in milliseconds';

-- ============================================================================
-- TABLE: violations
-- Purpose: Detected violations from AI interactions
-- ============================================================================
CREATE TABLE IF NOT EXISTS violations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    interaction_id UUID NOT NULL REFERENCES ai_interactions(id) ON DELETE CASCADE,
    violation_type TEXT NOT NULL, -- 'hallucination', 'citation', 'compliance', 'policy'
    severity TEXT NOT NULL, -- 'low', 'medium', 'high', 'critical'
    description TEXT NOT NULL, -- Human-readable description of violation
    rule_id UUID REFERENCES compliance_rules(id) ON DELETE SET NULL, -- If violation is from a rule
    policy_id UUID REFERENCES company_policies(id) ON DELETE SET NULL, -- If violation is from a policy
    detected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add comment to table
COMMENT ON TABLE violations IS 'Detected violations from AI interactions';

-- Add comments to columns
COMMENT ON COLUMN violations.interaction_id IS 'The AI interaction that triggered this violation';
COMMENT ON COLUMN violations.violation_type IS 'Type of violation: hallucination (false facts), citation (fake/invalid citations), compliance (regulatory violation), policy (policy misalignment)';
COMMENT ON COLUMN violations.severity IS 'Severity level: low (minor issue), medium (moderate issue), high (serious issue), critical (must block)';
COMMENT ON COLUMN violations.description IS 'Human-readable description explaining the violation';
COMMENT ON COLUMN violations.rule_id IS 'Reference to compliance rule if this violation was detected by a rule';
COMMENT ON COLUMN violations.policy_id IS 'Reference to company policy if this violation was detected by a policy';

-- ============================================================================
-- TABLE: verification_results
-- Purpose: Fact verification results for extracted claims
-- ============================================================================
CREATE TABLE IF NOT EXISTS verification_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    interaction_id UUID NOT NULL REFERENCES ai_interactions(id) ON DELETE CASCADE,
    claim_text TEXT NOT NULL, -- The factual claim extracted from AI response
    verification_status TEXT NOT NULL, -- 'verified', 'unverified', 'false', 'partially_verified'
    source TEXT, -- Source used for verification (e.g., 'knowledge_base', 'wikipedia', 'api')
    confidence FLOAT, -- Confidence in verification (0.0 to 1.0)
    verification_method TEXT, -- Method used: 'database_lookup', 'api_call', 'semantic_match'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add comment to table
COMMENT ON TABLE verification_results IS 'Fact verification results for claims extracted from AI responses';

-- Add comments to columns
COMMENT ON COLUMN verification_results.claim_text IS 'The factual claim that was extracted and verified';
COMMENT ON COLUMN verification_results.verification_status IS 'Verification result: verified (confirmed true), unverified (cannot confirm), false (confirmed false), partially_verified (partially true)';
COMMENT ON COLUMN verification_results.source IS 'Source used for verification (knowledge_base, wikipedia, fact_check_api, etc.)';
COMMENT ON COLUMN verification_results.confidence IS 'Confidence in verification result (0.0 to 1.0)';
COMMENT ON COLUMN verification_results.verification_method IS 'Method used for verification: database_lookup, api_call, semantic_match, etc.';

-- ============================================================================
-- TABLE: citations
-- Purpose: Citation/URL verification results from AI responses
-- ============================================================================
CREATE TABLE IF NOT EXISTS citations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    interaction_id UUID NOT NULL REFERENCES ai_interactions(id) ON DELETE CASCADE,
    url TEXT NOT NULL, -- The URL/citation from AI response
    is_valid BOOLEAN, -- Whether URL is accessible (HTTP 200)
    content_match BOOLEAN, -- Whether URL content matches what AI claims
    http_status_code INTEGER, -- HTTP status code (200, 404, 500, etc.)
    verified_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    error_message TEXT -- Error message if verification failed
);

-- Add comment to table
COMMENT ON TABLE citations IS 'Citation/URL verification results from AI responses';

-- Add comments to columns
COMMENT ON COLUMN citations.url IS 'The URL/citation extracted from AI response';
COMMENT ON COLUMN citations.is_valid IS 'Whether the URL is accessible and returns valid response';
COMMENT ON COLUMN citations.content_match IS 'Whether the URL content matches what the AI claims it says';
COMMENT ON COLUMN citations.http_status_code IS 'HTTP status code from URL check (200 = OK, 404 = Not Found, etc.)';
COMMENT ON COLUMN citations.error_message IS 'Error message if URL verification failed';

-- ============================================================================
-- INDEXES
-- Purpose: Improve query performance
-- ============================================================================

-- Organizations indexes
CREATE INDEX IF NOT EXISTS idx_organizations_industry ON organizations(industry);

-- Users indexes
CREATE INDEX IF NOT EXISTS idx_users_organization_id ON users(organization_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- API Keys indexes
CREATE INDEX IF NOT EXISTS idx_api_keys_organization_id ON api_keys(organization_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_key_hash ON api_keys(key_hash);
CREATE INDEX IF NOT EXISTS idx_api_keys_is_active ON api_keys(is_active);

-- Compliance Rules indexes
CREATE INDEX IF NOT EXISTS idx_compliance_rules_organization_id ON compliance_rules(organization_id);
CREATE INDEX IF NOT EXISTS idx_compliance_rules_rule_type ON compliance_rules(rule_type);
CREATE INDEX IF NOT EXISTS idx_compliance_rules_industry ON compliance_rules(industry);
CREATE INDEX IF NOT EXISTS idx_compliance_rules_is_active ON compliance_rules(is_active);

-- Company Policies indexes
CREATE INDEX IF NOT EXISTS idx_company_policies_organization_id ON company_policies(organization_id);
CREATE INDEX IF NOT EXISTS idx_company_policies_category ON company_policies(category);
CREATE INDEX IF NOT EXISTS idx_company_policies_is_active ON company_policies(is_active);

-- AI Interactions indexes (most important for queries)
CREATE INDEX IF NOT EXISTS idx_ai_interactions_organization_id ON ai_interactions(organization_id);
CREATE INDEX IF NOT EXISTS idx_ai_interactions_timestamp ON ai_interactions(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_ai_interactions_status ON ai_interactions(status);
CREATE INDEX IF NOT EXISTS idx_ai_interactions_session_id ON ai_interactions(session_id);
CREATE INDEX IF NOT EXISTS idx_ai_interactions_ai_model ON ai_interactions(ai_model);
CREATE INDEX IF NOT EXISTS idx_ai_interactions_org_timestamp ON ai_interactions(organization_id, timestamp DESC);

-- Violations indexes
CREATE INDEX IF NOT EXISTS idx_violations_interaction_id ON violations(interaction_id);
CREATE INDEX IF NOT EXISTS idx_violations_violation_type ON violations(violation_type);
CREATE INDEX IF NOT EXISTS idx_violations_severity ON violations(severity);
CREATE INDEX IF NOT EXISTS idx_violations_detected_at ON violations(detected_at DESC);
CREATE INDEX IF NOT EXISTS idx_violations_rule_id ON violations(rule_id);
CREATE INDEX IF NOT EXISTS idx_violations_policy_id ON violations(policy_id);

-- Verification Results indexes
CREATE INDEX IF NOT EXISTS idx_verification_results_interaction_id ON verification_results(interaction_id);
CREATE INDEX IF NOT EXISTS idx_verification_results_status ON verification_results(verification_status);

-- Citations indexes
CREATE INDEX IF NOT EXISTS idx_citations_interaction_id ON citations(interaction_id);
CREATE INDEX IF NOT EXISTS idx_citations_is_valid ON citations(is_valid);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Purpose: Secure data access based on user roles and organization
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE compliance_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE violations ENABLE ROW LEVEL SECURITY;
ALTER TABLE verification_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE citations ENABLE ROW LEVEL SECURITY;

-- Organizations policies
-- Users can only see their own organization
CREATE POLICY "Users can view their own organization"
    ON organizations FOR SELECT
    USING (
        id IN (
            SELECT organization_id FROM users WHERE id = auth.uid()
        )
    );

-- Users policies
-- Users can view users in their organization
CREATE POLICY "Users can view users in their organization"
    ON users FOR SELECT
    USING (
        organization_id IN (
            SELECT organization_id FROM users WHERE id = auth.uid()
        )
    );

-- Users can update their own profile
CREATE POLICY "Users can update their own profile"
    ON users FOR UPDATE
    USING (id = auth.uid());

-- API Keys policies
-- Users can view API keys for their organization
CREATE POLICY "Users can view API keys for their organization"
    ON api_keys FOR SELECT
    USING (
        organization_id IN (
            SELECT organization_id FROM users WHERE id = auth.uid()
        )
    );

-- Only admins can create/update/delete API keys
CREATE POLICY "Admins can manage API keys"
    ON api_keys FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE id = auth.uid()
            AND role = 'admin'
            AND organization_id = api_keys.organization_id
        )
    );

-- Compliance Rules policies
-- Users can view compliance rules for their organization
CREATE POLICY "Users can view compliance rules for their organization"
    ON compliance_rules FOR SELECT
    USING (
        organization_id IN (
            SELECT organization_id FROM users WHERE id = auth.uid()
        )
    );

-- Only admins and compliance officers can manage rules
CREATE POLICY "Admins and compliance officers can manage rules"
    ON compliance_rules FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE id = auth.uid()
            AND role IN ('admin', 'compliance_officer')
            AND organization_id = compliance_rules.organization_id
        )
    );

-- Company Policies policies
-- Users can view policies for their organization
CREATE POLICY "Users can view policies for their organization"
    ON company_policies FOR SELECT
    USING (
        organization_id IN (
            SELECT organization_id FROM users WHERE id = auth.uid()
        )
    );

-- Only admins and compliance officers can manage policies
CREATE POLICY "Admins and compliance officers can manage policies"
    ON company_policies FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE id = auth.uid()
            AND role IN ('admin', 'compliance_officer')
            AND organization_id = company_policies.organization_id
        )
    );

-- AI Interactions policies
-- Users can view interactions for their organization
CREATE POLICY "Users can view interactions for their organization"
    ON ai_interactions FOR SELECT
    USING (
        organization_id IN (
            SELECT organization_id FROM users WHERE id = auth.uid()
        )
    );

-- Violations policies
-- Users can view violations for their organization
CREATE POLICY "Users can view violations for their organization"
    ON violations FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM ai_interactions
            WHERE ai_interactions.id = violations.interaction_id
            AND ai_interactions.organization_id IN (
                SELECT organization_id FROM users WHERE id = auth.uid()
            )
        )
    );

-- Verification Results policies
-- Users can view verification results for their organization
CREATE POLICY "Users can view verification results for their organization"
    ON verification_results FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM ai_interactions
            WHERE ai_interactions.id = verification_results.interaction_id
            AND ai_interactions.organization_id IN (
                SELECT organization_id FROM users WHERE id = auth.uid()
            )
        )
    );

-- Citations policies
-- Users can view citations for their organization
CREATE POLICY "Users can view citations for their organization"
    ON citations FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM ai_interactions
            WHERE ai_interactions.id = citations.interaction_id
            AND ai_interactions.organization_id IN (
                SELECT organization_id FROM users WHERE id = auth.uid()
            )
        )
    );

-- ============================================================================
-- FUNCTIONS & TRIGGERS
-- Purpose: Automate common operations
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers to auto-update updated_at
CREATE TRIGGER update_organizations_updated_at
    BEFORE UPDATE ON organizations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_compliance_rules_updated_at
    BEFORE UPDATE ON compliance_rules
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_company_policies_updated_at
    BEFORE UPDATE ON company_policies
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- SAMPLE DATA (Optional - Comment out if you don't want sample data)
-- ============================================================================

-- Uncomment below to insert sample data for testing

/*
-- Sample Organization
INSERT INTO organizations (id, name, industry) VALUES
('00000000-0000-0000-0000-000000000001', 'Demo Financial Services', 'finance'),
('00000000-0000-0000-0000-000000000002', 'Demo Airlines', 'airline'),
('00000000-0000-0000-0000-000000000003', 'Demo Consulting', 'consulting');

-- Sample Compliance Rules
INSERT INTO compliance_rules (organization_id, rule_type, rule_name, rule_definition, industry, severity) VALUES
('00000000-0000-0000-0000-000000000001', 'regulatory', 'No Financial Guarantees', 
 '{"type": "keyword_match", "keywords": ["guarantee", "always profitable", "risk-free"], "action": "block"}', 
 'finance', 'critical'),
('00000000-0000-0000-0000-000000000002', 'policy', 'Refund Policy Compliance', 
 '{"type": "keyword_match", "keywords": ["24 hours", "immediate refund"], "action": "flag"}', 
 'airline', 'high');
*/

-- ============================================================================
-- VERIFICATION QUERIES
-- Purpose: Run these to verify the schema was created correctly
-- ============================================================================

-- Uncomment to verify tables were created:
-- SELECT table_name FROM information_schema.tables 
-- WHERE table_schema = 'public' 
-- ORDER BY table_name;

-- Uncomment to verify indexes:
-- SELECT indexname, tablename FROM pg_indexes 
-- WHERE schemaname = 'public' 
-- ORDER BY tablename, indexname;

-- ============================================================================
-- END OF SCHEMA
-- ============================================================================
-- 
-- Next Steps:
-- 1. Run this SQL in Supabase SQL Editor
-- 2. Verify all tables were created
-- 3. Set up your first organization and user
-- 4. Start using the API!
--
-- ============================================================================

