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
        return 'bg-[#10b981] text-white'
      case 'flagged':
        return 'bg-[#f59e0b] text-white'
      case 'blocked':
        return 'bg-[#dc2626] text-white'
      default:
        return 'bg-black text-white'
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
      <div className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-black mb-2">AI Response Testing</h1>
            <p className="text-sm text-black/60">Test AI responses with automated generation or manual input</p>
          </div>

          {/* Mode Toggle */}
          <div className="mb-8 bg-white border border-[#e5e5e5] p-1 inline-flex">
            <button
              onClick={() => setMode('ai')}
              disabled={!aiEnabled}
              className={`px-6 py-3 text-sm font-medium transition-colors flex items-center gap-2 ${
                mode === 'ai'
                  ? 'bg-black text-white'
                  : 'bg-white text-black hover:bg-[#f5f5f5]'
              } ${!aiEnabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <Sparkles size={16} />
              AI Generation
            </button>
            <button
              onClick={() => setMode('manual')}
              className={`px-6 py-3 text-sm font-medium transition-colors flex items-center gap-2 ${
                mode === 'manual'
                  ? 'bg-black text-white'
                  : 'bg-white text-black hover:bg-[#f5f5f5]'
              }`}
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
            <div className="bg-white border border-[#e5e5e5] p-8">
              <h2 className="text-2xl font-bold text-black mb-6">
                {mode === 'ai' ? 'Generate & Validate' : 'Manual Validation'}
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Company Selector (AI Mode) */}
                {mode === 'ai' && (
                  <div>
                    <label className="block text-sm font-semibold text-black mb-2">
                      Company
                    </label>
                    {loadingCompanies ? (
                      <div className="px-4 py-3 border border-[#e5e5e5] bg-[#f5f5f5] flex items-center gap-2">
                        <Loader2 className="animate-spin" size={16} />
                        <span className="text-sm text-black/60">Loading companies...</span>
                      </div>
                    ) : (
                      <select
                        value={formData.company_id}
                        onChange={(e) => setFormData({ ...formData, company_id: e.target.value })}
                        required
                        className="w-full px-4 py-3 border border-[#e5e5e5] bg-white text-black focus:outline-none focus:border-black text-sm"
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
                  <label className="block text-sm font-semibold text-black mb-2">
                    User Query
                  </label>
                  <textarea
                    value={formData.query}
                    onChange={(e) => setFormData({ ...formData, query: e.target.value })}
                    placeholder="Enter the user's question..."
                    required
                    rows={3}
                    className="w-full px-4 py-3 border border-[#e5e5e5] bg-white text-black focus:outline-none focus:border-black resize-none text-sm"
                  />
                </div>

                {/* AI Response (Manual Mode) */}
                {mode === 'manual' && (
                  <div>
                    <label className="block text-sm font-semibold text-black mb-2">
                      AI Response
                    </label>
                    <textarea
                      value={formData.ai_response}
                      onChange={(e) => setFormData({ ...formData, ai_response: e.target.value })}
                      placeholder="Enter the AI's response to validate..."
                      required
                      rows={8}
                      className="w-full px-4 py-3 border border-[#e5e5e5] bg-white text-black focus:outline-none focus:border-black resize-none text-sm"
                    />
                  </div>
                )}

                {/* AI Model */}
                <div>
                  <label className="block text-sm font-semibold text-black mb-2">
                    AI Model
                  </label>
                  <select
                    value={formData.ai_model}
                    onChange={(e) => setFormData({ ...formData, ai_model: e.target.value })}
                    className="w-full px-4 py-3 border border-[#e5e5e5] bg-white text-black focus:outline-none focus:border-black text-sm"
                  >
                    <option value="gemini-pro">Gemini Pro</option>
                    <option value="gpt-4">GPT-4</option>
                    <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                    <option value="claude-3-opus">Claude 3 Opus</option>
                    <option value="claude-3-sonnet">Claude 3 Sonnet</option>
                  </select>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full px-6 py-4 bg-black text-white font-semibold hover:bg-black/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
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
                <div className="mt-8 pt-8 border-t border-[#e5e5e5]">
                  <h3 className="text-sm font-semibold text-black mb-4">Quick Examples</h3>
                  <div className="space-y-2">
                    {QUICK_EXAMPLES.map((example, idx) => (
                      <button
                        key={idx}
                        onClick={() => setFormData(prev => ({ ...prev, query: example.query }))}
                        className="w-full p-4 border border-[#e5e5e5] bg-white text-left hover:bg-[#f5f5f5] transition-colors"
                      >
                        <p className="text-sm font-medium text-black mb-1">{example.category}</p>
                        <p className="text-xs text-black/60">{example.query}</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Results Section */}
            <div className="bg-white border border-[#e5e5e5] p-8">
              <h2 className="text-2xl font-bold text-black mb-6">Validation Results</h2>
              
              {!result && !loading && (
                <div className="flex items-center justify-center h-96 text-black/40">
                  <div className="text-center">
                    <FileText size={48} className="mx-auto mb-4 opacity-20" />
                    <p className="text-sm">Submit a {mode === 'ai' ? 'query' : 'response'} to see validation results</p>
                  </div>
                </div>
              )}

              {result && (
                <div className="space-y-6">
                  {/* AI Response (AI Mode) */}
                  {mode === 'ai' && (
                    <div className="pb-6 border-b border-[#e5e5e5]">
                      <h3 className="text-sm font-semibold text-black mb-3 flex items-center gap-2">
                        <Sparkles size={16} />
                        Generated AI Response
                      </h3>
                      <div className="p-4 bg-[#f5f5f5] border border-[#e5e5e5]">
                        <p className="text-sm text-black whitespace-pre-wrap leading-relaxed">
                          {result.ai_response}
                        </p>
                      </div>
                      {result.company_context && (
                        <div className="mt-3 flex items-center gap-4 text-xs text-black/60">
                          <span>Company: <strong className="text-black">{result.company_context.name}</strong></span>
                          <span>Industry: <strong className="text-black">{result.company_context.industry}</strong></span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Status and Confidence */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-black/60 mb-2">Status</p>
                      <span className={`inline-block px-4 py-2 text-xs font-semibold ${getStatusColor(result.validation_result.status)}`}>
                        {result.validation_result.status.toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="text-xs text-black/60 mb-2">Confidence</p>
                      <p className="text-2xl font-bold text-black">
                        {(result.validation_result.confidence_score * 100).toFixed(0)}%
                      </p>
                    </div>
                  </div>

                  {/* Confidence Score Breakdown */}
                  {result.validation_result.confidence_breakdown && (
                    <div className="border border-[#e5e5e5]">
                      <button
                        onClick={() => toggleSection('breakdown')}
                        className="w-full p-4 bg-[#f5f5f5] flex items-center justify-between hover:bg-[#e5e5e5] transition-colors"
                      >
                        <h3 className="text-sm font-semibold text-black flex items-center gap-2">
                          <span>📊</span>
                          Score Breakdown
                        </h3>
                        {expandedSections.has('breakdown') ? (
                          <ChevronUp size={16} className="text-black/60" />
                        ) : (
                          <ChevronDown size={16} className="text-black/60" />
                        )}
                      </button>
                      {expandedSections.has('breakdown') && (
                        <div className="p-6 bg-white space-y-5">
                          {/* Overall Score */}
                          <div className="pb-4 border-b border-[#e5e5e5]">
                            <div className="flex items-baseline justify-between mb-2">
                              <p className="text-sm font-semibold text-black">Overall Confidence Score</p>
                              <p className="text-3xl font-bold text-black">
                                {(result.validation_result.confidence_score * 100).toFixed(0)}%
                              </p>
                            </div>
                            <div className="w-full h-2 bg-[#e5e5e5] mt-3">
                              <div
                                className="h-full bg-black transition-all"
                                style={{ width: `${result.validation_result.confidence_score * 100}%` }}
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
                                      <p className="text-sm font-semibold text-black mb-1">
                                        {component.label}
                                      </p>
                                      <p className="text-xs text-black/60">{component.description}</p>
                                    </div>
                                    <div className="text-right ml-4">
                                      <p className="text-lg font-bold text-black">
                                        {scorePercent.toFixed(0)}%
                                      </p>
                                      <p className="text-xs text-black/40">
                                        {weightPercent.toFixed(0)}% weight
                                      </p>
                                    </div>
                                  </div>
                                  <div className="w-full h-3 bg-[#e5e5e5]">
                                    <div
                                      className={`h-full ${getScoreColor(component.score)} transition-all`}
                                      style={{ width: `${scorePercent}%` }}
                                    />
                                  </div>
                                  {component.details && Object.keys(component.details).length > 0 && (
                                    <div className="mt-2 pt-2 border-t border-[#e5e5e5]">
                                      <div className="flex flex-wrap gap-3 text-xs text-black/60">
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
                            <div className="pt-4 border-t border-[#e5e5e5] space-y-3">
                              {result.validation_result.confidence_breakdown.contributions.positive_factors?.length > 0 && (
                                <div>
                                  <p className="text-xs font-semibold text-[#10b981] mb-2">✅ Positive Factors</p>
                                  <ul className="space-y-1">
                                    {result.validation_result.confidence_breakdown.contributions.positive_factors.map((factor: string, idx: number) => (
                                      <li key={idx} className="text-xs text-black/70 flex items-start gap-2">
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
                                      <li key={idx} className="text-xs text-black/70 flex items-start gap-2">
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
                    <div className="border border-[#e5e5e5]">
                      <button
                        onClick={() => toggleSection('violations')}
                        className="w-full p-4 bg-[#f5f5f5] flex items-center justify-between hover:bg-[#e5e5e5] transition-colors"
                      >
                        <h3 className="text-sm font-semibold text-black flex items-center gap-2">
                          <AlertTriangle size={16} />
                          Violations ({result.validation_result.violations.length})
                        </h3>
                        {expandedSections.has('violations') ? (
                          <ChevronUp size={16} className="text-black/60" />
                        ) : (
                          <ChevronDown size={16} className="text-black/60" />
                        )}
                      </button>
                      {expandedSections.has('violations') && (
                        <div className="p-4 space-y-3">
                          {result.validation_result.violations.map((violation, idx) => (
                            <div key={idx} className="p-4 bg-white border-l-4 border-[#dc2626] border border-[#e5e5e5]">
                              <div className="flex items-start justify-between mb-2">
                                <span className="text-xs font-semibold text-black">{violation.type.toUpperCase()}</span>
                                <span className={`text-xs font-semibold ${getSeverityColor(violation.severity)}`}>
                                  {violation.severity.toUpperCase()}
                                </span>
                              </div>
                              <p className="text-sm text-black/80 leading-relaxed">{violation.description}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Verification Results */}
                  {result.validation_result.verification_results.length > 0 && (
                    <div className="border border-[#e5e5e5]">
                      <button
                        onClick={() => toggleSection('verification')}
                        className="w-full p-4 bg-[#f5f5f5] flex items-center justify-between hover:bg-[#e5e5e5] transition-colors"
                      >
                        <h3 className="text-sm font-semibold text-black">
                          Fact Verification ({result.validation_result.verification_results.length})
                        </h3>
                        {expandedSections.has('verification') ? (
                          <ChevronUp size={16} className="text-black/60" />
                        ) : (
                          <ChevronDown size={16} className="text-black/60" />
                        )}
                      </button>
                      {expandedSections.has('verification') && (
                        <div className="p-4 space-y-3">
                          {result.validation_result.verification_results.map((vr, idx) => (
                            <div key={idx} className="p-4 bg-white border border-[#e5e5e5]">
                              <p className="text-sm font-medium text-black mb-3">{vr.claim_text}</p>
                              <div className="flex items-center gap-3 flex-wrap mb-3">
                                <span className={`text-xs font-semibold px-3 py-1 ${
                                  vr.verification_status === 'verified' ? 'bg-[#10b981]/10 text-[#10b981]' : 
                                  vr.verification_status === 'unverified' ? 'bg-[#f59e0b]/10 text-[#f59e0b]' : 
                                  'bg-[#dc2626]/10 text-[#dc2626]'
                                }`}>
                                  {vr.verification_status.toUpperCase()}
                                </span>
                                <span className="text-xs text-black/60">
                                  {(vr.confidence * 100).toFixed(0)}% confidence
                                </span>
                                {vr.source && (
                                  <span className="text-xs text-black/60">
                                    Source: <span className="font-medium capitalize">{vr.source}</span>
                                  </span>
                                )}
                              </div>
                              {vr.details && (
                                <div className="mt-3 pt-3 border-t border-[#e5e5e5]">
                                  <p className="text-xs text-black/80 leading-relaxed">{vr.details}</p>
                                </div>
                              )}
                              {vr.url && (
                                <div className="mt-3">
                                  <a
                                    href={vr.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs text-black/60 hover:text-black flex items-center gap-1"
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
                    <div className="p-4 bg-[#f0fdf4] border border-[#10b981]">
                      <h3 className="text-sm font-semibold text-black mb-3 flex items-center gap-2">
                        <CheckCircle size={16} className="text-[#10b981]" />
                        Corrected Response
                      </h3>
                      <p className="text-sm text-black whitespace-pre-wrap leading-relaxed mb-3">
                        {result.corrected_response}
                      </p>
                      {result.changes_made && result.changes_made.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-[#10b981]">
                          <p className="text-xs font-semibold text-black mb-2">Changes Made:</p>
                          <ul className="list-disc list-inside text-xs text-black/80 space-y-1">
                            {result.changes_made.map((change, idx) => (
                              <li key={idx}>{change}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Explanation */}
                  <div className="p-4 bg-[#f5f5f5] border border-[#e5e5e5]">
                    <h3 className="text-sm font-semibold text-black mb-3">Explanation</h3>
                    <p className="text-sm text-black whitespace-pre-wrap leading-relaxed">
                      {result.validation_result.explanation}
                    </p>
                  </div>

                  {/* Success Message */}
                  {result.validation_result.status === 'approved' && result.validation_result.violations.length === 0 && (
                    <div className="p-4 bg-[#f0fdf4] border border-[#10b981] flex items-center gap-3">
                      <CheckCircle className="text-[#10b981]" size={20} />
                      <p className="text-sm text-black">Response approved! No violations detected.</p>
                    </div>
                  )}

                  {/* View Details Link */}
                  {result.interaction_id && (
                    <button
                      onClick={() => router.push(`/interactions/${result.interaction_id}`)}
                      className="w-full px-4 py-3 border border-black bg-white text-black font-semibold hover:bg-black hover:text-white transition-colors flex items-center justify-center gap-2"
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
      </div>
    </DashboardLayout>
  )
}

