'use client'

import { useEffect, useState } from 'react'
import DashboardLayout from '@/components/common/DashboardLayout'
import { apiClient } from '@/lib/api-client'
import { AlertTriangle, Filter } from 'lucide-react'

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

  return (
    <DashboardLayout>
      <div className="p-4 lg:p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-black mb-2">Violations</h1>
          <p className="text-sm text-black/60">Review all detected violations</p>
        </div>

        {/* Filters */}
        <div className="bg-white border border-[#e5e5e5] p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="px-4 py-2 border border-[#e5e5e5] bg-white text-black focus:outline-none focus:border-black"
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
              className="px-4 py-2 border border-[#e5e5e5] bg-white text-black focus:outline-none focus:border-black"
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
          <div className="flex items-center justify-center h-64">
            <div className="text-black">Loading...</div>
          </div>
        ) : (
          <div className="space-y-4">
            {violations.length === 0 ? (
              <div className="bg-white border border-[#e5e5e5] p-12 text-center">
                <p className="text-black/60">No violations found</p>
              </div>
            ) : (
              violations.map((violation) => (
                <div key={violation.id} className="bg-white border border-[#e5e5e5] p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <AlertTriangle size={20} className="text-[#dc2626]" />
                      <div>
                        <h3 className="text-lg font-semibold text-black">{violation.violation_type}</h3>
                        <p className="text-xs text-black/60">
                          {new Date(violation.detected_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <SeverityBadge severity={violation.severity} />
                  </div>
                  <p className="text-sm text-black/80">{violation.description}</p>
                  <a
                    href={`/interactions/${violation.interaction_id}`}
                    className="text-sm text-black hover:text-black/60 underline mt-4 inline-block"
                  >
                    View Interaction →
                  </a>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}

function SeverityBadge({ severity }: { severity: string }) {
  const colors = {
    critical: 'bg-[#dc2626] text-white',
    high: 'bg-[#f59e0b] text-white',
    medium: 'bg-[#3b82f6] text-white',
    low: 'bg-[#10b981] text-white',
  }

  return (
    <span className={`px-3 py-1 text-xs font-medium ${colors[severity as keyof typeof colors] || 'bg-black text-white'}`}>
      {severity.toUpperCase()}
    </span>
  )
}

