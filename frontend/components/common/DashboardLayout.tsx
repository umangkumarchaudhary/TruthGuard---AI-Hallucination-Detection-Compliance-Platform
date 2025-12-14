'use client'

import { ReactNode, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
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
  ChevronUp
} from 'lucide-react'

interface DashboardLayoutProps {
  children: ReactNode
}

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'AI Test', href: '/ai-test', icon: Sparkles },
  { name: 'Live Demo', href: '/live-demo', icon: Radio },
  { name: 'Interactions', href: '/interactions', icon: MessageSquare },
  { name: 'Violations', href: '/violations', icon: AlertTriangle },
  { name: 'Policies', href: '/policies', icon: FileText },
  { name: 'Compliance Rules', href: '/compliance-rules', icon: Shield },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  { name: 'Badge Generator', href: '/badge', icon: Badge },
  { name: 'Settings', href: '/settings', icon: Settings },
]

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [aboutDropdownOpen, setAboutDropdownOpen] = useState(false)
  const pathname = usePathname()

  return (
    <div className="min-h-screen bg-white flex">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50
        w-64 bg-white border-r border-[#e5e5e5]
        transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 transition-transform duration-200
        flex flex-col
      `}>
        {/* Logo */}
        <div className="h-20 border-b border-[#e5e5e5] flex items-center justify-between px-6">
          <Link href="/dashboard" className="text-xl font-bold text-black tracking-tight">
            TruthGuard
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-black"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            const Icon = item.icon
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`
                  flex items-center gap-3 px-4 py-3 text-sm font-medium
                  transition-colors
                  ${isActive 
                    ? 'bg-black text-white' 
                    : 'text-black hover:bg-[#f5f5f5]'
                  }
                `}
                onClick={() => setSidebarOpen(false)}
              >
                <Icon size={18} />
                {item.name}
              </Link>
            )
          })}
        </nav>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="border-b border-[#e5e5e5] bg-white">
          {/* Top Header Bar */}
          <div className="h-20 flex items-center justify-between px-6 lg:px-8 relative">
            {/* Left: Mobile Menu Only */}
            <div className="flex items-center w-16 lg:w-0">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden text-black hover:text-black/70 transition-colors"
              >
                <Menu size={22} />
              </button>
            </div>

            {/* Center: Main Title - Absolutely Centered */}
            <div className="absolute left-1/2 transform -translate-x-1/2 w-full max-w-3xl px-4">
              <h1 className="text-2xl lg:text-4xl font-bold text-black text-center tracking-tighter leading-tight">
                AI Hallucination Detector
              </h1>
            </div>

            {/* Right: About & Admin */}
            <div className="flex items-center gap-4 lg:gap-6 justify-end flex-1">
              <button
                onClick={() => setAboutDropdownOpen(!aboutDropdownOpen)}
                className="text-sm font-semibold text-black hover:text-black/70 flex items-center gap-2 transition-all duration-200 hover:bg-[#f5f5f5] px-4 py-2 tracking-tight"
              >
                <Info size={18} className="text-black/60" />
                <span className="hidden md:inline">About</span>
                {aboutDropdownOpen ? <ChevronUp size={16} className="text-black/50" /> : <ChevronDown size={16} className="text-black/50" />}
              </button>
              <div className="h-6 w-px bg-[#e5e5e5] hidden md:block" />
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-black flex items-center justify-center shadow-sm">
                  <span className="text-white text-xs font-bold tracking-tight">A</span>
                </div>
                <span className="text-sm font-semibold text-black hidden md:inline tracking-tight">Admin</span>
              </div>
            </div>
          </div>

          {/* About Dropdown */}
          {aboutDropdownOpen && (
            <div className="border-t border-[#e5e5e5] bg-white">
              <div className="max-w-7xl mx-auto p-8 lg:p-12">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-10">
                  {/* About Project */}
                  <div>
                    <h2 className="text-2xl font-bold text-black mb-6 tracking-tight">About TruthGuard</h2>
                    <p className="text-black/80 leading-relaxed mb-6 text-base tracking-tight">
                      <strong className="text-black font-semibold">TruthGuard</strong> is a comprehensive AI safety and compliance platform designed to solve the critical problem of AI hallucinations and regulatory compliance in enterprise AI deployments.
                    </p>
                    <p className="text-sm text-black/70 leading-relaxed tracking-tight">
                      Real-time monitoring of AI outputs, automated fact verification against external sources (Wikipedia, DuckDuckGo, NewsAPI), compliance rule checking, policy alignment validation, and complete audit trails for regulatory compliance.
                    </p>
                  </div>

                  {/* Architecture Overview */}
                  <div>
                    <h2 className="text-2xl font-bold text-black mb-6 tracking-tight">System Architecture</h2>
                    <div className="text-sm text-black/70 space-y-3 mb-6 tracking-tight">
                      <div className="flex items-start gap-2">
                        <span className="text-black font-semibold min-w-[100px]">Frontend:</span>
                        <span>Next.js 16, React 19, TypeScript, Tailwind CSS</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-black font-semibold min-w-[100px]">Backend:</span>
                        <span>FastAPI (Python), Pydantic, AsyncIO</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-black font-semibold min-w-[100px]">Database:</span>
                        <span>Supabase (PostgreSQL), Real-time subscriptions</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-black font-semibold min-w-[100px]">AI/ML:</span>
                        <span>spaCy, Transformers, Google Gemini Pro</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-black font-semibold min-w-[100px]">APIs:</span>
                        <span>Wikipedia, DuckDuckGo, NewsAPI</span>
                      </div>
                    </div>
                    <div className="text-xs text-black/60 font-mono bg-[#f5f5f5] p-4 border border-[#e5e5e5] leading-relaxed tracking-tight">
                      <div>AI Response → Claim Extraction →</div>
                      <div>Fact Verification → Compliance Check →</div>
                      <div>Consistency Check → Decision & Correction</div>
                    </div>
                  </div>
                </div>

                {/* Contact Developer */}
                <div className="border-t border-[#e5e5e5] pt-8">
                  <h2 className="text-2xl font-bold text-black mb-6 tracking-tight">Contact Developer</h2>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-6">
                    <p className="text-lg text-black font-semibold tracking-tight">Umang Kumar</p>
                    <span className="hidden sm:inline text-black/40">•</span>
                    <p className="text-sm text-black/60 tracking-tight">Full Stack Developer & AI Engineer</p>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <a
                      href="https://www.linkedin.com/in/umang-kumar-0546b71b5/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-5 py-2.5 border border-[#e5e5e5] text-black hover:border-black hover:bg-black hover:text-white transition-all duration-200 text-sm font-semibold tracking-tight"
                    >
                      <Linkedin size={18} />
                      LinkedIn
                    </a>
                    <a
                      href="https://umangkumar.netlify.app"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-5 py-2.5 border border-[#e5e5e5] text-black hover:border-black hover:bg-black hover:text-white transition-all duration-200 text-sm font-semibold tracking-tight"
                    >
                      <Globe size={18} />
                      Personal Website
                    </a>
                    <a
                      href="https://github.com/umangkumarchaudhary"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-5 py-2.5 border border-[#e5e5e5] text-black hover:border-black hover:bg-black hover:text-white transition-all duration-200 text-sm font-semibold tracking-tight"
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
        <main className="flex-1 overflow-y-auto bg-white">
          {children}
        </main>
      </div>
    </div>
  )
}

