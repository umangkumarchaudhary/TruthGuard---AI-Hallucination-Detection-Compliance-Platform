'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import DashboardLayout from '@/components/common/DashboardLayout'
import ExportButton from '@/components/audit/ExportButton'
import { apiClient } from '@/lib/api-client'
import { useTheme } from '@/lib/theme-provider'
import { Search, Filter, Calendar, ChevronRight, Activity, CheckCircle, AlertCircle, XCircle, Clock } from 'lucide-react'

interface Interaction {
  id: string
  user_query: string
  ai_response: string
  validated_response?: string
  status: string
  confidence_score: number
  ai_model?: string
  timestamp: string
  violation_count: number
}

export default function InteractionsPage() {
  const router = useRouter()
  const [interactions, setInteractions] = useState<Interaction[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const { theme } = useTheme()
  const itemsPerPage = 20

  useEffect(() => {
    loadInteractions()
  }, [currentPage, statusFilter])

  const loadInteractions = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        limit: itemsPerPage.toString(),
        offset: ((currentPage - 1) * itemsPerPage).toString(),
        organization_id: '00000000-0000-0000-0000-000000000001',
      })

      if (statusFilter !== 'all') {
        params.append('status', statusFilter)
      }

      const res = await apiClient.get<Interaction[]>(`/api/v1/audit/interactions?${params}`)
      if (res.data) {
        setInteractions(res.data)
        setTotalPages(Math.ceil((res.data.length || 0) / itemsPerPage))
      }
    } catch (error) {
      console.error('Error loading interactions:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredInteractions = interactions.filter(interaction =>
    interaction.user_query.toLowerCase().includes(searchTerm.toLowerCase()) ||
    interaction.ai_response.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <DashboardLayout>
      <div className="p-4 lg:p-8">
        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-start justify-between gap-4 animate-slide-down">
          <div>
            <h1 className="text-3xl lg:text-4xl font-bold tracking-tight mb-2" style={{ color: 'var(--foreground)' }}>
              Interactions
            </h1>
            <p style={{ color: 'var(--foreground-muted)' }}>View and analyze all AI interactions</p>
          </div>
          <ExportButton organizationId="00000000-0000-0000-0000-000000000001" />
        </div>

        {/* Filters */}
        <div className="premium-card p-4 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Filter size={18} style={{ color: 'var(--foreground-muted)' }} />
            <span className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>Filters</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2" size={18} style={{ color: 'var(--foreground-muted)' }} />
              <input
                type="text"
                placeholder="Search interactions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 text-sm focus:outline-none"
                style={{
                  background: 'var(--background-tertiary)',
                  border: '1px solid var(--border)',
                  color: 'var(--foreground)'
                }}
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value)
                setCurrentPage(1)
              }}
              className="px-4 py-3 text-sm focus:outline-none"
              style={{
                background: 'var(--background-tertiary)',
                border: '1px solid var(--border)',
                color: 'var(--foreground)'
              }}
            >
              <option value="all">All Status</option>
              <option value="approved">Approved</option>
              <option value="flagged">Flagged</option>
              <option value="blocked">Blocked</option>
            </select>

            {/* Date Filter */}
            <button
              className="px-4 py-3 flex items-center gap-2 text-sm"
              style={{
                background: 'var(--background-tertiary)',
                border: '1px solid var(--border)',
                color: 'var(--foreground)'
              }}
            >
              <Calendar size={18} />
              <span>Date Range</span>
            </button>
          </div>
        </div>

        {/* Interactions List */}
        {loading ? (
          <div className="space-y-4 animate-pulse">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="premium-card p-6">
                <div className="h-5 w-3/4 rounded mb-3" style={{ background: 'var(--background-tertiary)' }} />
                <div className="h-4 w-1/2 rounded" style={{ background: 'var(--background-tertiary)' }} />
              </div>
            ))}
          </div>
        ) : filteredInteractions.length === 0 ? (
          <div className="premium-card p-12 text-center">
            <Activity size={48} className="mx-auto mb-4 opacity-30" style={{ color: 'var(--foreground-muted)' }} />
            <p className="text-lg font-semibold mb-2" style={{ color: 'var(--foreground)' }}>No Interactions Found</p>
            <p style={{ color: 'var(--foreground-muted)' }}>Start testing AI responses to see data here.</p>
          </div>
        ) : (
          <div className="space-y-3 stagger-children">
            {filteredInteractions.map((interaction) => (
              <div
                key={interaction.id}
                className="premium-card p-4 lg:p-6 cursor-pointer group"
                onClick={() => router.push(`/interactions/${interaction.id}`)}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium mb-2 truncate" style={{ color: 'var(--foreground)' }}>
                      {interaction.user_query}
                    </p>
                    <div className="flex flex-wrap items-center gap-3 text-xs" style={{ color: 'var(--foreground-muted)' }}>
                      <span className="flex items-center gap-1">
                        <Clock size={12} />
                        {new Date(interaction.timestamp).toLocaleString()}
                      </span>
                      <span>Confidence: {(interaction.confidence_score * 100).toFixed(0)}%</span>
                      {interaction.violation_count > 0 && (
                        <span style={{ color: 'var(--danger)' }}>{interaction.violation_count} violations</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <StatusBadge status={interaction.status} />
                    <ChevronRight
                      size={20}
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                      style={{ color: 'var(--foreground-muted)' }}
                    />
                  </div>
                </div>
              </div>
            ))}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-4">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    background: 'var(--background-tertiary)',
                    border: '1px solid var(--border)',
                    color: 'var(--foreground)'
                  }}
                >
                  Previous
                </button>
                <span className="text-sm" style={{ color: 'var(--foreground-muted)' }}>
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    background: 'var(--background-tertiary)',
                    border: '1px solid var(--border)',
                    color: 'var(--foreground)'
                  }}
                >
                  Next
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}

function StatusBadge({ status }: { status: string }) {
  const configs = {
    approved: { bg: 'var(--success-bg)', color: 'var(--success)', icon: CheckCircle },
    flagged: { bg: 'var(--warning-bg)', color: 'var(--warning)', icon: AlertCircle },
    blocked: { bg: 'var(--danger-bg)', color: 'var(--danger)', icon: XCircle },
  }

  const config = configs[status as keyof typeof configs] || { bg: 'var(--background-tertiary)', color: 'var(--foreground)', icon: Activity }
  const Icon = config.icon

  return (
    <span
      className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold"
      style={{ background: config.bg, color: config.color }}
    >
      <Icon size={12} />
      {status.toUpperCase()}
    </span>
  )
}
