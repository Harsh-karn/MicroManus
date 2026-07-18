// @ts-nocheck
import { tool } from 'ai'
import { z } from 'zod'

export const braveSearch = tool({
  description: 'Search the web using Brave Search API to gather information for research.',
  parameters: z.object({
    query: z.string().describe('The search query to look up on the web.'),
  }),
  execute: async ({ query }) => {
    try {
      const apiKey = process.env.BRAVE_SEARCH_API_KEY
      if (!apiKey) {
        throw new Error('Brave Search API key not configured.')
      }

      const res = await fetch(`https://api.search.brave.com/res/v1/web/search?q=${encodeURIComponent(query)}&count=5`, {
        headers: {
          'Accept': 'application/json',
          'Accept-Encoding': 'gzip',
          'X-Subscription-Token': apiKey
        }
      })

      if (!res.ok) {
        throw new Error(`Brave Search failed with status: ${res.status}`)
      }

      const data = await res.json()
      
      const results = data.web?.results?.map((r: any) => ({
        title: r.title,
        url: r.url,
        description: r.description,
      })) || []

      return JSON.stringify(results)
    } catch (error: any) {
      return JSON.stringify({ error: error.message })
    }
  }
})
