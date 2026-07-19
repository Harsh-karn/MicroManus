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
    <div className="flex-1 flex flex-col items-center justify-center p-6 h-full bg-zinc-50/50">
      <div className="max-w-3xl w-full space-y-10 text-center -mt-20">
        <div className="space-y-4">
          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-zinc-900">
            What do you want to <span className="text-indigo-600">research</span> today?
          </h2>
          <p className="text-lg text-zinc-500">Ask MicroManus to explore the web and generate comprehensive reports.</p>
        </div>
        
        <form onSubmit={handleSubmit} className="relative shadow-xl shadow-zinc-200/50 rounded-2xl bg-white border border-zinc-200 focus-within:ring-4 focus-within:ring-indigo-500/20 focus-within:border-indigo-400 transition-all duration-300 mx-auto max-w-2xl">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="E.g., What are the latest advancements in quantum computing?"
            className="w-full p-5 pr-14 rounded-2xl outline-none text-zinc-800 bg-transparent text-lg placeholder-zinc-400 font-medium"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:hover:bg-indigo-600 transition-all active:scale-95 shadow-sm"
          >
            <SendIcon size={20} className={loading ? "animate-pulse" : ""} />
          </button>
        </form>
      </div>
    </div>
  )
}
