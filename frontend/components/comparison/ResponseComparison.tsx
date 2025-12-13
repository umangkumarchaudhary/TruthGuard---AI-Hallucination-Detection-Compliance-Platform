'use client'

import { CheckCircle, XCircle, ExternalLink, ArrowDown } from 'lucide-react'

interface ResponseComparisonProps {
  originalResponse: string
  correctedResponse?: string
  violations: Array<{
    type: string
    severity: string
    description: string
  }>
  verificationResults?: Array<{
    claim_text: string
    verification_status: string
    source?: string
    url?: string
    details?: string
  }>
}

export default function ResponseComparison({
  originalResponse,
  correctedResponse,
  violations,
  verificationResults = []
}: ResponseComparisonProps) {
  // Only show if there are violations and a corrected response
  if (!violations.length || !correctedResponse || correctedResponse.trim() === originalResponse.trim()) {
    return null
  }

  // Extract verified facts from verification results
  const verifiedFacts = verificationResults
    .filter(r => r.verification_status === 'verified' && r.source)
    .map(r => ({
      claim: r.claim_text,
      source: r.source,
      url: r.url,
      details: r.details
    }))

  return (
    <div className="bg-white border border-[#e5e5e5] p-6 mb-6">
      <h3 className="text-lg font-semibold text-black mb-6">Response Correction</h3>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Original Response */}
        <div className="border-2 border-[#dc2626] p-5">
          <div className="flex items-center gap-2 mb-4">
            <XCircle className="text-[#dc2626]" size={20} />
            <h4 className="text-sm font-semibold text-[#dc2626]">AI Response (BLOCKED/FLAGGED)</h4>
          </div>
          <div className="bg-[#fee2e2] p-4 border border-[#dc2626]">
            <p className="text-sm text-black leading-relaxed whitespace-pre-wrap">
              {originalResponse}
            </p>
          </div>
          {violations.length > 0 && (
            <div className="mt-4 pt-4 border-t border-[#dc2626]">
              <p className="text-xs font-semibold text-[#dc2626] mb-2">Issues Detected:</p>
              <ul className="space-y-1">
                {violations.map((violation, idx) => (
                  <li key={idx} className="text-xs text-black/80">
                    • {violation.description}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Arrow */}
        <div className="hidden lg:flex items-center justify-center">
          <div className="flex flex-col items-center gap-2 text-black/60">
            <ArrowDown size={24} />
            <span className="text-xs font-medium">Should be</span>
          </div>
        </div>

        {/* Corrected Response */}
        <div className="border-2 border-[#10b981] p-5">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle className="text-[#10b981]" size={20} />
            <h4 className="text-sm font-semibold text-[#10b981]">Correct Response</h4>
          </div>
          <div className="bg-[#d1fae5] p-4 border border-[#10b981]">
            <p className="text-sm text-black leading-relaxed whitespace-pre-wrap">
              {correctedResponse}
            </p>
          </div>
          
          {/* Show verified facts if available */}
          {verifiedFacts.length > 0 && (
            <div className="mt-4 pt-4 border-t border-[#10b981]">
              <p className="text-xs font-semibold text-[#10b981] mb-2">Verified Sources:</p>
              <div className="space-y-2">
                {verifiedFacts.slice(0, 3).map((fact, idx) => (
                  <div key={idx} className="bg-white p-2 border border-[#10b981]">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <p className="text-xs text-black/80 mb-1">{fact.claim}</p>
                        <p className="text-xs text-black/60">
                          Source: <span className="font-medium capitalize">{fact.source}</span>
                        </p>
                        {fact.details && (
                          <p className="text-xs text-black/50 mt-1 line-clamp-2">
                            {fact.details.substring(0, 100)}...
                          </p>
                        )}
                      </div>
                      {fact.url && (
                        <a
                          href={fact.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#10b981] hover:text-[#059669] flex-shrink-0"
                        >
                          <ExternalLink size={14} />
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Arrow */}
      <div className="lg:hidden flex items-center justify-center my-4">
        <div className="flex flex-col items-center gap-2 text-black/60">
          <ArrowDown size={24} />
          <span className="text-xs font-medium">Should be</span>
        </div>
      </div>
    </div>
  )
}

