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

  try {
    // Use service role key to bypass RLS
    const { createClient: createAdminClient } = await import('@supabase/supabase-js')
    const supabaseAdmin = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Check if user row already exists
    const { data: existingUser } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('id', user.id)
      .single()

    let dbError
    if (existingUser) {
      // Row exists → update it
      const { error } = await supabaseAdmin
        .from('users')
        .update({ credits: 5, has_paid: true })
        .eq('id', user.id)
      dbError = error
    } else {
      // Row doesn't exist → insert it
      const { error } = await supabaseAdmin
        .from('users')
        .insert({
          id: user.id,
          email: user.email || '',
          provider: 'github',
          credits: 5,
          has_paid: true,
        })
      dbError = error
    }

    if (dbError) {
      console.error('Supabase coupon error:', dbError)
      return { error: `DB Error: ${dbError.message}` }
    }
  } catch (err: any) {
    console.error('Coupon exception:', err)
    return { error: `Exception: ${err.message}` }
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
