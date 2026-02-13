// app/r/[offerId]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { cookies as nextCookies } from 'next/headers'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { buildAffiliateUrl } from '@/utils/affiliateUrl'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const UUIDV4 =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

function isUuid(v: string | null | undefined): v is string {
  return !!v && UUIDV4.test(v)
}

/**
 * Normalize any incoming ref into a canonical influencer partner id = partners.id
 * Accepts:
 *  - partners.id (preferred) -> returns itself
 *  - partners.user_id (auth.users.id) -> maps to partners.id
 */
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

  // 2) raw is partners.user_id -> map to partners.id
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

/**
 * Get partner_subid:
 * - if influencerPartnerId is set: read influencer's profile via partners.user_id
 * - else fallback to user's own profile.partner_subid
 */
async function resolvePartnerSubId(
  supabase: any,
  userId: string,
  influencerPartnerId: string | null
): Promise<string | null> {
  // influencer subid (partners -> auth user -> profiles)
  if (influencerPartnerId) {
    const { data: p } = await supabase
      .from('partners')
      .select('user_id')
      .eq('id', influencerPartnerId)
      .maybeSingle()

    const infUserId = (p as any)?.user_id as string | undefined
    if (infUserId) {
      const { data: infProf } = await supabase
        .from('profiles')
        .select('partner_subid')
        .eq('id', infUserId)
        .maybeSingle()
      const s = (infProf as any)?.partner_subid ?? null
      if (s) return s
    }
  }

  // fallback: user's own subid
  const { data: me } = await supabase
    .from('profiles')
    .select('partner_subid')
    .eq('id', userId)
    .maybeSingle()

  return ((me as any)?.partner_subid ?? null) as string | null
}

export async function GET(req: NextRequest, context: any) {
  const supabase = createRouteHandlerClient({ cookies: nextCookies })

  const offerId: string | undefined = context?.params?.offerId
  if (!isUuid(offerId)) return NextResponse.redirect(new URL('/', req.url), 302)

  const url = new URL(req.url)
  const dbg = url.searchParams.get('dbg') === '1'

  // Raw ref (can be partners.id or partners.user_id, we normalize later)
  const refRaw = url.searchParams.get('ref')
  const cookieRaw = req.cookies.get('bn_ref')?.value ?? null

  // 1) Auth (Login erzwingen – merkt sich ref im Cookie)
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    const nextPath =
      `/r/${offerId}` + (isUuid(refRaw) ? `?ref=${refRaw}` : '')
    const loginUrl = new URL('/login', url)
    loginUrl.searchParams.set('next', nextPath)

    const res = NextResponse.redirect(loginUrl, 302)

    // store normalized partner id if possible; else store raw if uuid (we'll normalize later)
    const norm = await resolvePartnerId(supabase, refRaw)
    const toStore = norm ?? (isUuid(refRaw) ? refRaw : null)

    if (toStore) {
      res.cookies.set('bn_ref', toStore, {
        maxAge: 60 * 60 * 24 * 30,
        path: '/',
      })
    }
    return res
  }

  // 2) Offer prüfen
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
          error: offerErr?.message ?? null,
        })
      : NextResponse.redirect(loc, 302)
  }

  // 3) Influencer bestimmen (canonical partners.id):
  //    Query -> Cookie -> profiles.partner_id (schema stores partners.id)
  const refPartnerId = await resolvePartnerId(supabase, refRaw)
  const cookiePartnerId = await resolvePartnerId(supabase, cookieRaw)

  let profilePartnerId: string | null = null
  {
    const { data: p } = await supabase
      .from('profiles')
      .select('partner_id')
      .eq('id', user.id)
      .maybeSingle()
    // profiles.partner_id FK -> partners.id (your schema)
    profilePartnerId = await resolvePartnerId(supabase, (p as any)?.partner_id ?? null)
  }

  const influencerPartnerId: string | null =
    refPartnerId ?? cookiePartnerId ?? profilePartnerId

  // 4) Sub-ID bestimmen: erst Influencer, sonst User
  const partnerSubId = await resolvePartnerSubId(
    supabase,
    user.id,
    influencerPartnerId
  )

  // 5) Idempotenter Click (bei Duplicate → Update solange nicht redeemed)
  const nowIso = new Date().toISOString()

  const row: Record<string, any> = {
    user_id: user.id,
    offer_id: offerId,
    clicked_at: nowIso,
    influencer_id: influencerPartnerId, // partners.id
  }

  let mode: 'insert' | 'update' = 'insert'
  let err: string | null = null

  const ins = await supabase.from('clicks').insert(row)
  if (ins.error) {
    if ((ins.error as any).code === '23505') {
      mode = 'update'
      const upd = await supabase
        .from('clicks')
        .update({
          clicked_at: nowIso,
          influencer_id: influencerPartnerId,
        })
        .eq('user_id', user.id)
        .eq('offer_id', offerId)
        .or('redeemed.is.null,redeemed.eq.false')
      if (upd.error) err = upd.error.message
    } else {
      err = ins.error.message
    }
  }

  // 6) Neuesten Click holen → subid_token kommt aus DB Default
  const { data: latest } = await supabase
    .from('clicks')
    .select('id, subid_token, user_id, offer_id, clicked_at, redeemed, influencer_id')
    .eq('user_id', user.id)
    .eq('offer_id', offerId)
    .order('clicked_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  const clickToken: string | null = (latest as any)?.subid_token ?? null

  // 7) Ziel-URL bauen (Mapping passiert zentral in buildAffiliateUrl)
  const dest =
    buildAffiliateUrl(offer.affiliate_url, {
      userId: user.id,
      offerId,
      influencerId: influencerPartnerId ?? undefined, // IMPORTANT: partners.id
      subId: partnerSubId || undefined,
      clickToken: clickToken || undefined,
    }) || '/'

  if (dbg) {
    return NextResponse.json({
      ok: true,
      user: user.id,
      offerId,
      refRaw,
      cookieRaw,
      influencerPartnerId,
      partnerSubId,
      clickToken,
      mode,
      err,
      row: latest ?? null,
      dest,
    })
  }

  // 8) Redirect + Cookie mitschreiben (immer canonical partners.id)
  const res = NextResponse.redirect(dest, 302)

  // If ref was provided, store canonical partner id (if resolvable)
  if (refRaw) {
    const norm = await resolvePartnerId(supabase, refRaw)
    if (norm) {
      res.cookies.set('bn_ref', norm, {
        maxAge: 60 * 60 * 24 * 30,
        path: '/',
      })
    }
  }

  return res
}

