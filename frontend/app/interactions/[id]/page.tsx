'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import DashboardLayout from '@/components/common/DashboardLayout'
import SeverityBadge from '@/components/common/SeverityBadge'
import ResponseComparison from '@/components/comparison/ResponseComparison'
import { apiClient } from '@/lib/api-client'
import { useTheme } from '@/lib/theme-provider'
import {
  ArrowLeft,
  AlertTriangle,
  CheckCircle,
  XCircle,
  ExternalLink,
  Clock,
  Shield,
  FileCheck,
  Brain,
  Zap,
  ChevronDown,
  ChevronUp,
  Copy,
  Check
} from 'lucide-react'

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
  const { theme } = useTheme()
  const [data, setData] = useState<InteractionDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['query', 'violations', 'verification', 'breakdown']))
  const [copied, setCopied] = useState(false)

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

  const copyId = () => {
    navigator.clipboard.writeText(params.id as string)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-4 lg:p-8">
          <div className="animate-pulse space-y-6">
            <div className="h-10 w-48 rounded" style={{ background: 'var(--background-tertiary)' }} />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="premium-card p-6">
                  <div className="h-4 w-20 rounded mb-2" style={{ background: 'var(--background-tertiary)' }} />
                  <div className="h-8 w-24 rounded" style={{ background: 'var(--background-tertiary)' }} />
                </div>
              ))}
            </div>
            <div className="premium-card p-6">
              <div className="h-6 w-40 rounded mb-4" style={{ background: 'var(--background-tertiary)' }} />
              <div className="h-24 w-full rounded" style={{ background: 'var(--background-tertiary)' }} />
            </div>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (!data) {
    return (
      <DashboardLayout>
        <div className="p-4 lg:p-8">
          <div className="premium-card text-center py-12">
            <AlertTriangle size={48} className="mx-auto mb-4 opacity-30" style={{ color: 'var(--foreground-muted)' }} />
            <p className="text-lg font-semibold mb-2" style={{ color: 'var(--foreground)' }}>Interaction not found</p>
            <button
              onClick={() => router.back()}
              className="mt-4 px-6 py-2 text-sm font-medium"
              style={{ background: 'var(--accent-gradient)', color: 'white' }}
            >
              Go Back
            </button>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  const { interaction, violations, verification_results, citations, explanation } = data

  const getScoreColor = (score: number) => {
    if (score >= 0.8) return 'var(--success)'
    if (score >= 0.6) return '#3b82f6'
    if (score >= 0.4) return 'var(--warning)'
    return 'var(--danger)'
  }

  return (
    <DashboardLayout>
      <div className="p-4 lg:p-8">
        {/* Back Button & Header */}
        <div className="mb-6 animate-slide-down">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-sm font-medium mb-4 transition-colors"
            style={{ color: 'var(--foreground-muted)' }}
          >
            <ArrowLeft size={18} />
            <span>Back to Interactions</span>
          </button>

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold mb-2" style={{ color: 'var(--foreground)' }}>
                Interaction Details
              </h1>
              <div className="flex items-center gap-3 flex-wrap text-sm" style={{ color: 'var(--foreground-muted)' }}>
                <span className="flex items-center gap-1">
                  <Clock size={14} />
                  {new Date(interaction.timestamp).toLocaleString()}
                </span>
                <button
                  onClick={copyId}
                  className="flex items-center gap-1 px-2 py-0.5 text-xs font-mono transition-colors"
                  style={{ background: 'var(--background-tertiary)', border: '1px solid var(--border)' }}
                >
                  {copied ? <Check size={12} /> : <Copy size={12} />}
                  {(params.id as string).slice(0, 8)}...
                </button>
              </div>
            </div>
            <StatusBadge status={interaction.status} />
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="premium-card p-5">
            <div className="flex items-center gap-3 mb-2">
              <Shield size={18} style={{ color: 'var(--accent)' }} />
              <span className="text-sm font-medium" style={{ color: 'var(--foreground-muted)' }}>Status</span>
            </div>
            <StatusBadge status={interaction.status} />
          </div>

          <div className="premium-card p-5">
            <div className="flex items-center gap-3 mb-2">
              <Zap size={18} style={{ color: getScoreColor(interaction.confidence_score) }} />
              <span className="text-sm font-medium" style={{ color: 'var(--foreground-muted)' }}>Confidence</span>
            </div>
            <div className="flex items-center gap-3">
              <p className="text-2xl font-bold" style={{ color: 'var(--foreground)' }}>
                {(interaction.confidence_score * 100).toFixed(0)}%
              </p>
              <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: 'var(--background-tertiary)' }}>
                <div
                  className="h-full transition-all"
                  style={{ width: `${interaction.confidence_score * 100}%`, background: getScoreColor(interaction.confidence_score) }}
                />
              </div>
            </div>
          </div>

          <div className="premium-card p-5">
            <div className="flex items-center gap-3 mb-2">
              <AlertTriangle size={18} style={{ color: violations.length > 0 ? 'var(--danger)' : 'var(--success)' }} />
              <span className="text-sm font-medium" style={{ color: 'var(--foreground-muted)' }}>Violations</span>
            </div>
            <p
              className="text-2xl font-bold"
              style={{ color: violations.length > 0 ? 'var(--danger)' : 'var(--success)' }}
            >
              {violations.length}
            </p>
          </div>
        </div>

        {/* Query and Response */}
        <CollapsibleSection
          title="Query & Response"
          icon={Brain}
          expanded={expandedSections.has('query')}
          onToggle={() => toggleSection('query')}
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="p-4" style={{ background: 'var(--background-tertiary)', border: '1px solid var(--border)' }}>
              <h4 className="text-sm font-semibold mb-2" style={{ color: 'var(--foreground-muted)' }}>User Query</h4>
              <p className="text-sm whitespace-pre-wrap" style={{ color: 'var(--foreground)' }}>
                {interaction.user_query}
              </p>
            </div>
            <div className="p-4" style={{ background: 'var(--background-tertiary)', border: '1px solid var(--border)' }}>
              <h4 className="text-sm font-semibold mb-2" style={{ color: 'var(--foreground-muted)' }}>AI Response</h4>
              <p className="text-sm whitespace-pre-wrap" style={{ color: 'var(--foreground)' }}>
                {interaction.ai_response}
              </p>
            </div>
          </div>
        </CollapsibleSection>

        {/* Side-by-Side Comparison */}
        {interaction.validated_response &&
          interaction.validated_response.trim() !== interaction.ai_response.trim() &&
          violations.length > 0 && (
            <div className="mb-4">
              <ResponseComparison
                originalResponse={interaction.ai_response}
                correctedResponse={interaction.validated_response}
                violations={violations.map(v => ({
                  type: v.violation_type,
                  severity: v.severity,
                  description: v.description
                }))}
                verificationResults={verification_results.map(r => ({
                  claim_text: r.claim_text,
                  verification_status: r.verification_status,
                  source: r.source ?? undefined,
                  url: r.url ?? undefined,
                  details: r.details ?? undefined
                }))}
              />
            </div>
          )}

        {/* Confidence Breakdown */}
        {interaction.confidence_breakdown && (
          <CollapsibleSection
            title="Confidence Score Breakdown"
            icon={FileCheck}
            expanded={expandedSections.has('breakdown')}
            onToggle={() => toggleSection('breakdown')}
          >
            <div className="space-y-4">
              {Object.entries(interaction.confidence_breakdown)
                .filter(([key]) => key !== 'contributions')
                .map(([key, component]: [string, any]) => {
                  if (!component || typeof component !== 'object' || !component.score) return null

                  const scorePercent = component.score * 100

                  return (
                    <div key={key} className="p-4" style={{ background: 'var(--background-tertiary)', border: '1px solid var(--border)' }}>
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <p className="font-semibold" style={{ color: 'var(--foreground)' }}>{component.label}</p>
                          <p className="text-xs" style={{ color: 'var(--foreground-muted)' }}>{component.description}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold" style={{ color: getScoreColor(component.score) }}>
                            {scorePercent.toFixed(0)}%
                          </p>
                          <p className="text-xs" style={{ color: 'var(--foreground-muted)' }}>
                            {(component.weight * 100).toFixed(0)}% weight
                          </p>
                        </div>
                      </div>
                      <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
                        <div
                          className="h-full transition-all"
                          style={{ width: `${scorePercent}%`, background: getScoreColor(component.score) }}
                        />
                      </div>
                    </div>
                  )
                })}

              {/* Contributions */}
              {interaction.confidence_breakdown.contributions && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {interaction.confidence_breakdown.contributions.positive_factors?.length > 0 && (
                    <div className="p-4" style={{ background: 'var(--success-bg)', border: '1px solid var(--success)' }}>
                      <p className="text-sm font-semibold mb-2" style={{ color: 'var(--success)' }}>✓ Positive Factors</p>
                      <ul className="space-y-1">
                        {interaction.confidence_breakdown.contributions.positive_factors.map((f, i) => (
                          <li key={i} className="text-xs" style={{ color: 'var(--foreground-secondary)' }}>• {f}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {interaction.confidence_breakdown.contributions.negative_factors?.length > 0 && (
                    <div className="p-4" style={{ background: 'var(--warning-bg)', border: '1px solid var(--warning)' }}>
                      <p className="text-sm font-semibold mb-2" style={{ color: 'var(--warning)' }}>⚠ Areas for Improvement</p>
                      <ul className="space-y-1">
                        {interaction.confidence_breakdown.contributions.negative_factors.map((f, i) => (
                          <li key={i} className="text-xs" style={{ color: 'var(--foreground-secondary)' }}>• {f}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          </CollapsibleSection>
        )}

        {/* Violations */}
        {violations.length > 0 && (
          <CollapsibleSection
            title={`Violations (${violations.length})`}
            icon={AlertTriangle}
            expanded={expandedSections.has('violations')}
            onToggle={() => toggleSection('violations')}
            iconColor="var(--danger)"
          >
            <div className="space-y-3">
              {violations.map((violation) => (
                <div
                  key={violation.id}
                  className="p-4"
                  style={{ borderLeft: '4px solid var(--danger)', background: 'var(--danger-bg)', border: '1px solid var(--danger)' }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-semibold capitalize" style={{ color: 'var(--foreground)' }}>
                      {violation.violation_type.replace(/_/g, ' ')}
                    </span>
                    <SeverityBadge severity={violation.severity as 'critical' | 'high' | 'medium' | 'low'} />
                  </div>
                  <p className="text-sm" style={{ color: 'var(--foreground-secondary)' }}>{violation.description}</p>
                </div>
              ))}
            </div>
          </CollapsibleSection>
        )}

        {/* Verification Results */}
        {verification_results.length > 0 && (
          <CollapsibleSection
            title={`Fact Verification (${verification_results.length})`}
            icon={CheckCircle}
            expanded={expandedSections.has('verification')}
            onToggle={() => toggleSection('verification')}
            iconColor="var(--success)"
          >
            <div className="space-y-3">
              {verification_results.map((result) => (
                <div key={result.id} className="p-4" style={{ background: 'var(--background-tertiary)', border: '1px solid var(--border)' }}>
                  <div className="flex items-start gap-3">
                    {result.verification_status === 'verified' ? (
                      <CheckCircle size={20} style={{ color: 'var(--success)', flexShrink: 0, marginTop: 2 }} />
                    ) : result.verification_status === 'false' ? (
                      <XCircle size={20} style={{ color: 'var(--danger)', flexShrink: 0, marginTop: 2 }} />
                    ) : (
                      <AlertTriangle size={20} style={{ color: 'var(--warning)', flexShrink: 0, marginTop: 2 }} />
                    )}
                    <div className="flex-1">
                      <p className="font-medium mb-2" style={{ color: 'var(--foreground)' }}>{result.claim_text}</p>
                      <div className="flex items-center gap-3 flex-wrap">
                        <span
                          className="text-xs font-semibold px-2 py-1"
                          style={{
                            background: result.verification_status === 'verified' ? 'var(--success-bg)' :
                              result.verification_status === 'false' ? 'var(--danger-bg)' : 'var(--warning-bg)',
                            color: result.verification_status === 'verified' ? 'var(--success)' :
                              result.verification_status === 'false' ? 'var(--danger)' : 'var(--warning)'
                          }}
                        >
                          {result.verification_status.toUpperCase()}
                        </span>
                        <span className="text-xs" style={{ color: 'var(--foreground-muted)' }}>
                          {(result.confidence * 100).toFixed(0)}% confidence
                        </span>
                        {result.source && (
                          <span className="text-xs capitalize" style={{ color: 'var(--foreground-muted)' }}>
                            Source: {result.source}
                          </span>
                        )}
                      </div>
                      {result.details && (
                        <p className="text-xs mt-2 leading-relaxed" style={{ color: 'var(--foreground-secondary)' }}>
                          {result.details}
                        </p>
                      )}
                      {result.url && (
                        <a
                          href={result.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs mt-2"
                          style={{ color: 'var(--accent)' }}
                        >
                          View source <ExternalLink size={12} />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CollapsibleSection>
        )}

        {/* Citations */}
        {citations.length > 0 && (
          <CollapsibleSection
            title={`Citations (${citations.length})`}
            icon={ExternalLink}
            expanded={expandedSections.has('citations')}
            onToggle={() => toggleSection('citations')}
          >
            <div className="space-y-2">
              {citations.map((citation) => (
                <div
                  key={citation.id}
                  className="flex items-center gap-3 p-3"
                  style={{ background: 'var(--background-tertiary)', border: '1px solid var(--border)' }}
                >
                  {citation.is_valid ? (
                    <CheckCircle size={18} style={{ color: 'var(--success)', flexShrink: 0 }} />
                  ) : (
                    <XCircle size={18} style={{ color: 'var(--danger)', flexShrink: 0 }} />
                  )}
                  <a
                    href={citation.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm flex items-center gap-1 truncate flex-1"
                    style={{ color: 'var(--accent)' }}
                  >
                    {citation.url}
                  </a>
                  {citation.http_status_code && (
                    <span className="text-xs" style={{ color: 'var(--foreground-muted)' }}>
                      ({citation.http_status_code})
                    </span>
                  )}
                </div>
              ))}
            </div>
          </CollapsibleSection>
        )}

        {/* Explanation */}
        {explanation && (
          <div className="premium-card p-6">
            <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--foreground)' }}>Explanation</h3>
            <p className="text-sm whitespace-pre-wrap leading-relaxed" style={{ color: 'var(--foreground-secondary)' }}>
              {explanation.summary}
            </p>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}

function StatusBadge({ status }: { status: string }) {
  const configs = {
    approved: { bg: 'var(--success-bg)', color: 'var(--success)', icon: CheckCircle },
    flagged: { bg: 'var(--warning-bg)', color: 'var(--warning)', icon: AlertTriangle },
    blocked: { bg: 'var(--danger-bg)', color: 'var(--danger)', icon: XCircle },
  }

  const config = configs[status as keyof typeof configs] || { bg: 'var(--background-tertiary)', color: 'var(--foreground)', icon: Shield }
  const Icon = config.icon

  return (
    <span
      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold"
      style={{ background: config.bg, color: config.color }}
    >
      <Icon size={14} />
      {status.toUpperCase()}
    </span>
  )
}

function CollapsibleSection({
  title,
  icon: Icon,
  expanded,
  onToggle,
  children,
  iconColor
}: {
  title: string
  icon: any
  expanded: boolean
  onToggle: () => void
  children: React.ReactNode
  iconColor?: string
}) {
  return (
    <div className="premium-card mb-4 overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full p-4 flex items-center justify-between transition-colors"
        style={{ background: expanded ? 'var(--background-tertiary)' : 'transparent' }}
      >
        <h3 className="text-lg font-semibold flex items-center gap-2" style={{ color: 'var(--foreground)' }}>
          <Icon size={20} style={{ color: iconColor || 'var(--accent)' }} />
          {title}
        </h3>
        {expanded ? (
          <ChevronUp size={20} style={{ color: 'var(--foreground-muted)' }} />
        ) : (
          <ChevronDown size={20} style={{ color: 'var(--foreground-muted)' }} />
        )}
      </button>
      {expanded && (
        <div className="p-4" style={{ borderTop: '1px solid var(--border)' }}>
          {children}
        </div>
      )}
    </div>
  )
}
