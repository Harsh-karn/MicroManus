// @ts-nocheck
import { tool } from 'ai'
import { z } from 'zod'
import { jsPDF } from 'jspdf'
import { createClient } from '@supabase/supabase-js'

export const generatePdfReport = tool({

  description: 'Generate a PDF report from the gathered research and upload it. Returns a downloadable link.',
  parameters: z.object({
    title: z.string().describe('The title of the report'),
    content: z.string().describe('The main text content of the report. Should be comprehensive.'),
  } as any),
  execute: async ({ title, content }) => {
    try {
      const doc = new jsPDF()
      
      doc.setFontSize(22)
      doc.text(title, 20, 20)
      
      doc.setFontSize(12)
      const lines = doc.splitTextToSize(content, 170)
      doc.text(lines, 20, 30)
      
      const arrayBuffer = doc.output('arraybuffer')

      // Upload to Supabase Storage
      // We need to use service role to bypass RLS for server-side uploads or just user token
      // For simplicity in the tool, we'll use the service role key
      const supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://dummy.supabase.co',
        process.env.SUPABASE_SERVICE_ROLE_KEY || 'dummy_service_key'
      )

      const filename = `${Date.now()}-${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`
      
      const { data, error } = await supabaseAdmin
        .storage
        .from('reports')
        .upload(filename, arrayBuffer, {
          contentType: 'application/pdf',
        })

      if (error) {
        throw new Error(`Failed to upload PDF: ${error.message}`)
      }

      const { data: publicUrlData } = supabaseAdmin
        .storage
        .from('reports')
        .getPublicUrl(filename)

      return `Report generated successfully. Download here: ${publicUrlData.publicUrl}`
    } catch (error: any) {
      return `Failed to generate PDF: ${error.message}`
    }
  }
})
