// app/api/claim-ref/route.ts
import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies as nextCookies } from 'next/headers'

const UUIDV4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

function getCookie(req: Request, name: string): string | null {
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
  if (!user) return NextResponse.json({ ok: false, error: 'not-authenticated' }, { status: 401 })

  const ref = getCookie(req, 'bn_ref')
  if (!ref || !UUIDV4.test(ref)) {
    return NextResponse.json({ ok: true, action: 'noop', reason: 'no-valid-cookie' })
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('partner_id')
    .eq('id', user.id)
    .maybeSingle()

  if (!profile) return NextResponse.json({ ok: false, error: 'profile-not-found' }, { status: 404 })
  if (profile.partner_id) {
    return NextResponse.json({ ok: true, action: 'noop', reason: 'already-set', partner_id: profile.partner_id })
  }

  const { error: updErr } = await supabase
    .from('profiles')
    .update({ partner_id: ref })
    .eq('id', user.id)

  if (updErr) return NextResponse.json({ ok: false, error: updErr.message }, { status: 403 })
  return NextResponse.json({ ok: true, action: 'set', partner_id: ref })
}

export async function GET(req: Request) { return handler(req) }
export async function POST(req: Request) { return handler(req) }
