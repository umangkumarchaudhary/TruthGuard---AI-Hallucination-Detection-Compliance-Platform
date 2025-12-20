'use client'

import { useEffect, useState, useCallback } from 'react'
import DashboardLayout from '@/components/common/DashboardLayout'
import BusinessImpactCard from '@/components/dashboard/BusinessImpactCard'
import { apiClient } from '@/lib/api-client'
import { useTheme } from '@/lib/theme-provider'
import {
  MessageSquare,
  AlertTriangle,
  TrendingUp,
  Shield,
  Activity,
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react'
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts'
import Link from 'next/link'

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

interface MetricCardData {
  id: string
  title: string
  value: string | number
  icon: any
  color: string
  gradient: string
  change?: { value: string; positive: boolean }
  link: string
}

// Mobile Carousel for Metric Cards
function MobileMetricsCarousel({ cards }: { cards: MetricCardData[] }) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)

  useEffect(() => {
    if (isPaused) return
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % cards.length)
    }, 3000)
    return () => clearInterval(interval)
  }, [cards.length, isPaused])

  const goToSlide = useCallback((index: number) => {
    setCurrentIndex(index)
    setIsPaused(true)
    setTimeout(() => setIsPaused(false), 5000)
  }, [])

  return (
    <div
      className="relative"
      onTouchStart={() => setIsPaused(true)}
      onTouchEnd={() => setTimeout(() => setIsPaused(false), 5000)}
    >
      <div className="relative overflow-hidden">
        <div
          className="transition-all duration-500 ease-out flex"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {cards.map((card) => (
            <div key={card.id} className="w-full flex-shrink-0 px-1">
              <MetricCard {...card} />
            </div>
          ))}
        </div>
      </div>
      {/* Dots */}
      <div className="flex justify-center items-center gap-2 mt-4">
        {cards.map((_, idx) => (
          <button
            key={idx}
            onClick={() => goToSlide(idx)}
            className={`transition-all duration-300 rounded-full ${idx === currentIndex ? 'w-6 h-2' : 'w-2 h-2'
              }`}
            style={{ background: idx === currentIndex ? 'var(--accent)' : 'var(--foreground-muted)' }}
          />
        ))}
      </div>
      {/* Progress */}
      <div className="mt-3 mx-auto max-w-[200px] h-1 rounded-full overflow-hidden" style={{ background: 'var(--background-tertiary)' }}>
        <div
          className="h-full transition-all duration-300"
          style={{
            width: `${((currentIndex + 1) / cards.length) * 100}%`,
            background: 'var(--accent-gradient)'
          }}
        />
      </div>
    </div>
  )
}

// Premium Metric Card
function MetricCard({
  title,
  value,
  icon: Icon,
  color,
  gradient,
  change,
  link
}: MetricCardData) {
  return (
    <Link href={link}>
      <div
        className="premium-card p-5 group cursor-pointer"
      >
        <div className="flex items-start justify-between mb-4">
          <div
            className="p-3 transition-transform group-hover:scale-110"
            style={{ background: gradient }}
          >
            <Icon size={22} style={{ color }} />
          </div>
          {change && (
            <div className={`flex items-center gap-1 text-xs font-semibold ${change.positive ? 'text-green-500' : 'text-red-500'}`}>
              {change.positive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
              {change.value}
            </div>
          )}
        </div>
        <p
          className="text-3xl font-bold mb-1 transition-colors"
          style={{ color: 'var(--foreground)' }}
        >
          {value}
        </p>
        <div className="flex items-center justify-between">
          <h3
            className="text-sm font-medium"
            style={{ color: 'var(--foreground-muted)' }}
          >
            {title}
          </h3>
          <ChevronRight
            size={16}
            className="opacity-0 group-hover:opacity-100 transition-opacity"
            style={{ color: 'var(--foreground-muted)' }}
          />
        </div>
      </div>
    </Link>
  )
}

// Premium Chart Card
function ChartCard({ title, children, className = '' }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={`premium-card p-6 ${className}`}>
      <h3
        className="text-lg font-semibold mb-4"
        style={{ color: 'var(--foreground)' }}
      >
        {title}
      </h3>
      {children}
    </div>
  )
}

// Status Badge
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

// Loading Skeleton
function LoadingSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Metrics skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="premium-card p-6">
            <div className="h-10 w-10 rounded mb-4" style={{ background: 'var(--background-tertiary)' }} />
            <div className="h-8 w-20 rounded mb-2" style={{ background: 'var(--background-tertiary)' }} />
            <div className="h-4 w-28 rounded" style={{ background: 'var(--background-tertiary)' }} />
          </div>
        ))}
      </div>
      {/* Charts skeleton */}
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

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [businessImpact, setBusinessImpact] = useState<BusinessImpactData | null>(null)
  const [loading, setLoading] = useState(true)
  const [recentInteractions, setRecentInteractions] = useState<any[]>([])
  const [isMobile, setIsMobile] = useState(false)
  const { theme } = useTheme()

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    setLoading(true)
    try {
      const orgId = '00000000-0000-0000-0000-000000000001'

      const [statsRes, interactionsRes, impactRes] = await Promise.allSettled([
        apiClient.get<DashboardStats>(`/api/v1/audit/stats?organization_id=${orgId}`),
        apiClient.get<any[]>(`/api/v1/audit/interactions?limit=5&organization_id=${orgId}`),
        apiClient.get<BusinessImpactData>(`/api/v1/audit/business-impact?organization_id=${orgId}`)
      ])

      if (statsRes.status === 'fulfilled' && statsRes.value.data) {
        setStats(statsRes.value.data)
      }
      if (interactionsRes.status === 'fulfilled' && interactionsRes.value.data) {
        setRecentInteractions(interactionsRes.value.data)
      }
      if (impactRes.status === 'fulfilled' && impactRes.value.data) {
        setBusinessImpact(impactRes.value.data)
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const hallucinationRate = stats
    ? ((stats.flagged_count + stats.blocked_count) / Math.max(stats.total_interactions, 1) * 100).toFixed(1)
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

  // Dynamic colors based on theme
  const chartColors = theme === 'dark'
    ? ['#22c55e', '#fbbf24', '#ef4444']
    : ['#10b981', '#f59e0b', '#dc2626']

  const metricCards: MetricCardData[] = [
    {
      id: 'interactions',
      title: 'Total Interactions',
      value: stats?.total_interactions || 0,
      icon: MessageSquare,
      color: theme === 'dark' ? '#60a5fa' : '#3b82f6',
      gradient: theme === 'dark' ? 'rgba(96, 165, 250, 0.15)' : 'rgba(59, 130, 246, 0.1)',
      change: { value: '+12%', positive: true },
      link: '/interactions'
    },
    {
      id: 'hallucination',
      title: 'Hallucination Rate',
      value: `${hallucinationRate}%`,
      icon: TrendingUp,
      color: parseFloat(hallucinationRate) > 10 ? '#ef4444' : '#22c55e',
      gradient: parseFloat(hallucinationRate) > 10
        ? 'rgba(239, 68, 68, 0.15)'
        : 'rgba(34, 197, 94, 0.15)',
      change: { value: '-3%', positive: true },
      link: '/analytics'
    },
    {
      id: 'violations',
      title: 'Violations',
      value: stats?.total_violations || 0,
      icon: AlertTriangle,
      color: theme === 'dark' ? '#fbbf24' : '#f59e0b',
      gradient: theme === 'dark' ? 'rgba(251, 191, 36, 0.15)' : 'rgba(245, 158, 11, 0.1)',
      link: '/violations'
    },
    {
      id: 'confidence',
      title: 'Avg Confidence',
      value: `${((stats?.avg_confidence_score || 0) * 100).toFixed(0)}%`,
      icon: Shield,
      color: theme === 'dark' ? '#a78bfa' : '#8b5cf6',
      gradient: theme === 'dark' ? 'rgba(167, 139, 250, 0.15)' : 'rgba(139, 92, 246, 0.1)',
      change: { value: '+5%', positive: true },
      link: '/analytics'
    },
  ]

  return (
    <DashboardLayout>
      <div className="p-4 lg:p-8">
        {/* Header */}
        <div className="mb-8 animate-slide-down">
          <div className="flex items-center gap-3 mb-2">
            <div
              className="w-2 h-2 rounded-full animate-pulse"
              style={{ background: 'var(--success)' }}
            />
            <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--success)' }}>
              Live
            </span>
          </div>
          <h1
            className="text-3xl lg:text-4xl font-bold tracking-tight mb-2"
            style={{ color: 'var(--foreground)' }}
          >
            Dashboard
          </h1>
          <p style={{ color: 'var(--foreground-muted)' }}>
            Monitor AI interactions and compliance in real-time
          </p>
        </div>

        {loading && !stats ? (
          <LoadingSkeleton />
        ) : (
          <div className="space-y-8 stagger-children">
            {/* Metrics Cards */}
            {isMobile ? (
              <MobileMetricsCarousel cards={metricCards} />
            ) : (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {metricCards.map((card) => (
                  <MetricCard key={card.id} {...card} />
                ))}
              </div>
            )}

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Status Distribution */}
              <ChartCard title="Interaction Status">
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {chartData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={chartColors[index]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        background: 'var(--background-secondary)',
                        border: '1px solid var(--border)',
                        color: 'var(--foreground)'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                {/* Legend */}
                <div className="flex justify-center gap-6 mt-4">
                  {chartData.map((item, idx) => (
                    <div key={item.name} className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-sm" style={{ background: chartColors[idx] }} />
                      <span className="text-sm" style={{ color: 'var(--foreground-secondary)' }}>
                        {item.name}: {item.value}
                      </span>
                    </div>
                  ))}
                </div>
              </ChartCard>

              {/* Violations by Type */}
              <ChartCard title="Violations by Type">
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={violationTypeData} layout="vertical">
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="var(--border)"
                      horizontal={false}
                    />
                    <XAxis type="number" stroke="var(--foreground-muted)" fontSize={12} />
                    <YAxis
                      type="category"
                      dataKey="name"
                      stroke="var(--foreground-muted)"
                      fontSize={12}
                      width={100}
                    />
                    <Tooltip
                      contentStyle={{
                        background: 'var(--background-secondary)',
                        border: '1px solid var(--border)',
                        color: 'var(--foreground)'
                      }}
                    />
                    <Bar
                      dataKey="value"
                      fill={theme === 'dark' ? '#dc2626' : '#000000'}
                      radius={[0, 4, 4, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>
            </div>

            {/* Business Impact Card */}
            {businessImpact && (
              <BusinessImpactCard data={businessImpact} loading={false} />
            )}

            {/* Recent Interactions */}
            <div className="premium-card overflow-hidden">
              <div
                className="px-6 py-4 flex items-center justify-between"
                style={{ borderBottom: '1px solid var(--border)' }}
              >
                <h2
                  className="text-lg font-semibold"
                  style={{ color: 'var(--foreground)' }}
                >
                  Recent Interactions
                </h2>
                <Link
                  href="/interactions"
                  className="text-sm font-medium flex items-center gap-1 transition-colors"
                  style={{ color: 'var(--accent)' }}
                >
                  View All <ChevronRight size={16} />
                </Link>
              </div>
              <div>
                {recentInteractions.length === 0 ? (
                  <div
                    className="px-6 py-12 text-center"
                    style={{ color: 'var(--foreground-muted)' }}
                  >
                    <Activity size={40} className="mx-auto mb-3 opacity-30" />
                    <p>No interactions yet</p>
                    <p className="text-sm mt-1">Start testing AI responses to see data here</p>
                  </div>
                ) : (
                  <div>
                    {recentInteractions.map((interaction, idx) => (
                      <div
                        key={interaction.id}
                        className="px-6 py-4 transition-colors cursor-pointer"
                        style={{
                          borderBottom: idx < recentInteractions.length - 1 ? '1px solid var(--border)' : 'none',
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = 'var(--background-tertiary)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                      >
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <p
                              className="text-sm font-medium truncate"
                              style={{ color: 'var(--foreground)' }}
                            >
                              {interaction.user_query}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <Clock size={12} style={{ color: 'var(--foreground-muted)' }} />
                              <p
                                className="text-xs"
                                style={{ color: 'var(--foreground-muted)' }}
                              >
                                {new Date(interaction.timestamp).toLocaleString()}
                              </p>
                            </div>
                          </div>
                          <StatusBadge status={interaction.status} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
