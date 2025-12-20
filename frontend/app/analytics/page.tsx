'use client'

import { useEffect, useState, useCallback } from 'react'
import DashboardLayout from '@/components/common/DashboardLayout'
import HistoricalTrendsChart from '@/components/analytics/HistoricalTrendsChart'
import BeforeAfterDashboard from '@/components/comparison/BeforeAfterDashboard'
import { apiClient } from '@/lib/api-client'
import { useTheme } from '@/lib/theme-provider'
import { TrendingUp, Activity, BarChart3, Target, ChevronRight } from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
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

interface StatCardData {
  id: string
  title: string
  value: number
  icon: any
  color: string
  gradient: string
}

// Mobile Carousel for Stats
function MobileStatsCarousel({ cards }: { cards: StatCardData[] }) {
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % cards.length)
    }, 3000)
    return () => clearInterval(interval)
  }, [cards.length])

  return (
    <div className="relative">
      <div className="relative overflow-hidden">
        <div
          className="transition-all duration-500 ease-out flex"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {cards.map((card) => (
            <div key={card.id} className="w-full flex-shrink-0 px-1">
              <StatCard {...card} />
            </div>
          ))}
        </div>
      </div>
      <div className="flex justify-center items-center gap-2 mt-4">
        {cards.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentIndex(idx)}
            className={`transition-all duration-300 rounded-full ${idx === currentIndex ? 'w-6 h-2' : 'w-2 h-2'
              }`}
            style={{ background: idx === currentIndex ? 'var(--accent)' : 'var(--foreground-muted)' }}
          />
        ))}
      </div>
    </div>
  )
}

function StatCard({ title, value, icon: Icon, color, gradient }: StatCardData) {
  return (
    <div className="premium-card p-5 group">
      <div className="flex items-start justify-between mb-4">
        <div className="p-3" style={{ background: gradient }}>
          <Icon size={22} style={{ color }} />
        </div>
      </div>
      <p className="text-3xl font-bold mb-1" style={{ color: 'var(--foreground)' }}>
        {value.toLocaleString()}
      </p>
      <h3 className="text-sm font-medium" style={{ color: 'var(--foreground-muted)' }}>
        {title}
      </h3>
    </div>
  )
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="premium-card p-6">
      <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--foreground)' }}>
        {title}
      </h3>
      {children}
    </div>
  )
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="premium-card p-6">
            <div className="h-10 w-10 rounded mb-4" style={{ background: 'var(--background-tertiary)' }} />
            <div className="h-8 w-20 rounded mb-2" style={{ background: 'var(--background-tertiary)' }} />
            <div className="h-4 w-28 rounded" style={{ background: 'var(--background-tertiary)' }} />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[1, 2].map((i) => (
          <div key={i} className="premium-card p-6">
            <div className="h-6 w-40 rounded mb-4" style={{ background: 'var(--background-tertiary)' }} />
            <div className="h-64 rounded" style={{ background: 'var(--background-tertiary)' }} />
          </div>
        ))}
      </div>
    </div>
  )
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [isMobile, setIsMobile] = useState(false)
  const { theme } = useTheme()

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

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

  const statCards: StatCardData[] = data ? [
    {
      id: 'total',
      title: 'Total Interactions',
      value: data.total_interactions,
      icon: Activity,
      color: theme === 'dark' ? '#60a5fa' : '#3b82f6',
      gradient: theme === 'dark' ? 'rgba(96, 165, 250, 0.15)' : 'rgba(59, 130, 246, 0.1)',
    },
    {
      id: 'approved',
      title: 'Approved',
      value: data.approved_count,
      icon: TrendingUp,
      color: theme === 'dark' ? '#22c55e' : '#10b981',
      gradient: theme === 'dark' ? 'rgba(34, 197, 94, 0.15)' : 'rgba(16, 185, 129, 0.1)',
    },
    {
      id: 'flagged',
      title: 'Flagged',
      value: data.flagged_count,
      icon: BarChart3,
      color: theme === 'dark' ? '#fbbf24' : '#f59e0b',
      gradient: theme === 'dark' ? 'rgba(251, 191, 36, 0.15)' : 'rgba(245, 158, 11, 0.1)',
    },
    {
      id: 'blocked',
      title: 'Blocked',
      value: data.blocked_count,
      icon: Target,
      color: theme === 'dark' ? '#ef4444' : '#dc2626',
      gradient: theme === 'dark' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(220, 38, 38, 0.1)',
    },
  ] : []

  const chartBarColor = theme === 'dark' ? '#dc2626' : '#000000'

  return (
    <DashboardLayout>
      <div className="p-4 lg:p-8">
        {/* Header */}
        <div className="mb-8 animate-slide-down">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: 'var(--success)' }} />
            <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--success)' }}>
              Live Data
            </span>
          </div>
          <h1 className="text-3xl lg:text-4xl font-bold tracking-tight mb-2" style={{ color: 'var(--foreground)' }}>
            Analytics
          </h1>
          <p style={{ color: 'var(--foreground-muted)' }}>
            Advanced analytics and insights
          </p>
        </div>

        {loading ? (
          <LoadingSkeleton />
        ) : data ? (
          <div className="space-y-6 stagger-children">
            {/* Before/After Comparison */}
            <BeforeAfterDashboard organizationId="00000000-0000-0000-0000-000000000001" />

            {/* Historical Trends */}
            <HistoricalTrendsChart organizationId="00000000-0000-0000-0000-000000000001" />

            {/* Summary Cards */}
            {isMobile ? (
              <MobileStatsCarousel cards={statCards} />
            ) : (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {statCards.map((card) => (
                  <StatCard key={card.id} {...card} />
                ))}
              </div>
            )}

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ChartCard title="Violations by Type">
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={violationTypeData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
                    <XAxis type="number" stroke="var(--foreground-muted)" fontSize={12} />
                    <YAxis type="category" dataKey="name" stroke="var(--foreground-muted)" fontSize={12} width={100} />
                    <Tooltip
                      contentStyle={{
                        background: 'var(--background-secondary)',
                        border: '1px solid var(--border)',
                        color: 'var(--foreground)'
                      }}
                    />
                    <Bar dataKey="value" fill={chartBarColor} radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>

              <ChartCard title="Violations by Severity">
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={severityData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="name" stroke="var(--foreground-muted)" fontSize={12} />
                    <YAxis stroke="var(--foreground-muted)" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        background: 'var(--background-secondary)',
                        border: '1px solid var(--border)',
                        color: 'var(--foreground)'
                      }}
                    />
                    <Bar dataKey="value" fill={theme === 'dark' ? '#ef4444' : '#dc2626'} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>

              <ChartCard title="Interactions by Model">
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={modelData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="name" stroke="var(--foreground-muted)" fontSize={12} />
                    <YAxis stroke="var(--foreground-muted)" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        background: 'var(--background-secondary)',
                        border: '1px solid var(--border)',
                        color: 'var(--foreground)'
                      }}
                    />
                    <Bar dataKey="value" fill={theme === 'dark' ? '#60a5fa' : '#3b82f6'} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>

              <ChartCard title="Confidence Score">
                <div className="flex items-center justify-center h-[280px]">
                  <div className="text-center">
                    <div
                      className="relative w-40 h-40 mx-auto mb-4 flex items-center justify-center"
                      style={{
                        background: `conic-gradient(var(--accent) ${(data.avg_confidence_score || 0) * 360}deg, var(--background-tertiary) 0deg)`,
                        borderRadius: '50%'
                      }}
                    >
                      <div
                        className="w-32 h-32 flex items-center justify-center"
                        style={{ background: 'var(--background)', borderRadius: '50%' }}
                      >
                        <p className="text-4xl font-bold" style={{ color: 'var(--foreground)' }}>
                          {((data.avg_confidence_score || 0) * 100).toFixed(0)}%
                        </p>
                      </div>
                    </div>
                    <p className="text-sm" style={{ color: 'var(--foreground-muted)' }}>Average Confidence</p>
                  </div>
                </div>
              </ChartCard>
            </div>
          </div>
        ) : (
          <div className="premium-card text-center py-12">
            <Activity size={40} className="mx-auto mb-3 opacity-30" style={{ color: 'var(--foreground-muted)' }} />
            <p style={{ color: 'var(--foreground-muted)' }}>No analytics data available</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
