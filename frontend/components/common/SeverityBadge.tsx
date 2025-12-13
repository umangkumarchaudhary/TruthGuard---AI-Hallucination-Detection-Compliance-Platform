'use client'

import { AlertTriangle, AlertCircle, Info, CheckCircle } from 'lucide-react'

interface SeverityBadgeProps {
  severity: 'critical' | 'high' | 'medium' | 'low'
  showIcon?: boolean
  showDescription?: boolean
  size?: 'sm' | 'md' | 'lg'
}

const SEVERITY_CONFIG = {
  critical: {
    color: '#dc2626',
    bgColor: '#fee2e2',
    textColor: '#dc2626',
    borderColor: '#dc2626',
    icon: AlertCircle,
    label: 'CRITICAL',
    description: 'Immediate Action Required',
    iconColor: '#dc2626'
  },
  high: {
    color: '#f59e0b',
    bgColor: '#fef3c7',
    textColor: '#d97706',
    borderColor: '#f59e0b',
    icon: AlertTriangle,
    label: 'HIGH',
    description: 'Block Recommended',
    iconColor: '#f59e0b'
  },
  medium: {
    color: '#fbbf24',
    bgColor: '#fef9c3',
    textColor: '#ca8a04',
    borderColor: '#fbbf24',
    icon: AlertTriangle,
    label: 'MEDIUM',
    description: 'Review Suggested',
    iconColor: '#fbbf24'
  },
  low: {
    color: '#10b981',
    bgColor: '#d1fae5',
    textColor: '#059669',
    borderColor: '#10b981',
    icon: Info,
    label: 'LOW',
    description: 'Monitor Only',
    iconColor: '#10b981'
  }
}

export default function SeverityBadge({ 
  severity, 
  showIcon = true, 
  showDescription = false,
  size = 'md'
}: SeverityBadgeProps) {
  const config = SEVERITY_CONFIG[severity] || SEVERITY_CONFIG.medium
  const Icon = config.icon

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-xs',
    lg: 'px-4 py-1.5 text-sm'
  }

  return (
    <div className="inline-flex items-center gap-2">
      <span 
        className={`inline-flex items-center gap-1.5 font-semibold border ${sizeClasses[size]}`}
        style={{
          backgroundColor: config.bgColor,
          color: config.textColor,
          borderColor: config.borderColor
        }}
      >
        {showIcon && <Icon size={size === 'sm' ? 12 : size === 'md' ? 14 : 16} style={{ color: config.iconColor }} />}
        {config.label}
      </span>
      {showDescription && (
        <span className="text-xs text-black/60">
          {config.description}
        </span>
      )}
    </div>
  )
}

