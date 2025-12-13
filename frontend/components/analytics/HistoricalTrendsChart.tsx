'use client'

import { useState, useEffect } from 'react'
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts'
import { Calendar, TrendingUp, Filter } from 'lucide-react'
import { apiClient } from '@/lib/api-client'

interface TrendDataPoint {
  date: string
  total_interactions: number
  approved: number
  flagged: number
  blocked: number
  violations: number
  avg_confidence: number
}

interface HistoricalTrendsData {
  trends: TrendDataPoint[]
  period: string
  total_days: number
}

interface HistoricalTrendsChartProps {
  organizationId?: string
}

export default function HistoricalTrendsChart({ organizationId = '00000000-0000-0000-0000-000000000001' }: HistoricalTrendsChartProps) {
  const [data, setData] = useState<HistoricalTrendsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [groupBy, setGroupBy] = useState<'day' | 'week' | 'month'>('day')
  const [days, setDays] = useState<number>(30)

  useEffect(() => {
    loadTrends()
  }, [groupBy, days])

  const loadTrends = async () => {
    setLoading(true)
    try {
      const endDate = new Date().toISOString()
      const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()
      
      const res = await apiClient.get<HistoricalTrendsData>(
        `/api/v1/audit/trends?organization_id=${organizationId}&start_date=${startDate}&end_date=${endDate}&group_by=${groupBy}`
      )
      
      if (res.data) {
        setData(res.data)
      }
    } catch (error) {
      console.error('Error loading trends:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr)
      if (groupBy === 'month') {
        return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
      } else if (groupBy === 'week') {
        return `Week of ${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
      } else {
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      }
    } catch {
      return dateStr
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

  if (!data || data.trends.length === 0) {
    return (
      <div className="bg-white border border-[#e5e5e5] p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="text-black" size={20} />
            <h3 className="text-lg font-semibold text-black">Historical Trends</h3>
          </div>
        </div>
        <div className="text-center py-12 text-black/60">
          <p>No trend data available for the selected period</p>
        </div>
      </div>
    )
  }

  const chartData = data.trends.map(point => ({
    ...point,
    date: formatDate(point.date),
    dateRaw: point.date
  }))

  return (
    <div className="bg-white border border-[#e5e5e5] p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-center gap-2">
          <TrendingUp className="text-black" size={20} />
          <div>
            <h3 className="text-lg font-semibold text-black">Historical Trends</h3>
            <p className="text-xs text-black/60">{data.period}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3 flex-wrap">
          {/* Time Range Selector */}
          <div className="flex items-center gap-2">
            <Calendar size={16} className="text-black/60" />
            <select
              value={days}
              onChange={(e) => setDays(Number(e.target.value))}
              className="px-3 py-1.5 border border-[#e5e5e5] bg-white text-black text-sm focus:outline-none focus:border-black"
            >
              <option value={7}>Last 7 days</option>
              <option value={30}>Last 30 days</option>
              <option value={90}>Last 90 days</option>
              <option value={180}>Last 6 months</option>
              <option value={365}>Last year</option>
            </select>
          </div>
          
          {/* Group By Selector */}
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-black/60" />
            <select
              value={groupBy}
              onChange={(e) => setGroupBy(e.target.value as 'day' | 'week' | 'month')}
              className="px-3 py-1.5 border border-[#e5e5e5] bg-white text-black text-sm focus:outline-none focus:border-black"
            >
              <option value="day">Daily</option>
              <option value="week">Weekly</option>
              <option value="month">Monthly</option>
            </select>
          </div>
        </div>
      </div>

      {/* Interactions Trend */}
      <div className="mb-8">
        <h4 className="text-sm font-semibold text-black mb-4">Interactions Over Time</h4>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorApproved" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorFlagged" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorBlocked" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#dc2626" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#dc2626" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
            <XAxis 
              dataKey="date" 
              stroke="#000"
              tick={{ fill: '#000', fontSize: 12 }}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis 
              stroke="#000"
              tick={{ fill: '#000', fontSize: 12 }}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #e5e5e5',
                borderRadius: '0'
              }}
              labelStyle={{ color: '#000', fontWeight: 'bold' }}
            />
            <Legend />
            <Area 
              type="monotone" 
              dataKey="approved" 
              stackId="1" 
              stroke="#10b981" 
              fill="url(#colorApproved)"
              name="Approved"
            />
            <Area 
              type="monotone" 
              dataKey="flagged" 
              stackId="1" 
              stroke="#f59e0b" 
              fill="url(#colorFlagged)"
              name="Flagged"
            />
            <Area 
              type="monotone" 
              dataKey="blocked" 
              stackId="1" 
              stroke="#dc2626" 
              fill="url(#colorBlocked)"
              name="Blocked"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Violations & Confidence Trend */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h4 className="text-sm font-semibold text-black mb-4">Violations Over Time</h4>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
              <XAxis 
                dataKey="date" 
                stroke="#000"
                tick={{ fill: '#000', fontSize: 11 }}
                angle={-45}
                textAnchor="end"
                height={70}
              />
              <YAxis 
                stroke="#000"
                tick={{ fill: '#000', fontSize: 11 }}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e5e5e5',
                  borderRadius: '0'
                }}
                labelStyle={{ color: '#000', fontWeight: 'bold' }}
              />
              <Line 
                type="monotone" 
                dataKey="violations" 
                stroke="#dc2626" 
                strokeWidth={2}
                dot={{ fill: '#dc2626', r: 4 }}
                name="Violations"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-black mb-4">Average Confidence Score</h4>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
              <XAxis 
                dataKey="date" 
                stroke="#000"
                tick={{ fill: '#000', fontSize: 11 }}
                angle={-45}
                textAnchor="end"
                height={70}
              />
              <YAxis 
                stroke="#000"
                tick={{ fill: '#000', fontSize: 11 }}
                domain={[0, 1]}
                tickFormatter={(value) => `${(value * 100).toFixed(0)}%`}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e5e5e5',
                  borderRadius: '0'
                }}
                labelStyle={{ color: '#000', fontWeight: 'bold' }}
                formatter={(value: number) => [`${(value * 100).toFixed(1)}%`, 'Confidence']}
              />
              <Line 
                type="monotone" 
                dataKey="avg_confidence" 
                stroke="#3b82f6" 
                strokeWidth={2}
                dot={{ fill: '#3b82f6', r: 4 }}
                name="Avg Confidence"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}

