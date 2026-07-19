// @ts-nocheck
import { tool } from 'ai'
import { z } from 'zod'

export const webSearch = tool({
  description: 'Search the web using SERP API to gather information for research.',
  parameters: z.object({
    query: z.string().describe('The search query to look up on the web.'),
  }),
  execute: async ({ query }) => {
    try {
      const apiKey = process.env.SERP_API_KEY
      if (!apiKey) {
        throw new Error('SERP API key not configured.')
      }

      const res = await fetch(`https://serpapi.com/search.json?q=${encodeURIComponent(query)}&api_key=${apiKey}&engine=google&num=5`)

      if (!res.ok) {
        throw new Error(`SERP API failed with status: ${res.status}`)
      }

      const data = await res.json()
      
      const results = data.organic_results?.map((r: any) => ({
        title: r.title,
        url: r.link,
        description: r.snippet,
      })) || []

      return JSON.stringify(results)
    } catch (error: any) {
      return JSON.stringify({ error: error.message })
    }
  }
})
