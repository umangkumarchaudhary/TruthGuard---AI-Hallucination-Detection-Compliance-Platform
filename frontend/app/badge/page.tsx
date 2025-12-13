'use client'

import { useState } from 'react'
import DashboardLayout from '@/components/common/DashboardLayout'
import TruthGuardBadge from '@/components/badge/TruthGuardBadge'
import { Copy, Download, Code, Shield } from 'lucide-react'

type BadgeStatus = 'monitored' | 'verified' | 'protected'
type BadgeSize = 'small' | 'medium' | 'large'
type BadgeVariant = 'default' | 'minimal' | 'detailed'

export default function BadgePage() {
  const [status, setStatus] = useState<BadgeStatus>('monitored')
  const [size, setSize] = useState<BadgeSize>('medium')
  const [variant, setVariant] = useState<BadgeVariant>('default')
  const [showLogo, setShowLogo] = useState(true)
  const [copied, setCopied] = useState(false)

  const generateHTMLCode = () => {
    const statusLabels = {
      monitored: 'Monitored 24/7',
      verified: 'AI Verified',
      protected: 'Protected'
    }
    
    if (variant === 'minimal') {
      return `<div style="display: inline-flex; align-items: center; gap: 8px; padding: 8px 16px; border: 2px solid #000; background: #fff; font-size: 14px; font-weight: 600; color: #000;">
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
  <span>TruthGuard</span>
</div>`
    }
    
    if (variant === 'detailed') {
      return `<div style="display: inline-flex; flex-direction: column; padding: 12px 16px; border: 2px solid #000; background: #fff;">
  <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>
    <span style="font-size: 14px; font-weight: 700; color: #000;">TruthGuard</span>
  </div>
  <div style="display: flex; align-items: center; gap: 6px;">
    <span style="font-size: 12px; font-weight: 600; color: #000;">${statusLabels[status]}</span>
  </div>
  <p style="font-size: 10px; color: #666; margin-top: 4px; margin: 0;">AI responses verified</p>
</div>`
    }
    
    return `<div style="display: inline-flex; align-items: center; gap: 8px; padding: 12px 24px; border: 2px solid #000; background: #fff; font-size: 14px; font-weight: 600; color: #000;">
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
  <span>Powered by</span>
  <span style="font-weight: 700;">TruthGuard</span>
  <span style="color: #666;">${statusLabels[status]}</span>
</div>`
  }

  const generateReactCode = () => {
    return `import TruthGuardBadge from '@/components/badge/TruthGuardBadge'

<TruthGuardBadge 
  status="${status}"
  size="${size}"
  variant="${variant}"
  showLogo={${showLogo}}
/>`
  }

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <DashboardLayout>
      <div className="p-4 lg:p-8">
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="text-black" size={24} />
            <h1 className="text-3xl font-bold text-black">TruthGuard Badge</h1>
          </div>
          <p className="text-sm text-black/60">Generate embeddable badges to show trust and verification</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Customization Panel */}
          <div className="bg-white border border-[#e5e5e5] p-6">
            <h3 className="text-lg font-semibold text-black mb-6">Customize Badge</h3>
            
            <div className="space-y-6">
              {/* Status */}
              <div>
                <label className="block text-sm font-semibold text-black mb-3">Status</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['monitored', 'verified', 'protected'] as BadgeStatus[]).map((s) => (
                    <button
                      key={s}
                      onClick={() => setStatus(s)}
                      className={`px-4 py-2 border-2 text-sm font-semibold transition-colors ${
                        status === s
                          ? 'border-black bg-black text-white'
                          : 'border-[#e5e5e5] bg-white text-black hover:border-black'
                      }`}
                    >
                      {s.charAt(0).toUpperCase() + s.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Size */}
              <div>
                <label className="block text-sm font-semibold text-black mb-3">Size</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['small', 'medium', 'large'] as BadgeSize[]).map((s) => (
                    <button
                      key={s}
                      onClick={() => setSize(s)}
                      className={`px-4 py-2 border-2 text-sm font-semibold transition-colors ${
                        size === s
                          ? 'border-black bg-black text-white'
                          : 'border-[#e5e5e5] bg-white text-black hover:border-black'
                      }`}
                    >
                      {s.charAt(0).toUpperCase() + s.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Variant */}
              <div>
                <label className="block text-sm font-semibold text-black mb-3">Style</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['default', 'minimal', 'detailed'] as BadgeVariant[]).map((v) => (
                    <button
                      key={v}
                      onClick={() => setVariant(v)}
                      className={`px-4 py-2 border-2 text-sm font-semibold transition-colors ${
                        variant === v
                          ? 'border-black bg-black text-white'
                          : 'border-[#e5e5e5] bg-white text-black hover:border-black'
                      }`}
                    >
                      {v.charAt(0).toUpperCase() + v.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Show Logo */}
              <div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showLogo}
                    onChange={(e) => setShowLogo(e.target.checked)}
                    className="w-4 h-4 border-[#e5e5e5] text-black focus:ring-black"
                  />
                  <span className="text-sm font-semibold text-black">Show Logo</span>
                </label>
              </div>
            </div>
          </div>

          {/* Preview & Code */}
          <div className="space-y-6">
            {/* Preview */}
            <div className="bg-white border border-[#e5e5e5] p-6">
              <h3 className="text-lg font-semibold text-black mb-4">Preview</h3>
              <div className="flex items-center justify-center min-h-[120px] bg-[#f5f5f5] border border-[#e5e5e5]">
                <TruthGuardBadge
                  status={status}
                  size={size}
                  variant={variant}
                  showLogo={showLogo}
                />
              </div>
            </div>

            {/* Code */}
            <div className="bg-white border border-[#e5e5e5] p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-black">Embed Code</h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleCopy(generateHTMLCode())}
                    className="flex items-center gap-2 px-3 py-1.5 border border-[#e5e5e5] bg-white text-black hover:bg-[#f5f5f5] text-xs font-semibold transition-colors"
                  >
                    <Code size={14} />
                    <span>HTML</span>
                  </button>
                  <button
                    onClick={() => handleCopy(generateReactCode())}
                    className="flex items-center gap-2 px-3 py-1.5 border border-[#e5e5e5] bg-white text-black hover:bg-[#f5f5f5] text-xs font-semibold transition-colors"
                  >
                    <Code size={14} />
                    <span>React</span>
                  </button>
                </div>
              </div>
              
              <div className="bg-[#f5f5f5] border border-[#e5e5e5] p-4">
                <pre className="text-xs text-black overflow-x-auto">
                  <code>{variant === 'default' ? generateReactCode() : generateHTMLCode()}</code>
                </pre>
              </div>
              
              {copied && (
                <div className="mt-3 p-2 bg-[#d1fae5] border border-[#10b981] text-xs text-[#10b981] flex items-center gap-2">
                  <Copy size={12} />
                  <span>Code copied to clipboard!</span>
                </div>
              )}
            </div>

            {/* Usage Instructions */}
            <div className="bg-white border border-[#e5e5e5] p-6">
              <h3 className="text-sm font-semibold text-black mb-3">How to Use</h3>
              <ol className="text-xs text-black/80 space-y-2 list-decimal list-inside">
                <li>Customize the badge using the options on the left</li>
                <li>Copy the HTML or React code</li>
                <li>Paste it into your website or application</li>
                <li>The badge will display your verification status</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

