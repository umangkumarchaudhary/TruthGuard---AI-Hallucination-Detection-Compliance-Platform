'use client'

import { useEffect, useState } from 'react'
import DashboardLayout from '@/components/common/DashboardLayout'
import { apiClient } from '@/lib/api-client'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts'

interface AnalyticsData {
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

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadAnalytics()
  }, [])

  const loadAnalytics = async () => {
    setLoading(true)
    try {
      const res = await apiClient.get<AnalyticsData>('/api/v1/audit/stats?organization_id=00000000-0000-0000-0000-000000000001')
      if (res.data) {
        setData(res.data)
      }
    } catch (error) {
      console.error('Error loading analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  const violationTypeData = data ? Object.entries(data.violations_by_type).map(([name, value]) => ({
    name,
    value
  })) : []

  const severityData = data ? Object.entries(data.violations_by_severity).map(([name, value]) => ({
    name,
    value
  })) : []

  const modelData = data ? Object.entries(data.interactions_by_model).map(([name, value]) => ({
    name,
    value
  })) : []

  return (
    <DashboardLayout>
      <div className="p-4 lg:p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-black mb-2">Analytics</h1>
          <p className="text-sm text-black/60">Advanced analytics and insights</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-black">Loading...</div>
          </div>
        ) : data ? (
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard title="Total Interactions" value={data.total_interactions} />
              <StatCard title="Approved" value={data.approved_count} />
              <StatCard title="Flagged" value={data.flagged_count} />
              <StatCard title="Blocked" value={data.blocked_count} />
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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

              <ChartCard title="Violations by Severity">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={severityData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
                    <XAxis dataKey="name" stroke="#000" />
                    <YAxis stroke="#000" />
                    <Tooltip />
                    <Bar dataKey="value" fill="#dc2626" />
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>

              <ChartCard title="Interactions by Model">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={modelData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
                    <XAxis dataKey="name" stroke="#000" />
                    <YAxis stroke="#000" />
                    <Tooltip />
                    <Bar dataKey="value" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>

              <ChartCard title="Confidence Score">
                <div className="flex items-center justify-center h-[300px]">
                  <div className="text-center">
                    <p className="text-5xl font-bold text-black mb-2">
                      {((data.avg_confidence_score || 0) * 100).toFixed(0)}%
                    </p>
                    <p className="text-sm text-black/60">Average Confidence</p>
                  </div>
                </div>
              </ChartCard>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-black/60">No analytics data available</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}

function StatCard({ title, value }: { title: string; value: number }) {
  return (
    <div className="bg-white border border-[#e5e5e5] p-6">
      <h3 className="text-sm font-medium text-black/60 mb-2">{title}</h3>
      <p className="text-3xl font-bold text-black">{value}</p>
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

