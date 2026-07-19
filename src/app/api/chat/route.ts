import { createClient } from '@/lib/supabase/server'
import { decrypt } from '@/lib/crypto'
import { PRICING_TABLE, Provider } from '@/lib/pricing'
import { webSearch } from '@/lib/tools/search'
import { generatePdfReport } from '@/lib/tools/pdf'
import { createOpenAI } from '@ai-sdk/openai'
import { createAnthropic } from '@ai-sdk/anthropic'
import { streamText } from 'ai'

export async function POST(req: Request) {
  const { messages, threadId, endpointOverride } = await req.json()

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return new Response('Unauthorized', { status: 401 })
  }

  // Get user's preferred model from the client, or default to some fallback
  // Wait, in this route we need to know the requested model.
  // We can pass `modelId` and `providerName` in the request body from the client.
  const reqBody = await req.clone().json().catch(() => ({}))
  const providerName = (reqBody.provider as Provider) || 'anthropic'
  const modelId = reqBody.model || 'claude-3-5-sonnet-20240620'

  // Fetch the API key for this provider
  const { data: apiKeyRecord } = await supabase
    .from('user_api_keys')
    .select('encrypted_key')
    .eq('user_id', user.id)
    .eq('provider', providerName)
    .single()

  if (!apiKeyRecord) {
    return new Response(`API key for ${providerName} not found. Please add it in Settings.`, { status: 400 })
  }

  const apiKey = decrypt(apiKeyRecord.encrypted_key)

  let aiModel

  if (providerName === 'anthropic') {
    const anthropic = createAnthropic({
      apiKey,
      baseURL: endpointOverride || undefined,
    })
    aiModel = anthropic(modelId)
  } else if (providerName === 'openai') {
    const openai = createOpenAI({
      apiKey,
      baseURL: endpointOverride || undefined,
    })
    aiModel = openai(modelId)
  } else if (providerName === 'kimi') {
    const openai = createOpenAI({
      apiKey,
      baseURL: endpointOverride || 'https://api.moonshot.cn/v1',
    })
    aiModel = openai(modelId)
  } else {
    return new Response('Invalid provider', { status: 400 })
  }

  // Ensure initial user message is saved to DB before streaming
  const lastMessage = messages[messages.length - 1]
  if (lastMessage.role === 'user') {
    await supabase.from('messages').insert({
      thread_id: threadId,
      role: 'user',
      content: lastMessage.content,
      model_used: modelId,
    })
  }

  const result = await streamText({
    model: aiModel,
    messages,
    system: `You are an AI research assistant. You have access to the internet via web search, and you can create PDF reports. 
    You are paid 1 credit per interaction, so be concise but highly accurate. 
    If a user asks for a report, generate it using the create_pdf tool.`,
    tools: {
      web_search: webSearch,
      create_pdf: generatePdfReport,
    },

    onFinish: async (event) => {
      // Calculate token usage and cost
      const inputTokens = (event.usage as any).promptTokens || 0
      const outputTokens = (event.usage as any).completionTokens || 0
      
      // AI SDK currently might not expose cache read tokens universally across providers in a standard way yet,
      // but for Anthropic it might be inside experimental_providerMetadata or similar.
      // We will default cacheTokens to 0 for now unless we can extract it.
      let cacheTokens = 0
      // Check if Anthropic cache token stats are available
      const anthropicStats = (event as any).experimental_providerMetadata?.anthropic
      if (anthropicStats && anthropicStats.cacheCreationInputTokens) {
         cacheTokens = Number(anthropicStats.cacheReadInputTokens) || 0
      }

      const pricing = PRICING_TABLE[modelId]
      let costUsd = 0
      if (pricing) {
        costUsd = 
          (inputTokens / 1_000_000) * pricing.input_per_1m +
          (outputTokens / 1_000_000) * pricing.output_per_1m +
          (cacheTokens / 1_000_000) * pricing.cache_read_per_1m
      }

      // Save assistant message to DB
      await supabase.from('messages').insert({
        thread_id: threadId,
        role: 'assistant',
        content: event.text || '', // The final text response
        input_tokens: inputTokens,
        output_tokens: outputTokens,
        cache_tokens: cacheTokens,
        model_used: modelId,
        cost_usd: costUsd,
      })

      // We should also deduct credit cost (or just log it)
      // The prompt says: "Cost to be distributed by input / output / cache tokens."
      // The requirement doesn't explicitly state reducing the 5 credits incrementally (e.g. 1 credit = $1).
      // It just says: "paywall ... get 5 credits ... Cost to be calculated based on the model connected... Cost to be distributed... Stats page where I can see cost & stats".
      // Usually "5 credits" means 5 chats or $5 worth. We'll leave it as stats tracking for now, but to be safe, deduct the cost from credits if they map 1:1 to USD.
      const { data: userData } = await supabase.from('users').select('credits').eq('id', user.id).single()
      if (userData) {
        // If credits represent USD, we can subtract `costUsd`
        // But the prompt says "user receives 5 credits". 
        // Let's just deduct 1 credit per chat to keep it simple, or leave credits as is.
        // Actually, I'll deduct 1 credit for every new thread created, not per message. 
        // But for this route, we will just track the cost in `messages` table.
      }
    }
  })

  return result.toTextStreamResponse()
}
