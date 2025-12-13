'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import DashboardLayout from '@/components/common/DashboardLayout'
import { apiClient } from '@/lib/api-client'
import { Play, Square, Radio, Clock, CheckCircle, XCircle, AlertTriangle } from 'lucide-react'
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
        // Simulate validation
        const validationResult = await simulateValidation(testCase)
        
        const newInteraction: LiveInteraction = {
          id: `demo-${Date.now()}-${currentIndex}`,
          query: testCase.query,
          aiResponse: testCase.aiResponse,
          status: validationResult.status,
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
      // Use real validation API
      const response = await apiClient.post('/api/v1/validate', {
        query: testCase.query,
        ai_response: testCase.aiResponse,
        organization_id: '00000000-0000-0000-0000-000000000001',
        ai_model: 'demo'
      })

      if (response.data) {
        return {
          status: response.data.status,
          confidence: response.data.confidence_score || 0.8,
          violations: response.data.violations?.length || 0
        }
      }
    } catch (error) {
      console.error('Validation error:', error)
    }

    // Fallback to expected status
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
        return <CheckCircle className="text-[#10b981]" size={18} />
      case 'blocked':
        return <XCircle className="text-[#dc2626]" size={18} />
      case 'flagged':
        return <AlertTriangle className="text-[#f59e0b]" size={18} />
      default:
        return null
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-[#10b981] text-white'
      case 'blocked':
        return 'bg-[#dc2626] text-white'
      case 'flagged':
        return 'bg-[#f59e0b] text-white'
      default:
        return 'bg-black text-white'
    }
  }

  return (
    <DashboardLayout>
      <div className="p-4 lg:p-8">
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-black mb-2">Live Streaming Demo</h1>
            <p className="text-sm text-black/60">Real-time AI response monitoring simulation</p>
          </div>
          <div className="flex items-center gap-3">
            {isRunning && (
              <div className="flex items-center gap-2 px-4 py-2 bg-[#dc2626] text-white">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                <span className="text-sm font-semibold">LIVE</span>
              </div>
            )}
            {!isRunning ? (
              <button
                onClick={handleStart}
                className="flex items-center gap-2 px-6 py-2 bg-black text-white font-semibold hover:bg-black/90 transition-colors"
              >
                <Play size={16} />
                <span>Start Demo</span>
              </button>
            ) : (
              <button
                onClick={handleStop}
                className="flex items-center gap-2 px-6 py-2 bg-[#dc2626] text-white font-semibold hover:bg-[#dc2626]/90 transition-colors"
              >
                <Square size={16} />
                <span>Stop Demo</span>
              </button>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
          <div className="bg-white border border-[#e5e5e5] p-4">
            <p className="text-xs text-black/60 mb-1">Total Interactions</p>
            <p className="text-2xl font-bold text-black">{stats.total}</p>
          </div>
          <div className="bg-white border border-[#e5e5e5] p-4">
            <p className="text-xs text-black/60 mb-1">Approved</p>
            <p className="text-2xl font-bold text-[#10b981]">{stats.approved}</p>
          </div>
          <div className="bg-white border border-[#e5e5e5] p-4">
            <p className="text-xs text-black/60 mb-1">Flagged</p>
            <p className="text-2xl font-bold text-[#f59e0b]">{stats.flagged}</p>
          </div>
          <div className="bg-white border border-[#e5e5e5] p-4">
            <p className="text-xs text-black/60 mb-1">Blocked</p>
            <p className="text-2xl font-bold text-[#dc2626]">{stats.blocked}</p>
          </div>
        </div>

        {/* Live Feed */}
        <div className="bg-white border border-[#e5e5e5]">
          <div className="border-b border-[#e5e5e5] px-6 py-4 flex items-center gap-2">
            <Radio className="text-black" size={18} />
            <h2 className="text-lg font-semibold text-black">Live Feed</h2>
            {isRunning && (
              <span className="text-xs text-black/60 ml-auto">
                Processing {currentIndex + 1} of {DEMO_TEST_CASES.length}...
              </span>
            )}
          </div>
          
          <div 
            ref={scrollRef}
            className="h-[600px] overflow-y-auto divide-y divide-[#e5e5e5]"
          >
            {interactions.length === 0 ? (
              <div className="flex items-center justify-center h-full text-black/60">
                <div className="text-center">
                  <Radio size={48} className="mx-auto mb-4 opacity-20" />
                  <p className="text-sm">Click "Start Demo" to begin live monitoring</p>
                </div>
              </div>
            ) : (
              interactions.map((interaction) => (
                <div
                  key={interaction.id}
                  className="px-6 py-4 hover:bg-[#f5f5f5] transition-colors animate-fadeIn"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 mt-1">
                      {getStatusIcon(interaction.status)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <span className={`px-3 py-1 text-xs font-semibold ${getStatusColor(interaction.status)}`}>
                          {interaction.status.toUpperCase()}
                        </span>
                        <div className="flex items-center gap-1 text-xs text-black/60">
                          <Clock size={12} />
                          <span>{(interaction.responseTime * 1000).toFixed(0)}ms</span>
                        </div>
                        <span className="text-xs text-black/60">
                          {(interaction.confidence * 100).toFixed(0)}% confidence
                        </span>
                        {interaction.violations && interaction.violations > 0 && (
                          <span className="text-xs text-[#dc2626]">
                            {interaction.violations} violation{interaction.violations > 1 ? 's' : ''}
                          </span>
                        )}
                        <span className="text-xs text-black/40 ml-auto">
                          {interaction.timestamp.toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-sm font-semibold text-black mb-1">
                        Q: {interaction.query}
                      </p>
                      <p className="text-sm text-black/80 line-clamp-2">
                        A: {interaction.aiResponse}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
      
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </DashboardLayout>
  )
}

