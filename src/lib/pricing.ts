export type Provider = 'openai' | 'anthropic' | 'kimi' | 'gemini' | 'groq'

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
  'claude-3-5-sonnet-20241022': {
    id: 'claude-3-5-sonnet-20241022',
    name: 'Claude 3.5 Sonnet (Latest)',
    provider: 'anthropic',
    input_per_1m: 3.0,
    output_per_1m: 15.0,
    cache_read_per_1m: 0.3,
  },
  'claude-3-5-haiku-20241022': {
    id: 'claude-3-5-haiku-20241022',
    name: 'Claude 3.5 Haiku',
    provider: 'anthropic',
    input_per_1m: 1.0,
    output_per_1m: 5.0,
    cache_read_per_1m: 0.1,
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
    cache_read_per_1m: 2.5,
  },
  'gpt-4o-mini': {
    id: 'gpt-4o-mini',
    name: 'GPT-4o mini',
    provider: 'openai',
    input_per_1m: 0.15,
    output_per_1m: 0.60,
    cache_read_per_1m: 0.075,
  },
  'o1-mini': {
    id: 'o1-mini',
    name: 'o1-mini',
    provider: 'openai',
    input_per_1m: 3.0,
    output_per_1m: 12.0,
    cache_read_per_1m: 1.5,
  },
  // Kimi (Moonshot) Models
  'moonshot-v1-8k': {
    id: 'moonshot-v1-8k',
    name: 'Moonshot v1 8K',
    provider: 'kimi',
    input_per_1m: 1.6,
    output_per_1m: 1.6,
    cache_read_per_1m: 0.0,
  },
  'moonshot-v1-32k': {
    id: 'moonshot-v1-32k',
    name: 'Moonshot v1 32K',
    provider: 'kimi',
    input_per_1m: 3.2,
    output_per_1m: 3.2,
    cache_read_per_1m: 0.0,
  },
  // Gemini Models
  'gemini-1.5-pro-latest': {
    id: 'gemini-1.5-pro-latest',
    name: 'Gemini 1.5 Pro',
    provider: 'gemini',
    input_per_1m: 3.5, // approx based on >128k vs <128k
    output_per_1m: 10.5,
    cache_read_per_1m: 0.875,
  },
  'gemini-2.0-flash-exp': {
    id: 'gemini-2.0-flash-exp',
    name: 'Gemini 2.0 Flash (Exp)',
    provider: 'gemini',
    input_per_1m: 0.0, // free while in exp usually, but lets set a nominal or standard flash pricing
    output_per_1m: 0.0,
    cache_read_per_1m: 0.0,
  },
  'gemini-1.5-flash-latest': {
    id: 'gemini-1.5-flash-latest',
    name: 'Gemini 1.5 Flash',
    provider: 'gemini',
    input_per_1m: 0.075,
    output_per_1m: 0.3,
    cache_read_per_1m: 0.01875,
  },
  // Groq Models
  'llama-3.3-70b-versatile': {
    id: 'llama-3.3-70b-versatile',
    name: 'Llama 3.3 70B (Groq)',
    provider: 'groq',
    input_per_1m: 0.59,
    output_per_1m: 0.79,
    cache_read_per_1m: 0.0,
  },
  'mixtral-8x7b-32768': {
    id: 'mixtral-8x7b-32768',
    name: 'Mixtral 8x7b (Groq)',
    provider: 'groq',
    input_per_1m: 0.24,
    output_per_1m: 0.24,
    cache_read_per_1m: 0.0,
  },
}
