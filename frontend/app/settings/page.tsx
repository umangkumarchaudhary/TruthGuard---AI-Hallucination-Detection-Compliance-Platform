'use client'

import { useState } from 'react'
import DashboardLayout from '@/components/common/DashboardLayout'
import AlertSettings from '@/components/settings/AlertSettings'
import { Settings, Bell, User, Shield } from 'lucide-react'

type TabType = 'alerts' | 'profile' | 'security'

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<TabType>('alerts')

  const tabs = [
    { id: 'alerts' as TabType, label: 'Alert Settings', icon: Bell },
    { id: 'profile' as TabType, label: 'Profile', icon: User },
    { id: 'security' as TabType, label: 'Security', icon: Shield }
  ]

  return (
    <DashboardLayout>
      <div className="p-4 lg:p-8">
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <Settings className="text-black" size={24} />
            <h1 className="text-3xl font-bold text-black">Settings</h1>
          </div>
          <p className="text-sm text-black/60">Configure your TruthGuard preferences</p>
        </div>

        {/* Tabs */}
        <div className="mb-6 border-b border-[#e5e5e5]">
          <div className="flex gap-1">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-6 py-3 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 ${
                    activeTab === tab.id
                      ? 'border-black text-black'
                      : 'border-transparent text-black/60 hover:text-black'
                  }`}
                >
                  <Icon size={16} />
                  <span>{tab.label}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Tab Content */}
        <div>
          {activeTab === 'alerts' && <AlertSettings />}
          {activeTab === 'profile' && (
            <div className="bg-white border border-[#e5e5e5] p-6">
              <h3 className="text-lg font-semibold text-black mb-4">Profile Settings</h3>
              <p className="text-sm text-black/60">Profile settings coming soon</p>
            </div>
          )}
          {activeTab === 'security' && (
            <div className="bg-white border border-[#e5e5e5] p-6">
              <h3 className="text-lg font-semibold text-black mb-4">Security Settings</h3>
              <p className="text-sm text-black/60">Security settings coming soon</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
