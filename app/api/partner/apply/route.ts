import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function bad(message: string, status = 400) {
  return NextResponse.json({ ok: false, error: message }, { status })
}

export async function POST(req: Request) {
  // 1) User-Session prüfen (normaler Supabase Client mit Cookies)
  const supabase = createRouteHandlerClient({ cookies })
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return bad('not_authenticated', 401)

  // 2) Payload
  let body: any = null
  try {
    body = await req.json()
  } catch {
    return bad('invalid_json', 400)
  }

  const name = String(body?.name ?? '').trim()
  const platform = String(body?.platform ?? '').trim()
  const profileUrl = String(body?.profile_url ?? '').trim()
  const reach = String(body?.reach ?? '').trim()
  const pitch = String(body?.pitch ?? '').trim()

  if (!platform) return bad('platform_required')
  if (!profileUrl) return bad('profile_url_required')
  if (!pitch) return bad('pitch_required')

  // 3) Service Role Client (bypasst RLS)
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const srk = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !srk) return bad('server_misconfigured', 500)

  const admin = createClient(url, srk, { auth: { persistSession: false } })

  // 4) Email aus auth.users ziehen (stabiler als Formfeld)
  const email =
    user.email ??
    (user.user_metadata?.email as string | undefined) ??
    (user.app_metadata?.email as string | undefined) ??
    null

  if (!email) return bad('email_missing', 400)

  // 5) Duplikate blocken: schon pending/approved?
  const { data: existing, error: exErr } = await admin
    .from('partner_applications')
    .select('id, status')
    .eq('user_id', user.id)
    .in('status', ['pending', 'approved'])
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (exErr) return bad(exErr.message, 500)
  if (existing) {
    return NextResponse.json({
      ok: true,
      status: 'exists',
      application_id: existing.id,
      application_status: existing.status,
    })
  }

  // 6) Insert
  const { data: created, error: insErr } = await admin
    .from('partner_applications')
    .insert({
      user_id: user.id,
      email,
      name: name || null,
      platform,
      profile_url: profileUrl,
      reach: reach || null,
      pitch,
      status: 'pending',
    })
    .select('id, status, created_at')
    .maybeSingle()

  if (insErr) return bad(insErr.message, 500)

  return NextResponse.json({
    ok: true,
    status: 'created',
    application: created,
  })
}