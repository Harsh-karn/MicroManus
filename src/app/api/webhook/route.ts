import { stripe } from '@/lib/stripe'
import { createClient } from '@supabase/supabase-js'
import { headers } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const body = await req.text()
  const signature = (await headers()).get('Stripe-Signature') as string

  let event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (error: any) {
    return new NextResponse(`Webhook Error: ${error.message}`, { status: 400 })
  }

  const session = event.data.object as any

  if (event.type === 'checkout.session.completed') {
    const userId = session.client_reference_id

    if (userId) {
      // Use service role key to bypass RLS and update credits
      const supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://dummy.supabase.co',
        process.env.SUPABASE_SERVICE_ROLE_KEY || 'dummy_service_key'
      )

      const { error } = await supabaseAdmin
        .from('users')
        .update({ credits: 5, has_paid: true })
        .eq('id', userId)

      if (error) {
        console.error('Error updating user credits:', error)
        return new NextResponse('Database Error', { status: 500 })
      }
    }
  }

  return new NextResponse(null, { status: 200 })
}
