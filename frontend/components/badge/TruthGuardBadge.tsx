'use client'

import { Shield, CheckCircle } from 'lucide-react'

interface TruthGuardBadgeProps {
  status?: 'monitored' | 'verified' | 'protected'
  size?: 'small' | 'medium' | 'large'
  showLogo?: boolean
  variant?: 'default' | 'minimal' | 'detailed'
}

const STATUS_CONFIG = {
  monitored: {
    label: 'Monitored 24/7',
    icon: Shield,
    color: '#3b82f6'
  },
  verified: {
    label: 'AI Verified',
    icon: CheckCircle,
    color: '#10b981'
  },
  protected: {
    label: 'Protected',
    icon: Shield,
    color: '#dc2626'
  }
}

const SIZE_CONFIG = {
  small: {
    padding: 'px-3 py-1.5',
    text: 'text-xs',
    icon: 14,
    gap: 'gap-1.5'
  },
  medium: {
    padding: 'px-4 py-2',
    text: 'text-sm',
    icon: 16,
    gap: 'gap-2'
  },
  large: {
    padding: 'px-6 py-3',
    text: 'text-base',
    icon: 20,
    gap: 'gap-2.5'
  }
}

export default function TruthGuardBadge({
  status = 'monitored',
  size = 'medium',
  showLogo = true,
  variant = 'default'
}: TruthGuardBadgeProps) {
  const statusConfig = STATUS_CONFIG[status]
  const sizeConfig = SIZE_CONFIG[size]
  const Icon = statusConfig.icon

  if (variant === 'minimal') {
    return (
      <div 
        className={`inline-flex items-center ${sizeConfig.gap} ${sizeConfig.padding} border border-black bg-white ${sizeConfig.text} font-semibold text-black`}
        style={{ borderWidth: '2px' }}
      >
        {showLogo && <Shield size={sizeConfig.icon} />}
        <span>TruthGuard</span>
      </div>
    )
  }

  if (variant === 'detailed') {
    return (
      <div 
        className={`inline-flex flex-col ${sizeConfig.padding} border-2 border-black bg-white`}
        style={{ borderWidth: '2px' }}
      >
        <div className={`flex items-center ${sizeConfig.gap} mb-1`}>
          {showLogo && <Shield size={sizeConfig.icon} className="text-black" />}
          <span className={`${sizeConfig.text} font-bold text-black`}>TruthGuard</span>
        </div>
        <div className={`flex items-center ${sizeConfig.gap}`}>
          <Icon size={sizeConfig.icon - 2} style={{ color: statusConfig.color }} />
          <span className={`${sizeConfig.text === 'text-xs' ? 'text-[10px]' : sizeConfig.text === 'text-sm' ? 'text-xs' : 'text-sm'} font-semibold text-black`}>
            {statusConfig.label}
          </span>
        </div>
        <p className={`${sizeConfig.text === 'text-xs' ? 'text-[9px]' : sizeConfig.text === 'text-sm' ? 'text-[10px]' : 'text-xs'} text-black/60 mt-1`}>
          AI responses verified
        </p>
      </div>
    )
  }

  // Default variant
  return (
    <div 
      className={`inline-flex items-center ${sizeConfig.gap} ${sizeConfig.padding} border-2 border-black bg-white ${sizeConfig.text} font-semibold text-black`}
      style={{ borderWidth: '2px' }}
    >
      {showLogo && <Shield size={sizeConfig.icon} className="text-black" />}
      <span>Powered by</span>
      <span className="font-bold">TruthGuard</span>
      <div className="flex items-center gap-1">
        <Icon size={sizeConfig.icon - 2} style={{ color: statusConfig.color }} />
        <span className="text-black/80">{statusConfig.label}</span>
      </div>
    </div>
  )
}

