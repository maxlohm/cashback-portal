// app/r/[offerId]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { cookies as nextCookies } from 'next/headers';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { buildAffiliateUrl } from '@/utils/offers';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const UUIDV4 =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

// 👉 2. Argument absichtlich als `any`, damit Next 15s Signatur-Check nicht zickt
export async function GET(req: NextRequest, context: any) {
  const supabase = createRouteHandlerClient({ cookies: nextCookies });

  const offerId: string | undefined = context?.params?.offerId;
  if (!offerId) return NextResponse.redirect(new URL('/', req.url), 302);

  const url = new URL(req.url);
  const dbg = url.searchParams.get('dbg') === '1';

  // 1) ?ref als Influencer-ID prüfen
  const ref = url.searchParams.get('ref');
  const refInfluencerId = ref && UUIDV4.test(ref) ? ref : null;

  // 2) Auth (Login erzwingen – merkt sich ref im Cookie)
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    const loginUrl = new URL('/login', url);
    loginUrl.searchParams.set(
      'next',
      `/r/${offerId}${refInfluencerId ? `?ref=${refInfluencerId}` : ''}`
    );
    const res = NextResponse.redirect(loginUrl, 302);
    if (refInfluencerId) {
      res.cookies.set('bn_ref', refInfluencerId, {
        maxAge: 60 * 60 * 24 * 30,
        path: '/',
      });
    }
    return res;
  }

  // 3) Offer prüfen
  const { data: offer, error: offerErr } = await supabase
    .from('offers')
    .select('id, affiliate_url, active')
    .eq('id', offerId)
    .eq('active', true)
    .maybeSingle();

  if (offerErr || !offer?.affiliate_url) {
    const loc = new URL(`/angebot/${offerId}?unavailable=1`, url);
    return dbg
      ? NextResponse.json({ ok: false, reason: 'no-offer', error: offerErr?.message })
      : NextResponse.redirect(loc, 302);
  }

  // 4) Influencer bestimmen: Query → Cookie → Profil.partner_id
  const refFromCookie = req.cookies.get('bn_ref')?.value ?? null;
  let influencerId: string | null = refInfluencerId ?? refFromCookie;
  if (!influencerId) {
    const { data: p } = await supabase
      .from('profiles')
      .select('partner_id')
      .eq('id', user.id)
      .maybeSingle();
    influencerId = (p as any)?.partner_id ?? null;
  }

  // 4b) Sub-ID bestimmen: erst Influencer, sonst User
  let partnerSubId: string | null = null;
  if (influencerId) {
    const { data: inf } = await supabase
      .from('profiles')
      .select('partner_subid')
      .eq('id', influencerId)
      .maybeSingle();
    partnerSubId = (inf as any)?.partner_subid ?? null;
  }
  if (!partnerSubId) {
    const { data: me } = await supabase
      .from('profiles')
      .select('partner_subid')
      .eq('id', user.id)
      .maybeSingle();
    partnerSubId = (me as any)?.partner_subid ?? null;
  }

  // 5) Idempotenter Click (bei Duplicate → Update solange nicht redeemed)

  const nowIso = new Date().toISOString();

  // 🔥 NEU: pro Insert eine eindeutige SubID erzeugen
  const subidTokenForInsert = crypto.randomUUID();

  const row: Record<string, any> = {
    user_id: user.id,
    offer_id: offerId,
    clicked_at: nowIso,
    subid_token: subidTokenForInsert, // ← wird an FinanceAds als {subid} gehen
  };
  if (influencerId) row.influencer_id = influencerId;

  let mode: 'insert' | 'update' = 'insert';
  let err: string | null = null;

  const ins = await supabase.from('clicks').insert(row);
  if (ins.error) {
    if ((ins.error as any).code === '23505') {
      mode = 'update';
      const upd = await supabase
        .from('clicks')
        .update({ clicked_at: nowIso, influencer_id: influencerId ?? null })
        .eq('user_id', user.id)
        .eq('offer_id', offerId)
        .or('redeemed.is.null,redeemed.eq.false');
      if (upd.error) err = upd.error.message;
    } else {
      err = ins.error.message;
    }
  }

  // 6) Neuesten Click holen → clickToken für SubID-Fallback
  const { data: latest } = await supabase
    .from('clicks')
    .select('id, subid_token, user_id, offer_id, clicked_at, redeemed, influencer_id')
    .eq('user_id', user.id)
    .eq('offer_id', offerId)
    .order('clicked_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  const clickToken: string | null = (latest as any)?.subid_token ?? null;

  // 7) Ziel-URL bauen (Mapping passiert zentral in buildAffiliateUrl)
  const dest =
    buildAffiliateUrl(offer.affiliate_url, {
      userId: user.id,
      offerId,
      influencerId,
      subId: partnerSubId || undefined,   // Influencer-/User-SubID
      clickToken: clickToken || undefined // ← dieser Token wird bei FinanceAds als ?subid=... landen
    }) || '/';

  if (dbg) {
    return NextResponse.json({
      ok: true,
      user: user.id,
      offerId,
      influencerIdUsed: influencerId,
      partnerSubId,
      clickToken,
      mode,
      err,
      row: latest ?? null,
      dest,
      subidTokenForInsert, // zum Debuggen
    });
  }

  // 8) Redirect + Ref-Cookie mitschreiben
  const res = NextResponse.redirect(dest, 302);
  if (refInfluencerId) {
    res.cookies.set('bn_ref', refInfluencerId, {
      maxAge: 60 * 60 * 24 * 30,
      path: '/',
    });
  }
  return res;
}
