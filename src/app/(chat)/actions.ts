'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getThreads() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data: threads, error } = await supabase
    .from('threads')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching threads:', error)
    return []
  }

  return threads || []
}

export async function getCredits() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return 0

  const { data } = await supabase
    .from('users')
    .select('credits')
    .eq('id', user.id)
    .single()

  return data?.credits || 0
}

export async function createThread(title: string = 'New Chat') {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('threads')
    .insert({ user_id: user.id, title })
    .select()
    .single()

  if (error) {
    console.error('Error creating thread:', error)
    throw new Error('Failed to create thread')
  }

  revalidatePath('/')
  return data
}

import { redirect } from 'next/navigation'

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}
