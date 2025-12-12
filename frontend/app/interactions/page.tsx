'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import DashboardLayout from '@/components/common/DashboardLayout'
import { apiClient } from '@/lib/api-client'
import { Search, Filter, Calendar } from 'lucide-react'

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
        // In real app, get total from API
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-black mb-2">Interactions</h1>
          <p className="text-sm text-black/60">View and analyze all AI interactions</p>
        </div>

        {/* Filters */}
        <div className="bg-white border border-[#e5e5e5] p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black/40" size={18} />
              <input
                type="text"
                placeholder="Search interactions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-[#e5e5e5] bg-white text-black focus:outline-none focus:border-black"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value)
                setCurrentPage(1)
              }}
              className="px-4 py-2 border border-[#e5e5e5] bg-white text-black focus:outline-none focus:border-black"
            >
              <option value="all">All Status</option>
              <option value="approved">Approved</option>
              <option value="flagged">Flagged</option>
              <option value="blocked">Blocked</option>
            </select>

            {/* Date Filter Placeholder */}
            <button className="px-4 py-2 border border-[#e5e5e5] bg-white text-black hover:bg-[#f5f5f5] flex items-center gap-2">
              <Calendar size={18} />
              <span>Date Range</span>
            </button>
          </div>
        </div>

        {/* Interactions Table */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-black">Loading...</div>
          </div>
        ) : (
          <div className="bg-white border border-[#e5e5e5]">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#f5f5f5] border-b border-[#e5e5e5]">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-black uppercase">Query</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-black uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-black uppercase">Confidence</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-black uppercase">Violations</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-black uppercase">Timestamp</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-black uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e5e5e5]">
                  {filteredInteractions.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-black/60">
                        No interactions found
                      </td>
                    </tr>
                  ) : (
                    filteredInteractions.map((interaction) => (
                      <tr key={interaction.id} className="hover:bg-[#f5f5f5] transition-colors">
                        <td className="px-6 py-4">
                          <p className="text-sm text-black max-w-md truncate">{interaction.user_query}</p>
                        </td>
                        <td className="px-6 py-4">
                          <StatusBadge status={interaction.status} />
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-black">
                            {(interaction.confidence_score * 100).toFixed(0)}%
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-black">{interaction.violation_count}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-black/60">
                            {new Date(interaction.timestamp).toLocaleString()}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => router.push(`/interactions/${interaction.id}`)}
                            className="text-sm text-black hover:text-black/60 underline"
                          >
                            View Details
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="border-t border-[#e5e5e5] px-6 py-4 flex items-center justify-between">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border border-[#e5e5e5] bg-white text-black hover:bg-[#f5f5f5] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span className="text-sm text-black/60">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 border border-[#e5e5e5] bg-white text-black hover:bg-[#f5f5f5] disabled:opacity-50 disabled:cursor-not-allowed"
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

