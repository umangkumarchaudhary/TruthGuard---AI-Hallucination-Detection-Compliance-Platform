'use client'

import React from 'react'
import DashboardLayout from '@/components/common/DashboardLayout'
import { Shield, Zap, Database, Code, GitBranch, Cloud, Brain, CheckCircle, Linkedin, Globe, Github, ExternalLink } from 'lucide-react'

export default function AboutPage() {
  return (
    <DashboardLayout>
      <div className="p-4 lg:p-8">
        {/* Big Header Title */}
        <div className="mb-12 text-center border-b border-[#e5e5e5] pb-8">
          <h1 className="text-5xl lg:text-6xl font-bold text-black mb-4">
            AI Hallucination Detector
          </h1>
          <p className="text-xl text-black/60 max-w-3xl mx-auto">
            Enterprise-grade platform for real-time AI response validation, compliance monitoring, and regulatory audit trails
          </p>
        </div>

        {/* About the Project */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-black mb-6">About TruthGuard</h2>
          
          <div className="bg-white border border-[#e5e5e5] p-8 mb-8">
            <p className="text-lg text-black/80 leading-relaxed mb-6">
              <strong className="text-black">TruthGuard</strong> is a comprehensive AI safety and compliance platform designed to solve the critical problem of AI hallucinations and regulatory compliance in enterprise AI deployments.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="border border-[#e5e5e5] p-6">
                <h3 className="text-xl font-semibold text-black mb-3 flex items-center gap-2">
                  <Shield size={24} className="text-[#dc2626]" />
                  The Problem
                </h3>
                <p className="text-black/70 leading-relaxed">
                  Companies deploying AI systems face massive challenges: AI hallucinations creating false information, compliance violations risking legal exposure, and lack of audit trails for regulators. TruthGuard solves all of these.
                </p>
              </div>

              <div className="border border-[#e5e5e5] p-6">
                <h3 className="text-xl font-semibold text-black mb-3 flex items-center gap-2">
                  <CheckCircle size={24} className="text-[#10b981]" />
                  The Solution
                </h3>
                <p className="text-black/70 leading-relaxed">
                  Real-time monitoring of AI outputs, automated fact verification against external sources, compliance rule checking, policy alignment validation, and complete audit trails for regulatory compliance.
                </p>
              </div>
            </div>

            <div className="border border-[#e5e5e5] p-6 bg-[#f5f5f5]">
              <h3 className="text-xl font-semibold text-black mb-4">Key Features</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="flex items-start gap-3">
                  <Zap size={20} className="text-[#f59e0b] mt-1" />
                  <div>
                    <p className="font-semibold text-black">Real-Time Detection</p>
                    <p className="text-sm text-black/60">Instant hallucination detection and fact verification</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Shield size={20} className="text-[#dc2626] mt-1" />
                  <div>
                    <p className="font-semibold text-black">Compliance Checking</p>
                    <p className="text-sm text-black/60">Automated regulatory and policy compliance validation</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Database size={20} className="text-[#3b82f6] mt-1" />
                  <div>
                    <p className="font-semibold text-black">Audit Trails</p>
                    <p className="text-sm text-black/60">Complete logging and explainability for regulators</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Brain size={20} className="text-[#8b5cf6] mt-1" />
                  <div>
                    <p className="font-semibold text-black">AI-Powered Correction</p>
                    <p className="text-sm text-black/60">Automated response correction and validation</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Code size={20} className="text-[#10b981] mt-1" />
                  <div>
                    <p className="font-semibold text-black">API Integration</p>
                    <p className="text-sm text-black/60">Easy integration with any AI system</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Cloud size={20} className="text-[#f59e0b] mt-1" />
                  <div>
                    <p className="font-semibold text-black">Real-Time Monitoring</p>
                    <p className="text-sm text-black/60">Live dashboard with metrics and alerts</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Architecture Section */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-black mb-6">System Architecture</h2>
          
          <div className="bg-white border border-[#e5e5e5] p-8">
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-black mb-4">High-Level Architecture</h3>
              <div className="bg-[#f5f5f5] border border-[#e5e5e5] p-6 font-mono text-sm text-black/80 overflow-x-auto">
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
│         │                        │                        │
│         │                        ▼                        │
│         │              ┌─────────────────┐              │
│         │              │  Detection      │              │
│         │              │  Engine         │              │
│         │              └─────────────────┘              │
│         │                        │                        │
└─────────┼────────────────────────┼───────────────────────┘
          │                        │
          ▼                        ▼
┌─────────────────┐    ┌──────────────────────────┐
│  Supabase       │    │  External APIs          │
│  PostgreSQL     │    │  - Wikipedia            │
│  (Audit Logs)   │    │  - DuckDuckGo           │
│                 │    │  - NewsAPI              │
│  - Interactions │    │  - Google Gemini        │
│  - Violations   │    │                         │
│  - Policies     │    │  Fact Verification      │
│  - Compliance   │    │  & Knowledge Base       │
└─────────────────┘    └──────────────────────────┘`}
                </pre>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-semibold text-black mb-4">Tech Stack</h3>
                <div className="space-y-4">
                  <div className="border-l-4 border-[#3b82f6] pl-4">
                    <p className="font-semibold text-black">Frontend</p>
                    <p className="text-sm text-black/70">Next.js 16, React 19, TypeScript, Tailwind CSS</p>
                  </div>
                  <div className="border-l-4 border-[#10b981] pl-4">
                    <p className="font-semibold text-black">Backend</p>
                    <p className="text-sm text-black/70">FastAPI (Python), Pydantic, AsyncIO</p>
                  </div>
                  <div className="border-l-4 border-[#f59e0b] pl-4">
                    <p className="font-semibold text-black">Database</p>
                    <p className="text-sm text-black/70">Supabase (PostgreSQL), Real-time subscriptions</p>
                  </div>
                  <div className="border-l-4 border-[#8b5cf6] pl-4">
                    <p className="font-semibold text-black">AI/ML</p>
                    <p className="text-sm text-black/70">spaCy, Transformers, Google Gemini Pro, Sentence Embeddings</p>
                  </div>
                  <div className="border-l-4 border-[#dc2626] pl-4">
                    <p className="font-semibold text-black">APIs</p>
                    <p className="text-sm text-black/70">Wikipedia API, DuckDuckGo, NewsAPI, REST APIs</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-black mb-4">Detection Pipeline</h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-3 border border-[#e5e5e5]">
                    <div className="w-8 h-8 bg-[#3b82f6] text-white flex items-center justify-center font-bold text-sm">1</div>
                    <div>
                      <p className="font-semibold text-black">Claim Extraction</p>
                      <p className="text-sm text-black/70">NLP-based extraction of factual claims from AI responses</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 border border-[#e5e5e5]">
                    <div className="w-8 h-8 bg-[#10b981] text-white flex items-center justify-center font-bold text-sm">2</div>
                    <div>
                      <p className="font-semibold text-black">Fact Verification</p>
                      <p className="text-sm text-black/70">Real-time verification against Wikipedia, DuckDuckGo, NewsAPI</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 border border-[#e5e5e5]">
                    <div className="w-8 h-8 bg-[#f59e0b] text-white flex items-center justify-center font-bold text-sm">3</div>
                    <div>
                      <p className="font-semibold text-black">Compliance Check</p>
                      <p className="text-sm text-black/70">Validate against regulatory rules and company policies</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 border border-[#e5e5e5]">
                    <div className="w-8 h-8 bg-[#8b5cf6] text-white flex items-center justify-center font-bold text-sm">4</div>
                    <div>
                      <p className="font-semibold text-black">Consistency Check</p>
                      <p className="text-sm text-black/70">Compare with historical responses for consistency</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 border border-[#e5e5e5]">
                    <div className="w-8 h-8 bg-[#dc2626] text-white flex items-center justify-center font-bold text-sm">5</div>
                    <div>
                      <p className="font-semibold text-black">Decision & Correction</p>
                      <p className="text-sm text-black/70">Generate confidence score, flag violations, auto-correct responses</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Developer Section */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-black mb-6">Contact Developer</h2>
          
          <div className="bg-white border border-[#e5e5e5] p-8">
            <div className="text-center mb-8">
              <div className="w-24 h-24 bg-[#f5f5f5] border-2 border-black rounded-full mx-auto mb-4 flex items-center justify-center">
                <Code size={40} className="text-black" />
              </div>
              <h3 className="text-2xl font-bold text-black mb-2">Umang Kumar</h3>
              <p className="text-black/60 mb-6">Full Stack Developer & AI Engineer</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <a
                href="https://www.linkedin.com/in/umang-kumar-0546b71b5/"
                target="_blank"
                rel="noopener noreferrer"
                className="border border-[#e5e5e5] p-6 hover:border-black transition-colors group"
              >
                <div className="flex flex-col items-center text-center">
                  <div className="w-12 h-12 bg-[#0077b5] text-white flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <Linkedin size={24} />
                  </div>
                  <p className="font-semibold text-black mb-2">LinkedIn</p>
                  <p className="text-sm text-black/60 mb-3">Connect with me</p>
                  <ExternalLink size={16} className="text-black/40 group-hover:text-black transition-colors" />
                </div>
              </a>

              <a
                href="https://umangkumar.netlify.app"
                target="_blank"
                rel="noopener noreferrer"
                className="border border-[#e5e5e5] p-6 hover:border-black transition-colors group"
              >
                <div className="flex flex-col items-center text-center">
                  <div className="w-12 h-12 bg-black text-white flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <Globe size={24} />
                  </div>
                  <p className="font-semibold text-black mb-2">Personal Website</p>
                  <p className="text-sm text-black/60 mb-3">umangkumar.netlify.app</p>
                  <ExternalLink size={16} className="text-black/40 group-hover:text-black transition-colors" />
                </div>
              </a>

              <a
                href="https://github.com/umangkumarchaudhary"
                target="_blank"
                rel="noopener noreferrer"
                className="border border-[#e5e5e5] p-6 hover:border-black transition-colors group"
              >
                <div className="flex flex-col items-center text-center">
                  <div className="w-12 h-12 bg-black text-white flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <Github size={24} />
                  </div>
                  <p className="font-semibold text-black mb-2">GitHub</p>
                  <p className="text-sm text-black/60 mb-3">View my projects</p>
                  <ExternalLink size={16} className="text-black/40 group-hover:text-black transition-colors" />
                </div>
              </a>
            </div>

            <div className="mt-8 pt-8 border-t border-[#e5e5e5] text-center">
              <p className="text-black/60 mb-4">
                Interested in collaborating or have questions about TruthGuard?
              </p>
              <p className="text-sm text-black/50">
                Feel free to reach out through any of the platforms above
              </p>
            </div>
          </div>
        </div>

        {/* Project Stats */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-black mb-6">Project Highlights</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white border border-[#e5e5e5] p-6 text-center">
              <div className="text-4xl font-bold text-black mb-2">9+</div>
              <p className="text-black/70">Advanced Features</p>
            </div>
            <div className="bg-white border border-[#e5e5e5] p-6 text-center">
              <div className="text-4xl font-bold text-black mb-2">3</div>
              <p className="text-black/70">Real-Time APIs</p>
            </div>
            <div className="bg-white border border-[#e5e5e5] p-6 text-center">
              <div className="text-4xl font-bold text-black mb-2">100%</div>
              <p className="text-black/70">Open Source</p>
            </div>
            <div className="bg-white border border-[#e5e5e5] p-6 text-center">
              <div className="text-4xl font-bold text-black mb-2">∞</div>
              <p className="text-black/70">Scalable</p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

