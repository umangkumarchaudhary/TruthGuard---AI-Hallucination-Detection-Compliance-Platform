'use client'

import { useState, useEffect } from 'react'
import { Bell, Mail, MessageSquare, Webhook, CheckCircle, AlertCircle } from 'lucide-react'

interface AlertSettings {
  alertTriggers: {
    hallucination: boolean
    compliance: boolean
    consistency: boolean
    critical: boolean
  }
  channels: {
    inApp: boolean
    email: string
    slack: string
    webhook: string
  }
}

export default function AlertSettings() {
  const [settings, setSettings] = useState<AlertSettings>({
    alertTriggers: {
      hallucination: true,
      compliance: true,
      consistency: false,
      critical: true
    },
    channels: {
      inApp: true,
      email: '',
      slack: '',
      webhook: ''
    }
  })
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    // Load from localStorage
    const saved = localStorage.getItem('truthguard_alert_settings')
    if (saved) {
      setSettings(JSON.parse(saved))
    }
  }, [])

  const handleSave = () => {
    localStorage.setItem('truthguard_alert_settings', JSON.stringify(settings))
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const updateTrigger = (key: keyof AlertSettings['alertTriggers'], value: boolean) => {
    setSettings(prev => ({
      ...prev,
      alertTriggers: { ...prev.alertTriggers, [key]: value }
    }))
  }

  const updateChannel = (key: keyof AlertSettings['channels'], value: boolean | string) => {
    setSettings(prev => ({
      ...prev,
      channels: { ...prev.channels, [key]: value }
    }))
  }

  const activeChannels = [
    settings.channels.inApp && 'In-App',
    settings.channels.email && 'Email',
    settings.channels.slack && 'Slack',
    settings.channels.webhook && 'Webhook'
  ].filter(Boolean)

  return (
    <div className="space-y-6">
      {/* Alert Triggers */}
      <div className="bg-white border border-[#e5e5e5] p-6">
        <div className="flex items-center gap-2 mb-6">
          <Bell className="text-black" size={20} />
          <h3 className="text-lg font-semibold text-black">Alert Triggers</h3>
        </div>
        <p className="text-sm text-black/60 mb-6">
          Configure when TruthGuard should send alerts
        </p>
        
        <div className="space-y-4">
          {[
            { key: 'hallucination' as const, label: 'Hallucination Detected', description: 'When AI generates false information' },
            { key: 'compliance' as const, label: 'Compliance Violation', description: 'When response violates regulatory rules' },
            { key: 'critical' as const, label: 'Critical Violation', description: 'When high-severity issues are detected' },
            { key: 'consistency' as const, label: 'Consistency Issues', description: 'When response contradicts historical data' }
          ].map((trigger) => (
            <div key={trigger.key} className="flex items-start justify-between p-4 border border-[#e5e5e5] hover:bg-[#f5f5f5] transition-colors">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <input
                    type="checkbox"
                    checked={settings.alertTriggers[trigger.key]}
                    onChange={(e) => updateTrigger(trigger.key, e.target.checked)}
                    className="w-4 h-4 border-[#e5e5e5] text-black focus:ring-black"
                  />
                  <label className="text-sm font-semibold text-black cursor-pointer">
                    {trigger.label}
                  </label>
                </div>
                <p className="text-xs text-black/60 ml-6">{trigger.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Notification Channels */}
      <div className="bg-white border border-[#e5e5e5] p-6">
        <div className="flex items-center gap-2 mb-6">
          <MessageSquare className="text-black" size={20} />
          <h3 className="text-lg font-semibold text-black">Notification Channels</h3>
        </div>
        <p className="text-sm text-black/60 mb-6">
          Where alerts should be sent
        </p>
        
        <div className="space-y-4">
          {/* In-App */}
          <div className="p-4 border border-[#e5e5e5]">
            <div className="flex items-center gap-2 mb-2">
              <input
                type="checkbox"
                checked={settings.channels.inApp}
                onChange={(e) => updateChannel('inApp', e.target.checked)}
                className="w-4 h-4 border-[#e5e5e5] text-black focus:ring-black"
              />
              <Bell size={16} className="text-black" />
              <label className="text-sm font-semibold text-black cursor-pointer">
                In-App Notifications
              </label>
            </div>
            <p className="text-xs text-black/60 ml-6">Show alerts in the TruthGuard dashboard</p>
          </div>

          {/* Email */}
          <div className="p-4 border border-[#e5e5e5]">
            <div className="flex items-center gap-2 mb-2">
              <Mail size={16} className="text-black" />
              <label className="text-sm font-semibold text-black">Email</label>
            </div>
            <input
              type="email"
              value={settings.channels.email}
              onChange={(e) => updateChannel('email', e.target.value)}
              placeholder="alerts@company.com"
              className="w-full mt-2 px-3 py-2 border border-[#e5e5e5] bg-white text-black focus:outline-none focus:border-black text-sm"
            />
            <p className="text-xs text-black/60 mt-1">Email address to receive alerts</p>
          </div>

          {/* Slack */}
          <div className="p-4 border border-[#e5e5e5]">
            <div className="flex items-center gap-2 mb-2">
              <MessageSquare size={16} className="text-black" />
              <label className="text-sm font-semibold text-black">Slack Webhook</label>
            </div>
            <input
              type="text"
              value={settings.channels.slack}
              onChange={(e) => updateChannel('slack', e.target.value)}
              placeholder="https://hooks.slack.com/services/..."
              className="w-full mt-2 px-3 py-2 border border-[#e5e5e5] bg-white text-black focus:outline-none focus:border-black text-sm"
            />
            <p className="text-xs text-black/60 mt-1">Slack webhook URL for alerts</p>
          </div>

          {/* Webhook */}
          <div className="p-4 border border-[#e5e5e5]">
            <div className="flex items-center gap-2 mb-2">
              <Webhook size={16} className="text-black" />
              <label className="text-sm font-semibold text-black">Custom Webhook</label>
            </div>
            <input
              type="text"
              value={settings.channels.webhook}
              onChange={(e) => updateChannel('webhook', e.target.value)}
              placeholder="https://api.company.com/webhooks/alerts"
              className="w-full mt-2 px-3 py-2 border border-[#e5e5e5] bg-white text-black focus:outline-none focus:border-black text-sm"
            />
            <p className="text-xs text-black/60 mt-1">Custom webhook endpoint for alerts</p>
          </div>
        </div>
      </div>

      {/* Alert Preview */}
      <div className="bg-white border border-[#e5e5e5] p-6">
        <h3 className="text-lg font-semibold text-black mb-4">Alert Preview</h3>
        <div className="bg-[#fee2e2] border-2 border-[#dc2626] p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="text-[#dc2626] flex-shrink-0 mt-0.5" size={20} />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-semibold text-[#dc2626]">CRITICAL VIOLATION DETECTED</span>
                <span className="text-xs text-black/60">Just now</span>
              </div>
              <p className="text-sm text-black mb-2">
                Hallucination detected in AI response: "Python is a snake" when query was "what is python in programming"
              </p>
              <div className="flex items-center gap-4 text-xs text-black/60">
                <span>Status: BLOCKED</span>
                <span>Confidence: 37%</span>
                <span>Severity: CRITICAL</span>
              </div>
              {activeChannels.length > 0 && (
                <div className="mt-3 pt-3 border-t border-[#dc2626]">
                  <p className="text-xs text-black/60 mb-1">Alert would be sent to:</p>
                  <div className="flex items-center gap-2 flex-wrap">
                    {activeChannels.map((channel, idx) => (
                      <span key={idx} className="px-2 py-1 bg-white border border-[#dc2626] text-xs text-black">
                        {channel}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-black/60">
          Settings are saved locally for demo purposes
        </p>
        <button
          onClick={handleSave}
          className="px-6 py-2 bg-black text-white font-semibold hover:bg-black/90 transition-colors flex items-center gap-2"
        >
          {saved ? (
            <>
              <CheckCircle size={16} />
              <span>Saved</span>
            </>
          ) : (
            <span>Save Settings</span>
          )}
        </button>
      </div>
    </div>
  )
}

