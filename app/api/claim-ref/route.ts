// app/api/claim-ref/route.ts
import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies as nextCookies } from 'next/headers'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const UUIDV4 =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

function readCookie(req: Request, name: string): string | null {
  const header = req.headers.get('cookie') ?? ''
  for (const part of header.split(';')) {
    const [k, ...rest] = part.trim().split('=')
    if (k === name) {
      try {
        return decodeURIComponent(rest.join('='))
      } catch {
        return rest.join('=')
      }
    }
  }
  return null
}

function isUuid(v: string | null | undefined): v is string {
  return !!v && UUIDV4.test(v)
}

async function resolvePartnerId(
  supabase: any,
  raw: string | null
): Promise<string | null> {
  if (!isUuid(raw)) return null
  const v = raw.trim()

  // 1) raw is partners.id
  {
    const { data, error } = await supabase
      .from('partners')
      .select('id')
      .eq('id', v)
      .maybeSingle()
    if (!error && data?.id) return data.id
  }

  // 2) raw is partners.user_id
  {
    const { data, error } = await supabase
      .from('partners')
      .select('id')
      .eq('user_id', v)
      .maybeSingle()
    if (!error && data?.id) return data.id
  }

  return null
}

async function handler(req: Request) {
  const supabase = createRouteHandlerClient({ cookies: nextCookies })

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json(
      { ok: false, error: 'not-authenticated' },
      { status: 401 }
    )
  }

  const url = new URL(req.url)
  const refFromQuery = url.searchParams.get('ref')
  const refFromCookie = readCookie(req, 'bn_ref')
  const raw = refFromQuery || refFromCookie

  if (!raw || !isUuid(raw)) {
    return NextResponse.json({
      ok: true,
      action: 'noop',
      reason: 'no-valid-ref',
    })
  }

  const partnerId = await resolvePartnerId(supabase, raw)

  if (!partnerId) {
    return NextResponse.json({
      ok: true,
      action: 'noop',
      reason: 'ref-not-a-partner',
    })
  }

  const { data, error } = await supabase.rpc('set_user_partner', {
    p_partner: partnerId,
  })

  if (error) {
    return NextResponse.json(
      { ok: false, error: error.message },
      { status: 400 }
    )
  }

  if (data?.action === 'set' && refFromCookie) {
    const res = NextResponse.json({
      ...data,
      partner_id: partnerId,
    })

    const secure = process.env.NODE_ENV === 'production'

    res.headers.append(
      'Set-Cookie',
      `bn_ref=; Path=/; Max-Age=0; SameSite=Lax; HttpOnly${
        secure ? '; Secure' : ''
      }`
    )

    return res
  }

  return NextResponse.json({
    ...data,
    partner_id: partnerId,
  })
}

export const GET = handler
export const POST = handler
