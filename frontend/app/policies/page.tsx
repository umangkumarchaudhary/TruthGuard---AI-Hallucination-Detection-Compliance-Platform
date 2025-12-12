'use client'

import { useEffect, useState } from 'react'
import DashboardLayout from '@/components/common/DashboardLayout'
import { apiClient } from '@/lib/api-client'
import { Plus, Edit, Trash2, FileText } from 'lucide-react'

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
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-black mb-2">Policies</h1>
            <p className="text-sm text-black/60">Manage company policies</p>
          </div>
          <button
            onClick={() => {
              setEditingPolicy(null)
              setShowModal(true)
            }}
            className="px-6 py-3 bg-black text-white hover:bg-black/90 flex items-center gap-2"
          >
            <Plus size={18} />
            <span>New Policy</span>
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-black">Loading...</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {policies.length === 0 ? (
              <div className="col-span-full bg-white border border-[#e5e5e5] p-12 text-center">
                <p className="text-black/60">No policies found</p>
              </div>
            ) : (
              policies.map((policy) => (
                <div key={policy.id} className="bg-white border border-[#e5e5e5] p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <FileText size={20} className="text-black" />
                      <div>
                        <h3 className="text-lg font-semibold text-black">{policy.policy_name}</h3>
                        <p className="text-xs text-black/60">{policy.category}</p>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-black/80 mb-4 line-clamp-3">{policy.policy_content}</p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setEditingPolicy(policy)
                        setShowModal(true)
                      }}
                      className="px-4 py-2 border border-[#e5e5e5] bg-white text-black hover:bg-[#f5f5f5] flex items-center gap-2"
                    >
                      <Edit size={16} />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => handleDelete(policy.id)}
                      className="px-4 py-2 border border-[#e5e5e5] bg-white text-black hover:bg-[#f5f5f5] flex items-center gap-2"
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
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
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white border border-[#e5e5e5] w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="border-b border-[#e5e5e5] px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-black">
            {policy ? 'Edit Policy' : 'New Policy'}
          </h2>
          <button onClick={onClose} className="text-black hover:text-black/60">
            ×
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-black mb-2">Policy Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 border border-[#e5e5e5] bg-white text-black focus:outline-none focus:border-black"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-black mb-2">Category</label>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-2 border border-[#e5e5e5] bg-white text-black focus:outline-none focus:border-black"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-black mb-2">Content</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={10}
              className="w-full px-4 py-2 border border-[#e5e5e5] bg-white text-black focus:outline-none focus:border-black"
              required
            />
          </div>
          <div className="flex items-center gap-4">
            <button
              type="submit"
              className="px-6 py-3 bg-black text-white hover:bg-black/90"
            >
              {policy ? 'Update' : 'Create'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 border border-[#e5e5e5] bg-white text-black hover:bg-[#f5f5f5]"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

