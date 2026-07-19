'use client'

import { PlusIcon, MessageSquareIcon } from 'lucide-react'
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
    <div className="flex h-full w-64 flex-col bg-gray-900 text-white">
      <div className="p-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-xl font-bold">MicroManus</h1>
          <div className="text-xs font-semibold bg-gray-800 px-2 py-1 rounded-full text-indigo-400">
            {credits} {credits === 1 ? 'Credit' : 'Credits'}
          </div>
        </div>
        <Link
          href="/"
          className="flex w-full items-center gap-2 rounded-md border border-gray-700 p-2 text-sm transition-colors hover:bg-gray-800"
        >
          <PlusIcon size={16} />
          New chat
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        <div className="text-xs font-semibold uppercase text-gray-500 mb-2 px-2">History</div>
        {threads.map((thread) => (
          <Link
            key={thread.id}
            href={`/chat/${thread.id}`}
            className={`flex w-full items-center gap-2 rounded-md p-2 text-sm transition-colors ${
              activeThreadId === thread.id ? 'bg-gray-800' : 'hover:bg-gray-800'
            }`}
          >
            <MessageSquareIcon size={16} />
            <span className="truncate">{thread.title || 'New Chat'}</span>
          </Link>
        ))}
      </div>

      <div className="p-4 border-t border-gray-800 space-y-2">
        <Link href="/stats" className="block text-sm text-gray-400 hover:text-white transition-colors">
          Usage Stats
        </Link>
        <Link href="/settings" className="block text-sm text-gray-400 hover:text-white transition-colors">
          Settings
        </Link>
      </div>
    </div>
  )
}
