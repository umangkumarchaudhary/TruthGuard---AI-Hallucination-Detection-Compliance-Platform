'use client'

import { TrendingUp, Shield, DollarSign, AlertCircle, CheckCircle2, Info, Sparkles } from 'lucide-react'
import { useTheme } from '@/lib/theme-provider'

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

interface BusinessImpactCardProps {
  data: BusinessImpactData | null
  loading?: boolean
}

export default function BusinessImpactCard({ data, loading }: BusinessImpactCardProps) {
  const { theme } = useTheme()

  if (loading) {
    return (
      <div className="premium-card p-8">
        <div className="animate-pulse">
          <div className="h-6 w-48 mb-4 rounded" style={{ background: 'var(--background-tertiary)' }} />
          <div className="h-20 mb-4 rounded" style={{ background: 'var(--background-tertiary)' }} />
          <div className="h-16 rounded" style={{ background: 'var(--background-tertiary)' }} />
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="premium-card p-8">
        <p style={{ color: 'var(--foreground-muted)' }}>No business impact data available</p>
      </div>
    )
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  return (
    <div className="premium-card overflow-hidden">
      {/* Header Section */}
      <div
        className="px-6 lg:px-8 py-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        style={{
          borderBottom: '1px solid var(--border)',
          background: 'var(--background-secondary)'
        }}
      >
        <div className="flex items-center gap-4">
          <div
            className="w-12 h-12 flex items-center justify-center"
            style={{ background: 'var(--accent-gradient)', boxShadow: '0 0 20px var(--glow)' }}
          >
            <TrendingUp className="text-white" size={24} />
          </div>
          <div>
            <h2
              className="text-xl lg:text-2xl font-bold tracking-tight"
              style={{ color: 'var(--foreground)' }}
            >
              Business Impact
            </h2>
            <p className="text-sm" style={{ color: 'var(--foreground-muted)' }}>
              Real value protected by TruthGuard
            </p>
          </div>
        </div>
        <span
          className="self-start sm:self-auto text-xs font-semibold px-3 py-1.5"
          style={{
            background: 'var(--background-tertiary)',
            color: 'var(--foreground-secondary)',
            border: '1px solid var(--border)'
          }}
        >
          {data.period}
        </span>
      </div>

      <div className="p-6 lg:p-8">
        {/* Key Metrics - Visual Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6 mb-6 lg:mb-8">
          {/* Hallucinations Blocked */}
          <div
            className="p-5 lg:p-6 transition-all hover:scale-[1.02]"
            style={{
              background: 'var(--success-bg)',
              border: '2px solid var(--success)'
            }}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 lg:w-12 lg:h-12 flex items-center justify-center"
                  style={{ background: 'var(--success)' }}
                >
                  <Shield className="text-white" size={22} />
                </div>
                <div>
                  <p
                    className="text-xs lg:text-sm font-semibold uppercase tracking-wide"
                    style={{ color: 'var(--foreground-secondary)' }}
                  >
                    Hallucinations Blocked
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--foreground-muted)' }}>
                    Harmful AI responses prevented
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <p
                className="text-4xl lg:text-5xl font-bold"
                style={{ color: 'var(--foreground)' }}
              >
                {data.hallucinations_blocked}
              </p>
              <p style={{ color: 'var(--foreground-muted)' }}>incidents</p>
            </div>
          </div>

          {/* Critical Violations Prevented */}
          <div
            className="p-5 lg:p-6 transition-all hover:scale-[1.02]"
            style={{
              background: 'var(--danger-bg)',
              border: '2px solid var(--danger)'
            }}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 lg:w-12 lg:h-12 flex items-center justify-center"
                  style={{ background: 'var(--danger)' }}
                >
                  <AlertCircle className="text-white" size={22} />
                </div>
                <div>
                  <p
                    className="text-xs lg:text-sm font-semibold uppercase tracking-wide"
                    style={{ color: 'var(--foreground-secondary)' }}
                  >
                    Critical Violations Prevented
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--foreground-muted)' }}>
                    High-risk issues caught early
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <p
                className="text-4xl lg:text-5xl font-bold"
                style={{ color: 'var(--foreground)' }}
              >
                {data.critical_violations_prevented}
              </p>
              <p style={{ color: 'var(--foreground-muted)' }}>violations</p>
            </div>
          </div>
        </div>

        {/* Estimated Savings - Premium Section */}
        <div
          className="p-6 lg:p-8"
          style={{
            background: 'var(--accent-gradient)',
            boxShadow: '0 0 30px var(--glow)'
          }}
        >
          <div className="flex items-center gap-3 mb-6">
            <DollarSign size={24} className="text-white" />
            <h3 className="text-lg lg:text-xl font-bold tracking-tight text-white">
              Estimated Savings
            </h3>
            <Sparkles size={18} className="text-white/60" />
          </div>

          <div className="space-y-4 mb-6">
            <div className="flex justify-between items-center py-3 border-b border-white/20">
              <div className="flex items-center gap-3">
                <CheckCircle2 size={18} className="text-white/70" />
                <span className="text-sm lg:text-base text-white/90">Legal Risk Mitigation</span>
              </div>
              <span className="text-base lg:text-lg font-bold text-white">
                {formatCurrency(data.legal_risk_savings)}
              </span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-white/20">
              <div className="flex items-center gap-3">
                <CheckCircle2 size={18} className="text-white/70" />
                <span className="text-sm lg:text-base text-white/90">Brand Damage Prevention</span>
              </div>
              <span className="text-base lg:text-lg font-bold text-white">
                {formatCurrency(data.brand_damage_savings)}
              </span>
            </div>
          </div>

          {/* Total Value Protected - Highlighted */}
          <div className="border-t-2 border-white pt-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <p className="text-sm font-semibold text-white/80 uppercase tracking-wide mb-1">
                  Total Value Protected
                </p>
                <p className="text-xs text-white/60">
                  Combined savings from all prevented incidents
                </p>
              </div>
              <p className="text-3xl lg:text-4xl font-bold text-white tracking-tight">
                {formatCurrency(data.total_savings)}
              </p>
            </div>
          </div>
        </div>

        {/* Calculation Info - Helpful Context */}
        <div
          className="mt-6 p-4"
          style={{
            background: 'var(--background-secondary)',
            border: '1px solid var(--border)'
          }}
        >
          <div className="flex items-start gap-3">
            <Info size={18} style={{ color: 'var(--foreground-muted)' }} className="flex-shrink-0 mt-0.5" />
            <div>
              <p
                className="text-xs font-semibold mb-1"
                style={{ color: 'var(--foreground-secondary)' }}
              >
                How we calculate savings:
              </p>
              <p
                className="text-xs leading-relaxed"
                style={{ color: 'var(--foreground-muted)' }}
              >
                Based on industry standards: <strong style={{ color: 'var(--foreground)' }}>${(data.config.lawsuit_cost / 1000).toFixed(0)}K</strong> per critical violation prevented,
                <strong style={{ color: 'var(--foreground)' }}> ${(data.config.brand_incident_cost / 1000).toFixed(0)}K</strong> per hallucination blocked.
                These estimates reflect potential costs from legal exposure, regulatory fines, and brand reputation damage.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
