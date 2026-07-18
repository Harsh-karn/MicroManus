'use server'

import { createClient } from '@/lib/supabase/server'
import { encrypt } from '@/lib/crypto'
import { revalidatePath } from 'next/cache'

export async function saveApiKey(formData: FormData) {
  const provider = formData.get('provider') as string
  const apiKey = formData.get('apiKey') as string
  const endpoint = formData.get('endpoint') as string | null

  if (!provider || !apiKey) {
    return { error: 'Provider and API Key are required' }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  const encryptedKey = encrypt(apiKey)
  
  // We can also store the endpoint and selected model in the user_api_keys table or user profile.
  // For simplicity, we just store the encrypted key for now.
  const payload = {
    user_id: user.id,
    provider,
    encrypted_key: encryptedKey,
    // Add endpoint or other settings if we extend the schema later
  }

  const { error } = await supabase
    .from('user_api_keys')
    .upsert(payload, { onConflict: 'user_id,provider' })

  if (error) {
    console.error(error)
    return { error: 'Failed to save API key' }
  }

  revalidatePath('/settings')
  return { success: true }
}

export async function getApiKeysStatus() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return {}

  const { data } = await supabase
    .from('user_api_keys')
    .select('provider')
    .eq('user_id', user.id)

  const status: Record<string, boolean> = {
    openai: false,
    anthropic: false,
    kimi: false,
  }

  if (data) {
    data.forEach((row) => {
      status[row.provider] = true
    })
  }

  return status
}
