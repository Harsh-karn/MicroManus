'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createThread } from './actions'
import { SendIcon } from 'lucide-react'

export default function NewChatPage() {
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || loading) return

    setLoading(true)
    try {
      const thread = await createThread(input.slice(0, 40) + '...')
      // We pass the initial message via a query parameter or localStorage
      // so the chat page can immediately send it.
      sessionStorage.setItem(`initial_msg_${thread.id}`, input)
      router.push(`/chat/${thread.id}`)
    } catch (error) {
      console.error(error)
      setLoading(false)
    }
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4 h-full">
      <div className="max-w-2xl w-full space-y-8 text-center">
        <h2 className="text-4xl font-bold text-gray-800 mb-8">What do you want to research today?</h2>
        
        <form onSubmit={handleSubmit} className="relative shadow-lg rounded-2xl bg-white border border-gray-200 focus-within:ring-2 focus-within:ring-indigo-500">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask MicroManus to research anything..."
            className="w-full p-4 pr-12 rounded-2xl outline-none text-gray-700 bg-transparent"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-colors"
          >
            <SendIcon size={18} />
          </button>
        </form>
      </div>
    </div>
  )
}
