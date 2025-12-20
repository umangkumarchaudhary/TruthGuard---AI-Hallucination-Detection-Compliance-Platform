'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import DashboardLayout from '@/components/common/DashboardLayout'
import { apiClient } from '@/lib/api-client'
import { useTheme } from '@/lib/theme-provider'
import { Play, Square, Radio, Clock, CheckCircle, XCircle, AlertTriangle, Activity, TrendingUp, Shield, AlertCircle as CircleAlert } from 'lucide-react'
import { DEMO_TEST_CASES, DemoTestCase } from '@/data/demo-test-cases'

interface LiveInteraction {
  id: string
  query: string
  aiResponse: string
  status: 'approved' | 'flagged' | 'blocked'
  confidence: number
  responseTime: number
  timestamp: Date
  violations?: number
}

export default function LiveDemoPage() {
  const router = useRouter()
  const { theme } = useTheme()
  const [isRunning, setIsRunning] = useState(false)
  const [interactions, setInteractions] = useState<LiveInteraction[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [stats, setStats] = useState({
    total: 0,
    approved: 0,
    flagged: 0,
    blocked: 0
  })
  const scrollRef = useRef<HTMLDivElement>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (isRunning && currentIndex < DEMO_TEST_CASES.length) {
      const testCase = DEMO_TEST_CASES[currentIndex]

      intervalRef.current = setTimeout(async () => {
        const validationResult = await simulateValidation(testCase)

        const newInteraction: LiveInteraction = {
          id: `demo-${Date.now()}-${currentIndex}`,
          query: testCase.query,
          aiResponse: testCase.aiResponse,
          status: validationResult.status as 'approved' | 'flagged' | 'blocked',
          confidence: validationResult.confidence,
          responseTime: testCase.responseTime || Math.random() * 0.2 + 0.15,
          timestamp: new Date(),
          violations: validationResult.violations
        }

        setInteractions(prev => [newInteraction, ...prev])
        setStats(prev => ({
          total: prev.total + 1,
          approved: prev.approved + (validationResult.status === 'approved' ? 1 : 0),
          flagged: prev.flagged + (validationResult.status === 'flagged' ? 1 : 0),
          blocked: prev.blocked + (validationResult.status === 'blocked' ? 1 : 0)
        }))
        setCurrentIndex(prev => prev + 1)
      }, testCase.delay)
    } else if (currentIndex >= DEMO_TEST_CASES.length) {
      setIsRunning(false)
    }

    return () => {
      if (intervalRef.current) {
        clearTimeout(intervalRef.current)
      }
    }
  }, [isRunning, currentIndex])

  useEffect(() => {
    if (scrollRef.current && interactions.length > 0) {
      scrollRef.current.scrollTop = 0
    }
  }, [interactions])

  const simulateValidation = async (testCase: DemoTestCase) => {
    try {
      const response = await apiClient.post('/api/v1/validate', {
        query: testCase.query,
        ai_response: testCase.aiResponse,
        organization_id: '00000000-0000-0000-0000-000000000001',
        ai_model: 'demo'
      })

      if (response.data && typeof response.data === 'object' && 'status' in response.data) {
        const data = response.data as { status: string; confidence_score?: number; violations?: any[] }
        return {
          status: data.status,
          confidence: data.confidence_score || 0.8,
          violations: data.violations?.length || 0
        }
      }
    } catch (error) {
      console.error('Validation error:', error)
    }

    return {
      status: testCase.expectedStatus,
      confidence: testCase.expectedStatus === 'approved' ? 0.85 : 0.35,
      violations: testCase.violation ? 1 : 0
    }
  }

  const handleStart = () => {
    setIsRunning(true)
    setCurrentIndex(0)
    setInteractions([])
    setStats({ total: 0, approved: 0, flagged: 0, blocked: 0 })
  }

  const handleStop = () => {
    setIsRunning(false)
    if (intervalRef.current) {
      clearTimeout(intervalRef.current)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle style={{ color: 'var(--success)' }} size={18} />
      case 'blocked':
        return <XCircle style={{ color: 'var(--danger)' }} size={18} />
      case 'flagged':
        return <AlertTriangle style={{ color: 'var(--warning)' }} size={18} />
      default:
        return null
    }
  }

  const statCards = [
    { id: 'total', label: 'Total', value: stats.total, color: 'var(--foreground)', icon: Activity },
    { id: 'approved', label: 'Approved', value: stats.approved, color: 'var(--success)', icon: CheckCircle },
    { id: 'flagged', label: 'Flagged', value: stats.flagged, color: 'var(--warning)', icon: CircleAlert },
    { id: 'blocked', label: 'Blocked', value: stats.blocked, color: 'var(--danger)', icon: XCircle },
  ]

  return (
    <DashboardLayout>
      <div className="p-4 lg:p-8">
        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-start justify-between gap-4 animate-slide-down">
          <div>
            <div className="flex items-center gap-3 mb-2">
              {isRunning && (
                <div
                  className="flex items-center gap-2 px-3 py-1 text-xs font-semibold text-white"
                  style={{ background: 'var(--danger)' }}
                >
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                  LIVE
                </div>
              )}
            </div>
            <h1 className="text-3xl lg:text-4xl font-bold tracking-tight mb-2" style={{ color: 'var(--foreground)' }}>
              Live Streaming Demo
            </h1>
            <p style={{ color: 'var(--foreground-muted)' }}>Real-time AI response monitoring simulation</p>
          </div>
          <div className="flex items-center gap-3">
            {!isRunning ? (
              <button
                onClick={handleStart}
                className="flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white transition-all hover:scale-105"
                style={{ background: 'var(--accent-gradient)', boxShadow: '0 0 20px var(--glow)' }}
              >
                <Play size={16} />
                <span>Start Demo</span>
              </button>
            ) : (
              <button
                onClick={handleStop}
                className="flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white transition-colors"
                style={{ background: 'var(--danger)' }}
              >
                <Square size={16} />
                <span>Stop Demo</span>
              </button>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {statCards.map((stat) => {
            const Icon = stat.icon
            return (
              <div key={stat.id} className="premium-card p-4">
                <div className="flex items-center gap-3 mb-2">
                  <Icon size={18} style={{ color: stat.color }} />
                  <p className="text-xs font-medium" style={{ color: 'var(--foreground-muted)' }}>{stat.label}</p>
                </div>
                <p className="text-2xl lg:text-3xl font-bold" style={{ color: stat.color }}>{stat.value}</p>
              </div>
            )
          })}
        </div>

        {/* Progress Bar */}
        {isRunning && (
          <div className="premium-card p-4 mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>Demo Progress</span>
              <span className="text-sm" style={{ color: 'var(--foreground-muted)' }}>
                {currentIndex} / {DEMO_TEST_CASES.length}
              </span>
            </div>
            <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--background-tertiary)' }}>
              <div
                className="h-full transition-all duration-500"
                style={{
                  width: `${(currentIndex / DEMO_TEST_CASES.length) * 100}%`,
                  background: 'var(--accent-gradient)'
                }}
              />
            </div>
          </div>
        )}

        {/* Live Feed */}
        <div className="premium-card overflow-hidden">
          <div
            className="px-6 py-4 flex items-center gap-3"
            style={{ borderBottom: '1px solid var(--border)' }}
          >
            <Radio size={18} style={{ color: isRunning ? 'var(--danger)' : 'var(--foreground-muted)' }} />
            <h2 className="text-lg font-semibold" style={{ color: 'var(--foreground)' }}>Live Feed</h2>
            {isRunning && (
              <span className="text-xs ml-auto" style={{ color: 'var(--foreground-muted)' }}>
                Processing...
              </span>
            )}
          </div>

          <div
            ref={scrollRef}
            className="h-[500px] lg:h-[600px] overflow-y-auto"
          >
            {interactions.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <Radio size={48} className="mx-auto mb-4 opacity-20" style={{ color: 'var(--foreground-muted)' }} />
                  <p className="text-sm" style={{ color: 'var(--foreground-muted)' }}>Click "Start Demo" to begin live monitoring</p>
                </div>
              </div>
            ) : (
              <div>
                {interactions.map((interaction) => (
                  <div
                    key={interaction.id}
                    className="px-6 py-4 transition-colors animate-slide-down"
                    style={{ borderBottom: '1px solid var(--border)' }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--background-tertiary)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 mt-1">
                        {getStatusIcon(interaction.status)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2 flex-wrap">
                          <span
                            className="px-3 py-1 text-xs font-semibold"
                            style={{
                              background: interaction.status === 'approved' ? 'var(--success-bg)' :
                                interaction.status === 'flagged' ? 'var(--warning-bg)' : 'var(--danger-bg)',
                              color: interaction.status === 'approved' ? 'var(--success)' :
                                interaction.status === 'flagged' ? 'var(--warning)' : 'var(--danger)'
                            }}
                          >
                            {interaction.status.toUpperCase()}
                          </span>
                          <div className="flex items-center gap-1 text-xs" style={{ color: 'var(--foreground-muted)' }}>
                            <Clock size={12} />
                            <span>{(interaction.responseTime * 1000).toFixed(0)}ms</span>
                          </div>
                          <span className="text-xs" style={{ color: 'var(--foreground-muted)' }}>
                            {(interaction.confidence * 100).toFixed(0)}% confidence
                          </span>
                          {interaction.violations && interaction.violations > 0 && (
                            <span className="text-xs" style={{ color: 'var(--danger)' }}>
                              {interaction.violations} violation{interaction.violations > 1 ? 's' : ''}
                            </span>
                          )}
                          <span className="text-xs ml-auto" style={{ color: 'var(--foreground-muted)' }}>
                            {interaction.timestamp.toLocaleTimeString()}
                          </span>
                        </div>
                        <p className="text-sm font-semibold mb-1" style={{ color: 'var(--foreground)' }}>
                          Q: {interaction.query}
                        </p>
                        <p className="text-sm line-clamp-2" style={{ color: 'var(--foreground-secondary)' }}>
                          A: {interaction.aiResponse}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
