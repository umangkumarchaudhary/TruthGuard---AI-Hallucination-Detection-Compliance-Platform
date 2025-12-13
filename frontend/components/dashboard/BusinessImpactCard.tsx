'use client'

import { TrendingUp, Shield, DollarSign, AlertCircle } from 'lucide-react'

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
      <div className="bg-white border border-[#e5e5e5] p-6">
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
      <div className="bg-white border border-[#e5e5e5] p-6">
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
    <div className="bg-white border border-[#e5e5e5] p-6">
      <div className="flex items-center gap-2 mb-6">
        <TrendingUp className="text-black" size={20} />
        <h3 className="text-lg font-semibold text-black">Business Impact</h3>
        <span className="text-xs text-black/60 ml-auto">({data.period})</span>
      </div>

      <div className="space-y-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-2 gap-4">
          <div className="border border-[#e5e5e5] p-4">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="text-[#10b981]" size={16} />
              <p className="text-xs text-black/60">Hallucinations Blocked</p>
            </div>
            <p className="text-2xl font-bold text-black">{data.hallucinations_blocked}</p>
          </div>

          <div className="border border-[#e5e5e5] p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="text-[#dc2626]" size={16} />
              <p className="text-xs text-black/60">Critical Violations Prevented</p>
            </div>
            <p className="text-2xl font-bold text-black">{data.critical_violations_prevented}</p>
          </div>
        </div>

        {/* Estimated Savings */}
        <div className="border-t border-[#e5e5e5] pt-6">
          <div className="flex items-center gap-2 mb-4">
            <DollarSign className="text-black" size={18} />
            <h4 className="text-sm font-semibold text-black">Estimated Savings</h4>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-black/80">Legal Risk Mitigation</span>
              <span className="text-sm font-semibold text-black">
                {formatCurrency(data.legal_risk_savings)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-black/80">Brand Damage Prevention</span>
              <span className="text-sm font-semibold text-black">
                {formatCurrency(data.brand_damage_savings)}
              </span>
            </div>
            <div className="border-t border-[#e5e5e5] pt-3 mt-3">
              <div className="flex justify-between items-center">
                <span className="text-base font-semibold text-black">Total Value Protected</span>
                <span className="text-xl font-bold text-black">
                  {formatCurrency(data.total_savings)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Calculation Info */}
        <div className="border-t border-[#e5e5e5] pt-4">
          <p className="text-xs text-black/50">
            Based on industry standards: ${(data.config.lawsuit_cost / 1000).toFixed(0)}K per critical violation, 
            ${(data.config.brand_incident_cost / 1000).toFixed(0)}K per blocked incident
          </p>
        </div>
      </div>
    </div>
  )
}

