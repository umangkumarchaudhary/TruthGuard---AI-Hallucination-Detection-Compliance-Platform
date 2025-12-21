'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import DashboardLayout from '@/components/common/DashboardLayout'
import ResponseComparison from '@/components/comparison/ResponseComparison'
import { apiClient } from '@/lib/api-client'
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  Loader2,
  ExternalLink,
  Sparkles,
  FileText,
  ChevronDown,
  ChevronUp
} from 'lucide-react'

interface Company {
  id: string
  name: string
  industry?: string
}

interface ConfidenceBreakdown {
  score: number
  weight: number
  weighted_score: number
  label: string
  description: string
  details: Record<string, any>
}

interface AITestResponse {
  ai_response: string
  validation_result: {
    status: 'approved' | 'flagged' | 'blocked'
    confidence_score: number
    confidence_breakdown?: {
      fact_verification?: ConfidenceBreakdown
      citation_validity?: ConfidenceBreakdown
      consistency?: ConfidenceBreakdown
      compliance?: ConfidenceBreakdown
      response_clarity?: ConfidenceBreakdown
      contributions?: {
        positive_factors: string[]
        negative_factors: string[]
      }
    }
    violations: Array<{
      type: string
      severity: string
      description: string
    }>
    verification_results: Array<{
      claim_text: string
      verification_status: string
      confidence: number
      source?: string
      details?: string
      url?: string
    }>
    citations: Array<{
      url: string
      is_valid: boolean
    }>
    claims: Array<any>
    explanation: string
  }
  company_context: {
    name: string
    industry: string
    policies_count: number
    rules_count: number
  }
  interaction_id?: string
  correction_suggested: boolean
  corrected_response?: string
  changes_made?: string[]
}

type TestMode = 'manual' | 'ai'

const QUICK_EXAMPLES = [
  {
    query: "Should I invest all my savings in cryptocurrency?",
    category: "Financial Advice",
    description: "Test compliance violations"
  },
  {
    query: "Can I get a full refund within 24 hours?",
    category: "Refund Policy",
    description: "Test policy alignment"
  },
  {
    query: "What is Python in programming?",
    category: "Fact Verification",
    description: "Test fact checking"
  }
]

export default function AITestPage() {
  const router = useRouter()
  const [mode, setMode] = useState<TestMode>('ai')
  const [loading, setLoading] = useState(false)
  const [loadingCompanies, setLoadingCompanies] = useState(false)
  const [loadingAIStatus, setLoadingAIStatus] = useState(false)
  const [result, setResult] = useState<AITestResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [companies, setCompanies] = useState<Company[]>([])
  const [aiEnabled, setAiEnabled] = useState(false)
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['breakdown', 'violations', 'verification']))

  const [formData, setFormData] = useState({
    company_id: '',
    query: '',
    ai_response: '',
    ai_model: 'gemini-pro'
  })

  // Load companies and AI status on mount
  useEffect(() => {
    loadCompanies()
    checkAIStatus()
  }, [])

  const loadCompanies = async () => {
    setLoadingCompanies(true)
    try {
      const response = await apiClient.get<{ companies: Company[], total: number }>('/api/v1/ai-test/companies')
      if (response.data) {
        setCompanies(response.data.companies)
        if (response.data.companies.length > 0) {
          setFormData(prev => ({ ...prev, company_id: response.data!.companies[0].id }))
        }
      }
    } catch (err) {
      console.error('Error loading companies:', err)
    } finally {
      setLoadingCompanies(false)
    }
  }

  const checkAIStatus = async () => {
    setLoadingAIStatus(true)
    try {
      const response = await apiClient.get<{ enabled: boolean, model: string, message: string }>('/api/v1/ai-test/status')
      if (response.data) {
        setAiEnabled(response.data.enabled)
        if (!response.data.enabled) {
          setMode('manual')
        }
      }
    } catch (err) {
      console.error('Error checking AI status:', err)
    } finally {
      setLoadingAIStatus(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      if (mode === 'ai') {
        // AI Mode: Generate and validate
        if (!formData.company_id) {
          setError('Please select a company')
          setLoading(false)
          return
        }

        const response = await apiClient.post<AITestResponse>('/api/v1/ai-test/generate', {
          company_id: formData.company_id,
          user_query: formData.query,
          ai_model: formData.ai_model
        })

        if (response.error) {
          setError(response.error)
        } else if (response.data) {
          setResult(response.data)
          setFormData(prev => ({ ...prev, query: '' }))
        }
      } else {
        // Manual Mode: Just validate
        if (!formData.ai_response) {
          setError('Please enter an AI response to validate')
          setLoading(false)
          return
        }

        const response = await apiClient.post<any>('/api/v1/validate', {
          query: formData.query,
          ai_response: formData.ai_response,
          ai_model: formData.ai_model,
          organization_id: formData.company_id || '00000000-0000-0000-0000-000000000001'
        })

        if (response.error) {
          setError(response.error)
        } else if (response.data) {
          // Transform validation response to match AITestResponse format
          setResult({
            ai_response: formData.ai_response,
            validation_result: {
              status: response.data.status,
              confidence_score: response.data.confidence_score,
              violations: response.data.violations || [],
              verification_results: response.data.verification_results || [],
              citations: response.data.citations || [],
              claims: response.data.claims || [],
              explanation: response.data.explanation || ''
            },
            company_context: {
              name: 'Manual Test',
              industry: 'general',
              policies_count: 0,
              rules_count: 0
            },
            interaction_id: response.data.interaction_id,
            correction_suggested: response.data.correction_suggested || false,
            corrected_response: response.data.validated_response,
            changes_made: response.data.changes_made
          })
          setFormData(prev => ({ ...prev, query: '', ai_response: '' }))
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const toggleSection = (section: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev)
      if (newSet.has(section)) {
        newSet.delete(section)
      } else {
        newSet.add(section)
      }
      return newSet
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'badge-success'
      case 'flagged':
        return 'badge-warning'
      case 'blocked':
        return 'badge-danger'
      default:
        return ''
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical':
        return 'text-[#dc2626]'
      case 'high':
        return 'text-[#f59e0b]'
      case 'medium':
        return 'text-[#3b82f6]'
      case 'low':
        return 'text-black/60'
      default:
        return 'text-black'
    }
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen" style={{ background: 'var(--background)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8 animate-slide-down">
            <h1 className="text-3xl lg:text-4xl font-bold tracking-tight mb-2" style={{ color: 'var(--foreground)' }}>AI Response Testing</h1>
            <p style={{ color: 'var(--foreground-muted)' }}>Test AI responses with automated generation or manual input</p>
          </div>

          {/* Mode Toggle */}
          <div className="mb-8 premium-card p-1 inline-flex">
            <button
              onClick={() => setMode('ai')}
              disabled={!aiEnabled}
              className={`px-6 py-3 text-sm font-medium transition-colors flex items-center gap-2 ${mode === 'ai'
                ? 'text-white'
                : ''
                } ${!aiEnabled ? 'opacity-50 cursor-not-allowed' : ''}`}
              style={{
                background: mode === 'ai' ? 'var(--accent-gradient)' : 'transparent',
                color: mode === 'ai' ? 'white' : 'var(--foreground)'
              }}
            >
              <Sparkles size={16} />
              AI Generation
            </button>
            <button
              onClick={() => setMode('manual')}
              className="px-6 py-3 text-sm font-medium transition-colors flex items-center gap-2"
              style={{
                background: mode === 'manual' ? 'var(--accent-gradient)' : 'transparent',
                color: mode === 'manual' ? 'white' : 'var(--foreground)'
              }}
            >
              <FileText size={16} />
              Manual Input
            </button>
          </div>

          {!aiEnabled && mode === 'ai' && (
            <div className="mb-6 p-4 bg-[#fef3c7] border border-[#f59e0b]">
              <p className="text-sm text-black">
                <strong>AI Generation Unavailable:</strong> Gemini Pro API key not configured.
                Please set GEMINI_API_KEY in backend/.env or use Manual Input mode.
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Input Section */}
            <div className="premium-card p-6 lg:p-8">
              <h2 className="text-xl lg:text-2xl font-bold mb-6" style={{ color: 'var(--foreground)' }}>
                {mode === 'ai' ? 'Generate & Validate' : 'Manual Validation'}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Company Selector (AI Mode) */}
                {mode === 'ai' && (
                  <div>
                    <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--foreground)' }}>
                      Company
                    </label>
                    {loadingCompanies ? (
                      <div className="px-4 py-3 flex items-center gap-2" style={{ background: 'var(--background-tertiary)', border: '1px solid var(--border)' }}>
                        <Loader2 className="animate-spin" size={16} style={{ color: 'var(--foreground-muted)' }} />
                        <span className="text-sm" style={{ color: 'var(--foreground-muted)' }}>Loading companies...</span>
                      </div>
                    ) : (
                      <select
                        value={formData.company_id}
                        onChange={(e) => setFormData({ ...formData, company_id: e.target.value })}
                        required
                        className="w-full px-4 py-3 text-sm font-medium focus:outline-none"
                        style={{
                          background: 'var(--background-tertiary)',
                          border: '1px solid var(--border)',
                          color: 'var(--foreground)'
                        }}
                      >
                        <option value="">Select a company</option>
                        {companies.map(company => (
                          <option key={company.id} value={company.id}>
                            {company.name} {company.industry ? `(${company.industry})` : ''}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                )}

                {/* User Query */}
                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--foreground)' }}>
                    User Query
                  </label>
                  <textarea
                    value={formData.query}
                    onChange={(e) => setFormData({ ...formData, query: e.target.value })}
                    placeholder="Enter the user's question..."
                    required
                    rows={3}
                    className="w-full px-4 py-3 resize-none text-sm"
                    style={{
                      background: 'var(--background-tertiary)',
                      border: '1px solid var(--border)',
                      color: 'var(--foreground)'
                    }}
                  />
                </div>

                {/* AI Response (Manual Mode) */}
                {mode === 'manual' && (
                  <div>
                    <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--foreground)' }}>
                      AI Response
                    </label>
                    <textarea
                      value={formData.ai_response}
                      onChange={(e) => setFormData({ ...formData, ai_response: e.target.value })}
                      placeholder="Enter the AI's response to validate..."
                      required
                      rows={8}
                      className="w-full px-4 py-3 resize-none text-sm"
                      style={{
                        background: 'var(--background-tertiary)',
                        border: '1px solid var(--border)',
                        color: 'var(--foreground)'
                      }}
                    />
                  </div>
                )}

                {/* AI Model */}
                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--foreground)' }}>
                    AI Model
                  </label>
                  <select
                    value={formData.ai_model}
                    onChange={(e) => setFormData({ ...formData, ai_model: e.target.value })}
                    className="w-full px-4 py-3 text-sm font-medium focus:outline-none"
                    style={{
                      background: 'var(--background-tertiary)',
                      border: '1px solid var(--border)',
                      color: 'var(--foreground)'
                    }}
                  >
                    <option value="gemini-pro">Gemini Pro</option>
                    <option value="gpt-4">GPT-4</option>
                    <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                    <option value="claude-3-opus">Claude 3 Opus</option>
                    <option value="claude-3-sonnet">Claude 3 Sonnet</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full px-6 py-4 font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm text-white"
                  style={{ background: 'var(--accent-gradient)', boxShadow: '0 0 20px var(--glow)' }}
                >
                  {loading ? (
                    <>
                      <Loader2 className="animate-spin" size={18} />
                      <span>{mode === 'ai' ? 'Generating & Validating...' : 'Validating...'}</span>
                    </>
                  ) : (
                    <span>{mode === 'ai' ? 'Generate & Validate' : 'Validate Response'}</span>
                  )}
                </button>
              </form>

              {/* Error Display */}
              {error && (
                <div className="mt-6 p-4 bg-[#fee2e2] border border-[#dc2626]">
                  <p className="text-sm text-[#dc2626]">{error}</p>
                </div>
              )}

              {/* Quick Examples */}
              {!result && (
                <div className="mt-8 pt-8" style={{ borderTop: '1px solid var(--border)' }}>
                  <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--foreground)' }}>Quick Examples</h3>
                  <div className="space-y-2">
                    {QUICK_EXAMPLES.map((example, idx) => (
                      <button
                        key={idx}
                        onClick={() => setFormData(prev => ({ ...prev, query: example.query }))}
                        className="w-full p-4 text-left transition-colors"
                        style={{ background: 'var(--background-tertiary)', border: '1px solid var(--border)' }}
                      >
                        <p className="text-sm font-medium mb-1" style={{ color: 'var(--foreground)' }}>{example.category}</p>
                        <p className="text-xs" style={{ color: 'var(--foreground-muted)' }}>{example.query}</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Results Section */}
            <div className="premium-card p-6 lg:p-8">
              <h2 className="text-xl lg:text-2xl font-bold mb-6" style={{ color: 'var(--foreground)' }}>Validation Results</h2>

              {!result && !loading && (
                <div className="flex items-center justify-center h-96">
                  <div className="text-center">
                    <FileText size={48} className="mx-auto mb-4 opacity-20" style={{ color: 'var(--foreground-muted)' }} />
                    <p className="text-sm" style={{ color: 'var(--foreground-muted)' }}>Submit a {mode === 'ai' ? 'query' : 'response'} to see validation results</p>
                  </div>
                </div>
              )}

              {result && (
                <div className="space-y-6">
                  {/* AI Response (AI Mode) */}
                  {mode === 'ai' && (
                    <div className="pb-6" style={{ borderBottom: '1px solid var(--border)' }}>
                      <h3 className="text-sm font-semibold mb-3 flex items-center gap-2" style={{ color: 'var(--foreground)' }}>
                        <Sparkles size={16} />
                        Generated AI Response
                      </h3>
                      <div className="p-4" style={{ background: 'var(--background-tertiary)', border: '1px solid var(--border)' }}>
                        <p className="text-sm whitespace-pre-wrap leading-relaxed" style={{ color: 'var(--foreground)' }}>
                          {result.ai_response}
                        </p>
                      </div>
                      {result.company_context && (
                        <div className="mt-3 flex items-center gap-4 text-xs" style={{ color: 'var(--foreground-muted)' }}>
                          <span>Company: <strong style={{ color: 'var(--foreground)' }}>{result.company_context.name}</strong></span>
                          <span>Industry: <strong style={{ color: 'var(--foreground)' }}>{result.company_context.industry}</strong></span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Status and Confidence */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs mb-2" style={{ color: 'var(--foreground-muted)' }}>Status</p>
                      <span className={`inline-block px-4 py-2 text-xs font-semibold ${getStatusColor(result.validation_result.status)}`}>
                        {result.validation_result.status.toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="text-xs mb-2" style={{ color: 'var(--foreground-muted)' }}>Confidence</p>
                      <p className="text-2xl font-bold" style={{ color: 'var(--foreground)' }}>
                        {(result.validation_result.confidence_score * 100).toFixed(0)}%
                      </p>
                    </div>
                  </div>

                  {/* Confidence Score Breakdown */}
                  {result.validation_result.confidence_breakdown && (
                    <div style={{ border: '1px solid var(--border)' }}>
                      <button
                        onClick={() => toggleSection('breakdown')}
                        className="w-full p-4 flex items-center justify-between transition-colors"
                        style={{ background: 'var(--background-tertiary)' }}
                      >
                        <h3 className="text-sm font-semibold flex items-center gap-2" style={{ color: 'var(--foreground)' }}>
                          <span>📊</span>
                          Score Breakdown
                        </h3>
                        {expandedSections.has('breakdown') ? (
                          <ChevronUp size={16} style={{ color: 'var(--foreground-muted)' }} />
                        ) : (
                          <ChevronDown size={16} style={{ color: 'var(--foreground-muted)' }} />
                        )}
                      </button>
                      {expandedSections.has('breakdown') && (
                        <div className="p-6 space-y-5" style={{ background: 'var(--background)' }}>
                          {/* Overall Score */}
                          <div className="pb-4" style={{ borderBottom: '1px solid var(--border)' }}>
                            <div className="flex items-baseline justify-between mb-2">
                              <p className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>Overall Confidence Score</p>
                              <p className="text-3xl font-bold" style={{ color: 'var(--foreground)' }}>
                                {(result.validation_result.confidence_score * 100).toFixed(0)}%
                              </p>
                            </div>
                            <div className="w-full h-2 mt-3" style={{ background: 'var(--border)' }}>
                              <div
                                className="h-full transition-all"
                                style={{ width: `${result.validation_result.confidence_score * 100}%`, background: 'var(--accent)' }}
                              />
                            </div>
                          </div>

                          {/* Component Breakdowns */}
                          {Object.entries(result.validation_result.confidence_breakdown)
                            .filter(([key]) => key !== 'contributions')
                            .map(([key, component]: [string, any]) => {
                              if (!component || typeof component !== 'object' || !component.score) return null

                              const scorePercent = component.score * 100
                              const weightPercent = component.weight * 100
                              const getScoreColor = (score: number) => {
                                if (score >= 0.8) return 'bg-[#10b981]'
                                if (score >= 0.6) return 'bg-[#3b82f6]'
                                if (score >= 0.4) return 'bg-[#f59e0b]'
                                return 'bg-[#dc2626]'
                              }

                              return (
                                <div key={key} className="space-y-2">
                                  <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                      <p className="text-sm font-semibold mb-1" style={{ color: 'var(--foreground)' }}>
                                        {component.label}
                                      </p>
                                      <p className="text-xs" style={{ color: 'var(--foreground-muted)' }}>{component.description}</p>
                                    </div>
                                    <div className="text-right ml-4">
                                      <p className="text-lg font-bold" style={{ color: 'var(--foreground)' }}>
                                        {scorePercent.toFixed(0)}%
                                      </p>
                                      <p className="text-xs" style={{ color: 'var(--foreground-muted)' }}>
                                        {weightPercent.toFixed(0)}% weight
                                      </p>
                                    </div>
                                  </div>
                                  <div className="w-full h-3" style={{ background: 'var(--border)' }}>
                                    <div
                                      className={`h-full ${getScoreColor(component.score)} transition-all`}
                                      style={{ width: `${scorePercent}%` }}
                                    />
                                  </div>
                                  {component.details && Object.keys(component.details).length > 0 && (
                                    <div className="mt-2 pt-2" style={{ borderTop: '1px solid var(--border)' }}>
                                      <div className="flex flex-wrap gap-3 text-xs" style={{ color: 'var(--foreground-muted)' }}>
                                        {Object.entries(component.details).map(([detailKey, detailValue]: [string, any]) => (
                                          <span key={detailKey}>
                                            <span className="font-medium">{detailKey.replace(/_/g, ' ')}:</span> {String(detailValue)}
                                          </span>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )
                            })}

                          {/* Contributions */}
                          {result.validation_result.confidence_breakdown.contributions && (
                            <div className="pt-4 space-y-3" style={{ borderTop: '1px solid var(--border)' }}>
                              {result.validation_result.confidence_breakdown.contributions.positive_factors?.length > 0 && (
                                <div>
                                  <p className="text-xs font-semibold text-[#10b981] mb-2">✅ Positive Factors</p>
                                  <ul className="space-y-1">
                                    {result.validation_result.confidence_breakdown.contributions.positive_factors.map((factor: string, idx: number) => (
                                      <li key={idx} className="text-xs flex items-start gap-2" style={{ color: 'var(--foreground-secondary)' }}>
                                        <span className="text-[#10b981] mt-0.5">•</span>
                                        <span>{factor}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                              {result.validation_result.confidence_breakdown.contributions.negative_factors?.length > 0 && (
                                <div>
                                  <p className="text-xs font-semibold text-[#f59e0b] mb-2">⚠️ Areas for Improvement</p>
                                  <ul className="space-y-1">
                                    {result.validation_result.confidence_breakdown.contributions.negative_factors.map((factor: string, idx: number) => (
                                      <li key={idx} className="text-xs flex items-start gap-2" style={{ color: 'var(--foreground-secondary)' }}>
                                        <span className="text-[#f59e0b] mt-0.5">•</span>
                                        <span>{factor}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Violations */}
                  {result.validation_result.violations.length > 0 && (
                    <div style={{ border: '1px solid var(--border)' }}>
                      <button
                        onClick={() => toggleSection('violations')}
                        className="w-full p-4 flex items-center justify-between transition-colors"
                        style={{ background: 'var(--background-tertiary)' }}
                      >
                        <h3 className="text-sm font-semibold flex items-center gap-2" style={{ color: 'var(--foreground)' }}>
                          <AlertTriangle size={16} />
                          Violations ({result.validation_result.violations.length})
                        </h3>
                        {expandedSections.has('violations') ? (
                          <ChevronUp size={16} style={{ color: 'var(--foreground-muted)' }} />
                        ) : (
                          <ChevronDown size={16} style={{ color: 'var(--foreground-muted)' }} />
                        )}
                      </button>
                      {expandedSections.has('violations') && (
                        <div className="p-4 space-y-3">
                          {result.validation_result.violations.map((violation, idx) => (
                            <div key={idx} className="p-4" style={{ background: 'var(--background)', borderLeft: '4px solid var(--danger)', border: '1px solid var(--border)' }}>
                              <div className="flex items-start justify-between mb-2">
                                <span className="text-xs font-semibold" style={{ color: 'var(--foreground)' }}>{violation.type.toUpperCase()}</span>
                                <span className={`text-xs font-semibold ${getSeverityColor(violation.severity)}`}>
                                  {violation.severity.toUpperCase()}
                                </span>
                              </div>
                              <p className="text-sm leading-relaxed" style={{ color: 'var(--foreground-secondary)' }}>{violation.description}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Verification Results */}
                  {result.validation_result.verification_results.length > 0 && (
                    <div style={{ border: '1px solid var(--border)' }}>
                      <button
                        onClick={() => toggleSection('verification')}
                        className="w-full p-4 flex items-center justify-between transition-colors"
                        style={{ background: 'var(--background-tertiary)' }}
                      >
                        <h3 className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>
                          Fact Verification ({result.validation_result.verification_results.length})
                        </h3>
                        {expandedSections.has('verification') ? (
                          <ChevronUp size={16} style={{ color: 'var(--foreground-muted)' }} />
                        ) : (
                          <ChevronDown size={16} style={{ color: 'var(--foreground-muted)' }} />
                        )}
                      </button>
                      {expandedSections.has('verification') && (
                        <div className="p-4 space-y-3">
                          {result.validation_result.verification_results.map((vr, idx) => (
                            <div key={idx} className="p-4" style={{ background: 'var(--background)', border: '1px solid var(--border)' }}>
                              <p className="text-sm font-medium mb-3" style={{ color: 'var(--foreground)' }}>{vr.claim_text}</p>
                              <div className="flex items-center gap-3 flex-wrap mb-3">
                                <span className={`text-xs font-semibold px-3 py-1 ${vr.verification_status === 'verified' ? 'bg-[#10b981]/10 text-[#10b981]' :
                                  vr.verification_status === 'unverified' ? 'bg-[#f59e0b]/10 text-[#f59e0b]' :
                                    'bg-[#dc2626]/10 text-[#dc2626]'
                                  }`}>
                                  {vr.verification_status.toUpperCase()}
                                </span>
                                <span className="text-xs" style={{ color: 'var(--foreground-muted)' }}>
                                  {(vr.confidence * 100).toFixed(0)}% confidence
                                </span>
                                {vr.source && (
                                  <span className="text-xs" style={{ color: 'var(--foreground-muted)' }}>
                                    Source: <span className="font-medium capitalize">{vr.source}</span>
                                  </span>
                                )}
                              </div>
                              {vr.details && (
                                <div className="mt-3 pt-3" style={{ borderTop: '1px solid var(--border)' }}>
                                  <p className="text-xs leading-relaxed" style={{ color: 'var(--foreground-secondary)' }}>{vr.details}</p>
                                </div>
                              )}
                              {vr.url && (
                                <div className="mt-3">
                                  <a
                                    href={vr.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs flex items-center gap-1"
                                    style={{ color: 'var(--accent)' }}
                                  >
                                    View source <ExternalLink size={12} />
                                  </a>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Side-by-Side Comparison */}
                  {result.correction_suggested &&
                    result.corrected_response &&
                    result.corrected_response.trim() !== result.ai_response.trim() &&
                    result.validation_result.violations.length > 0 && (
                      <ResponseComparison
                        originalResponse={result.ai_response}
                        correctedResponse={result.corrected_response}
                        violations={result.validation_result.violations}
                        verificationResults={result.validation_result.verification_results}
                      />
                    )}

                  {/* Corrected Response (fallback if no comparison) */}
                  {result.correction_suggested &&
                    result.corrected_response &&
                    (result.corrected_response.trim() === result.ai_response.trim() || result.validation_result.violations.length === 0) && (
                      <div className="p-4" style={{ background: 'var(--success-bg)', border: '1px solid var(--success)' }}>
                        <h3 className="text-sm font-semibold mb-3 flex items-center gap-2" style={{ color: 'var(--foreground)' }}>
                          <CheckCircle size={16} className="text-[#10b981]" />
                          Corrected Response
                        </h3>
                        <p className="text-sm whitespace-pre-wrap leading-relaxed mb-3" style={{ color: 'var(--foreground)' }}>
                          {result.corrected_response}
                        </p>
                        {result.changes_made && result.changes_made.length > 0 && (
                          <div className="mt-3 pt-3" style={{ borderTop: '1px solid var(--success)' }}>
                            <p className="text-xs font-semibold mb-2" style={{ color: 'var(--foreground)' }}>Changes Made:</p>
                            <ul className="list-disc list-inside text-xs space-y-1" style={{ color: 'var(--foreground-secondary)' }}>
                              {result.changes_made.map((change, idx) => (
                                <li key={idx}>{change}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}

                  {/* Explanation */}
                  <div className="p-4" style={{ background: 'var(--background-tertiary)', border: '1px solid var(--border)' }}>
                    <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--foreground)' }}>Explanation</h3>
                    <p className="text-sm whitespace-pre-wrap leading-relaxed" style={{ color: 'var(--foreground-secondary)' }}>
                      {result.validation_result.explanation}
                    </p>
                  </div>

                  {/* Success Message */}
                  {result.validation_result.status === 'approved' && result.validation_result.violations.length === 0 && (
                    <div className="p-4 flex items-center gap-3" style={{ background: 'var(--success-bg)', border: '1px solid var(--success)' }}>
                      <CheckCircle className="text-[#10b981]" size={20} />
                      <p className="text-sm" style={{ color: 'var(--foreground)' }}>Response approved! No violations detected.</p>
                    </div>
                  )}

                  {/* View Details Link */}
                  {result.interaction_id && (
                    <button
                      onClick={() => router.push(`/interactions/${result.interaction_id}`)}
                      className="w-full px-4 py-3 font-semibold transition-colors flex items-center justify-center gap-2"
                      style={{ background: 'var(--background-tertiary)', border: '1px solid var(--border)', color: 'var(--foreground)' }}
                    >
                      <span>View Full Details</span>
                      <ExternalLink size={16} />
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div >
    </DashboardLayout >
  )
}

