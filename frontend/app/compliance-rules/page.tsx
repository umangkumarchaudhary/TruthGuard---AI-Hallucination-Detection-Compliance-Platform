'use client'

import { useEffect, useState } from 'react'
import DashboardLayout from '@/components/common/DashboardLayout'
import { apiClient } from '@/lib/api-client'
import { Plus, Edit, Trash2, Shield } from 'lucide-react'

interface ComplianceRule {
  id: string
  rule_name: string
  rule_type: string
  rule_definition: any
  industry?: string
  is_active: boolean
}

export default function ComplianceRulesPage() {
  const [rules, setRules] = useState<ComplianceRule[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingRule, setEditingRule] = useState<ComplianceRule | null>(null)

  useEffect(() => {
    loadRules()
  }, [])

  const loadRules = async () => {
    setLoading(true)
    try {
      const res = await apiClient.get<ComplianceRule[]>('/api/v1/compliance/rules?organization_id=00000000-0000-0000-0000-000000000001')
      if (res.data) {
        setRules(res.data)
      }
    } catch (error) {
      console.error('Error loading rules:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this rule?')) {
      try {
        await apiClient.delete(`/api/v1/compliance/rules/${id}`)
        loadRules()
      } catch (error) {
        console.error('Error deleting rule:', error)
      }
    }
  }

  return (
    <DashboardLayout>
      <div className="p-4 lg:p-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-black mb-2">Compliance Rules</h1>
            <p className="text-sm text-black/60">Manage regulatory compliance rules</p>
          </div>
          <button
            onClick={() => {
              setEditingRule(null)
              setShowModal(true)
            }}
            className="px-6 py-3 bg-black text-white hover:bg-black/90 flex items-center gap-2"
          >
            <Plus size={18} />
            <span>New Rule</span>
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-black">Loading...</div>
          </div>
        ) : (
          <div className="space-y-4">
            {rules.length === 0 ? (
              <div className="bg-white border border-[#e5e5e5] p-12 text-center">
                <p className="text-black/60">No compliance rules found</p>
              </div>
            ) : (
              rules.map((rule) => (
                <div key={rule.id} className="bg-white border border-[#e5e5e5] p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <Shield size={20} className="text-black" />
                      <div>
                        <h3 className="text-lg font-semibold text-black">{rule.rule_name}</h3>
                        <p className="text-xs text-black/60">
                          {rule.rule_type} {rule.industry && `• ${rule.industry}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setEditingRule(rule)
                          setShowModal(true)
                        }}
                        className="px-4 py-2 border border-[#e5e5e5] bg-white text-black hover:bg-[#f5f5f5] flex items-center gap-2"
                      >
                        <Edit size={16} />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() => handleDelete(rule.id)}
                        className="px-4 py-2 border border-[#e5e5e5] bg-white text-black hover:bg-[#f5f5f5] flex items-center gap-2"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                  <div className="text-sm text-black/80">
                    <pre className="whitespace-pre-wrap font-sans">
                      {JSON.stringify(rule.rule_definition, null, 2)}
                    </pre>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {showModal && (
          <RuleModal
            rule={editingRule}
            onClose={() => {
              setShowModal(false)
              setEditingRule(null)
            }}
            onSave={loadRules}
          />
        )}
      </div>
    </DashboardLayout>
  )
}

function RuleModal({ 
  rule, 
  onClose, 
  onSave 
}: { 
  rule: ComplianceRule | null
  onClose: () => void
  onSave: () => void
}) {
  const [name, setName] = useState(rule?.rule_name || '')
  const [type, setType] = useState(rule?.rule_type || 'regulatory')
  const [definition, setDefinition] = useState(JSON.stringify(rule?.rule_definition || {}, null, 2))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const data = {
        rule_name: name,
        rule_type: type,
        rule_definition: JSON.parse(definition),
        organization_id: '00000000-0000-0000-0000-000000000001',
      }

      if (rule) {
        await apiClient.put(`/api/v1/compliance/rules/${rule.id}`, data)
      } else {
        await apiClient.post('/api/v1/compliance/rules', data)
      }
      onSave()
      onClose()
    } catch (error) {
      console.error('Error saving rule:', error)
      alert('Invalid JSON in rule definition')
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white border border-[#e5e5e5] w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="border-b border-[#e5e5e5] px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-black">
            {rule ? 'Edit Rule' : 'New Rule'}
          </h2>
          <button onClick={onClose} className="text-black hover:text-black/60">
            ×
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-black mb-2">Rule Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 border border-[#e5e5e5] bg-white text-black focus:outline-none focus:border-black"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-black mb-2">Rule Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full px-4 py-2 border border-[#e5e5e5] bg-white text-black focus:outline-none focus:border-black"
            >
              <option value="regulatory">Regulatory</option>
              <option value="policy">Policy</option>
              <option value="custom">Custom</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-black mb-2">Rule Definition (JSON)</label>
            <textarea
              value={definition}
              onChange={(e) => setDefinition(e.target.value)}
              rows={15}
              className="w-full px-4 py-2 border border-[#e5e5e5] bg-white text-black focus:outline-none focus:border-black font-mono text-sm"
              required
            />
          </div>
          <div className="flex items-center gap-4">
            <button
              type="submit"
              className="px-6 py-3 bg-black text-white hover:bg-black/90"
            >
              {rule ? 'Update' : 'Create'}
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

