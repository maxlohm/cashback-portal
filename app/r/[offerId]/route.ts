// app/r/[offerId]/route.ts
import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies as nextCookies } from 'next/headers'
import { buildAffiliateUrl } from '@/utils/offers'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const UUIDV4 =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

function readCookieFromReq(req: Request, name: string): string | null {
  const cookieHeader = req.headers.get('cookie') || ''
  for (const part of cookieHeader.split(';')) {
    const [k, ...rest] = part.trim().split('=')
    if (k === name) {
      const v = rest.join('=')
      try {
        return decodeURIComponent(v)
      } catch {
        return v
      }
    }
  }
  return null
}

export async function GET(
  req: Request,
  { params }: { params: { offerId: string } }
) {
  const supabase = createRouteHandlerClient({ cookies: nextCookies })

  const offerId = params.offerId
  const url = new URL(req.url)
  const dbg = url.searchParams.get('dbg') === '1'

  // 1) Partner-Ref aus Query validieren
  const ref = url.searchParams.get('ref')
  const refPartnerId = ref && UUIDV4.test(ref) ? ref : null

  // 2) Auth prüfen (User optional → hier aber Login erzwingen)
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    const loginUrl = new URL('/login', url)
    loginUrl.searchParams.set(
      'next',
      `/r/${offerId}${refPartnerId ? `?ref=${refPartnerId}` : ''}`
    )
    const res = NextResponse.redirect(loginUrl, 302)
    if (refPartnerId) {
      res.cookies.set('bn_ref', refPartnerId, {
        maxAge: 60 * 60 * 24 * 30,
        path: '/',
      })
    }
    return res
  }

  // 3) Offer prüfen (aktiv + Affiliate-URL vorhanden)
  const { data: offer, error: offerErr } = await supabase
    .from('offers')
    .select('id, affiliate_url, active')
    .eq('id', offerId)
    .eq('active', true)
    .maybeSingle()

  if (offerErr || !offer?.affiliate_url) {
    const loc = new URL(`/angebot/${offerId}?unavailable=1`, url)
    return dbg
      ? NextResponse.json({
          ok: false,
          reason: 'no-offer',
          error: offerErr?.message,
        })
      : NextResponse.redirect(loc, 302)
  }

  // 4) Partner-Attribution: Query → Cookie → Profil
  const refFromCookie = readCookieFromReq(req, 'bn_ref')
  let partnerId: string | null = refPartnerId ?? refFromCookie
  if (!partnerId) {
    const { data: p } = await supabase
      .from('profiles')
      .select('partner_id')
      .eq('id', user.id)
      .maybeSingle()
    partnerId = (p as any)?.partner_id ?? null
  }

  // 5) Idempotenter Click (INSERT → bei Unique-Konflikt UPDATE)
  const nowIso = new Date().toISOString()
  const row: Record<string, any> = {
    user_id: user.id,
    offer_id: offerId,
    clicked_at: nowIso,
  }
  if (partnerId) row.partner_id = partnerId

  let mode: 'insert' | 'update' = 'insert'
  let err: string | null = null

  const ins = await supabase.from('clicks').insert(row)
  if (ins.error) {
    if ((ins.error as any).code === '23505') {
      mode = 'update'
      const upd = await supabase
        .from('clicks')
        .update({ clicked_at: nowIso, partner_id: partnerId ?? null })
        .eq('user_id', user.id)
        .eq('offer_id', offerId)
        .or('redeemed.eq.false,redeemed.is.null')
      if (upd.error) err = upd.error.message
    } else {
      err = ins.error.message
    }
  }

  if (dbg) {
    const { data: latest } = await supabase
      .from('clicks')
      .select('id, user_id, offer_id, clicked_at, redeemed, partner_id')
      .eq('user_id', user.id)
      .eq('offer_id', offerId)
      .order('clicked_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    return NextResponse.json({
      ok: true,
      user: user.id,
      offerId,
      ref: refPartnerId,
      partnerIdUsed: partnerId,
      mode,
      err,
      row: latest ?? null,
    })
  }

  // 6) Redirect + Ref-Cookie setzen
  const dest =
    buildAffiliateUrl(offer.affiliate_url, user.id, offerId) || '/'
  const res = NextResponse.redirect(dest, 302)
  if (refPartnerId) {
    res.cookies.set('bn_ref', refPartnerId, {
      maxAge: 60 * 60 * 24 * 30,
      path: '/',
    })
  }
  return res
}
