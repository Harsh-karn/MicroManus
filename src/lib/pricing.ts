export type Provider = 'openai' | 'anthropic' | 'kimi'

export interface ModelPricing {
  id: string
  name: string
  provider: Provider
  input_per_1m: number
  output_per_1m: number
  cache_read_per_1m: number // For models that support prompt caching
}

export const PRICING_TABLE: Record<string, ModelPricing> = {
  // Anthropic Models
  'claude-3-5-sonnet-20240620': {
    id: 'claude-3-5-sonnet-20240620',
    name: 'Claude 3.5 Sonnet',
    provider: 'anthropic',
    input_per_1m: 3.0,
    output_per_1m: 15.0,
    cache_read_per_1m: 0.3,
  },
  'claude-3-opus-20240229': {
    id: 'claude-3-opus-20240229',
    name: 'Claude 3 Opus',
    provider: 'anthropic',
    input_per_1m: 15.0,
    output_per_1m: 75.0,
    cache_read_per_1m: 1.5,
  },
  // OpenAI Models
  'gpt-4o': {
    id: 'gpt-4o',
    name: 'GPT-4o',
    provider: 'openai',
    input_per_1m: 5.0,
    output_per_1m: 15.0,
    cache_read_per_1m: 2.5, // Discounted input tokens for cache
  },
  'gpt-4o-mini': {
    id: 'gpt-4o-mini',
    name: 'GPT-4o mini',
    provider: 'openai',
    input_per_1m: 0.15,
    output_per_1m: 0.60,
    cache_read_per_1m: 0.075,
  },
  // Kimi (Moonshot) Models
  'moonshot-v1-8k': {
    id: 'moonshot-v1-8k',
    name: 'Moonshot v1 8K',
    provider: 'kimi',
    input_per_1m: 1.6, // ~$1.67 per 1M (estimate, typically billed in RMB)
    output_per_1m: 1.6,
    cache_read_per_1m: 0.0, // Assuming no cache discount published
  },
}
