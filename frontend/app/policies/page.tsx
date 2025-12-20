'use client'

import { useEffect, useState } from 'react'
import DashboardLayout from '@/components/common/DashboardLayout'
import { apiClient } from '@/lib/api-client'
import { useTheme } from '@/lib/theme-provider'
import { Plus, Edit, Trash2, FileText, X, Check, AlertCircle } from 'lucide-react'

interface Policy {
  id: string
  policy_name: string
  policy_content: string
  category: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export default function PoliciesPage() {
  const [policies, setPolicies] = useState<Policy[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingPolicy, setEditingPolicy] = useState<Policy | null>(null)
  const { theme } = useTheme()

  useEffect(() => {
    loadPolicies()
  }, [])

  const loadPolicies = async () => {
    setLoading(true)
    try {
      const res = await apiClient.get<Policy[]>('/api/v1/policies?organization_id=00000000-0000-0000-0000-000000000001')
      if (res.data) {
        setPolicies(res.data)
      }
    } catch (error) {
      console.error('Error loading policies:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this policy?')) {
      try {
        await apiClient.delete(`/api/v1/policies/${id}`)
        loadPolicies()
      } catch (error) {
        console.error('Error deleting policy:', error)
      }
    }
  }

  return (
    <DashboardLayout>
      <div className="p-4 lg:p-8">
        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-slide-down">
          <div>
            <h1 className="text-3xl lg:text-4xl font-bold tracking-tight mb-2" style={{ color: 'var(--foreground)' }}>
              Policies
            </h1>
            <p style={{ color: 'var(--foreground-muted)' }}>Manage company policies</p>
          </div>
          <button
            onClick={() => {
              setEditingPolicy(null)
              setShowModal(true)
            }}
            className="px-6 py-3 flex items-center gap-2 text-sm font-semibold text-white transition-all hover:scale-105"
            style={{ background: 'var(--accent-gradient)', boxShadow: '0 0 20px var(--glow)' }}
          >
            <Plus size={18} />
            <span>New Policy</span>
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
            {[1, 2, 3].map((i) => (
              <div key={i} className="premium-card p-6">
                <div className="h-6 w-40 rounded mb-4" style={{ background: 'var(--background-tertiary)' }} />
                <div className="h-4 w-full rounded mb-2" style={{ background: 'var(--background-tertiary)' }} />
                <div className="h-4 w-3/4 rounded" style={{ background: 'var(--background-tertiary)' }} />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 stagger-children">
            {policies.length === 0 ? (
              <div className="col-span-full premium-card p-12 text-center">
                <FileText size={48} className="mx-auto mb-4 opacity-30" style={{ color: 'var(--foreground-muted)' }} />
                <p className="text-lg font-semibold mb-2" style={{ color: 'var(--foreground)' }}>No Policies Found</p>
                <p style={{ color: 'var(--foreground-muted)' }}>Create your first policy to get started.</p>
              </div>
            ) : (
              policies.map((policy) => (
                <div key={policy.id} className="premium-card p-6 group">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 flex items-center justify-center"
                        style={{ background: theme === 'dark' ? 'rgba(96, 165, 250, 0.15)' : 'rgba(59, 130, 246, 0.1)' }}
                      >
                        <FileText size={20} style={{ color: theme === 'dark' ? '#60a5fa' : '#3b82f6' }} />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold" style={{ color: 'var(--foreground)' }}>
                          {policy.policy_name}
                        </h3>
                        <p className="text-xs" style={{ color: 'var(--foreground-muted)' }}>{policy.category}</p>
                      </div>
                    </div>
                    <span
                      className="px-2 py-1 text-xs font-semibold"
                      style={{
                        background: policy.is_active ? 'var(--success-bg)' : 'var(--background-tertiary)',
                        color: policy.is_active ? 'var(--success)' : 'var(--foreground-muted)'
                      }}
                    >
                      {policy.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <p
                    className="text-sm mb-4 line-clamp-3 leading-relaxed"
                    style={{ color: 'var(--foreground-secondary)' }}
                  >
                    {policy.policy_content}
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setEditingPolicy(policy)
                        setShowModal(true)
                      }}
                      className="flex-1 px-4 py-2 flex items-center justify-center gap-2 text-sm font-medium transition-colors"
                      style={{
                        background: 'var(--background-tertiary)',
                        border: '1px solid var(--border)',
                        color: 'var(--foreground)'
                      }}
                    >
                      <Edit size={16} />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => handleDelete(policy.id)}
                      className="px-4 py-2 flex items-center justify-center gap-2 text-sm font-medium transition-colors"
                      style={{
                        background: 'var(--danger-bg)',
                        border: '1px solid var(--danger)',
                        color: 'var(--danger)'
                      }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {showModal && (
          <PolicyModal
            policy={editingPolicy}
            onClose={() => {
              setShowModal(false)
              setEditingPolicy(null)
            }}
            onSave={loadPolicies}
          />
        )}
      </div>
    </DashboardLayout>
  )
}

function PolicyModal({
  policy,
  onClose,
  onSave
}: {
  policy: Policy | null
  onClose: () => void
  onSave: () => void
}) {
  const [name, setName] = useState(policy?.policy_name || '')
  const [content, setContent] = useState(policy?.policy_content || '')
  const [category, setCategory] = useState(policy?.category || '')
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const data = {
        policy_name: name,
        policy_content: content,
        category,
        organization_id: '00000000-0000-0000-0000-000000000001',
      }

      if (policy) {
        await apiClient.put(`/api/v1/policies/${policy.id}`, data)
      } else {
        await apiClient.post('/api/v1/policies', data)
      }
      onSave()
      onClose()
    } catch (error) {
      console.error('Error saving policy:', error)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50 p-4"
      style={{ background: 'rgba(0,0,0,0.5)' }}
    >
      <div
        className="w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        style={{
          background: 'var(--background)',
          border: '1px solid var(--border)',
          boxShadow: '0 0 50px var(--glow)'
        }}
      >
        <div
          className="px-6 py-4 flex items-center justify-between"
          style={{ borderBottom: '1px solid var(--border)' }}
        >
          <h2 className="text-xl font-bold" style={{ color: 'var(--foreground)' }}>
            {policy ? 'Edit Policy' : 'New Policy'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 transition-colors"
            style={{ color: 'var(--foreground-muted)' }}
          >
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label
              className="block text-sm font-semibold mb-2"
              style={{ color: 'var(--foreground)' }}
            >
              Policy Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 text-sm focus:outline-none"
              style={{
                background: 'var(--background-tertiary)',
                border: '1px solid var(--border)',
                color: 'var(--foreground)'
              }}
              required
            />
          </div>
          <div>
            <label
              className="block text-sm font-semibold mb-2"
              style={{ color: 'var(--foreground)' }}
            >
              Category
            </label>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-3 text-sm focus:outline-none"
              style={{
                background: 'var(--background-tertiary)',
                border: '1px solid var(--border)',
                color: 'var(--foreground)'
              }}
              required
            />
          </div>
          <div>
            <label
              className="block text-sm font-semibold mb-2"
              style={{ color: 'var(--foreground)' }}
            >
              Content
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={10}
              className="w-full px-4 py-3 text-sm focus:outline-none resize-none"
              style={{
                background: 'var(--background-tertiary)',
                border: '1px solid var(--border)',
                color: 'var(--foreground)'
              }}
              required
            />
          </div>
          <div className="flex items-center gap-4 pt-4">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 px-6 py-3 text-sm font-semibold text-white flex items-center justify-center gap-2 disabled:opacity-50"
              style={{ background: 'var(--accent-gradient)' }}
            >
              {saving ? 'Saving...' : policy ? 'Update Policy' : 'Create Policy'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 text-sm font-medium"
              style={{
                background: 'var(--background-tertiary)',
                border: '1px solid var(--border)',
                color: 'var(--foreground)'
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
