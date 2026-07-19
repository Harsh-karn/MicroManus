'use server'

import { createClient } from '@/lib/supabase/server'
import { stripe } from '@/lib/stripe'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'

export async function applyCoupon(formData: FormData) {
  const code = formData.get('code')
  
  if (code !== 'SID_DRDROID') {
    return { error: 'Invalid coupon code' }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  // Update credits using upsert in case the trigger didn't run
  const { error } = await supabase
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
