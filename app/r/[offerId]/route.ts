// app/r/[offerId]/route.ts
import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies as nextCookies } from 'next/headers'
import { buildAffiliateUrl } from '@/utils/offers'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const UUIDV4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

function readCookieFromReq(req: Request, name: string): string | null {
  const cookieHeader = req.headers.get('cookie') || ''
  for (const part of cookieHeader.split(';')) {
    const [k, ...rest] = part.trim().split('=')
    if (k === name) {
      const v = rest.join('=')
      try { return decodeURIComponent(v) } catch { return v }
    }
  }
  return null
}

export async function GET(req: Request, ctx: any) {
  const supabase = createRouteHandlerClient({ cookies: nextCookies })

  const offerId = ctx?.params?.offerId as string | undefined
  if (!offerId) return NextResponse.redirect(new URL('/', req.url), 302)

  const url = new URL(req.url)
  const dbg = url.searchParams.get('dbg') === '1'

  // 1) ?ref= als Influencer-Id prüfen
  const ref = url.searchParams.get('ref')
  const refInfluencerId = ref && UUIDV4.test(ref) ? ref : null

  // 2) Auth
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    const loginUrl = new URL('/login', url)
    loginUrl.searchParams.set('next', `/r/${offerId}${refInfluencerId ? `?ref=${refInfluencerId}` : ''}`)
    const res = NextResponse.redirect(loginUrl, 302)
    if (refInfluencerId) res.cookies.set('bn_ref', refInfluencerId, { maxAge: 60 * 60 * 24 * 30, path: '/' })
    return res
  }

  // 3) Offer prüfen
  const { data: offer, error: offerErr } = await supabase
    .from('offers')
    .select('id, affiliate_url, active')
    .eq('id', offerId)
    .eq('active', true)
    .maybeSingle()

  if (offerErr || !offer?.affiliate_url) {
    const loc = new URL(`/angebot/${offerId}?unavailable=1`, url)
    return dbg
      ? NextResponse.json({ ok: false, reason: 'no-offer', error: offerErr?.message })
      : NextResponse.redirect(loc, 302)
  }

  // 4) Influencer bestimmen: Query → Cookie → Profil.partner_id
  const refFromCookie = readCookieFromReq(req, 'bn_ref')
  let influencerId: string | null = refInfluencerId ?? refFromCookie
  if (!influencerId) {
    const { data: p } = await supabase
      .from('profiles')
      .select('partner_id')
      .eq('id', user.id)
      .maybeSingle()
    influencerId = (p as any)?.partner_id ?? null
  }

  // 5) Idempotenter Click (influencer_id schreiben)
  const nowIso = new Date().toISOString()
  const row: Record<string, any> = { user_id: user.id, offer_id: offerId, clicked_at: nowIso }
  if (influencerId) row.influencer_id = influencerId

  let mode: 'insert' | 'update' = 'insert'
  let err: string | null = null

  const ins = await supabase.from('clicks').insert(row)
  if (ins.error) {
    if ((ins.error as any).code === '23505') {
      mode = 'update'
      const upd = await supabase
        .from('clicks')
        .update({ clicked_at: nowIso, influencer_id: influencerId ?? null })
        .eq('user_id', user.id)
        .eq('offer_id', offerId)
        .or('redeemed.eq.false,redeemed.is.null')
      if (upd.error) err = upd.error.message
    } else {
      err = ins.error.message
    }
  }

  // 6) Den neuesten Click holen (für den subid_token)
  const { data: latest } = await supabase
    .from('clicks')
    .select('id, subid_token, user_id, offer_id, clicked_at, redeemed, influencer_id')
    .eq('user_id', user.id)
    .eq('offer_id', offerId)
    .order('clicked_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  const clickToken = (latest as any)?.subid_token ?? null

  if (dbg) {
    const dest = buildAffiliateUrl(offer.affiliate_url, {
      userId: user.id,
      offerId,
      influencerId,
      clickToken, // 👈 jetzt der Click-Token als SubID
    }) || null

    return NextResponse.json({
      ok: true,
      user: user.id,
      offerId,
      influencerIdUsed: influencerId,
      mode,
      err,
      row: latest ?? null,
      dest,
    })
  }

  // 7) Redirect + Cookie
  const dest = buildAffiliateUrl(offer.affiliate_url, {
    userId: user.id,
    offerId,
    influencerId,
    clickToken, // 👈 jetzt der Click-Token als SubID
  }) || '/'

  const res = NextResponse.redirect(dest, 302)
  if (refInfluencerId) res.cookies.set('bn_ref', refInfluencerId, { maxAge: 60 * 60 * 24 * 30, path: '/' })
  return res
}
