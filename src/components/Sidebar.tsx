'use client'

import { PlusIcon, MessageSquareIcon, KeyIcon, BarChart2Icon, LogOutIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

type Thread = {
  id: string
  title: string
  created_at: string
}

export function Sidebar({ threads, activeThreadId, credits }: { threads: Thread[], activeThreadId?: string, credits: number }) {
  const router = useRouter()

  return (
    <div className="flex h-full w-[280px] flex-col bg-zinc-950 text-zinc-100 shadow-2xl z-20 border-r border-zinc-900">
      <div className="p-5">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-xl font-bold tracking-tight text-white">MicroManus</h1>
          <div className="text-[11px] font-medium bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-1 rounded-full text-indigo-300 shadow-inner">
            {credits} {credits === 1 ? 'Credit' : 'Credits'}
          </div>
        </div>
        <Link
          href="/"
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 p-2.5 text-sm font-medium text-white shadow-md transition-all active:scale-95"
        >
          <PlusIcon size={16} />
          New Chat
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-0.5">
        <div className="text-[11px] font-semibold tracking-wider text-zinc-500 mb-3 px-3 mt-2">CHAT HISTORY</div>
        {threads.map((thread) => (
          <Link
            key={thread.id}
            href={`/chat/${thread.id}`}
            className={`group flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all duration-200 ${
              activeThreadId === thread.id 
                ? 'bg-zinc-800/80 text-white shadow-sm' 
                : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-100'
            }`}
          >
            <MessageSquareIcon size={16} className={`shrink-0 ${activeThreadId === thread.id ? 'text-indigo-400' : 'text-zinc-500 group-hover:text-zinc-400 transition-colors'}`} />
            <span className="truncate font-medium">{thread.title || 'New Chat'}</span>
          </Link>
        ))}
      </div>

      <div className="p-4 border-t border-zinc-900 space-y-2">
        <Link href="/settings" className="flex w-full items-center gap-2 text-sm font-medium text-indigo-300 hover:text-indigo-200 transition-all px-3 py-2.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 hover:bg-indigo-500/20 shadow-sm mb-1">
          <KeyIcon size={16} />
          Configure your API
        </Link>
        <Link href="/stats" className="flex items-center gap-2 text-sm font-medium text-zinc-400 hover:text-white transition-colors px-3 py-2 rounded-lg hover:bg-zinc-900">
          <BarChart2Icon size={16} />
          Usage Stats
        </Link>
        <button 
          onClick={async () => {
            const { signOut } = await import('@/app/(chat)/actions')
            await signOut()
          }} 
          className="flex w-full items-center gap-2 text-left text-sm font-medium text-red-400 hover:text-red-300 transition-colors px-3 py-2 rounded-lg hover:bg-red-500/10"
        >
          <LogOutIcon size={16} />
          Log Out
        </button>
      </div>
    </div>
  )
}
