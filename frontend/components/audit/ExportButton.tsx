'use client'

import { useState } from 'react'
import { Download, FileText, FileJson, File, Loader2, Calendar } from 'lucide-react'

interface ExportButtonProps {
  organizationId?: string
  startDate?: string
  endDate?: string
}

export default function ExportButton({ 
  organizationId = '00000000-0000-0000-0000-000000000001',
  startDate,
  endDate
}: ExportButtonProps) {
  const [loading, setLoading] = useState<string | null>(null)
  const [showOptions, setShowOptions] = useState(false)

  const handleExport = async (format: 'csv' | 'json' | 'pdf') => {
    setLoading(format)
    try {
      const params = new URLSearchParams({
        organization_id: organizationId,
        format: format,
        include_violations: 'true',
        include_verification: 'true'
      })
      
      if (startDate) params.append('start_date', startDate)
      if (endDate) params.append('end_date', endDate)
      
      const response = await fetch(`http://localhost:8000/api/v1/audit/export?${params.toString()}`, {
        method: 'GET',
        headers: {
          'X-API-Key': localStorage.getItem('api_key') || ''
        }
      })
      
      if (!response.ok) {
        throw new Error('Export failed')
      }
      
      // Get filename from Content-Disposition header or generate one
      const contentDisposition = response.headers.get('Content-Disposition')
      let filename = `truthguard_export_${new Date().toISOString().split('T')[0]}.${format}`
      
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?(.+)"?/i)
        if (filenameMatch) {
          filename = filenameMatch[1]
        }
      }
      
      // Handle different content types
      if (format === 'json') {
        const data = await response.json()
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = filename
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      } else {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = filename
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      }
      
      setShowOptions(false)
    } catch (error) {
      console.error('Export error:', error)
      alert('Failed to export data. Please try again.')
    } finally {
      setLoading(null)
    }
  }

  const formatOptions = [
    { 
      format: 'csv' as const, 
      label: 'CSV', 
      icon: FileText, 
      description: 'Excel-compatible spreadsheet',
      color: '#10b981'
    },
    { 
      format: 'json' as const, 
      label: 'JSON', 
      icon: FileJson, 
      description: 'Structured data format',
      color: '#3b82f6'
    },
    { 
      format: 'pdf' as const, 
      label: 'PDF', 
      icon: File, 
      description: 'Formatted report document',
      color: '#dc2626'
    }
  ]

  return (
    <div className="relative">
      <button
        onClick={() => setShowOptions(!showOptions)}
        className="flex items-center gap-2 px-4 py-2 bg-black text-white font-semibold hover:bg-black/90 transition-colors text-sm"
      >
        <Download size={16} />
        <span>Export Report</span>
      </button>

      {showOptions && (
        <>
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setShowOptions(false)}
          />
          <div className="absolute right-0 top-full mt-2 bg-white border border-[#e5e5e5] shadow-lg z-20 min-w-[280px]">
            <div className="p-4 border-b border-[#e5e5e5]">
              <div className="flex items-center gap-2 mb-2">
                <Calendar size={16} className="text-black/60" />
                <h3 className="text-sm font-semibold text-black">Export Options</h3>
              </div>
              {(startDate || endDate) && (
                <p className="text-xs text-black/60">
                  {startDate ? new Date(startDate).toLocaleDateString() : 'All'} - {endDate ? new Date(endDate).toLocaleDateString() : 'All'}
                </p>
              )}
            </div>
            
            <div className="p-2">
              {formatOptions.map((option) => {
                const Icon = option.icon
                const isLoading = loading === option.format
                
                return (
                  <button
                    key={option.format}
                    onClick={() => handleExport(option.format)}
                    disabled={isLoading}
                    className="w-full flex items-center gap-3 px-3 py-3 hover:bg-[#f5f5f5] transition-colors text-left disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div 
                      className="p-2 border border-[#e5e5e5]"
                      style={{ borderColor: option.color }}
                    >
                      <Icon size={18} style={{ color: option.color }} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-black">{option.label}</span>
                        {isLoading && <Loader2 size={14} className="animate-spin text-black/60" />}
                      </div>
                      <p className="text-xs text-black/60">{option.description}</p>
                    </div>
                  </button>
                )
              })}
            </div>
            
            <div className="p-3 border-t border-[#e5e5e5] bg-[#f5f5f5]">
              <p className="text-xs text-black/60">
                Includes: Interactions, Violations, Verification Results
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

