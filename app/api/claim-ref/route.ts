// app/api/claim-ref/route.ts
import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies as nextCookies } from 'next/headers'

const UUIDV4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

function readCookie(req: Request, name: string): string | null {
  const header = req.headers.get('cookie') ?? ''
  for (const part of header.split(';')) {
    const [k, ...rest] = part.trim().split('=')
    if (k === name) {
      try { return decodeURIComponent(rest.join('=')) } catch { return rest.join('=') }
    }
  }
  return null
}

async function handler(req: Request) {
  const supabase = createRouteHandlerClient({ cookies: nextCookies })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ ok: false, error: 'not-authenticated' }, { status: 401 })
  }

  // ref aus Query ODER Cookie
  const url = new URL(req.url)
  const refFromQuery = url.searchParams.get('ref')
  const refFromCookie = readCookie(req, 'bn_ref')
  const ref = refFromQuery || refFromCookie

  if (!ref || !UUIDV4.test(ref)) {
    return NextResponse.json({ ok: true, action: 'noop', reason: 'no-valid-ref' })
  }

  // Optional: Rate-Limit (wenn throttle_touch vorhanden)
  // const key = `claim-ref:${user.id}:${ref}`
  // const { data: allowed } = await supabase.rpc('throttle_touch', { p_key: key, window_seconds: 10 })
  // if (allowed === false) return NextResponse.json({ ok: false, error: 'rate-limited' }, { status: 429 })

  // sichere, idempotente Zuordnung via RPC
  const { data, error } = await supabase.rpc('set_user_partner', { p_partner: ref })
  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 400 })
  }

  // Nach erfolgreichem Setzen Cookie entfernen
  if (data?.action === 'set' && refFromCookie) {
    const res = NextResponse.json(data)
    // Cookie löschen
    res.headers.append('Set-Cookie', `bn_ref=; Path=/; Max-Age=0; SameSite=Lax; HttpOnly`)
    return res
  }

  // Schon gesetzt? 200 statt 409, um noise zu vermeiden
  return NextResponse.json(data)
}

export const GET = handler
export const POST = handler
