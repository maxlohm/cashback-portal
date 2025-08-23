// app/api/me/payout-request/route.ts
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'

export async function POST(req: Request) {
  const supabase = createRouteHandlerClient({ cookies })

  // Auth
  const { data: userRes } = await supabase.auth.getUser()
  const user = userRes?.user
  if (!user) return NextResponse.json({ error: 'not_authenticated' }, { status: 401 })

  // Body (optional): { min_amount?: number }
  let min_amount = 5
  try {
    const body = await req.json().catch(() => ({}))
    if (body && typeof body.min_amount === 'number') min_amount = body.min_amount
  } catch {}

  // Rate-Limit: 1 Request / 60s je User
  const rlKey = `payout:${user.id}`
  const { data: okRate, error: rlErr } = await supabase.rpc('throttle_touch', {
    p_key: rlKey,
    window_seconds: 60,
  })
  if (rlErr) {
    // Falls throttle_touch fehlt/fehlschlägt, lieber nicht blocken:
    console.warn('throttle_touch error', rlErr.message)
  } else if (okRate === false) {
    return NextResponse.json({ error: 'rate_limited' }, { status: 429 })
  }

  // RPC
  const { data, error } = await supabase.rpc('create_redemption_request', { min_amount })
  if (error) {
    const msg = String(error.message || '').toLowerCase()
    if (msg.includes('payout_in_progress')) return NextResponse.json({ error: 'payout_in_progress' }, { status: 409 })
    if (msg.includes('amount_below_minimum')) return NextResponse.json({ error: 'amount_below_minimum' }, { status: 400 })
    if (msg.includes('not_authenticated')) return NextResponse.json({ error: 'not_authenticated' }, { status: 401 })
    return NextResponse.json({ error: 'unknown_error', detail: error.message }, { status: 500 })
  }

  const row = Array.isArray(data) ? data[0] : data
  return NextResponse.json(
    { ok: true, redemption_id: row?.redemption_id, amount: row?.amount },
    { status: 201 }
  )
}
