'use server'

import { createClient } from '@/lib/supabase/server'
import { stripe } from '@/lib/stripe'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'

export async function applyCoupon(formData: FormData) {
  const code = formData.get('code')
  
  if (typeof code !== 'string' || code.trim().toUpperCase() !== 'SID_DRDROID') {
    return { error: 'Invalid coupon code' }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  // Use service role key to bypass RLS for credit update/insert
  const { createClient: createAdminClient } = await import('@supabase/supabase-js')
  const supabaseAdmin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://dummy.supabase.co',
    process.env.SUPABASE_SERVICE_ROLE_KEY || 'dummy_service_key'
  )

  const { error } = await supabaseAdmin
    .from('users')
    .upsert({ id: user.id, email: user.email, credits: 5, has_paid: true }, { onConflict: 'id' })

  if (error) {
    console.error(error)
    return { error: 'Failed to apply coupon' }
  }

  redirect('/')
}

export async function createCheckoutSession() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  const origin = (await headers()).get('origin') || 'http://localhost:3000'

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'MicroManus 5 Credits',
            },
            unit_amount: 500, // $5.00
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${origin}/paywall/success`,
      cancel_url: `${origin}/paywall`,
      client_reference_id: user.id,
      customer_email: user.email,
    })

    if (session.url) {
      redirect(session.url)
    }
  } catch (err: any) {
    console.error(err)
    return { error: err.message }
  }
}
