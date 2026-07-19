'use client'

import { createClient } from '@/lib/supabase/client'
import { useState } from 'react'

export default function LoginPage() {
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const handleLogin = async (provider: 'github' | 'google') => {
    try {
      setLoading(true)
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })
      if (error) throw error
    } catch (error) {
      console.error(error)
      alert('Error logging in!')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4">
      <div className="w-full max-w-md space-y-10 rounded-3xl bg-white p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-zinc-100">
        <div className="text-center space-y-3">
          <div className="mx-auto w-12 h-12 bg-indigo-600 rounded-xl mb-6 shadow-lg shadow-indigo-600/20 flex items-center justify-center">
            <span className="text-white font-bold text-xl font-serif">M</span>
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight text-zinc-900">
            MicroManus
          </h2>
          <p className="text-sm font-medium text-zinc-500">
            Your personal deep research AI agent
          </p>
        </div>
        <div className="space-y-4 pt-4">
          <button
            onClick={() => handleLogin('google')}
            disabled={loading}
            className="group relative flex w-full justify-center rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm font-medium text-zinc-700 hover:bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1 disabled:opacity-50 transition-all active:scale-95 shadow-sm"
          >
            Continue with Google
          </button>
          <button
            onClick={() => handleLogin('github')}
            disabled={loading}
            className="group relative flex w-full justify-center rounded-xl border border-transparent bg-zinc-900 px-4 py-3 text-sm font-medium text-white hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:ring-offset-1 disabled:opacity-50 transition-all active:scale-95 shadow-sm"
          >
            Continue with GitHub
          </button>
        </div>
      </div>
    </div>
  )
}
