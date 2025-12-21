'use client'

import React, { useState } from 'react'
import DashboardLayout from '@/components/common/DashboardLayout'
import { useTheme } from '@/lib/theme-provider'
import {
    Book,
    Code,
    Zap,
    Shield,
    Database,
    Brain,
    CheckCircle,
    XCircle,
    AlertTriangle,
    ChevronRight,
    Copy,
    Check,
    Terminal,
    Globe,
    Lock,
    TrendingUp,
    Eye,
    FileCheck
} from 'lucide-react'
import Link from 'next/link'

export default function DocsPage() {
    const { theme } = useTheme()
    const [copiedCode, setCopiedCode] = useState<string | null>(null)

    const copyCode = (code: string, id: string) => {
        navigator.clipboard.writeText(code)
        setCopiedCode(id)
        setTimeout(() => setCopiedCode(null), 2000)
    }

    const sections = [
        { id: 'overview', title: 'Overview', icon: Book },
        { id: 'architecture', title: 'Architecture', icon: Code },
        { id: 'detection', title: 'Detection Pipeline', icon: Eye },
        { id: 'api', title: 'API Reference', icon: Terminal },
        { id: 'integration', title: 'Integration Guide', icon: Globe },
    ]

    const apiEndpoints = [
        {
            method: 'POST',
            path: '/api/v1/validate',
            description: 'Validate an AI response',
            example: `{
  "query": "What is Python?",
  "ai_response": "Python is a programming language...",
  "organization_id": "your-org-id",
  "ai_model": "gpt-4"
}`
        },
        {
            method: 'GET',
            path: '/api/v1/audit/interactions',
            description: 'List all interactions',
            example: `// Query parameters
?limit=20
&offset=0
&organization_id=your-org-id
&status=approved|flagged|blocked`
        },
        {
            method: 'GET',
            path: '/api/v1/audit/violations',
            description: 'List violations',
            example: `// Query parameters
?severity=critical|high|medium|low
&violation_type=hallucination|compliance|policy`
        },
        {
            method: 'POST',
            path: '/api/v1/ai-test/generate',
            description: 'Generate AI response and validate',
            example: `{
  "company_id": "company-uuid",
  "user_query": "Your question here",
  "ai_model": "gemini-pro"
}`
        }
    ]

    return (
        <DashboardLayout>
            <div className="p-4 lg:p-8">
                {/* Header */}
                <div className="mb-8 animate-slide-down">
                    <div className="flex items-center gap-3 mb-2">
                        <Book size={24} style={{ color: 'var(--accent)' }} />
                        <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--accent)' }}>
                            Documentation
                        </span>
                    </div>
                    <h1 className="text-3xl lg:text-4xl font-bold tracking-tight mb-2" style={{ color: 'var(--foreground)' }}>
                        How TruthGuard Works
                    </h1>
                    <p style={{ color: 'var(--foreground-muted)' }}>
                        Complete technical documentation for developers and recruiters
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Sidebar Navigation */}
                    <div className="lg:col-span-1">
                        <div className="premium-card p-4 sticky top-4">
                            <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--foreground)' }}>Contents</h3>
                            <nav className="space-y-1">
                                {sections.map((section) => {
                                    const Icon = section.icon
                                    return (
                                        <a
                                            key={section.id}
                                            href={`#${section.id}`}
                                            className="flex items-center gap-2 px-3 py-2 text-sm transition-colors"
                                            style={{ color: 'var(--foreground-muted)' }}
                                        >
                                            <Icon size={16} />
                                            {section.title}
                                        </a>
                                    )
                                })}
                            </nav>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="lg:col-span-3 space-y-8">
                        {/* Overview Section */}
                        <section id="overview" className="premium-card p-6 lg:p-8">
                            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2" style={{ color: 'var(--foreground)' }}>
                                <Book size={24} style={{ color: 'var(--accent)' }} />
                                Overview
                            </h2>
                            <p className="mb-6 leading-relaxed" style={{ color: 'var(--foreground-secondary)' }}>
                                TruthGuard is an enterprise-grade AI safety platform that validates AI responses in real-time,
                                detects hallucinations, ensures compliance, and provides complete audit trails for regulatory requirements.
                            </p>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                                <FeatureCard
                                    icon={Shield}
                                    title="Hallucination Detection"
                                    description="Real-time fact verification against Wikipedia, DuckDuckGo, and NewsAPI"
                                    color="#dc2626"
                                />
                                <FeatureCard
                                    icon={FileCheck}
                                    title="Compliance Checking"
                                    description="Automated regulatory and policy violation detection"
                                    color="#f59e0b"
                                />
                                <FeatureCard
                                    icon={Database}
                                    title="Audit Trails"
                                    description="Complete logging for regulatory compliance and explainability"
                                    color="#3b82f6"
                                />
                            </div>

                            <div className="p-4" style={{ background: 'var(--success-bg)', border: '1px solid var(--success)' }}>
                                <p className="text-sm font-semibold mb-1" style={{ color: 'var(--success)' }}>Key Benefits</p>
                                <ul className="text-sm space-y-1" style={{ color: 'var(--foreground-secondary)' }}>
                                    <li>• Prevent false information from reaching customers</li>
                                    <li>• Maintain regulatory compliance automatically</li>
                                    <li>• Reduce legal exposure from AI-generated content</li>
                                    <li>• Provide auditors with complete interaction history</li>
                                </ul>
                            </div>
                        </section>

                        {/* Architecture Section */}
                        <section id="architecture" className="premium-card p-6 lg:p-8">
                            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2" style={{ color: 'var(--foreground)' }}>
                                <Code size={24} style={{ color: 'var(--accent)' }} />
                                System Architecture
                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                <div>
                                    <h3 className="font-semibold mb-3" style={{ color: 'var(--foreground)' }}>Frontend Stack</h3>
                                    <div className="space-y-2">
                                        <TechBadge name="Next.js 16" desc="React framework with App Router" />
                                        <TechBadge name="React 19" desc="UI library with Server Components" />
                                        <TechBadge name="TypeScript" desc="Type-safe development" />
                                        <TechBadge name="Tailwind CSS" desc="Utility-first styling" />
                                        <TechBadge name="Recharts" desc="Data visualization" />
                                    </div>
                                </div>
                                <div>
                                    <h3 className="font-semibold mb-3" style={{ color: 'var(--foreground)' }}>Backend Stack</h3>
                                    <div className="space-y-2">
                                        <TechBadge name="FastAPI" desc="High-performance Python API" />
                                        <TechBadge name="Pydantic" desc="Data validation" />
                                        <TechBadge name="Supabase" desc="PostgreSQL database" />
                                        <TechBadge name="spaCy" desc="NLP processing" />
                                        <TechBadge name="Google Gemini" desc="AI model integration" />
                                    </div>
                                </div>
                            </div>

                            <div className="p-4 font-mono text-xs overflow-x-auto" style={{ background: 'var(--background-tertiary)', border: '1px solid var(--border)', color: 'var(--foreground-secondary)' }}>
                                <pre>{`┌────────────────┐     ┌────────────────┐     ┌────────────────┐
│   Customer     │────▶│   TruthGuard   │────▶│   External     │
│   AI System    │     │   Platform     │     │   APIs         │
└────────────────┘     └────────────────┘     └────────────────┘
                              │
                              ▼
                       ┌────────────────┐
                       │   Supabase     │
                       │   PostgreSQL   │
                       └────────────────┘`}</pre>
                            </div>
                        </section>

                        {/* Detection Pipeline */}
                        <section id="detection" className="premium-card p-6 lg:p-8">
                            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2" style={{ color: 'var(--foreground)' }}>
                                <Eye size={24} style={{ color: 'var(--accent)' }} />
                                Detection Pipeline
                            </h2>
                            <p className="mb-6" style={{ color: 'var(--foreground-secondary)' }}>
                                Every AI response goes through a 5-step validation pipeline:
                            </p>

                            <div className="space-y-4">
                                <PipelineStep
                                    step={1}
                                    title="Claim Extraction"
                                    description="Uses spaCy NLP to extract factual claims from AI responses. Identifies nouns, numbers, dates, and verifiable assertions."
                                    color="#3b82f6"
                                />
                                <PipelineStep
                                    step={2}
                                    title="Fact Verification"
                                    description="Queries Wikipedia API, DuckDuckGo, and NewsAPI to verify claims. Uses semantic similarity to match claims with sources."
                                    color="#10b981"
                                />
                                <PipelineStep
                                    step={3}
                                    title="Compliance Checking"
                                    description="Validates against predefined compliance rules (financial advice, medical claims, etc.) and company-specific policies."
                                    color="#f59e0b"
                                />
                                <PipelineStep
                                    step={4}
                                    title="Consistency Analysis"
                                    description="Compares response with historical data to detect contradictions and ensure message consistency."
                                    color="#8b5cf6"
                                />
                                <PipelineStep
                                    step={5}
                                    title="Decision & Correction"
                                    description="Generates confidence score, flags violations, and optionally auto-corrects responses using AI."
                                    color="#dc2626"
                                />
                            </div>

                            <div className="mt-6 p-4" style={{ background: 'var(--background-tertiary)', border: '1px solid var(--border)' }}>
                                <p className="text-sm font-semibold mb-2" style={{ color: 'var(--foreground)' }}>Status Outcomes</p>
                                <div className="flex flex-wrap gap-3">
                                    <StatusExample status="approved" description="Passed all checks" />
                                    <StatusExample status="flagged" description="Minor issues found" />
                                    <StatusExample status="blocked" description="Critical violations" />
                                </div>
                            </div>
                        </section>

                        {/* API Reference */}
                        <section id="api" className="premium-card p-6 lg:p-8">
                            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2" style={{ color: 'var(--foreground)' }}>
                                <Terminal size={24} style={{ color: 'var(--accent)' }} />
                                API Reference
                            </h2>
                            <p className="mb-6" style={{ color: 'var(--foreground-secondary)' }}>
                                TruthGuard provides a RESTful API for integration with any AI system.
                            </p>

                            <div className="space-y-4">
                                {apiEndpoints.map((endpoint, idx) => (
                                    <div key={idx} className="p-4" style={{ background: 'var(--background-tertiary)', border: '1px solid var(--border)' }}>
                                        <div className="flex items-center gap-3 mb-2">
                                            <span
                                                className="px-2 py-0.5 text-xs font-bold"
                                                style={{
                                                    background: endpoint.method === 'GET' ? 'var(--success)' : 'var(--accent)',
                                                    color: 'white'
                                                }}
                                            >
                                                {endpoint.method}
                                            </span>
                                            <code className="text-sm font-mono" style={{ color: 'var(--foreground)' }}>{endpoint.path}</code>
                                        </div>
                                        <p className="text-sm mb-3" style={{ color: 'var(--foreground-muted)' }}>{endpoint.description}</p>
                                        <div className="relative">
                                            <pre
                                                className="text-xs p-3 overflow-x-auto"
                                                style={{ background: 'var(--background)', border: '1px solid var(--border)', color: 'var(--foreground-secondary)' }}
                                            >
                                                {endpoint.example}
                                            </pre>
                                            <button
                                                onClick={() => copyCode(endpoint.example, `endpoint-${idx}`)}
                                                className="absolute top-2 right-2 p-1"
                                                style={{ color: 'var(--foreground-muted)' }}
                                            >
                                                {copiedCode === `endpoint-${idx}` ? <Check size={14} /> : <Copy size={14} />}
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Integration Guide */}
                        <section id="integration" className="premium-card p-6 lg:p-8">
                            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2" style={{ color: 'var(--foreground)' }}>
                                <Globe size={24} style={{ color: 'var(--accent)' }} />
                                Integration Guide
                            </h2>

                            <div className="space-y-6">
                                <div>
                                    <h3 className="font-semibold mb-3" style={{ color: 'var(--foreground)' }}>1. Basic Integration</h3>
                                    <CodeBlock
                                        code={`// Send AI response for validation
const response = await fetch('https://api.truthguard.ai/api/v1/validate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    query: userQuery,
    ai_response: aiResponse,
    organization_id: 'your-org-id',
    ai_model: 'gpt-4'
  })
});

const result = await response.json();

if (result.status === 'blocked') {
  // Use corrected response or show warning
  return result.validated_response || "Unable to provide response";
}

return result.ai_response;`}
                                        language="javascript"
                                        onCopy={copyCode}
                                        copied={copiedCode === 'integration-1'}
                                        id="integration-1"
                                    />
                                </div>

                                <div>
                                    <h3 className="font-semibold mb-3" style={{ color: 'var(--foreground)' }}>2. Python Example</h3>
                                    <CodeBlock
                                        code={`import requests

def validate_ai_response(query: str, ai_response: str) -> dict:
    response = requests.post(
        "https://api.truthguard.ai/api/v1/validate",
        json={
            "query": query,
            "ai_response": ai_response,
            "organization_id": "your-org-id",
            "ai_model": "gpt-4"
        }
    )
    return response.json()

# Usage
result = validate_ai_response("What is Python?", ai_response)
if result["status"] == "approved":
    print("Response is valid!")
else:
    print(f"Issues found: {result['violations']}")`}
                                        language="python"
                                        onCopy={copyCode}
                                        copied={copiedCode === 'integration-2'}
                                        id="integration-2"
                                    />
                                </div>
                            </div>

                            <div className="mt-6 flex flex-wrap gap-3">
                                <Link
                                    href="/ai-test"
                                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white"
                                    style={{ background: 'var(--accent-gradient)' }}
                                >
                                    <Zap size={16} />
                                    Try the API
                                </Link>
                                <Link
                                    href="/live-demo"
                                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold"
                                    style={{ background: 'var(--background-tertiary)', border: '1px solid var(--border)', color: 'var(--foreground)' }}
                                >
                                    <Eye size={16} />
                                    View Live Demo
                                </Link>
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    )
}

function FeatureCard({ icon: Icon, title, description, color }: { icon: any; title: string; description: string; color: string }) {
    return (
        <div className="p-4" style={{ background: 'var(--background-tertiary)', border: '1px solid var(--border)' }}>
            <Icon size={24} style={{ color, marginBottom: 8 }} />
            <p className="font-semibold mb-1" style={{ color: 'var(--foreground)' }}>{title}</p>
            <p className="text-xs" style={{ color: 'var(--foreground-muted)' }}>{description}</p>
        </div>
    )
}

function TechBadge({ name, desc }: { name: string; desc: string }) {
    return (
        <div className="flex items-center gap-3 p-2" style={{ background: 'var(--background-tertiary)', border: '1px solid var(--border)' }}>
            <span className="font-semibold text-sm" style={{ color: 'var(--foreground)' }}>{name}</span>
            <span className="text-xs" style={{ color: 'var(--foreground-muted)' }}>{desc}</span>
        </div>
    )
}

function PipelineStep({ step, title, description, color }: { step: number; title: string; description: string; color: string }) {
    return (
        <div className="flex gap-4">
            <div
                className="w-8 h-8 flex items-center justify-center font-bold text-sm text-white flex-shrink-0"
                style={{ background: color }}
            >
                {step}
            </div>
            <div className="flex-1">
                <p className="font-semibold" style={{ color: 'var(--foreground)' }}>{title}</p>
                <p className="text-sm" style={{ color: 'var(--foreground-muted)' }}>{description}</p>
            </div>
        </div>
    )
}

function StatusExample({ status, description }: { status: 'approved' | 'flagged' | 'blocked'; description: string }) {
    const configs = {
        approved: { bg: 'var(--success-bg)', color: 'var(--success)', icon: CheckCircle },
        flagged: { bg: 'var(--warning-bg)', color: 'var(--warning)', icon: AlertTriangle },
        blocked: { bg: 'var(--danger-bg)', color: 'var(--danger)', icon: XCircle },
    }
    const config = configs[status]
    const Icon = config.icon

    return (
        <div className="flex items-center gap-2 px-3 py-1" style={{ background: config.bg }}>
            <Icon size={14} style={{ color: config.color }} />
            <span className="text-xs font-semibold uppercase" style={{ color: config.color }}>{status}</span>
            <span className="text-xs" style={{ color: 'var(--foreground-muted)' }}>- {description}</span>
        </div>
    )
}

function CodeBlock({ code, language, onCopy, copied, id }: { code: string; language: string; onCopy: (code: string, id: string) => void; copied: boolean; id: string }) {
    return (
        <div className="relative">
            <pre
                className="text-xs p-4 overflow-x-auto"
                style={{ background: 'var(--background-tertiary)', border: '1px solid var(--border)', color: 'var(--foreground-secondary)' }}
            >
                <code>{code}</code>
            </pre>
            <button
                onClick={() => onCopy(code, id)}
                className="absolute top-2 right-2 p-1.5 transition-colors"
                style={{ background: 'var(--background)', border: '1px solid var(--border)', color: 'var(--foreground-muted)' }}
            >
                {copied ? <Check size={14} /> : <Copy size={14} />}
            </button>
        </div>
    )
}
