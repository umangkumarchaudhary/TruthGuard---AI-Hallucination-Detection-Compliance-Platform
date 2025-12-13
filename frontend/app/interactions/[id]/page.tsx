'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import DashboardLayout from '@/components/common/DashboardLayout'
import SeverityBadge from '@/components/common/SeverityBadge'
import ResponseComparison from '@/components/comparison/ResponseComparison'
import { apiClient } from '@/lib/api-client'
import { ArrowLeft, AlertTriangle, CheckCircle, XCircle, ExternalLink } from 'lucide-react'

interface ConfidenceBreakdown {
  score: number
  weight: number
  weighted_score: number
  label: string
  description: string
  details: Record<string, any>
}

interface InteractionDetail {
  interaction: {
    id: string
    user_query: string
    ai_response: string
    validated_response?: string
    status: string
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
    ai_model?: string
    timestamp: string
  }
  violations: Array<{
    id: string
    violation_type: string
    severity: string
    description: string
  }>
  verification_results: Array<{
    id: string
    claim_text: string
    verification_status: string
    confidence: number
    source?: string | null
    details?: string | null
    url?: string | null
  }>
  citations: Array<{
    id: string
    url: string
    is_valid: boolean
    http_status_code?: number
  }>
  explanation: {
    summary: string
    status: string
    confidence_score: number
    violation_count: number
  }
}

export default function InteractionDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [data, setData] = useState<InteractionDetail | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (params.id) {
      loadInteractionDetail(params.id as string)
    }
  }, [params.id])

  const loadInteractionDetail = async (id: string) => {
    setLoading(true)
    try {
      const res = await apiClient.get<InteractionDetail>(`/api/v1/audit/interactions/${id}`)
      if (res.data) {
        setData(res.data)
      }
    } catch (error) {
      console.error('Error loading interaction detail:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-4 lg:p-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-black">Loading...</div>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (!data) {
    return (
      <DashboardLayout>
        <div className="p-4 lg:p-8">
          <div className="text-center py-12">
            <p className="text-black">Interaction not found</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  const { interaction, violations, verification_results, citations, explanation } = data

  return (
    <DashboardLayout>
      <div className="p-4 lg:p-8">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-black hover:text-black/60 mb-6"
        >
          <ArrowLeft size={18} />
          <span>Back to Interactions</span>
        </button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-black mb-2">Interaction Details</h1>
          <p className="text-sm text-black/60">
            {new Date(interaction.timestamp).toLocaleString()}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Status Card */}
          <div className="bg-white border border-[#e5e5e5] p-6">
            <h3 className="text-sm font-medium text-black/60 mb-2">Status</h3>
            <StatusBadge status={interaction.status} />
          </div>

          {/* Confidence Card */}
          <div className="bg-white border border-[#e5e5e5] p-6">
            <h3 className="text-sm font-medium text-black/60 mb-2">Confidence Score</h3>
            <p className="text-2xl font-bold text-black">
              {(interaction.confidence_score * 100).toFixed(0)}%
            </p>
          </div>

          {/* Violations Card */}
          <div className="bg-white border border-[#e5e5e5] p-6">
            <h3 className="text-sm font-medium text-black/60 mb-2">Violations</h3>
            <p className="text-2xl font-bold text-black">{violations.length}</p>
          </div>
        </div>

        {/* Query and Response */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="bg-white border border-[#e5e5e5] p-6">
            <h3 className="text-lg font-semibold text-black mb-4">User Query</h3>
            <p className="text-sm text-black whitespace-pre-wrap">{interaction.user_query}</p>
          </div>

          <div className="bg-white border border-[#e5e5e5] p-6">
            <h3 className="text-lg font-semibold text-black mb-4">AI Response</h3>
            <p className="text-sm text-black whitespace-pre-wrap">{interaction.ai_response}</p>
          </div>
        </div>

        {/* Side-by-Side Comparison */}
        {interaction.validated_response && 
         interaction.validated_response.trim() !== interaction.ai_response.trim() && 
         violations.length > 0 && (
          <ResponseComparison
            originalResponse={interaction.ai_response}
            correctedResponse={interaction.validated_response}
            violations={violations}
            verificationResults={verification_results}
          />
        )}

        {/* Validated Response (fallback if no comparison shown) */}
        {interaction.validated_response && 
         (interaction.validated_response.trim() === interaction.ai_response.trim() || violations.length === 0) && (
          <div className="bg-white border border-[#e5e5e5] p-6 mb-6">
            <h3 className="text-lg font-semibold text-black mb-4">Validated Response</h3>
            <p className="text-sm text-black whitespace-pre-wrap">{interaction.validated_response}</p>
          </div>
        )}

        {/* Violations */}
        {violations.length > 0 && (
          <div className="bg-white border border-[#e5e5e5] p-6 mb-6">
            <h3 className="text-lg font-semibold text-black mb-4 flex items-center gap-2">
              <AlertTriangle size={20} />
              Violations ({violations.length})
            </h3>
            <div className="space-y-3">
              {violations.map((violation) => (
                <div key={violation.id} className="border-l-4 border-[#dc2626] pl-4 py-2">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-semibold text-black">{violation.violation_type}</span>
                    <SeverityBadge severity={violation.severity} />
                  </div>
                  <p className="text-sm text-black/80">{violation.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Verification Results */}
        {verification_results.length > 0 && (
          <div className="bg-white border border-[#e5e5e5] p-6 mb-6">
            <h3 className="text-lg font-semibold text-black mb-4">Fact Verification</h3>
            <div className="space-y-4">
              {verification_results.map((result) => (
                <div key={result.id} className="border border-[#e5e5e5] p-4">
                  <div className="flex items-start gap-3 mb-2">
                    {result.verification_status === 'verified' ? (
                      <CheckCircle className="text-[#10b981] flex-shrink-0 mt-0.5" size={20} />
                    ) : result.verification_status === 'false' ? (
                      <XCircle className="text-[#dc2626] flex-shrink-0 mt-0.5" size={20} />
                    ) : (
                      <AlertTriangle className="text-[#f59e0b] flex-shrink-0 mt-0.5" size={20} />
                    )}
                    <div className="flex-1">
                      <p className="text-sm font-medium text-black mb-1">{result.claim_text}</p>
                      <div className="flex items-center gap-3 flex-wrap mt-2">
                        <span className={`text-xs font-medium px-2 py-1 ${
                          result.verification_status === 'verified' 
                            ? 'bg-[#10b981]/10 text-[#10b981]' 
                            : result.verification_status === 'false'
                            ? 'bg-[#dc2626]/10 text-[#dc2626]'
                            : 'bg-[#f59e0b]/10 text-[#f59e0b]'
                        }`}>
                          {result.verification_status.toUpperCase()}
                        </span>
                        <span className="text-xs text-black/60">
                          Confidence: {(result.confidence * 100).toFixed(0)}%
                        </span>
                        {result.source && (
                          <span className="text-xs text-black/60">
                            Source: <span className="font-medium capitalize">{result.source}</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Source Details */}
                  {result.details && (
                    <div className="mt-3 pt-3 border-t border-[#e5e5e5]">
                      <p className="text-xs text-black/80 mb-2">
                        <span className="font-medium">Verification Details:</span>
                      </p>
                      <p className="text-xs text-black/70 leading-relaxed">{result.details}</p>
                    </div>
                  )}
                  
                  {/* Source URL */}
                  {result.url && (
                    <div className="mt-2">
                      <a
                        href={result.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-black/60 hover:text-black flex items-center gap-1"
                      >
                        View source
                        <ExternalLink size={12} />
                      </a>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Citations */}
        {citations.length > 0 && (
          <div className="bg-white border border-[#e5e5e5] p-6 mb-6">
            <h3 className="text-lg font-semibold text-black mb-4">Citations</h3>
            <div className="space-y-2">
              {citations.map((citation) => (
                <div key={citation.id} className="flex items-center gap-3 p-3 border border-[#e5e5e5]">
                  {citation.is_valid ? (
                    <CheckCircle className="text-[#10b981] flex-shrink-0" size={18} />
                  ) : (
                    <XCircle className="text-[#dc2626] flex-shrink-0" size={18} />
                  )}
                  <a
                    href={citation.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-black hover:text-black/60 flex items-center gap-1"
                  >
                    {citation.url}
                    <ExternalLink size={14} />
                  </a>
                  {citation.http_status_code && (
                    <span className="text-xs text-black/60">({citation.http_status_code})</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Explanation */}
        {explanation && (
          <div className="bg-white border border-[#e5e5e5] p-6">
            <h3 className="text-lg font-semibold text-black mb-4">Explanation</h3>
            <div className="prose prose-sm max-w-none">
              <pre className="text-sm text-black whitespace-pre-wrap font-sans">
                {explanation.summary}
              </pre>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}

function StatusBadge({ status }: { status: string }) {
  const colors = {
    approved: 'bg-[#10b981] text-white',
    flagged: 'bg-[#f59e0b] text-white',
    blocked: 'bg-[#dc2626] text-white',
  }

  return (
    <span className={`px-3 py-1 text-xs font-medium ${colors[status as keyof typeof colors] || 'bg-black text-white'}`}>
      {status.toUpperCase()}
    </span>
  )
}


