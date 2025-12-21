'use client'

import React from 'react'
import DashboardLayout from '@/components/common/DashboardLayout'
import { useTheme } from '@/lib/theme-provider'
import {
  Shield,
  Zap,
  Database,
  Code,
  Brain,
  CheckCircle,
  Linkedin,
  Globe,
  Github,
  ExternalLink,
  Eye,
  FileCheck,
  TrendingUp,
  Lock,
  Cpu,
  Cloud
} from 'lucide-react'

export default function AboutPage() {
  const { theme } = useTheme()

  const features = [
    { icon: Zap, color: '#f59e0b', title: 'Real-Time Detection', desc: 'Instant hallucination detection and fact verification' },
    { icon: Shield, color: '#dc2626', title: 'Compliance Checking', desc: 'Automated regulatory and policy compliance validation' },
    { icon: Database, color: '#3b82f6', title: 'Audit Trails', desc: 'Complete logging and explainability for regulators' },
    { icon: Brain, color: '#8b5cf6', title: 'AI-Powered Correction', desc: 'Automated response correction and validation' },
    { icon: Code, color: '#10b981', title: 'API Integration', desc: 'Easy integration with any AI system' },
    { icon: Cloud, color: '#f59e0b', title: 'Real-Time Monitoring', desc: 'Live dashboard with metrics and alerts' },
  ]

  const pipeline = [
    { step: 1, color: '#3b82f6', title: 'Claim Extraction', desc: 'NLP-based extraction of factual claims from AI responses' },
    { step: 2, color: '#10b981', title: 'Fact Verification', desc: 'Real-time verification against Wikipedia, DuckDuckGo, NewsAPI' },
    { step: 3, color: '#f59e0b', title: 'Compliance Check', desc: 'Validate against regulatory rules and company policies' },
    { step: 4, color: '#8b5cf6', title: 'Consistency Check', desc: 'Compare with historical responses for consistency' },
    { step: 5, color: '#dc2626', title: 'Decision & Correction', desc: 'Generate confidence score, flag violations, auto-correct responses' },
  ]

  const techStack = [
    { color: '#3b82f6', title: 'Frontend', desc: 'Next.js 16, React 19, TypeScript, Tailwind CSS' },
    { color: '#10b981', title: 'Backend', desc: 'FastAPI (Python), Pydantic, AsyncIO' },
    { color: '#f59e0b', title: 'Database', desc: 'Supabase (PostgreSQL), Real-time subscriptions' },
    { color: '#8b5cf6', title: 'AI/ML', desc: 'spaCy, Transformers, Google Gemini Pro' },
    { color: '#dc2626', title: 'APIs', desc: 'Wikipedia API, DuckDuckGo, NewsAPI' },
  ]

  const stats = [
    { value: '9+', label: 'Advanced Features' },
    { value: '3', label: 'Real-Time APIs' },
    { value: '100%', label: 'Open Source' },
    { value: '∞', label: 'Scalable' },
  ]

  return (
    <DashboardLayout>
      <div className="p-4 lg:p-8">
        {/* Hero Header */}
        <div
          className="mb-12 text-center pb-8 animate-slide-down"
          style={{ borderBottom: '1px solid var(--border)' }}
        >
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider mb-6"
            style={{ background: 'var(--accent)', color: 'white' }}
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
            </span>
            Enterprise-Grade Platform
          </div>
          <h1
            className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-4"
            style={{ color: 'var(--foreground)' }}
          >
            AI Hallucination Detector
          </h1>
          <p
            className="text-lg lg:text-xl max-w-3xl mx-auto"
            style={{ color: 'var(--foreground-muted)' }}
          >
            Enterprise-grade platform for real-time AI response validation, compliance monitoring, and regulatory audit trails
          </p>
        </div>

        {/* Problem & Solution */}
        <div className="mb-12 stagger-children">
          <h2
            className="text-2xl lg:text-3xl font-bold mb-6"
            style={{ color: 'var(--foreground)' }}
          >
            About TruthGuard
          </h2>

          <div className="premium-card p-6 lg:p-8 mb-8">
            <p
              className="text-lg leading-relaxed mb-8"
              style={{ color: 'var(--foreground-secondary)' }}
            >
              <strong style={{ color: 'var(--foreground)' }}>TruthGuard</strong> is a comprehensive AI safety and compliance platform designed to solve the critical problem of AI hallucinations and regulatory compliance in enterprise AI deployments.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div
                className="p-6"
                style={{ border: '2px solid var(--danger)', background: 'var(--danger-bg)' }}
              >
                <h3
                  className="text-xl font-semibold mb-3 flex items-center gap-2"
                  style={{ color: 'var(--foreground)' }}
                >
                  <Shield size={24} style={{ color: 'var(--danger)' }} />
                  The Problem
                </h3>
                <p style={{ color: 'var(--foreground-secondary)' }}>
                  Companies deploying AI systems face massive challenges: AI hallucinations creating false information, compliance violations risking legal exposure, and lack of audit trails for regulators.
                </p>
              </div>

              <div
                className="p-6"
                style={{ border: '2px solid var(--success)', background: 'var(--success-bg)' }}
              >
                <h3
                  className="text-xl font-semibold mb-3 flex items-center gap-2"
                  style={{ color: 'var(--foreground)' }}
                >
                  <CheckCircle size={24} style={{ color: 'var(--success)' }} />
                  The Solution
                </h3>
                <p style={{ color: 'var(--foreground-secondary)' }}>
                  Real-time monitoring of AI outputs, automated fact verification against external sources, compliance rule checking, policy alignment validation, and complete audit trails.
                </p>
              </div>
            </div>

            {/* Key Features Grid */}
            <div className="p-6" style={{ background: 'var(--background-tertiary)', border: '1px solid var(--border)' }}>
              <h3 className="text-xl font-semibold mb-4" style={{ color: 'var(--foreground)' }}>Key Features</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {features.map((feature) => {
                  const Icon = feature.icon
                  return (
                    <div key={feature.title} className="flex items-start gap-3">
                      <Icon size={20} style={{ color: feature.color, marginTop: 2 }} />
                      <div>
                        <p className="font-semibold" style={{ color: 'var(--foreground)' }}>{feature.title}</p>
                        <p className="text-sm" style={{ color: 'var(--foreground-muted)' }}>{feature.desc}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Architecture Section */}
        <div className="mb-12">
          <h2 className="text-2xl lg:text-3xl font-bold mb-6" style={{ color: 'var(--foreground)' }}>
            System Architecture
          </h2>

          <div className="premium-card p-6 lg:p-8">
            {/* Architecture Diagram */}
            <div className="mb-8">
              <h3 className="text-xl font-semibold mb-4" style={{ color: 'var(--foreground)' }}>
                High-Level Architecture
              </h3>
              <div
                className="p-6 font-mono text-sm overflow-x-auto"
                style={{ background: 'var(--background-tertiary)', border: '1px solid var(--border)', color: 'var(--foreground-secondary)' }}
              >
                <pre className="whitespace-pre-wrap">
                  {`┌─────────────────────────────────────────────────────────┐
│              External AI System (Customer)                │
│              (Chatbot/LLM/API)                            │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│              TruthGuard Platform                         │
│                                                           │
│  ┌──────────────┐         ┌──────────────┐              │
│  │  Next.js     │         │  FastAPI     │              │
│  │  Frontend    │◄───────►│  Backend    │              │
│  │  Dashboard   │         │  (Python)   │              │
│  └──────────────┘         └──────┬───────┘              │
│                                  │                        │
│                                  ▼                        │
│                        ┌─────────────────┐              │
│                        │  Detection      │              │
│                        │  Engine         │              │
│                        └─────────────────┘              │
└──────────────────────────────┼───────────────────────────┘
                               │
            ┌──────────────────┼──────────────────┐
            ▼                                     ▼
┌─────────────────┐              ┌──────────────────────────┐
│  Supabase       │              │  External APIs          │
│  PostgreSQL     │              │  - Wikipedia            │
│  (Audit Logs)   │              │  - DuckDuckGo           │
│                 │              │  - NewsAPI              │
│  - Interactions │              │  - Google Gemini        │
│  - Violations   │              │                         │
│  - Policies     │              │  Fact Verification      │
│  - Compliance   │              │  & Knowledge Base       │
└─────────────────┘              └──────────────────────────┘`}
                </pre>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Tech Stack */}
              <div>
                <h3 className="text-xl font-semibold mb-4" style={{ color: 'var(--foreground)' }}>Tech Stack</h3>
                <div className="space-y-4">
                  {techStack.map((tech) => (
                    <div key={tech.title} className="pl-4" style={{ borderLeft: `4px solid ${tech.color}` }}>
                      <p className="font-semibold" style={{ color: 'var(--foreground)' }}>{tech.title}</p>
                      <p className="text-sm" style={{ color: 'var(--foreground-muted)' }}>{tech.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Detection Pipeline */}
              <div>
                <h3 className="text-xl font-semibold mb-4" style={{ color: 'var(--foreground)' }}>Detection Pipeline</h3>
                <div className="space-y-3">
                  {pipeline.map((step) => (
                    <div
                      key={step.step}
                      className="flex items-start gap-3 p-3"
                      style={{ border: '1px solid var(--border)' }}
                    >
                      <div
                        className="w-8 h-8 flex items-center justify-center font-bold text-sm text-white flex-shrink-0"
                        style={{ background: step.color }}
                      >
                        {step.step}
                      </div>
                      <div>
                        <p className="font-semibold" style={{ color: 'var(--foreground)' }}>{step.title}</p>
                        <p className="text-sm" style={{ color: 'var(--foreground-muted)' }}>{step.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Developer */}
        <div className="mb-12">
          <h2 className="text-2xl lg:text-3xl font-bold mb-6" style={{ color: 'var(--foreground)' }}>
            Contact Developer
          </h2>

          <div className="premium-card p-6 lg:p-8">
            <div className="text-center mb-8">
              <div
                className="w-24 h-24 mx-auto mb-4 flex items-center justify-center"
                style={{ background: 'var(--accent-gradient)', boxShadow: '0 0 30px var(--glow)' }}
              >
                <Code size={40} className="text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-2" style={{ color: 'var(--foreground)' }}>Umang Kumar</h3>
              <p style={{ color: 'var(--foreground-muted)' }}>Full Stack Developer & AI Engineer</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <a
                href="https://www.linkedin.com/in/umang-kumar-0546b71b5/"
                target="_blank"
                rel="noopener noreferrer"
                className="premium-card p-6 text-center group"
              >
                <div
                  className="w-12 h-12 mx-auto mb-3 flex items-center justify-center group-hover:scale-110 transition-transform"
                  style={{ background: '#0077b5' }}
                >
                  <Linkedin size={24} className="text-white" />
                </div>
                <p className="font-semibold mb-2" style={{ color: 'var(--foreground)' }}>LinkedIn</p>
                <p className="text-sm mb-3" style={{ color: 'var(--foreground-muted)' }}>Connect with me</p>
                <ExternalLink size={16} style={{ color: 'var(--foreground-muted)' }} className="mx-auto" />
              </a>

              <a
                href="https://umangkumar.netlify.app"
                target="_blank"
                rel="noopener noreferrer"
                className="premium-card p-6 text-center group"
              >
                <div
                  className="w-12 h-12 mx-auto mb-3 flex items-center justify-center group-hover:scale-110 transition-transform"
                  style={{ background: 'var(--accent)' }}
                >
                  <Globe size={24} className="text-white" />
                </div>
                <p className="font-semibold mb-2" style={{ color: 'var(--foreground)' }}>Portfolio</p>
                <p className="text-sm mb-3" style={{ color: 'var(--foreground-muted)' }}>umangkumar.netlify.app</p>
                <ExternalLink size={16} style={{ color: 'var(--foreground-muted)' }} className="mx-auto" />
              </a>

              <a
                href="https://github.com/umangkumarchaudhary"
                target="_blank"
                rel="noopener noreferrer"
                className="premium-card p-6 text-center group"
              >
                <div
                  className="w-12 h-12 mx-auto mb-3 flex items-center justify-center group-hover:scale-110 transition-transform"
                  style={{ background: theme === 'dark' ? '#fff' : '#000' }}
                >
                  <Github size={24} style={{ color: theme === 'dark' ? '#000' : '#fff' }} />
                </div>
                <p className="font-semibold mb-2" style={{ color: 'var(--foreground)' }}>GitHub</p>
                <p className="text-sm mb-3" style={{ color: 'var(--foreground-muted)' }}>View my projects</p>
                <ExternalLink size={16} style={{ color: 'var(--foreground-muted)' }} className="mx-auto" />
              </a>
            </div>

            <div className="mt-8 pt-8 text-center" style={{ borderTop: '1px solid var(--border)' }}>
              <p style={{ color: 'var(--foreground-muted)' }}>
                Interested in collaborating or have questions about TruthGuard?
              </p>
              <p className="text-sm mt-2" style={{ color: 'var(--foreground-muted)' }}>
                Feel free to reach out through any of the platforms above
              </p>
            </div>
          </div>
        </div>

        {/* Project Stats */}
        <div className="mb-12">
          <h2 className="text-2xl lg:text-3xl font-bold mb-6" style={{ color: 'var(--foreground)' }}>
            Project Highlights
          </h2>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            {stats.map((stat) => (
              <div key={stat.label} className="premium-card p-6 text-center">
                <div
                  className="text-3xl lg:text-4xl font-bold mb-2 gradient-text"
                >
                  {stat.value}
                </div>
                <p style={{ color: 'var(--foreground-muted)' }}>{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
