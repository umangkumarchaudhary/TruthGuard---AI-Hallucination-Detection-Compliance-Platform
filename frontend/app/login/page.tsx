'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (authError) throw authError

      if (data.user) {
        router.push('/dashboard')
      }
    } catch (err: any) {
      setError(err.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-black mb-2">TruthGuard</h1>
          <p className="text-sm text-black/60">AI Hallucination Detection & Compliance</p>
        </div>

        <div className="bg-white border border-[#e5e5e5] p-8">
          <h2 className="text-2xl font-semibold text-black mb-6">Sign In</h2>

          {error && (
            <div className="mb-4 p-3 bg-[#dc2626]/10 border border-[#dc2626] text-[#dc2626] text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-black mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-2 border border-[#e5e5e5] bg-white text-black focus:outline-none focus:border-black"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-black mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-2 border border-[#e5e5e5] bg-white text-black focus:outline-none focus:border-black"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full px-6 py-3 bg-black text-white hover:bg-black/90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-black/60">
            Don't have an account?{' '}
            <Link href="/signup" className="text-black hover:text-black/60 underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

