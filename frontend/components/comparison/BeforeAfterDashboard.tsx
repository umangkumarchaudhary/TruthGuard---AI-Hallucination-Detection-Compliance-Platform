'use client'

import { useState, useEffect } from 'react'
import { ArrowRight, TrendingUp, TrendingDown, Minus, CheckCircle, XCircle } from 'lucide-react'
import { apiClient } from '@/lib/api-client'

interface ComparisonMetrics {
  before: {
    total_interactions: number
    approved_count: number
    flagged_count: number
    blocked_count: number
    avg_confidence: number
    total_violations: number
  }
  after: {
    total_interactions: number
    approved_count: number
    flagged_count: number
    blocked_count: number
    avg_confidence: number
    total_violations: number
  }
  period: {
    before_start: string
    before_end: string
    after_start: string
    after_end: string
  }
}

interface BeforeAfterDashboardProps {
  organizationId?: string
  splitDate?: string  // Date to split before/after (default: 30 days ago)
}

export default function BeforeAfterDashboard({ 
  organizationId = '00000000-0000-0000-0000-000000000001',
  splitDate
}: BeforeAfterDashboardProps) {
  const [data, setData] = useState<ComparisonMetrics | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadComparisonData()
  }, [splitDate])

  const loadComparisonData = async () => {
    setLoading(true)
    try {
      // Calculate split date (30 days ago by default)
      const split = splitDate ? new Date(splitDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      const beforeEnd = split.toISOString()
      const afterStart = split.toISOString()
      const beforeStart = new Date(split.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString()
      const afterEnd = new Date().toISOString()

      // Fetch before period stats
      const beforeRes = await apiClient.get(
        `/api/v1/audit/stats?organization_id=${organizationId}&start_date=${beforeStart}&end_date=${beforeEnd}`
      )

      // Fetch after period stats
      const afterRes = await apiClient.get(
        `/api/v1/audit/stats?organization_id=${organizationId}&start_date=${afterStart}&end_date=${afterEnd}`
      )

      if (beforeRes.data && afterRes.data) {
        const beforeData = beforeRes.data as any
        const afterData = afterRes.data as any
        
        setData({
          before: {
            total_interactions: beforeData?.total_interactions || 0,
            approved_count: beforeData?.approved_count || 0,
            flagged_count: beforeData?.flagged_count || 0,
            blocked_count: beforeData?.blocked_count || 0,
            avg_confidence: beforeData?.avg_confidence_score || 0,
            total_violations: beforeData?.total_violations || 0
          },
          after: {
            total_interactions: afterData?.total_interactions || 0,
            approved_count: afterData?.approved_count || 0,
            flagged_count: afterData?.flagged_count || 0,
            blocked_count: afterData?.blocked_count || 0,
            avg_confidence: afterData?.avg_confidence_score || 0,
            total_violations: afterData?.total_violations || 0
          },
          period: {
            before_start: beforeStart.split('T')[0],
            before_end: beforeEnd.split('T')[0],
            after_start: afterStart.split('T')[0],
            after_end: afterEnd.split('T')[0]
          }
        })
      }
    } catch (error) {
      console.error('Error loading comparison data:', error)
    } finally {
      setLoading(false)
    }
  }

  const calculateChange = (before: number, after: number) => {
    if (before === 0) return after > 0 ? 100 : 0
    return ((after - before) / before) * 100
  }

  const getChangeIcon = (change: number) => {
    if (change > 0) return <TrendingUp className="text-[#10b981]" size={16} />
    if (change < 0) return <TrendingDown className="text-[#dc2626]" size={16} />
    return <Minus className="text-black/40" size={16} />
  }

  const getChangeColor = (change: number, isPositive: boolean) => {
    // For violations/blocked: negative change is good (fewer violations)
    // For approved/confidence: positive change is good (more approved)
    if (isPositive) {
      return change > 0 ? 'text-[#10b981]' : change < 0 ? 'text-[#dc2626]' : 'text-black/60'
    } else {
      return change < 0 ? 'text-[#10b981]' : change > 0 ? 'text-[#dc2626]' : 'text-black/60'
    }
  }

  if (loading) {
    return (
      <div className="bg-white border border-[#e5e5e5] p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-[#e5e5e5] w-48 mb-4"></div>
          <div className="h-64 bg-[#e5e5e5]"></div>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="bg-white border border-[#e5e5e5] p-6">
        <p className="text-sm text-black/60">No comparison data available</p>
      </div>
    )
  }

  const metrics = [
    {
      label: 'Total Interactions',
      before: data.before.total_interactions,
      after: data.after.total_interactions,
      isPositive: true,
      format: (n: number) => n.toString()
    },
    {
      label: 'Approved',
      before: data.before.approved_count,
      after: data.after.approved_count,
      isPositive: true,
      format: (n: number) => n.toString()
    },
    {
      label: 'Flagged',
      before: data.before.flagged_count,
      after: data.after.flagged_count,
      isPositive: false,
      format: (n: number) => n.toString()
    },
    {
      label: 'Blocked',
      before: data.before.blocked_count,
      after: data.after.blocked_count,
      isPositive: false,
      format: (n: number) => n.toString()
    },
    {
      label: 'Avg Confidence',
      before: data.before.avg_confidence,
      after: data.after.avg_confidence,
      isPositive: true,
      format: (n: number) => `${(n * 100).toFixed(1)}%`
    },
    {
      label: 'Total Violations',
      before: data.before.total_violations,
      after: data.after.total_violations,
      isPositive: false,
      format: (n: number) => n.toString()
    }
  ]

  return (
    <div className="bg-white border border-[#e5e5e5] p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-black mb-2">Before & After Comparison</h3>
        <p className="text-xs text-black/60">
          Comparing: {data.period.before_start} to {data.period.before_end} vs {data.period.after_start} to {data.period.after_end}
        </p>
      </div>

      <div className="space-y-4">
        {metrics.map((metric, idx) => {
          const change = calculateChange(metric.before, metric.after)
          const changeAbs = Math.abs(change)
          
          return (
            <div key={idx} className="border border-[#e5e5e5] p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-semibold text-black">{metric.label}</h4>
                <div className={`flex items-center gap-1 ${getChangeColor(change, metric.isPositive)}`}>
                  {getChangeIcon(change)}
                  <span className="text-sm font-semibold">
                    {change > 0 ? '+' : ''}{change.toFixed(1)}%
                  </span>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4 items-center">
                {/* Before */}
                <div className="text-center">
                  <p className="text-xs text-black/60 mb-1">Before</p>
                  <p className="text-2xl font-bold text-black">{metric.format(metric.before)}</p>
                </div>
                
                {/* Arrow */}
                <div className="flex items-center justify-center">
                  <ArrowRight className="text-black/40" size={20} />
                </div>
                
                {/* After */}
                <div className="text-center">
                  <p className="text-xs text-black/60 mb-1">After</p>
                  <p className="text-2xl font-bold text-black">{metric.format(metric.after)}</p>
                </div>
              </div>
              
              {/* Progress Bar */}
              <div className="mt-3 pt-3 border-t border-[#e5e5e5]">
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 bg-[#e5e5e5] relative">
                    <div 
                      className={`h-full ${
                        metric.isPositive 
                          ? (change > 0 ? 'bg-[#10b981]' : change < 0 ? 'bg-[#dc2626]' : 'bg-black/40')
                          : (change < 0 ? 'bg-[#10b981]' : change > 0 ? 'bg-[#dc2626]' : 'bg-black/40')
                      }`}
                      style={{ 
                        width: `${Math.min(100, Math.max(0, metric.before > 0 ? (metric.after / metric.before) * 100 : 0))}%` 
                      }}
                    />
                  </div>
                  <span className="text-xs text-black/60">
                    {metric.before > 0 
                      ? `${((metric.after / metric.before) * 100).toFixed(0)}%`
                      : metric.after > 0 ? 'New' : '0%'
                    }
                  </span>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Summary */}
      <div className="mt-6 pt-6 border-t border-[#e5e5e5]">
        <h4 className="text-sm font-semibold text-black mb-3">Summary</h4>
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 bg-[#f0fdf4] border border-[#10b981]">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle className="text-[#10b981]" size={16} />
              <span className="text-xs font-semibold text-[#10b981]">Improvements</span>
            </div>
            <ul className="text-xs text-black/80 space-y-1">
              {metrics.filter(m => {
                const change = calculateChange(m.before, m.after)
                return m.isPositive ? change > 0 : change < 0
              }).map((m, idx) => (
                <li key={idx}>• {m.label} improved</li>
              ))}
            </ul>
          </div>
          
          <div className="p-3 bg-[#fee2e2] border border-[#dc2626]">
            <div className="flex items-center gap-2 mb-1">
              <XCircle className="text-[#dc2626]" size={16} />
              <span className="text-xs font-semibold text-[#dc2626]">Areas to Watch</span>
            </div>
            <ul className="text-xs text-black/80 space-y-1">
              {metrics.filter(m => {
                const change = calculateChange(m.before, m.after)
                return m.isPositive ? change < 0 : change > 0
              }).map((m, idx) => (
                <li key={idx}>• {m.label} needs attention</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

