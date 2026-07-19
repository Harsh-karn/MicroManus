import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const { code } = await req.json()

    if (typeof code !== 'string' || code.trim().toUpperCase() !== 'SID_DRDROID') {
      return NextResponse.json({ error: 'Invalid coupon code' }, { status: 400 })
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // Use service role key to bypass RLS
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
      const { error } = await supabaseAdmin
        .from('users')
        .update({ credits: 5, has_paid: true })
        .eq('id', user.id)
      dbError = error
    } else {
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
      return NextResponse.json({ error: `DB: ${dbError.message} (code: ${dbError.code})` }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('Coupon route exception:', err)
    return NextResponse.json({ error: `Server error: ${err.message}` }, { status: 500 })
  }
}
