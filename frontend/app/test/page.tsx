'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import DashboardLayout from '@/components/common/DashboardLayout'
import { apiClient } from '@/lib/api-client'
import { CheckCircle, XCircle, AlertTriangle, Loader2, ExternalLink } from 'lucide-react'

interface ConfidenceBreakdown {
  score: number
  weight: number
  weighted_score: number
  label: string
  description: string
  details: Record<string, any>
}

interface ValidationResponse {
  status: 'approved' | 'flagged' | 'blocked'
  validated_response?: string
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
  explanation: string
  interaction_id?: string
  correction_suggested: boolean
  changes_made?: string[]
}

const AI_MODELS = [
  { value: 'gpt-4', label: 'GPT-4' },
  { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo' },
  { value: 'claude-3-opus', label: 'Claude 3 Opus' },
  { value: 'claude-3-sonnet', label: 'Claude 3 Sonnet' },
  { value: 'gemini-pro', label: 'Gemini Pro' },
  { value: 'custom', label: 'Custom Model' }
]

export default function TestPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<ValidationResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  
  const [formData, setFormData] = useState({
    query: '',
    ai_response: '',
    ai_model: 'gpt-4'
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const response = await apiClient.post<ValidationResponse>('/api/v1/validate', {
        query: formData.query,
        ai_response: formData.ai_response,
        ai_model: formData.ai_model,
        organization_id: '00000000-0000-0000-0000-000000000001'
      })

      if (response.error) {
        setError(response.error)
      } else if (response.data) {
        setResult(response.data)
        // Reset form after successful submission
        setFormData({ query: '', ai_response: '', ai_model: formData.ai_model })
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
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
      <div className="p-4 lg:p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-black mb-2">Test AI Response</h1>
          <p className="text-sm text-black/60">Validate AI responses for hallucinations, compliance, and accuracy</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Form Section */}
          <div className="bg-white border border-[#e5e5e5] p-6">
            <h2 className="text-xl font-semibold text-black mb-4">Submit for Validation</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* User Query */}
              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  User Query
                </label>
                <input
                  type="text"
                  value={formData.query}
                  onChange={(e) => setFormData({ ...formData, query: e.target.value })}
                  placeholder="Enter the user's question..."
                  required
                  className="w-full px-4 py-2 border border-[#e5e5e5] bg-white text-black focus:outline-none focus:border-black"
                />
              </div>

              {/* AI Response */}
              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  AI Response
                </label>
                <textarea
                  value={formData.ai_response}
                  onChange={(e) => setFormData({ ...formData, ai_response: e.target.value })}
                  placeholder="Enter the AI's response to validate..."
                  required
                  rows={8}
                  className="w-full px-4 py-2 border border-[#e5e5e5] bg-white text-black focus:outline-none focus:border-black resize-none"
                />
              </div>

              {/* AI Model */}
              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  AI Model
                </label>
                <select
                  value={formData.ai_model}
                  onChange={(e) => setFormData({ ...formData, ai_model: e.target.value })}
                  className="w-full px-4 py-2 border border-[#e5e5e5] bg-white text-black focus:outline-none focus:border-black"
                >
                  {AI_MODELS.map(model => (
                    <option key={model.value} value={model.value}>
                      {model.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full px-6 py-3 bg-black text-white font-medium hover:bg-black/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin" size={18} />
                    <span>Validating...</span>
                  </>
                ) : (
                  <span>Validate Response</span>
                )}
              </button>
            </form>

            {/* Error Display */}
            {error && (
              <div className="mt-4 p-4 bg-[#fee2e2] border border-[#dc2626]">
                <p className="text-sm text-[#dc2626]">{error}</p>
              </div>
            )}
          </div>

          {/* Results Section */}
          <div className="bg-white border border-[#e5e5e5] p-6">
            <h2 className="text-xl font-semibold text-black mb-4">Validation Results</h2>
            
            {!result && !loading && (
              <div className="flex items-center justify-center h-64 text-black/40">
                <p className="text-sm">Submit a response to see validation results</p>
              </div>
            )}

            {result && (
              <div className="space-y-6">
                {/* Status and Confidence */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-black/60 mb-1">Status</p>
                    <span className={`inline-block px-3 py-1 text-xs font-medium ${getStatusColor(result.status)}`}>
                      {result.status.toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="text-xs text-black/60 mb-1">Confidence</p>
                    <p className="text-lg font-semibold text-black">
                      {(result.confidence_score * 100).toFixed(0)}%
                    </p>
                  </div>
                </div>

                {/* Confidence Score Breakdown */}
                {result.confidence_breakdown && (
                  <div className="border border-[#e5e5e5]">
                    <h3 className="text-sm font-semibold text-black p-4 bg-[#f5f5f5] border-b border-[#e5e5e5] flex items-center gap-2">
                      <span>📊</span>
                      Score Breakdown
                    </h3>
                    <div className="p-6 bg-white space-y-5">
                      {/* Overall Score */}
                      <div className="pb-4 border-b border-[#e5e5e5]">
                        <div className="flex items-baseline justify-between mb-2">
                          <p className="text-sm font-semibold text-black">Overall Confidence Score</p>
                          <p className="text-3xl font-bold text-black">
                            {(result.confidence_score * 100).toFixed(0)}%
                          </p>
                        </div>
                        <div className="w-full h-2 bg-[#e5e5e5] mt-3">
                          <div
                            className="h-full bg-black transition-all"
                            style={{ width: `${result.confidence_score * 100}%` }}
                          />
                        </div>
                      </div>

                      {/* Component Breakdowns */}
                      {Object.entries(result.confidence_breakdown)
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
                      {result.confidence_breakdown.contributions && (
                        <div className="pt-4 border-t border-[#e5e5e5] space-y-3">
                          {result.confidence_breakdown.contributions.positive_factors?.length > 0 && (
                            <div>
                              <p className="text-xs font-semibold text-[#10b981] mb-2">✅ Positive Factors</p>
                              <ul className="space-y-1">
                                {result.confidence_breakdown.contributions.positive_factors.map((factor: string, idx: number) => (
                                  <li key={idx} className="text-xs text-black/70 flex items-start gap-2">
                                    <span className="text-[#10b981] mt-0.5">•</span>
                                    <span>{factor}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                          {result.confidence_breakdown.contributions.negative_factors?.length > 0 && (
                            <div>
                              <p className="text-xs font-semibold text-[#f59e0b] mb-2">⚠️ Areas for Improvement</p>
                              <ul className="space-y-1">
                                {result.confidence_breakdown.contributions.negative_factors.map((factor: string, idx: number) => (
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
                  </div>
                )}

                {/* Violations */}
                {result.violations.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-black mb-3 flex items-center gap-2">
                      <AlertTriangle size={16} />
                      Violations ({result.violations.length})
                    </h3>
                    <div className="space-y-2">
                      {result.violations.map((violation, idx) => (
                        <div key={idx} className="p-3 bg-[#f5f5f5] border-l-4 border-[#dc2626]">
                          <div className="flex items-start justify-between mb-1">
                            <span className="text-xs font-medium text-black">{violation.type.toUpperCase()}</span>
                            <span className={`text-xs font-medium ${getSeverityColor(violation.severity)}`}>
                              {violation.severity.toUpperCase()}
                            </span>
                          </div>
                          <p className="text-sm text-black/80">{violation.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Corrected Response */}
                {result.correction_suggested && result.validated_response && (
                  <div>
                    <h3 className="text-sm font-semibold text-black mb-2">Corrected Response</h3>
                    <div className="p-4 bg-[#f0fdf4] border border-[#10b981]">
                      <p className="text-sm text-black whitespace-pre-wrap">{result.validated_response}</p>
                    </div>
                    {result.changes_made && result.changes_made.length > 0 && (
                      <div className="mt-2">
                        <p className="text-xs text-black/60 mb-1">Changes Made:</p>
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
                <div>
                  <h3 className="text-sm font-semibold text-black mb-2">Explanation</h3>
                  <div className="p-4 bg-[#f5f5f5]">
                    <p className="text-sm text-black whitespace-pre-wrap">{result.explanation}</p>
                  </div>
                </div>

                {/* Verification Results */}
                {result.verification_results.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-black mb-2">Claim Verification</h3>
                    <div className="space-y-2">
                      {result.verification_results.slice(0, 3).map((vr, idx) => (
                        <div key={idx} className="p-3 bg-[#f5f5f5] border border-[#e5e5e5]">
                          <p className="text-xs font-medium text-black mb-2">{vr.claim_text}</p>
                          <div className="flex items-center gap-2 flex-wrap mb-2">
                            <span className={`text-xs font-medium px-2 py-0.5 ${
                              vr.verification_status === 'verified' ? 'bg-[#10b981]/10 text-[#10b981]' : 
                              vr.verification_status === 'unverified' ? 'bg-[#f59e0b]/10 text-[#f59e0b]' : 
                              'bg-[#dc2626]/10 text-[#dc2626]'
                            }`}>
                              {vr.verification_status.toUpperCase()}
                            </span>
                            <span className="text-xs text-black/60">
                              {(vr.confidence * 100).toFixed(0)}% confidence
                            </span>
                            {(vr as any).source && (
                              <span className="text-xs text-black/60">
                                Source: <span className="font-medium capitalize">{(vr as any).source}</span>
                              </span>
                            )}
                          </div>
                          {(vr as any).details && (
                            <p className="text-xs text-black/70 mt-2 leading-relaxed">
                              {(vr as any).details.substring(0, 150)}
                              {(vr as any).details.length > 150 ? '...' : ''}
                            </p>
                          )}
                          {(vr as any).url && (
                            <a
                              href={(vr as any).url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-black/60 hover:text-black mt-2 inline-flex items-center gap-1"
                            >
                              View source <ExternalLink size={12} />
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* View Details Link */}
                {result.interaction_id && (
                  <div className="pt-4 border-t border-[#e5e5e5]">
                    <button
                      onClick={() => router.push(`/interactions/${result.interaction_id}`)}
                      className="w-full px-4 py-2 border border-black bg-white text-black font-medium hover:bg-black hover:text-white transition-colors flex items-center justify-center gap-2"
                    >
                      <span>View Full Details</span>
                      <ExternalLink size={16} />
                    </button>
                  </div>
                )}

                {/* Success Message for Approved */}
                {result.status === 'approved' && result.violations.length === 0 && (
                  <div className="p-4 bg-[#f0fdf4] border border-[#10b981] flex items-center gap-2">
                    <CheckCircle className="text-[#10b981]" size={20} />
                    <p className="text-sm text-black">Response approved! No violations detected.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Quick Examples Section */}
        <div className="mt-8 bg-white border border-[#e5e5e5] p-6">
          <h2 className="text-xl font-semibold text-black mb-4">Quick Test Examples</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => setFormData({
                query: "Should I invest all my savings in cryptocurrency?",
                ai_response: "Yes, cryptocurrency always goes up. You should invest all your savings for maximum returns.",
                ai_model: 'gpt-4'
              })}
              className="p-4 border border-[#e5e5e5] bg-white text-left hover:bg-[#f5f5f5] transition-colors"
            >
              <p className="text-sm font-medium text-black mb-1">Financial Advice</p>
              <p className="text-xs text-black/60">Test compliance violations</p>
            </button>
            <button
              onClick={() => setFormData({
                query: "Can I get a refund for my canceled flight?",
                ai_response: "Yes, full refund within 24 hours guaranteed.",
                ai_model: 'gpt-4'
              })}
              className="p-4 border border-[#e5e5e5] bg-white text-left hover:bg-[#f5f5f5] transition-colors"
            >
              <p className="text-sm font-medium text-black mb-1">Policy Violation</p>
              <p className="text-xs text-black/60">Test policy alignment</p>
            </button>
            <button
              onClick={() => setFormData({
                query: "What does GDPR Article 25 say?",
                ai_response: "GDPR Article 25 requires companies to delete all user data annually.",
                ai_model: 'claude-3-opus'
              })}
              className="p-4 border border-[#e5e5e5] bg-white text-left hover:bg-[#f5f5f5] transition-colors"
            >
              <p className="text-sm font-medium text-black mb-1">Hallucination</p>
              <p className="text-xs text-black/60">Test fact verification</p>
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

