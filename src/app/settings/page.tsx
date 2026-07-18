'use client'

import { useState, useEffect } from 'react'
import { saveApiKey, getApiKeysStatus } from './actions'
import { PRICING_TABLE, Provider } from '@/lib/pricing'

export default function SettingsPage() {
  const [provider, setProvider] = useState<Provider>('anthropic')
  const [apiKey, setApiKey] = useState('')
  const [endpoint, setEndpoint] = useState('')
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<Record<string, boolean>>({})
  const [selectedModel, setSelectedModel] = useState<string>('')

  // Load configured keys on mount
  useEffect(() => {
    getApiKeysStatus().then(setStatus)
    
    // Load preferred model from local storage if any
    const storedModel = localStorage.getItem('preferredModel')
    const storedProvider = localStorage.getItem('preferredProvider') as Provider
    if (storedProvider) setProvider(storedProvider)
    if (storedModel) setSelectedModel(storedModel)
  }, [])

  const availableModels = Object.values(PRICING_TABLE).filter(m => m.provider === provider)

  // Ensure a model is selected when provider changes
  useEffect(() => {
    if (availableModels.length > 0 && (!selectedModel || !availableModels.find(m => m.id === selectedModel))) {
      setSelectedModel(availableModels[0].id)
    }
  }, [provider, availableModels, selectedModel])

  const handleSaveModel = () => {
    localStorage.setItem('preferredProvider', provider)
    localStorage.setItem('preferredModel', selectedModel)
    if (endpoint) {
      localStorage.setItem('endpointOverride', endpoint)
    }
    alert('Model preferences saved locally. Will be used for new chats.')
  }

  const handleSaveKey = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    const formData = new FormData()
    formData.append('provider', provider)
    formData.append('apiKey', apiKey)
    if (endpoint) formData.append('endpoint', endpoint)

    const res = await saveApiKey(formData)
    
    if (res.error) {
      alert(res.error)
    } else {
      alert('API key saved securely!')
      setStatus({ ...status, [provider]: true })
      setApiKey('')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen p-8 bg-gray-50 flex justify-center">
      <div className="max-w-2xl w-full bg-white rounded-xl shadow-xl p-8 space-y-8 h-fit">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Settings</h2>
          <p className="mt-1 text-sm text-gray-500">Configure your API keys and select models.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-t pt-8">
          
          {/* Key Management */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">API Keys</h3>
            <form onSubmit={handleSaveKey} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Provider</label>
                <select
                  value={provider}
                  onChange={(e) => setProvider(e.target.value as Provider)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                >
                  <option value="anthropic">Anthropic {status.anthropic ? '(Configured)' : ''}</option>
                  <option value="openai">OpenAI {status.openai ? '(Configured)' : ''}</option>
                  <option value="kimi">Kimi / Moonshot {status.kimi ? '(Configured)' : ''}</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">API Key</label>
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder={status[provider] ? 'Saved! Enter new to update.' : 'sk-...'}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Endpoint Override (Optional)</label>
                <input
                  type="url"
                  value={endpoint}
                  onChange={(e) => setEndpoint(e.target.value)}
                  placeholder="https://api.openai.com/v1"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                />
              </div>

              <button
                type="submit"
                disabled={loading || !apiKey}
                className="w-full justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
              >
                Save Key to Vault
              </button>
            </form>
          </div>

          {/* Model Selection */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Default Model</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Select Model</label>
                <select
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                >
                  {availableModels.map(m => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>
              </div>
              <button
                onClick={handleSaveModel}
                className="w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                Set as Default for Chats
              </button>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  )
}
