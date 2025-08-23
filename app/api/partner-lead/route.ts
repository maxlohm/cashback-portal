import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: Request) {
  const body = await req.json().catch(() => null)
  if (!body?.api_key || !body?.click_id) return NextResponse.json({ error: 'Bad Request' }, { status: 400 })

  const ip = (req.headers.get('x-forwarded-for') || '').split(',')[0] || 'unknown'
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

  // Rate limit: 1 per 5s per ip+click
  const { data: allowed, error: thrErr } = await supabase.rpc('throttle_touch', { p_key: `${ip}:${body.click_id}`, window_seconds: 5 })
  if (thrErr) return NextResponse.json({ error: thrErr.message }, { status: 500 })
  if (!allowed) return NextResponse.json({ error: 'Too Many Requests' }, { status: 429 })

  // Partner lookup
  const { data: partner, error: kErr } = await supabase.from('profiles').select('id, partner_subid').eq('id', body.api_key).single()
  if (kErr || !partner) return NextResponse.json({ error: 'Invalid api_key' }, { status: 401 })

  // Click exists & belongs to partner
  const { data: click, error: cErr } = await supabase.from('clicks').select('id, influencer_id').eq('id', body.click_id).single()
  if (cErr || !click) return NextResponse.json({ error: 'click_not_found' }, { status: 404 })
  if (click.influencer_id !== partner.id) return NextResponse.json({ error: 'click_not_owned' }, { status: 403 })

  // Lead idempotent eintragen
  const amount = typeof body.amount === 'number' && body.amount >= 0 ? body.amount : null
  const { data: leadExisting } = await supabase.from('leads').select('id').eq('click_id', body.click_id).maybeSingle()
  if (leadExisting) return NextResponse.json({ ok: true, status: 'exists' }, { status: 200 })

  const { error: insErr } = await supabase.from('leads').insert({
    click_id: body.click_id, confirmed: true, confirmed_at: new Date().toISOString(),
    amount, payout_ready: true
  })
  if (insErr) return NextResponse.json({ error: insErr.message }, { status: 500 })

  return NextResponse.json({ ok: true }, { status: 201 })
}
