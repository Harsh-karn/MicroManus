import { ChatClient } from './ChatClient'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function ChatPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const supabase = await createClient()

  const { data: userData, error: userError } = await supabase.auth.getUser()
  if (userError || !userData.user) {
    redirect('/auth')
  }

  // Fetch messages for this thread
  const { data: messages, error } = await supabase
    .from('messages')
    .select('id, role, content, created_at')
    .eq('thread_id', resolvedParams.id)
    .order('created_at', { ascending: true })

  // Map messages to the format expected by useChat
  const initialMessages = (messages || []).map((msg) => ({
    id: msg.id,
    role: msg.role as 'user' | 'assistant' | 'system' | 'data',
    parts: [{ type: 'text', text: msg.content }],
  }))

  return (
    <ChatClient 
      params={resolvedParams} 
      initialMessages={initialMessages} 
    />
  )
}
