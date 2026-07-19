'use client'

import { useState, useEffect } from 'react'
import { saveApiKey, getApiKeysStatus } from './actions'
import { PRICING_TABLE, Provider } from '@/lib/pricing'
import { LogoutButton } from '@/components/LogoutButton'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function SettingsPage() {
  const [provider, setProvider] = useState<Provider>('anthropic')
  const [apiKey, setApiKey] = useState('')
  const [endpoint, setEndpoint] = useState('')
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<Record<string, boolean>>({})
  const [selectedModel, setSelectedModel] = useState<string>('')
  const router = useRouter()

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

  const handleSaveKey = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    setLoading(true)
    
    // Save model preference
    localStorage.setItem('preferredProvider', provider)
    localStorage.setItem('preferredModel', selectedModel)
    if (endpoint) {
      localStorage.setItem('endpointOverride', endpoint)
    }

    if (apiKey) {
      const formData = new FormData()
      formData.append('provider', provider)
      formData.append('apiKey', apiKey)
      if (endpoint) formData.append('endpoint', endpoint)

      const res = await saveApiKey(formData)
      
      if (res.error) {
        alert(res.error)
        setLoading(false)
        return false
      } else {
        setStatus({ ...status, [provider]: true })
        setApiKey('')
      }
    }
    
    setLoading(false)
    return true
  }

  const handleApplyAndGoBack = async () => {
    const success = await handleSaveKey()
    if (success) {
      router.push('/')
    }
  }

  return (
    <div className="min-h-screen p-4 md:p-8 bg-zinc-50 flex justify-center relative">
      <div className="absolute top-4 right-4 md:top-8 md:right-8 flex gap-4">
        <Link href="/" className="text-sm font-semibold text-zinc-700 hover:text-zinc-900 transition-colors bg-white px-4 py-2 rounded-xl shadow-sm border border-zinc-200">
          Back to Chat
        </Link>
        <LogoutButton />
      </div>
      <div className="max-w-3xl w-full bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-zinc-100 p-8 md:p-10 space-y-8 h-fit mt-16 md:mt-12">
        <div className="space-y-1">
          <h2 className="text-2xl font-extrabold text-zinc-900 tracking-tight">Configure API</h2>
          <p className="text-sm font-medium text-zinc-500">Add your API keys and select default models.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 border-t border-zinc-100 pt-8">
          
          {/* Key Management */}
          <div>
            <h3 className="text-lg font-bold text-zinc-900 mb-5">API Keys</h3>
            <form onSubmit={handleSaveKey} className="space-y-5">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-zinc-700">Provider</label>
                <select
                  value={provider}
                  onChange={(e) => setProvider(e.target.value as Provider)}
                  className="block w-full rounded-xl border-0 py-3 text-zinc-900 shadow-sm ring-1 ring-inset ring-zinc-200 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 px-4 bg-zinc-50/50"
                >
                  <option value="anthropic">Anthropic {status.anthropic ? '(Configured)' : ''}</option>
                  <option value="openai">OpenAI {status.openai ? '(Configured)' : ''}</option>
                  <option value="kimi">Kimi / Moonshot {status.kimi ? '(Configured)' : ''}</option>
                  <option value="gemini">Google Gemini {status.gemini ? '(Configured)' : ''}</option>
                  <option value="groq">Groq {status.groq ? '(Configured)' : ''}</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-zinc-700">API Key</label>
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder={status[provider] ? 'Saved! Enter new to update.' : 'sk-...'}
                  className="block w-full rounded-xl border-0 py-3 text-zinc-900 shadow-sm ring-1 ring-inset ring-zinc-200 placeholder:text-zinc-500 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 px-4 bg-zinc-50/50"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-zinc-700">Endpoint Override <span className="text-zinc-400 font-normal">(Optional)</span></label>
                <input
                  type="url"
                  value={endpoint}
                  onChange={(e) => setEndpoint(e.target.value)}
                  placeholder="https://api.openai.com/v1"
                  className="block w-full rounded-xl border-0 py-3 text-zinc-900 shadow-sm ring-1 ring-inset ring-zinc-200 placeholder:text-zinc-500 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 px-4 bg-zinc-50/50"
                />
              </div>

              <button
                type="submit"
                disabled={loading || (!apiKey && !status[provider])}
                className="w-full rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95 mt-2"
              >
                Save Key to Vault
              </button>
            </form>
          </div>

          {/* Model Selection */}
          <div>
            <h3 className="text-lg font-bold text-zinc-900 mb-5">Default Model</h3>
            <div className="space-y-5">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-zinc-700">Select Model</label>
                <select
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  className="block w-full rounded-xl border-0 py-3 text-zinc-900 shadow-sm ring-1 ring-inset ring-zinc-200 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 px-4 bg-zinc-50/50"
                >
                  {availableModels.map(m => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>
              </div>
              <button
                onClick={handleSaveModel}
                className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm font-semibold text-zinc-700 shadow-sm hover:bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1 transition-all active:scale-95"
              >
                Set as Default for Chats
              </button>
            </div>
            
            <div className="mt-8 border-t border-zinc-100 pt-8">
              <button
                onClick={handleApplyAndGoBack}
                disabled={loading}
                className="w-full rounded-xl bg-zinc-900 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:ring-offset-1 transition-all active:scale-95"
              >
                Apply & Back to Chat
              </button>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  )
}
