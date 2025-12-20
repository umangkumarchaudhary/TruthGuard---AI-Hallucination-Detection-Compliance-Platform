'use client'

import { useEffect, useState } from 'react'
import DashboardLayout from '@/components/common/DashboardLayout'
import SeverityBadge from '@/components/common/SeverityBadge'
import { apiClient } from '@/lib/api-client'
import { useTheme } from '@/lib/theme-provider'
import { AlertTriangle, Filter, Clock, ChevronRight, Activity, Shield } from 'lucide-react'
import Link from 'next/link'

interface Violation {
  id: string
  interaction_id: string
  violation_type: string
  severity: string
  description: string
  detected_at: string
}

export default function ViolationsPage() {
  const [violations, setViolations] = useState<Violation[]>([])
  const [loading, setLoading] = useState(true)
  const [severityFilter, setSeverityFilter] = useState<string>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const { theme } = useTheme()

  useEffect(() => {
    loadViolations()
  }, [severityFilter, typeFilter])

  const loadViolations = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        limit: '100',
        offset: '0',
        organization_id: '00000000-0000-0000-0000-000000000001',
      })

      if (severityFilter !== 'all') {
        params.append('severity', severityFilter)
      }
      if (typeFilter !== 'all') {
        params.append('violation_type', typeFilter)
      }

      const res = await apiClient.get<Violation[]>(`/api/v1/audit/violations?${params}`)
      if (res.data) {
        setViolations(res.data)
      }
    } catch (error) {
      console.error('Error loading violations:', error)
    } finally {
      setLoading(false)
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical': return theme === 'dark' ? '#ef4444' : '#dc2626'
      case 'high': return theme === 'dark' ? '#fbbf24' : '#f59e0b'
      case 'medium': return theme === 'dark' ? '#60a5fa' : '#3b82f6'
      case 'low': return 'var(--foreground-muted)'
      default: return 'var(--foreground)'
    }
  }

  return (
    <DashboardLayout>
      <div className="p-4 lg:p-8">
        {/* Header */}
        <div className="mb-8 animate-slide-down">
          <div className="flex items-center gap-3 mb-2">
            <div
              className="w-2 h-2 rounded-full"
              style={{ background: violations.length > 0 ? 'var(--danger)' : 'var(--success)' }}
            />
            <span
              className="text-xs font-semibold uppercase tracking-wider"
              style={{ color: violations.length > 0 ? 'var(--danger)' : 'var(--success)' }}
            >
              {violations.length} Active
            </span>
          </div>
          <h1
            className="text-3xl lg:text-4xl font-bold tracking-tight mb-2"
            style={{ color: 'var(--foreground)' }}
          >
            Violations
          </h1>
          <p style={{ color: 'var(--foreground-muted)' }}>
            Review all detected violations
          </p>
        </div>

        {/* Filters */}
        <div className="premium-card p-4 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Filter size={18} style={{ color: 'var(--foreground-muted)' }} />
            <span className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>Filters</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="px-4 py-3 text-sm font-medium focus:outline-none"
              style={{
                background: 'var(--background-tertiary)',
                border: '1px solid var(--border)',
                color: 'var(--foreground)'
              }}
            >
              <option value="all">All Severities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-4 py-3 text-sm font-medium focus:outline-none"
              style={{
                background: 'var(--background-tertiary)',
                border: '1px solid var(--border)',
                color: 'var(--foreground)'
              }}
            >
              <option value="all">All Types</option>
              <option value="hallucination">Hallucination</option>
              <option value="citation">Citation</option>
              <option value="compliance">Compliance</option>
              <option value="policy">Policy</option>
            </select>
          </div>
        </div>

        {/* Violations List */}
        {loading ? (
          <div className="space-y-4 animate-pulse">
            {[1, 2, 3].map((i) => (
              <div key={i} className="premium-card p-6">
                <div className="h-6 w-40 rounded mb-4" style={{ background: 'var(--background-tertiary)' }} />
                <div className="h-4 w-full rounded mb-2" style={{ background: 'var(--background-tertiary)' }} />
                <div className="h-4 w-3/4 rounded" style={{ background: 'var(--background-tertiary)' }} />
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4 stagger-children">
            {violations.length === 0 ? (
              <div className="premium-card p-12 text-center">
                <Shield size={48} className="mx-auto mb-4 opacity-30" style={{ color: 'var(--success)' }} />
                <p className="text-lg font-semibold mb-2" style={{ color: 'var(--foreground)' }}>
                  No Violations Found
                </p>
                <p style={{ color: 'var(--foreground-muted)' }}>
                  All AI responses are compliant with current policies.
                </p>
              </div>
            ) : (
              violations.map((violation) => (
                <div
                  key={violation.id}
                  className="premium-card p-6 group"
                  style={{ borderLeft: `4px solid ${getSeverityColor(violation.severity)}` }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 flex items-center justify-center"
                        style={{ background: `${getSeverityColor(violation.severity)}20` }}
                      >
                        <AlertTriangle size={20} style={{ color: getSeverityColor(violation.severity) }} />
                      </div>
                      <div>
                        <h3
                          className="text-lg font-semibold capitalize"
                          style={{ color: 'var(--foreground)' }}
                        >
                          {violation.violation_type.replace(/_/g, ' ')}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          <Clock size={12} style={{ color: 'var(--foreground-muted)' }} />
                          <p className="text-xs" style={{ color: 'var(--foreground-muted)' }}>
                            {new Date(violation.detected_at).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                    <SeverityBadge severity={violation.severity as 'critical' | 'high' | 'medium' | 'low'} />
                  </div>
                  <p className="text-sm leading-relaxed mb-4" style={{ color: 'var(--foreground-secondary)' }}>
                    {violation.description}
                  </p>
                  <Link
                    href={`/interactions/${violation.interaction_id}`}
                    className="inline-flex items-center gap-1 text-sm font-medium transition-colors"
                    style={{ color: 'var(--accent)' }}
                  >
                    View Interaction <ChevronRight size={16} />
                  </Link>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
