'use client'

import { ReactNode, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ThemeToggle, useTheme } from '@/lib/theme-provider'
import {
  LayoutDashboard,
  MessageSquare,
  AlertTriangle,
  FileText,
  Shield,
  BarChart3,
  Settings,
  Menu,
  X,
  Sparkles,
  Radio,
  Badge,
  Info,
  Linkedin,
  Globe,
  Github,
  ChevronDown,
  ChevronUp,
  Home,
  Book
} from 'lucide-react'

interface DashboardLayoutProps {
  children: ReactNode
}

const navigation = [
  { name: 'Home', href: '/', icon: Home },
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'AI Test', href: '/ai-test', icon: Sparkles },
  { name: 'Live Demo', href: '/live-demo', icon: Radio },
  { name: 'Interactions', href: '/interactions', icon: MessageSquare },
  { name: 'Violations', href: '/violations', icon: AlertTriangle },
  { name: 'Policies', href: '/policies', icon: FileText },
  { name: 'Compliance Rules', href: '/compliance-rules', icon: Shield },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  { name: 'Docs', href: '/docs', icon: Book },
  { name: 'About', href: '/about', icon: Info },
  { name: 'Badge', href: '/badge', icon: Badge },
  { name: 'Settings', href: '/settings', icon: Settings },
]

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [aboutDropdownOpen, setAboutDropdownOpen] = useState(false)
  const pathname = usePathname()
  const { theme } = useTheme()

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--background)' }}>
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 lg:hidden mobile-overlay"
          style={{ background: 'rgba(0,0,0,0.5)' }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50
        w-64 flex flex-col mobile-sidebar
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0
      `}
        style={{
          background: 'var(--background-secondary)',
          borderRight: '1px solid var(--border)'
        }}
      >
        {/* Logo */}
        <div
          className="h-20 flex items-center justify-between px-6"
          style={{ borderBottom: '1px solid var(--border)' }}
        >
          <Link href="/" className="flex items-center gap-3 group">
            <div
              className="w-10 h-10 flex items-center justify-center transition-all group-hover:scale-105"
              style={{
                background: 'var(--accent-gradient)',
                boxShadow: '0 0 20px var(--glow)'
              }}
            >
              <Shield size={22} className="text-white" />
            </div>
            <span
              className="text-xl font-bold tracking-tight"
              style={{ color: 'var(--foreground)' }}
            >
              TruthGuard
            </span>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden transition-colors"
            style={{ color: 'var(--foreground)' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {navigation.map((item) => {
            const isActive = pathname === item.href ||
              (item.href !== '/' && pathname.startsWith(item.href))
            const Icon = item.icon
            return (
              <Link
                key={item.name}
                href={item.href}
                className="flex items-center gap-3 px-4 py-3 text-sm font-medium transition-all duration-200"
                style={{
                  background: isActive ? 'var(--accent-gradient)' : 'transparent',
                  color: isActive ? 'white' : 'var(--foreground-secondary)',
                  boxShadow: isActive ? '0 0 20px var(--glow)' : 'none',
                }}
                onClick={() => setSidebarOpen(false)}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'var(--background-tertiary)'
                    e.currentTarget.style.color = 'var(--foreground)'
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'transparent'
                    e.currentTarget.style.color = 'var(--foreground-secondary)'
                  }
                }}
              >
                <Icon size={18} />
                {item.name}
              </Link>
            )
          })}
        </nav>

        {/* Theme Toggle at bottom of sidebar */}
        <div
          className="px-6 py-4 flex items-center justify-between"
          style={{ borderTop: '1px solid var(--border)' }}
        >
          <span
            className="text-xs font-medium"
            style={{ color: 'var(--foreground-muted)' }}
          >
            {theme === 'dark' ? 'Dark' : 'Light'} Mode
          </span>
          <ThemeToggle />
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header style={{ borderBottom: '1px solid var(--border)', background: 'var(--background)' }}>
          {/* Top Header Bar */}
          <div className="h-20 flex items-center justify-between px-6 lg:px-8 relative">
            {/* Left: Mobile Menu Only */}
            <div className="flex items-center w-16 lg:w-0 relative z-20">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden transition-colors p-2"
                style={{ color: 'var(--foreground)' }}
                aria-label="Open menu"
              >
                <Menu size={22} />
              </button>
            </div>

            {/* Center: Main Title - Absolutely Centered */}
            <div className="absolute left-1/2 transform -translate-x-1/2 w-full max-w-3xl px-4 pointer-events-none z-10">
              <h1
                className="text-2xl lg:text-4xl font-bold text-center tracking-tighter leading-tight"
                style={{ color: 'var(--foreground)' }}
              >
                AI Hallucination Detector
              </h1>
            </div>

            {/* Right: About & Admin */}
            <div className="flex items-center gap-4 lg:gap-6 justify-end flex-1">
              <button
                onClick={() => setAboutDropdownOpen(!aboutDropdownOpen)}
                className="text-sm font-semibold flex items-center gap-2 transition-all duration-200 px-4 py-2 tracking-tight"
                style={{
                  color: 'var(--foreground)',
                  background: aboutDropdownOpen ? 'var(--background-tertiary)' : 'transparent'
                }}
              >
                <Info size={18} style={{ color: 'var(--foreground-muted)' }} />
                <span className="hidden md:inline">About</span>
                {aboutDropdownOpen
                  ? <ChevronUp size={16} style={{ color: 'var(--foreground-muted)' }} />
                  : <ChevronDown size={16} style={{ color: 'var(--foreground-muted)' }} />
                }
              </button>
              <div
                className="h-6 w-px hidden md:block"
                style={{ background: 'var(--border)' }}
              />
              <div className="flex items-center gap-3">
                <div
                  className="w-9 h-9 flex items-center justify-center shadow-sm"
                  style={{ background: 'var(--accent-gradient)' }}
                >
                  <span className="text-white text-xs font-bold tracking-tight">A</span>
                </div>
                <span
                  className="text-sm font-semibold hidden md:inline tracking-tight"
                  style={{ color: 'var(--foreground)' }}
                >
                  Admin
                </span>
              </div>
            </div>
          </div>

          {/* About Dropdown */}
          {aboutDropdownOpen && (
            <div style={{ borderTop: '1px solid var(--border)', background: 'var(--background-secondary)' }}>
              <div className="max-w-7xl mx-auto p-8 lg:p-12">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-10">
                  {/* About Project */}
                  <div>
                    <h2
                      className="text-2xl font-bold mb-6 tracking-tight"
                      style={{ color: 'var(--foreground)' }}
                    >
                      About TruthGuard
                    </h2>
                    <p
                      className="leading-relaxed mb-6 text-base tracking-tight"
                      style={{ color: 'var(--foreground-secondary)' }}
                    >
                      <strong style={{ color: 'var(--foreground)' }}>TruthGuard</strong> is a comprehensive AI safety and compliance platform designed to solve the critical problem of AI hallucinations and regulatory compliance in enterprise AI deployments.
                    </p>
                    <p
                      className="text-sm leading-relaxed tracking-tight"
                      style={{ color: 'var(--foreground-muted)' }}
                    >
                      Real-time monitoring of AI outputs, automated fact verification against external sources (Wikipedia, DuckDuckGo, NewsAPI), compliance rule checking, policy alignment validation, and complete audit trails for regulatory compliance.
                    </p>
                  </div>

                  {/* Architecture Overview */}
                  <div>
                    <h2
                      className="text-2xl font-bold mb-6 tracking-tight"
                      style={{ color: 'var(--foreground)' }}
                    >
                      System Architecture
                    </h2>
                    <div className="text-sm space-y-3 mb-6 tracking-tight" style={{ color: 'var(--foreground-muted)' }}>
                      <div className="flex items-start gap-2">
                        <span style={{ color: 'var(--foreground)' }} className="font-semibold min-w-[100px]">Frontend:</span>
                        <span>Next.js 16, React 19, TypeScript, Tailwind CSS</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span style={{ color: 'var(--foreground)' }} className="font-semibold min-w-[100px]">Backend:</span>
                        <span>FastAPI (Python), Pydantic, AsyncIO</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span style={{ color: 'var(--foreground)' }} className="font-semibold min-w-[100px]">Database:</span>
                        <span>Supabase (PostgreSQL), Real-time subscriptions</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span style={{ color: 'var(--foreground)' }} className="font-semibold min-w-[100px]">AI/ML:</span>
                        <span>spaCy, Transformers, Google Gemini Pro</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span style={{ color: 'var(--foreground)' }} className="font-semibold min-w-[100px]">APIs:</span>
                        <span>Wikipedia, DuckDuckGo, NewsAPI</span>
                      </div>
                    </div>
                    <div
                      className="text-xs font-mono p-4 leading-relaxed tracking-tight"
                      style={{
                        background: 'var(--background-tertiary)',
                        border: '1px solid var(--border)',
                        color: 'var(--foreground-muted)'
                      }}
                    >
                      <div>AI Response → Claim Extraction →</div>
                      <div>Fact Verification → Compliance Check →</div>
                      <div>Consistency Check → Decision & Correction</div>
                    </div>
                  </div>
                </div>

                {/* Contact Developer */}
                <div style={{ borderTop: '1px solid var(--border)' }} className="pt-8">
                  <h2
                    className="text-2xl font-bold mb-6 tracking-tight"
                    style={{ color: 'var(--foreground)' }}
                  >
                    Contact Developer
                  </h2>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-6">
                    <p
                      className="text-lg font-semibold tracking-tight"
                      style={{ color: 'var(--foreground)' }}
                    >
                      Umang Kumar
                    </p>
                    <span className="hidden sm:inline" style={{ color: 'var(--foreground-muted)' }}>•</span>
                    <p
                      className="text-sm tracking-tight"
                      style={{ color: 'var(--foreground-muted)' }}
                    >
                      Full Stack Developer & AI Engineer
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <a
                      href="https://www.linkedin.com/in/umang-kumar-0546b71b5/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold tracking-tight transition-all duration-200"
                      style={{
                        border: '1px solid var(--border)',
                        color: 'var(--foreground)',
                        background: 'var(--background)'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'var(--accent-gradient)'
                        e.currentTarget.style.color = 'white'
                        e.currentTarget.style.borderColor = 'transparent'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'var(--background)'
                        e.currentTarget.style.color = 'var(--foreground)'
                        e.currentTarget.style.borderColor = 'var(--border)'
                      }}
                    >
                      <Linkedin size={18} />
                      LinkedIn
                    </a>
                    <a
                      href="https://umangkumar.netlify.app"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold tracking-tight transition-all duration-200"
                      style={{
                        border: '1px solid var(--border)',
                        color: 'var(--foreground)',
                        background: 'var(--background)'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'var(--accent-gradient)'
                        e.currentTarget.style.color = 'white'
                        e.currentTarget.style.borderColor = 'transparent'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'var(--background)'
                        e.currentTarget.style.color = 'var(--foreground)'
                        e.currentTarget.style.borderColor = 'var(--border)'
                      }}
                    >
                      <Globe size={18} />
                      Portfolio
                    </a>
                    <a
                      href="https://github.com/umangkumarchaudhary"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold tracking-tight transition-all duration-200"
                      style={{
                        border: '1px solid var(--border)',
                        color: 'var(--foreground)',
                        background: 'var(--background)'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'var(--accent-gradient)'
                        e.currentTarget.style.color = 'white'
                        e.currentTarget.style.borderColor = 'transparent'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'var(--background)'
                        e.currentTarget.style.color = 'var(--foreground)'
                        e.currentTarget.style.borderColor = 'var(--border)'
                      }}
                    >
                      <Github size={18} />
                      GitHub
                    </a>
                  </div>
                </div>
              </div>
            </div>
          )}
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto" style={{ background: 'var(--background)' }}>
          {children}
        </main>
      </div>
    </div>
  )
}
