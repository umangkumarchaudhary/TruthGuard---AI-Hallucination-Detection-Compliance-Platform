'use client'

import { useEffect, useState } from 'react'
import DashboardLayout from '@/components/common/DashboardLayout'
import BusinessImpactCard from '@/components/dashboard/BusinessImpactCard'
import { apiClient } from '@/lib/api-client'
import { 
  MessageSquare, 
  AlertTriangle, 
  TrendingUp, 
  Shield,
  Activity
} from 'lucide-react'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts'

interface DashboardStats {
  total_interactions: number
  approved_count: number
  flagged_count: number
  blocked_count: number
  total_violations: number
  violations_by_type: Record<string, number>
  violations_by_severity: Record<string, number>
  avg_confidence_score: number
  interactions_by_model: Record<string, number>
}

interface BusinessImpactData {
  hallucinations_blocked: number
  critical_violations_prevented: number
  legal_risk_savings: number
  brand_damage_savings: number
  total_savings: number
  period: string
  config: {
    lawsuit_cost: number
    brand_incident_cost: number
  }
}

const COLORS = ['#000000', '#dc2626', '#f59e0b', '#3b82f6', '#10b981']

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [businessImpact, setBusinessImpact] = useState<BusinessImpactData | null>(null)
  const [loading, setLoading] = useState(true)
  const [recentInteractions, setRecentInteractions] = useState<any[]>([])

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    setLoading(true)
    try {
      const orgId = '00000000-0000-0000-0000-000000000001'
      
      // Load all data in parallel for faster loading
      const [statsRes, interactionsRes, impactRes] = await Promise.allSettled([
        apiClient.get<DashboardStats>(`/api/v1/audit/stats?organization_id=${orgId}`),
        apiClient.get<any[]>(`/api/v1/audit/interactions?limit=5&organization_id=${orgId}`),
        apiClient.get<BusinessImpactData>(`/api/v1/audit/business-impact?organization_id=${orgId}`)
      ])

      // Process stats
      if (statsRes.status === 'fulfilled' && statsRes.value.data) {
        setStats(statsRes.value.data)
      } else if (statsRes.status === 'fulfilled' && statsRes.value.error) {
        if (statsRes.value.error.includes('401') || statsRes.value.error.includes('Unauthorized')) {
          console.warn('⚠️ API key missing. For development, set DEV_BYPASS_AUTH=true in backend/.env or create an API key.')
        }
      }

      // Process interactions
      if (interactionsRes.status === 'fulfilled' && interactionsRes.value.data) {
        setRecentInteractions(interactionsRes.value.data)
      }

      // Process business impact
      if (impactRes.status === 'fulfilled' && impactRes.value.data) {
        setBusinessImpact(impactRes.value.data)
      } else if (impactRes.status === 'fulfilled' && impactRes.value.error) {
        console.warn('Could not load business impact data:', impactRes.value.error)
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const hallucinationRate = stats 
    ? ((stats.flagged_count + stats.blocked_count) / stats.total_interactions * 100).toFixed(1)
    : '0'

  const chartData = stats ? [
    { name: 'Approved', value: stats.approved_count },
    { name: 'Flagged', value: stats.flagged_count },
    { name: 'Blocked', value: stats.blocked_count },
  ] : []

  const violationTypeData = stats ? Object.entries(stats.violations_by_type).map(([name, value]) => ({
    name,
    value
  })) : []

  return (
    <DashboardLayout>
      <div className="p-4 lg:p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-black mb-2">Dashboard</h1>
          <p className="text-sm text-black/60">Monitor AI interactions and compliance in real-time</p>
        </div>

        {/* Progressive Loading - Show skeleton while loading */}
        {loading && !stats ? (
          <div className="space-y-8">
            {/* Skeleton for metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-white border border-[#e5e5e5] p-6 animate-pulse">
                  <div className="h-4 bg-[#e5e5e5] w-24 mb-4"></div>
                  <div className="h-8 bg-[#e5e5e5] w-16"></div>
                </div>
              ))}
            </div>
            {/* Skeleton for charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {[1, 2].map((i) => (
                <div key={i} className="bg-white border border-[#e5e5e5] p-6 animate-pulse">
                  <div className="h-6 bg-[#e5e5e5] w-32 mb-4"></div>
                  <div className="h-64 bg-[#e5e5e5]"></div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <>
            {/* Metrics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <MetricCard
                title="Total Interactions"
                value={stats?.total_interactions || 0}
                icon={MessageSquare}
                color="black"
              />
              <MetricCard
                title="Hallucination Rate"
                value={`${hallucinationRate}%`}
                icon={TrendingUp}
                color={parseFloat(hallucinationRate) > 10 ? '#dc2626' : '#10b981'}
              />
              <MetricCard
                title="Violations"
                value={stats?.total_violations || 0}
                icon={AlertTriangle}
                color="#f59e0b"
              />
              <MetricCard
                title="Avg Confidence"
                value={`${((stats?.avg_confidence_score || 0) * 100).toFixed(0)}%`}
                icon={Shield}
                color="black"
              />
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Status Distribution */}
              <ChartCard title="Interaction Status">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(props: any) => {
                        const name = props.name || 'Unknown'
                        const percent = props.percent || 0
                        return `${name}: ${(percent * 100).toFixed(0)}%`
                      }}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </ChartCard>

              {/* Violations by Type */}
              <ChartCard title="Violations by Type">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={violationTypeData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
                    <XAxis dataKey="name" stroke="#000" />
                    <YAxis stroke="#000" />
                    <Tooltip />
                    <Bar dataKey="value" fill="#000000" />
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>
            </div>

            {/* Recent Interactions */}
            

            {/* Business Impact Card - Below Dashboard */}
            {businessImpact && (
              <div className="mt-8">
                <BusinessImpactCard data={businessImpact} loading={false} />
              </div>
            )}

<div className="bg-white border border-[#e5e5e5]">
              <div className="border-b border-[#e5e5e5] px-6 py-4">
                <h2 className="text-lg font-semibold text-black">Recent Interactions</h2>
              </div>
              <div className="divide-y divide-[#e5e5e5]">
                {recentInteractions.length === 0 ? (
                  <div className="px-6 py-8 text-center text-black/60">
                    No interactions yet
                  </div>
                ) : (
                  recentInteractions.map((interaction) => (
                    <div key={interaction.id} className="px-6 py-4 hover:bg-[#f5f5f5] transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-black truncate">{interaction.user_query}</p>
                          <p className="text-xs text-black/60 mt-1">
                            {new Date(interaction.timestamp).toLocaleString()}
                          </p>
                        </div>
                        <StatusBadge status={interaction.status} />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div> 
          </>
        )}
      </div>
    </DashboardLayout>
  )
}

function MetricCard({ 
  title, 
  value, 
  icon: Icon, 
  color 
}: { 
  title: string
  value: string | number
  icon: any
  color: string
}) {
  return (
    <div className="bg-white border border-[#e5e5e5] p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-black/60">{title}</h3>
        <Icon size={20} style={{ color }} />
      </div>
      <p className="text-3xl font-bold" style={{ color }}>{value}</p>
    </div>
  )
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-[#e5e5e5] p-6">
      <h3 className="text-lg font-semibold text-black mb-4">{title}</h3>
      {children}
    </div>
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

