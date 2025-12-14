'use client'

import { TrendingUp, Shield, DollarSign, AlertCircle, Zap, CheckCircle2, Info } from 'lucide-react'

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
  if (loading) {
    return (
      <div className="bg-white border border-[#e5e5e5] p-8">
        <div className="animate-pulse">
          <div className="h-6 bg-[#e5e5e5] w-48 mb-4"></div>
          <div className="h-20 bg-[#e5e5e5] mb-4"></div>
          <div className="h-16 bg-[#e5e5e5]"></div>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="bg-white border border-[#e5e5e5] p-8">
        <p className="text-sm text-black/60">No business impact data available</p>
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
    <div className="bg-white border border-[#e5e5e5]">
      {/* Header Section */}
      <div className="border-b border-[#e5e5e5] bg-[#f5f5f5] px-8 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-black flex items-center justify-center">
              <TrendingUp className="text-white" size={20} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-black tracking-tight">Business Impact</h2>
              <p className="text-sm text-black/60 mt-0.5">Real value protected by TruthGuard</p>
            </div>
          </div>
          <span className="text-xs font-medium text-black/60 bg-white px-3 py-1 border border-[#e5e5e5]">
            {data.period}
          </span>
        </div>
      </div>

      <div className="p-8">
        {/* Key Metrics - Visual Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Hallucinations Blocked */}
          <div className="border-2 border-[#10b981] bg-[#f0fdf4] p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-[#10b981] flex items-center justify-center">
                  <Shield className="text-white" size={24} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-black/70 uppercase tracking-wide">Hallucinations Blocked</p>
                  <p className="text-xs text-black/50 mt-1">Harmful AI responses prevented</p>
                </div>
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <p className="text-5xl font-bold text-black">{data.hallucinations_blocked}</p>
              <p className="text-lg text-black/60">incidents</p>
            </div>
          </div>

          {/* Critical Violations Prevented */}
          <div className="border-2 border-[#dc2626] bg-[#fef2f2] p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-[#dc2626] flex items-center justify-center">
                  <AlertCircle className="text-white" size={24} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-black/70 uppercase tracking-wide">Critical Violations Prevented</p>
                  <p className="text-xs text-black/50 mt-1">High-risk issues caught early</p>
                </div>
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <p className="text-5xl font-bold text-black">{data.critical_violations_prevented}</p>
              <p className="text-lg text-black/60">violations</p>
            </div>
          </div>
        </div>

        {/* Estimated Savings - Premium Section */}
        <div className="border-2 border-black bg-black text-white p-8">
          <div className="flex items-center gap-3 mb-6">
            <DollarSign size={24} className="text-white" />
            <h3 className="text-xl font-bold tracking-tight">Estimated Savings</h3>
          </div>

          <div className="space-y-4 mb-6">
            <div className="flex justify-between items-center py-3 border-b border-white/20">
              <div className="flex items-center gap-3">
                <CheckCircle2 size={18} className="text-white/70" />
                <span className="text-base text-white/90">Legal Risk Mitigation</span>
              </div>
              <span className="text-lg font-bold text-white">
                {formatCurrency(data.legal_risk_savings)}
              </span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-white/20">
              <div className="flex items-center gap-3">
                <CheckCircle2 size={18} className="text-white/70" />
                <span className="text-base text-white/90">Brand Damage Prevention</span>
              </div>
              <span className="text-lg font-bold text-white">
                {formatCurrency(data.brand_damage_savings)}
              </span>
            </div>
          </div>

          {/* Total Value Protected - Highlighted */}
          <div className="border-t-2 border-white pt-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-semibold text-white/80 uppercase tracking-wide mb-1">Total Value Protected</p>
                <p className="text-xs text-white/60">Combined savings from all prevented incidents</p>
              </div>
              <div className="text-right">
                <p className="text-4xl font-bold text-white tracking-tight">
                  {formatCurrency(data.total_savings)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Calculation Info - Helpful Context */}
        <div className="mt-6 p-4 bg-[#f5f5f5] border border-[#e5e5e5]">
          <div className="flex items-start gap-3">
            <Info size={18} className="text-black/50 mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-black/70 mb-1">How we calculate savings:</p>
              <p className="text-xs text-black/60 leading-relaxed">
                Based on industry standards: <strong className="text-black">${(data.config.lawsuit_cost / 1000).toFixed(0)}K</strong> per critical violation prevented, 
                <strong className="text-black"> ${(data.config.brand_incident_cost / 1000).toFixed(0)}K</strong> per hallucination blocked. 
                These estimates reflect potential costs from legal exposure, regulatory fines, and brand reputation damage.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

