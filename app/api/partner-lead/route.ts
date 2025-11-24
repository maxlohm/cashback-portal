// app/api/partner-lead/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// gemeinsame Logik für GET + POST
async function handlePartnerLead(req: Request) {
  const method = req.method.toUpperCase()

  let api_key: string | null = null
  let subid: string | null = null
  let click_id: string | null = null
  let amount: number | null = null

  // --- 1) Eingaben einlesen (GET-Query oder JSON-Body) ---
  if (method === 'GET') {
    const url = new URL(req.url)
    api_key = url.searchParams.get('api_key')
    subid = url.searchParams.get('subid')
    const amountRaw = url.searchParams.get('amount')
    amount = amountRaw != null ? Number(amountRaw) : null
  } else if (method === 'POST') {
    const body = await req.json().catch(() => null)
    if (body) {
      api_key = body.api_key ?? null
      subid = body.subid ?? null
      click_id = body.click_id ?? null

      if (typeof body.amount === 'number') amount = body.amount
      if (typeof body.amount === 'string') amount = Number(body.amount)
    }
  }

  // api_key + subid oder click_id müssen vorhanden sein
  if (!api_key || (!subid && !click_id)) {
    return NextResponse.json({ error: 'missing_params' }, { status: 400 })
  }

  // amount ist der Gesamtbetrag vom Netzwerk (FinanceAds etc.)
  // Wenn kein amount mitkommt, setzen wir ihn auf 0, aber wir lassen den Lead trotzdem durch
  const safeAmount = amount != null && !Number.isNaN(amount) && amount >= 0 ? amount : 0

  // --- 2) Rate Limit: 1 / 5s pro ip+subid/click_id ---
  const ip =
    (req.headers.get('x-forwarded-for') || '').split(',')[0]?.trim() ||
    'unknown'
  const throttleKey = `${ip}:${subid || click_id || 'unknown'}`

  const { data: allowed, error: thrErr } = await supabase.rpc('throttle_touch', {
    p_key: throttleKey,
    window_seconds: 5,
  })

  if (thrErr) {
    return NextResponse.json({ error: thrErr.message }, { status: 500 })
  }

  if (!allowed) {
    // lieber 200 zurückgeben, damit Netzwerke nicht meckern
    return NextResponse.json({ status: 'rate_limited' }, { status: 200 })
  }

  // --- 3) Netzwerk anhand api_key validieren (affiliate_networks) ---
  const { data: network, error: netErr } = await supabase
    .from('affiliate_networks')
    .select('id, name, active')
    .eq('api_key', api_key)
    .eq('active', true)
    .maybeSingle()

  if (netErr || !network) {
    return NextResponse.json({ error: 'invalid_api_key' }, { status: 401 })
  }

  // --- 4) passenden Click finden (primär über subid, optional über click_id) ---
  let click: { id: string; user_id: string; offer_id: string; influencer_id: string } | null =
    null

  if (subid) {
    const { data, error } = await supabase
      .from('clicks')
      .select('id, user_id, offer_id, influencer_id')
      .eq('subid_token', subid)
      .maybeSingle()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    click = data
  } else if (click_id) {
    const { data, error } = await supabase
      .from('clicks')
      .select('id, user_id, offer_id, influencer_id')
      .eq('id', click_id)
      .maybeSingle()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    click = data
  }

  if (!click) {
    // für Netzwerk-Tests lieber 200 zurückgeben statt 4xx
    return NextResponse.json({ status: 'click_not_found' }, { status: 200 })
  }

  // --- 5) Lead idempotent anlegen (pro click nur ein Lead) ---
  const { data: existingLead, error: existErr } = await supabase
    .from('leads')
    .select('id')
    .eq('click_id', click.id)
    .maybeSingle()

  if (existErr) {
    return NextResponse.json({ error: existErr.message }, { status: 500 })
  }

  if (existingLead) {
    // Lead existiert schon → OK für Netzwerk
    return NextResponse.json({ status: 'exists' }, { status: 200 })
  }

  // --- 6) Lead schreiben ---
  // WICHTIG:
  // - leads.amount = Gesamtbetrag vom Netzwerk (FinanceAds etc.)
  // - Cashback für Kunde steht in offers.reward_amount
  // - Influencer-Provision wird in den RPCs berechnet:
  //   (leads.amount - offers.reward_amount) * partners.commission_rate
  const { error: insErr } = await supabase.from('leads').insert({
    click_id: click.id,
    confirmed: true,
    confirmed_at: new Date().toISOString(),
    amount: safeAmount,       // Netzwerk-Gesamtbetrag
    payout_ready: true,
    // influencer_commission: NULL  // optional wenn du die Spalte nicht mehr nutzt
  })

  if (insErr) {
    return NextResponse.json({ error: insErr.message }, { status: 500 })
  }

  return NextResponse.json({ status: 'created' }, { status: 201 })
}

// Next.js App Router: GET und POST exportieren
export async function GET(req: Request) {
  return handlePartnerLead(req)
}

export async function POST(req: Request) {
  return handlePartnerLead(req)
}
