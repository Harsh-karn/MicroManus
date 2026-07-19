'use client'

import { useChat } from '@ai-sdk/react'
import { useEffect, useRef, useState } from 'react'
import { SendIcon, Loader2Icon } from 'lucide-react'

export default function ChatPage({ params }: { params: { id: string } }) {
  const [provider, setProvider] = useState('anthropic')
  const [model, setModel] = useState('claude-3-5-sonnet-20240620')
  const [endpoint, setEndpoint] = useState('')

  useEffect(() => {
    setProvider(localStorage.getItem('preferredProvider') || 'anthropic')
    setModel(localStorage.getItem('preferredModel') || 'claude-3-5-sonnet-20240620')
    setEndpoint(localStorage.getItem('endpointOverride') || '')
  }, [])

  const [input, setInput] = useState('')
  const { messages, status, sendMessage, error } = useChat()

  const isLoading = status === 'streaming' || status === 'submitted'

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return
    sendMessage(
      { role: 'user', parts: [{ type: 'text', text: input }] },
      {
        body: {
          threadId: params.id,
          provider,
          model,
          endpointOverride: endpoint
        }
      }
    )
    setInput('')
  }

  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    // Check if there's an initial message to send (from NewChatPage)
    const initialMsg = sessionStorage.getItem(`initial_msg_${params.id}`)
    if (initialMsg && messages.length === 0) {
      sessionStorage.removeItem(`initial_msg_${params.id}`)
      sendMessage(
        { role: 'user', parts: [{ type: 'text', text: initialMsg }] },
        {
          body: {
            threadId: params.id,
            provider,
            model,
            endpointOverride: endpoint
          }
        }
      )
    }
  }, [params.id, sendMessage, messages.length, provider, model, endpoint])

  return (
    <div className="flex flex-col h-full bg-white relative">
      <div className="flex-1 overflow-y-auto p-4 space-y-6 pb-32">
        {messages.length === 0 && !isLoading && (
          <div className="text-center text-gray-500 mt-20">No messages yet.</div>
        )}
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-2xl px-5 py-3 ${
                m.role === 'user'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              <div className="whitespace-pre-wrap">
                {m.parts
                  ? m.parts.map((p: any) => (p.type === 'text' ? p.text : '')).join('')
                  : (m as any).content}
              </div>
              
              {(m as any).toolInvocations?.map((toolInvocation: any) => {
                const toolCallId = toolInvocation.toolCallId
                const message = toolInvocation.result
                  ? `Completed: ${toolInvocation.toolName}`
                  : `Calling: ${toolInvocation.toolName}...`
                return (
                  <div key={toolCallId} className="mt-2 text-xs opacity-75 bg-black/10 rounded p-2 font-mono">
                    {message}
                  </div>
                )
              })}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 text-gray-800 rounded-2xl px-5 py-3 flex items-center gap-2">
              <Loader2Icon className="animate-spin" size={16} />
              Thinking...
            </div>
          </div>
        )}
        {error && (
          <div className="flex justify-center my-4">
            <div className="bg-red-50 text-red-600 rounded-2xl px-5 py-3 flex items-center gap-2 border border-red-200">
              <span className="font-semibold">Error:</span>
              {error.message || 'Something went wrong. Do you have enough credits?'}
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-white via-white to-transparent">
        <div className="max-w-3xl mx-auto">
          <form onSubmit={handleSubmit} className="relative shadow-lg rounded-2xl bg-white border border-gray-200 focus-within:ring-2 focus-within:ring-indigo-500">
            <input
              type="text"
              value={input}
              onChange={handleInputChange}
              placeholder="Message MicroManus..."
              className="w-full p-4 pr-12 rounded-2xl outline-none text-gray-700 bg-transparent"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-colors"
            >
              <SendIcon size={18} />
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
