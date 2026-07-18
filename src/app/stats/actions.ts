'use server'

import { createClient } from '@/lib/supabase/server'

export type ThreadStat = {
  id: string
  title: string
  created_at: string
  total_cost: number
  total_input_tokens: number
  total_output_tokens: number
  total_cache_tokens: number
}

export async function getStats(): Promise<ThreadStat[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return []

  const { data: threads, error: threadError } = await supabase
    .from('threads')
    .select('id, title, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (threadError || !threads) {
    console.error(threadError)
    return []
  }

  // Get aggregated messages
  const { data: messages, error: msgError } = await supabase
    .from('messages')
    .select('thread_id, cost_usd, input_tokens, output_tokens, cache_tokens')

  if (msgError) {
    console.error(msgError)
    return []
  }

  return threads.map((thread) => {
    const threadMessages = messages.filter((m) => m.thread_id === thread.id)
    
    return {
      id: thread.id,
      title: thread.title || 'Unknown',
      created_at: thread.created_at,
      total_cost: threadMessages.reduce((sum, m) => sum + Number(m.cost_usd || 0), 0),
      total_input_tokens: threadMessages.reduce((sum, m) => sum + (m.input_tokens || 0), 0),
      total_output_tokens: threadMessages.reduce((sum, m) => sum + (m.output_tokens || 0), 0),
      total_cache_tokens: threadMessages.reduce((sum, m) => sum + (m.cache_tokens || 0), 0),
    }
  })
}
