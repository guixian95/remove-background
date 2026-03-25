import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const outTradeNo = searchParams.get('outTradeNo')

  if (!outTradeNo) {
    return NextResponse.json({ error: 'Missing outTradeNo' }, { status: 400 })
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: payment, error } = await supabase
    .from('payments')
    .select('*')
    .eq('stripe_checkout_session_id', outTradeNo)
    .eq('user_id', user.id)
    .single()

  if (error || !payment) {
    return NextResponse.json({ status: 'pending' })
  }

  return NextResponse.json({ status: payment.status })
}
