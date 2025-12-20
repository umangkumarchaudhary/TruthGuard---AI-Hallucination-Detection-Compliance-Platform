'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { ThemeToggle, useTheme } from '@/lib/theme-provider'
import {
  Shield,
  AlertTriangle,
  FileCheck,
  Database,
  Zap,
  Eye,
  CheckCircle,
  ArrowRight,
  Github,
  Linkedin,
  Globe,
  Play,
  ChevronRight,
  Menu,
  X
} from 'lucide-react'

interface FeatureCard {
  id: string
  title: string
  subtitle: string
  description: string
  icon: React.ReactNode
  color: string
  bgGradient: string
  link: string
  stats: { label: string; value: string }[]
  techStack: string[]
}

const features: FeatureCard[] = [
  {
    id: 'detection',
    title: 'Hallucination Detection',
    subtitle: 'Real-time AI Monitoring',
    description: 'NLP-based claim extraction with fact verification against Wikipedia, DuckDuckGo, and NewsAPI. Detects factual errors, fake citations, and inconsistencies.',
    icon: <Eye size={28} />,
    color: 'from-red-500 to-rose-600',
    bgGradient: 'from-red-500/10 via-rose-500/5 to-transparent',
    link: '/dashboard',
    stats: [
      { label: 'Accuracy', value: '95%' },
      { label: 'Latency', value: '<2s' },
    ],
    techStack: ['spaCy', 'Transformers', 'NLP'],
  },
  {
    id: 'compliance',
    title: 'Compliance Engine',
    subtitle: 'Regulatory Rules',
    description: 'Pre-built templates for EU AI Act, SEC, CFPB, GDPR, and DOT. Custom policy matching with flexible JSON-based rule definitions.',
    icon: <Shield size={28} />,
    color: 'from-blue-500 to-cyan-600',
    bgGradient: 'from-blue-500/10 via-cyan-500/5 to-transparent',
    link: '/compliance-rules',
    stats: [
      { label: 'Rules', value: '50+' },
      { label: 'Templates', value: '5' },
    ],
    techStack: ['EU AI Act', 'SEC', 'GDPR'],
  },
  {
    id: 'audit',
    title: 'Audit Trail',
    subtitle: 'Complete Logging',
    description: 'Every AI interaction logged with full context, human-readable explanations, and queryable logs for regulatory review and compliance reports.',
    icon: <Database size={28} />,
    color: 'from-emerald-500 to-teal-600',
    bgGradient: 'from-emerald-500/10 via-teal-500/5 to-transparent',
    link: '/interactions',
    stats: [
      { label: 'Retention', value: '∞' },
      { label: 'Export', value: 'CSV/JSON' },
    ],
    techStack: ['PostgreSQL', 'Supabase', 'RLS'],
  },
  {
    id: 'correction',
    title: 'Auto-Correction',
    subtitle: 'Smart Responses',
    description: 'Automatically suggests compliant alternatives when violations are detected. Blocks harmful responses while providing safe fallbacks.',
    icon: <CheckCircle size={28} />,
    color: 'from-violet-500 to-purple-600',
    bgGradient: 'from-violet-500/10 via-purple-500/5 to-transparent',
    link: '/ai-test',
    stats: [
      { label: 'Correction Rate', value: '99%' },
      { label: 'Response Time', value: '<1s' },
    ],
    techStack: ['Gemini Pro', 'FastAPI', 'Python'],
  },
]

// Mobile Carousel Component
function MobileCarousel({ features }: { features: FeatureCard[] }) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)

  useEffect(() => {
    if (isPaused) return
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % features.length)
    }, 3000)
    return () => clearInterval(interval)
  }, [features.length, isPaused])

  const goToSlide = useCallback((index: number) => {
    setCurrentIndex(index)
    setIsPaused(true)
    setTimeout(() => setIsPaused(false), 5000)
  }, [])

  return (
    <div
      className="relative"
      onTouchStart={() => setIsPaused(true)}
      onTouchEnd={() => setTimeout(() => setIsPaused(false), 5000)}
    >
      <div className="relative overflow-hidden">
        <div
          className="transition-all duration-500 ease-out flex"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {features.map((f) => (
            <div key={f.id} className="w-full flex-shrink-0 px-2">
              <Link href={f.link} className="block">
                <div
                  className="relative p-5 min-h-[220px] premium-card"
                >
                  <div className={`absolute inset-0 opacity-50 bg-gradient-to-br ${f.bgGradient}`} />
                  <div className="relative">
                    <div className={`inline-flex p-3 bg-gradient-to-br ${f.color} text-white mb-4 shadow-lg`}>
                      {f.icon}
                    </div>
                    <h3 className="font-bold text-lg mb-1" style={{ color: 'var(--foreground)' }}>
                      {f.title}
                    </h3>
                    <p className="text-xs font-medium uppercase tracking-wider mb-3" style={{ color: 'var(--foreground-muted)' }}>
                      {f.subtitle}
                    </p>
                    <div className="flex gap-6">
                      {f.stats.map((stat) => (
                        <div key={stat.label}>
                          <p className="text-xl font-bold" style={{ color: 'var(--foreground)' }}>{stat.value}</p>
                          <p className="text-[10px] uppercase tracking-wider" style={{ color: 'var(--foreground-muted)' }}>{stat.label}</p>
                        </div>
                      ))}
                    </div>
                    <p className="text-[10px] mt-3 flex items-center gap-1" style={{ color: 'var(--foreground-muted)' }}>
                      Tap to explore <ChevronRight size={12} />
                    </p>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>
      {/* Dots */}
      <div className="flex justify-center items-center gap-2 mt-4">
        {features.map((_, idx) => (
          <button
            key={idx}
            onClick={() => goToSlide(idx)}
            className={`transition-all duration-300 rounded-full ${idx === currentIndex ? 'w-6 h-2' : 'w-2 h-2'
              }`}
            style={{ background: idx === currentIndex ? 'var(--accent)' : 'var(--foreground-muted)' }}
          />
        ))}
      </div>
    </div>
  )
}

// Desktop Card
function DesktopCard({ feature, isExpanded, onClick }: { feature: FeatureCard; isExpanded: boolean; onClick: () => void }) {
  return (
    <div
      className={`group relative p-5 transition-all duration-500 cursor-pointer premium-card ${isExpanded ? 'sm:col-span-2' : ''}`}
      onClick={onClick}
    >
      <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br ${feature.bgGradient}`} />
      <div className="relative">
        <div className={`inline-flex p-3 bg-gradient-to-br ${feature.color} text-white mb-4 shadow-lg`}>
          {feature.icon}
        </div>
        <h3 className="font-bold text-lg mb-1" style={{ color: 'var(--foreground)' }}>{feature.title}</h3>
        <p className="text-xs font-medium uppercase tracking-wider mb-3" style={{ color: 'var(--foreground-muted)' }}>{feature.subtitle}</p>
        <div className="flex gap-4 mb-3">
          {feature.stats.map((stat) => (
            <div key={stat.label}>
              <p className="text-lg font-bold" style={{ color: 'var(--foreground)' }}>{stat.value}</p>
              <p className="text-[10px] uppercase tracking-wider" style={{ color: 'var(--foreground-muted)' }}>{stat.label}</p>
            </div>
          ))}
        </div>
        {isExpanded && (
          <div className="animate-fade-in mt-4 pt-4" style={{ borderTop: '1px solid var(--border)' }}>
            <p className="text-sm mb-4" style={{ color: 'var(--foreground-secondary)' }}>{feature.description}</p>
            <div className="flex flex-wrap gap-2 mb-4">
              {feature.techStack.map((tech) => (
                <span key={tech} className="px-2 py-1 text-xs font-medium" style={{ background: 'var(--background-tertiary)', color: 'var(--foreground-secondary)' }}>
                  {tech}
                </span>
              ))}
            </div>
            <Link
              href={feature.link}
              className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r ${feature.color} transition-transform hover:scale-105`}
              onClick={(e) => e.stopPropagation()}
            >
              Explore <ArrowRight size={16} />
            </Link>
          </div>
        )}
        {!isExpanded && (
          <p className="text-[10px] mt-2 opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: 'var(--foreground-muted)' }}>
            Click to expand →
          </p>
        )}
      </div>
    </div>
  )
}

export default function Home() {
  const [expandedCard, setExpandedCard] = useState<string | null>(null)
  const [isMobile, setIsMobile] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { theme } = useTheme()

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  return (
    <div className="min-h-screen" style={{ background: 'var(--background)' }}>
      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 mobile-overlay"
          style={{ background: 'rgba(0,0,0,0.5)' }}
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Menu Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-72 z-50 mobile-sidebar ${mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        style={{ background: 'var(--background-secondary)', borderLeft: '1px solid var(--border)' }}
      >
        <div className="flex items-center justify-between p-4" style={{ borderBottom: '1px solid var(--border)' }}>
          <span className="font-bold text-lg" style={{ color: 'var(--foreground)' }}>Menu</span>
          <button onClick={() => setMobileMenuOpen(false)} style={{ color: 'var(--foreground)' }}>
            <X size={24} />
          </button>
        </div>
        <nav className="p-4 space-y-2">
          <Link
            href="/dashboard"
            className="flex items-center gap-3 px-4 py-3 text-sm font-medium"
            style={{ color: 'var(--foreground)' }}
            onClick={() => setMobileMenuOpen(false)}
          >
            Dashboard
          </Link>
          <Link
            href="/ai-test"
            className="flex items-center gap-3 px-4 py-3 text-sm font-medium"
            style={{ color: 'var(--foreground)' }}
            onClick={() => setMobileMenuOpen(false)}
          >
            Try Demo
          </Link>
          <Link
            href="/analytics"
            className="flex items-center gap-3 px-4 py-3 text-sm font-medium"
            style={{ color: 'var(--foreground)' }}
            onClick={() => setMobileMenuOpen(false)}
          >
            Analytics
          </Link>
          <Link
            href="/violations"
            className="flex items-center gap-3 px-4 py-3 text-sm font-medium"
            style={{ color: 'var(--foreground)' }}
            onClick={() => setMobileMenuOpen(false)}
          >
            Violations
          </Link>
          <Link
            href="/policies"
            className="flex items-center gap-3 px-4 py-3 text-sm font-medium"
            style={{ color: 'var(--foreground)' }}
            onClick={() => setMobileMenuOpen(false)}
          >
            Policies
          </Link>
          <div className="pt-4" style={{ borderTop: '1px solid var(--border)' }}>
            <Link
              href="/dashboard"
              className="flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold text-white w-full"
              style={{ background: 'var(--accent-gradient)' }}
              onClick={() => setMobileMenuOpen(false)}
            >
              Get Started <ArrowRight size={16} />
            </Link>
          </div>
        </nav>
        <div className="absolute bottom-0 left-0 right-0 p-4" style={{ borderTop: '1px solid var(--border)' }}>
          <div className="flex items-center justify-between">
            <span className="text-xs" style={{ color: 'var(--foreground-muted)' }}>Theme</span>
            <ThemeToggle />
          </div>
        </div>
      </div>

      {/* Header */}
      <header
        className="fixed top-0 left-0 right-0 z-30 glass"
        style={{ borderBottom: '1px solid var(--border)' }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-16 flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 group">
              <div
                className="w-8 h-8 flex items-center justify-center transition-all group-hover:scale-105"
                style={{ background: 'var(--accent-gradient)', boxShadow: '0 0 15px var(--glow)' }}
              >
                <Shield size={18} className="text-white" />
              </div>
              <span className="text-lg font-bold tracking-tight" style={{ color: 'var(--foreground)' }}>
                TruthGuard
              </span>
            </Link>

            {/* Nav Links - Desktop */}
            <nav className="hidden md:flex items-center gap-6">
              <Link href="/dashboard" className="text-sm font-medium transition-colors" style={{ color: 'var(--foreground-secondary)' }}>
                Dashboard
              </Link>
              <Link href="/ai-test" className="text-sm font-medium transition-colors" style={{ color: 'var(--foreground-secondary)' }}>
                Try Demo
              </Link>
              <Link href="/analytics" className="text-sm font-medium transition-colors" style={{ color: 'var(--foreground-secondary)' }}>
                Analytics
              </Link>
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <div className="hidden sm:block">
                <ThemeToggle />
              </div>
              <Link
                href="/dashboard"
                className="hidden sm:flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white transition-all hover:scale-105"
                style={{ background: 'var(--accent-gradient)', boxShadow: '0 0 15px var(--glow)' }}
              >
                Get Started <ArrowRight size={16} />
              </Link>
              {/* Mobile Hamburger */}
              <button
                className="md:hidden p-2"
                onClick={() => setMobileMenuOpen(true)}
                style={{ color: 'var(--foreground)' }}
              >
                <Menu size={24} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Background Pattern */}
        <div
          className="absolute inset-0 opacity-30 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, var(--border) 1px, transparent 0)',
            backgroundSize: '40px 40px'
          }}
        />

        <div className="relative max-w-7xl mx-auto text-center">
          {/* Badge */}
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider mb-6 animate-slide-down"
            style={{ background: 'var(--accent)', color: 'white' }}
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
            </span>
            Production-Ready Platform
          </div>

          {/* Headline */}
          <h1
            className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6 animate-slide-up"
            style={{ color: 'var(--foreground)' }}
          >
            AI Hallucination Detection
            <br />
            <span className="gradient-text">&amp; Compliance Platform</span>
          </h1>

          {/* Subheadline */}
          <p
            className="max-w-2xl mx-auto text-lg sm:text-xl mb-8 animate-slide-up"
            style={{ color: 'var(--foreground-secondary)', animationDelay: '0.1s' }}
          >
            Monitor AI outputs in real-time. Detect hallucinations. Ensure compliance with EU AI Act, SEC, and GDPR. Provide complete audit trails for regulators.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <Link
              href="/live-demo"
              className="flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white transition-all hover:scale-105"
              style={{ background: 'var(--accent-gradient)', boxShadow: '0 0 20px var(--glow)' }}
            >
              <Play size={18} />
              Live Demo
            </Link>
            <Link
              href="/dashboard"
              className="flex items-center gap-2 px-6 py-3 text-sm font-semibold transition-all"
              style={{ background: 'var(--background-tertiary)', color: 'var(--foreground)', border: '1px solid var(--border)' }}
            >
              View Dashboard
              <ArrowRight size={18} />
            </Link>
          </div>

          {/* Stats Preview */}
          <div
            className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto animate-slide-up"
            style={{ animationDelay: '0.3s' }}
          >
            {[
              { value: '95%', label: 'Detection Accuracy' },
              { value: '<2s', label: 'Response Time' },
              { value: '50+', label: 'Compliance Rules' },
              { value: '24/7', label: 'Monitoring' },
            ].map((stat) => (
              <div
                key={stat.label}
                className="premium-card p-4"
              >
                <p className="text-2xl sm:text-3xl font-bold mb-1" style={{ color: 'var(--foreground)' }}>{stat.value}</p>
                <p className="text-xs" style={{ color: 'var(--foreground-muted)' }}>{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div
            className="relative overflow-hidden mb-8 premium-card p-6 lg:p-8"
          >
            {/* Header */}
            <div className="text-center mb-8">
              <h2 className="text-2xl lg:text-3xl font-bold tracking-tight mb-2" style={{ color: 'var(--foreground)' }}>
                Enterprise-Grade AI Safety
              </h2>
              <p className="max-w-2xl mx-auto text-sm lg:text-base" style={{ color: 'var(--foreground-muted)' }}>
                Complete platform for monitoring, validating, and securing AI outputs in production environments.
              </p>
            </div>

            {/* Cards */}
            {isMobile ? (
              <MobileCarousel features={features} />
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {features.map((feature) => (
                  <DesktopCard
                    key={feature.id}
                    feature={feature}
                    isExpanded={expandedCard === feature.id}
                    onClick={() => setExpandedCard(expandedCard === feature.id ? null : feature.id)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section
        className="py-20 px-4 sm:px-6 lg:px-8"
        style={{ background: 'var(--background-secondary)' }}
      >
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4" style={{ color: 'var(--foreground)' }}>
            Ready to Secure Your AI?
          </h2>
          <p className="text-lg mb-8" style={{ color: 'var(--foreground-secondary)' }}>
            Start monitoring your AI systems today. No credit card required.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/ai-test"
              className="flex items-center gap-2 px-8 py-4 text-lg font-semibold text-white transition-all hover:scale-105"
              style={{ background: 'var(--accent-gradient)', boxShadow: '0 0 30px var(--glow)' }}
            >
              Try It Now <Zap size={20} />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid var(--border)', background: 'var(--background)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div
                className="w-8 h-8 flex items-center justify-center"
                style={{ background: 'var(--accent-gradient)' }}
              >
                <Shield size={18} className="text-white" />
              </div>
              <span className="font-bold" style={{ color: 'var(--foreground)' }}>TruthGuard</span>
            </div>

            {/* Links */}
            <div className="flex items-center gap-4">
              <a
                href="https://github.com/umangkumarchaudhary"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 transition-colors"
                style={{ color: 'var(--foreground-muted)' }}
              >
                <Github size={20} />
              </a>
              <a
                href="https://www.linkedin.com/in/umang-kumar-0546b71b5/"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 transition-colors"
                style={{ color: 'var(--foreground-muted)' }}
              >
                <Linkedin size={20} />
              </a>
              <a
                href="https://umangkumar.netlify.app"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 transition-colors"
                style={{ color: 'var(--foreground-muted)' }}
              >
                <Globe size={20} />
              </a>
            </div>

            {/* Copyright */}
            <p className="text-sm" style={{ color: 'var(--foreground-muted)' }}>
              Built by <span style={{ color: 'var(--foreground)' }} className="font-semibold">Umang Kumar Chaudhary</span>
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
