'use client'

import { useChat } from '@ai-sdk/react'
import { useEffect, useRef, useState } from 'react'
import { SendIcon, Loader2Icon } from 'lucide-react'

export function ChatClient({ params, initialMessages = [] }: { params: { id: string }, initialMessages?: any[] }) {
  const [provider, setProvider] = useState('anthropic')
  const [model, setModel] = useState('claude-3-5-sonnet-20240620')
  const [endpoint, setEndpoint] = useState('')
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    setProvider(localStorage.getItem('preferredProvider') || 'anthropic')
    setModel(localStorage.getItem('preferredModel') || 'claude-3-5-sonnet-20240620')
    setEndpoint(localStorage.getItem('endpointOverride') || '')
    setIsInitialized(true)
  }, [])

  const [input, setInput] = useState('')
  const { messages, status, sendMessage, error } = useChat({ 
    id: params.id,
    messages: initialMessages,
    body: {
      threadId: params.id,
      provider,
      model,
      endpointOverride: endpoint
    }
  });

  useEffect(() => {
    console.log('[ChatClient] messages:', messages);
    console.log('[ChatClient] status:', status);
    if (error) {
      console.error('[ChatClient] error:', error);
    }
  }, [messages, status, error]);

  const isLoading = status === 'streaming' || status === 'submitted'

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return
    sendMessage(
      { text: input }
    )
    setInput('')
  }

  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    if (!isInitialized) return
    // Check if there's an initial message to send (from NewChatPage)
    const initialMsg = sessionStorage.getItem(`initial_msg_${params.id}`)
    if (initialMsg && messages.length === 0) {
      sessionStorage.removeItem(`initial_msg_${params.id}`)
      sendMessage(
        { text: initialMsg }
      )
    }
  }, [params.id, sendMessage, messages.length, provider, model, endpoint, isInitialized])

  return (
    <div className="flex flex-col h-full bg-zinc-50 relative">
      <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-8 pb-40">
        {messages.length === 0 && !isLoading && (
          <div className="text-center text-zinc-400 mt-20 font-medium">No messages yet.</div>
        )}
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] md:max-w-[75%] px-6 py-4 shadow-sm ${
                m.role === 'user'
                  ? 'bg-indigo-600 text-white rounded-3xl rounded-br-sm'
                  : 'bg-white border border-zinc-200 text-zinc-800 rounded-3xl rounded-bl-sm'
              }`}
            >
              <div className="whitespace-pre-wrap leading-relaxed">
                {m.parts
                  ? m.parts.map((p: any) => (p.type === 'text' ? p.text : '')).join('')
                  : (m as any).content}
              </div>
              
              {(m as any).toolInvocations?.length > 0 && (
                <div className="mt-4 space-y-2">
                  {(m as any).toolInvocations.map((toolInvocation: any) => {
                    const toolCallId = toolInvocation.toolCallId
                    const isCompleted = !!toolInvocation.result
                    
                    return (
                      <div key={toolCallId} className="flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-full bg-zinc-100 border border-zinc-200 text-zinc-600 w-fit">
                        {!isCompleted ? (
                          <Loader2Icon className="animate-spin text-indigo-500" size={14} />
                        ) : (
                          <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                        )}
                        <span>
                          {isCompleted ? 'Completed' : 'Running'}: <span className="font-mono text-[11px]">{toolInvocation.toolName}</span>
                        </span>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white border border-zinc-200 text-zinc-600 rounded-3xl rounded-bl-sm px-6 py-4 flex items-center gap-3 shadow-sm">
              <Loader2Icon className="animate-spin text-indigo-500" size={18} />
              <span className="font-medium text-sm">Thinking...</span>
            </div>
          </div>
        )}
        {error && (
          <div className="flex justify-center my-6">
            <div className="bg-red-50 text-red-700 rounded-2xl px-6 py-4 flex flex-col gap-2 border border-red-200 shadow-sm max-w-lg text-sm">
              <div className="flex items-center gap-3">
                <span className="font-bold">Error:</span>
                <span>{error.message || 'Something went wrong.'}</span>
              </div>
              <div className="text-xs text-red-600 mt-1">
                Hint: Check if you have enough credits and if your <strong>API Key</strong> is configured in <a href="/settings" className="underline font-medium">Settings</a>.
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 bg-gradient-to-t from-zinc-50 via-zinc-50 to-transparent pt-20">
        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSubmit} className="relative shadow-xl shadow-zinc-200/50 rounded-2xl bg-white border border-zinc-200 focus-within:ring-4 focus-within:ring-indigo-500/20 focus-within:border-indigo-400 transition-all duration-300">
            <input
              type="text"
              value={input}
              onChange={handleInputChange}
              placeholder="Message MicroManus..."
              className="w-full p-4 md:p-5 pr-14 rounded-2xl outline-none text-zinc-800 bg-transparent text-base placeholder-zinc-400 font-medium"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:hover:bg-indigo-600 transition-all active:scale-95 shadow-sm"
            >
              <SendIcon size={18} className={isLoading ? "animate-pulse" : ""} />
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
