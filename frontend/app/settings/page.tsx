'use client'

import { useEffect, useState } from 'react'
import DashboardLayout from '@/components/common/DashboardLayout'
import { Key, Save } from 'lucide-react'

export default function SettingsPage() {
  const [apiKey, setApiKey] = useState('')
  const [orgName, setOrgName] = useState('TruthGuard Organization')
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    // Load saved settings
    if (typeof window !== 'undefined') {
      const savedKey = localStorage.getItem('api_key')
      if (savedKey) {
        setApiKey(savedKey)
      }
    }
  }, [])

  const handleSave = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('api_key', apiKey)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    }
  }

  return (
    <DashboardLayout>
      <div className="p-4 lg:p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-black mb-2">Settings</h1>
          <p className="text-sm text-black/60">Manage your organization settings</p>
        </div>

        <div className="max-w-2xl space-y-6">
          {/* Organization Settings */}
          <div className="bg-white border border-[#e5e5e5] p-6">
            <h2 className="text-lg font-semibold text-black mb-4">Organization</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-black mb-2">Organization Name</label>
                <input
                  type="text"
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  className="w-full px-4 py-2 border border-[#e5e5e5] bg-white text-black focus:outline-none focus:border-black"
                />
              </div>
            </div>
          </div>

          {/* API Key Settings */}
          <div className="bg-white border border-[#e5e5e5] p-6">
            <h2 className="text-lg font-semibold text-black mb-4 flex items-center gap-2">
              <Key size={18} />
              API Key
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-black mb-2">API Key</label>
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="Enter your API key"
                  className="w-full px-4 py-2 border border-[#e5e5e5] bg-white text-black focus:outline-none focus:border-black"
                />
                <p className="text-xs text-black/60 mt-2">
                  Your API key is used to authenticate requests to the TruthGuard API
                </p>
              </div>
              <button
                onClick={handleSave}
                className="px-6 py-3 bg-black text-white hover:bg-black/90 flex items-center gap-2"
              >
                <Save size={18} />
                <span>Save Settings</span>
              </button>
              {saved && (
                <p className="text-sm text-[#10b981]">Settings saved successfully!</p>
              )}
            </div>
          </div>

          {/* User Management */}
          <div className="bg-white border border-[#e5e5e5] p-6">
            <h2 className="text-lg font-semibold text-black mb-4">User Management</h2>
            <p className="text-sm text-black/60 mb-4">Manage users and permissions</p>
            <button className="px-6 py-3 border border-[#e5e5e5] bg-white text-black hover:bg-[#f5f5f5]">
              Manage Users
            </button>
          </div>

          {/* Notifications */}
          <div className="bg-white border border-[#e5e5e5] p-6">
            <h2 className="text-lg font-semibold text-black mb-4">Notifications</h2>
            <div className="space-y-3">
              <label className="flex items-center gap-3">
                <input type="checkbox" className="w-4 h-4" defaultChecked />
                <span className="text-sm text-black">Email notifications for critical violations</span>
              </label>
              <label className="flex items-center gap-3">
                <input type="checkbox" className="w-4 h-4" defaultChecked />
                <span className="text-sm text-black">Daily summary reports</span>
              </label>
              <label className="flex items-center gap-3">
                <input type="checkbox" className="w-4 h-4" />
                <span className="text-sm text-black">Weekly analytics reports</span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

