// app/r/[offerId]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { cookies as nextCookies } from 'next/headers';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { buildAffiliateUrl } from '@/utils/offers';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const UUIDV4 =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function GET(req: NextRequest, context: any) {
  const supabase = createRouteHandlerClient({ cookies: nextCookies });

  const offerId: string | undefined = context?.params?.offerId;
  if (!offerId) return NextResponse.redirect(new URL('/', req.url), 302);

  const url = new URL(req.url);
  const dbg = url.searchParams.get('dbg') === '1';

  const ref = url.searchParams.get('ref');
  const refInfluencerId =
    ref && UUIDV4.test(ref) ? ref : null;

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

  const { data: offer } = await supabase
    .from('offers')
    .select('id, affiliate_url, active')
    .eq('id', offerId)
    .eq('active', true)
    .maybeSingle();

  if (!offer?.affiliate_url) {
    const loc = new URL(`/angebot/${offerId}?unavailable=1`, url);
    return dbg
      ? NextResponse.json({ ok: false, reason: 'no-offer' })
      : NextResponse.redirect(loc, 302);
  }

  const refFromCookie = req.cookies.get('bn_ref')?.value ?? null;

  let influencerId: string | null = refInfluencerId ?? refFromCookie;

  if (!influencerId) {
    const { data: p } = await supabase
      .from('profiles')
      .select('partner_id')
      .eq('id', user.id)
      .maybeSingle();
    influencerId = p?.partner_id ?? null;
  }

  let partnerSubId: string | null = null;

  if (influencerId) {
    const { data: inf } = await supabase
      .from('profiles')
      .select('partner_subid')
      .eq('id', influencerId)
      .maybeSingle();
    partnerSubId = inf?.partner_subid ?? null;
  }

  if (!partnerSubId) {
    const { data: me } = await supabase
      .from('profiles')
      .select('partner_subid')
      .eq('id', user.id)
      .maybeSingle();
    partnerSubId = me?.partner_subid ?? null;
  }

  const nowIso = new Date().toISOString();
  const subidTokenForInsert = crypto.randomUUID();

  const clickInsert = {
    user_id: user.id,
    offer_id: offerId,
    clicked_at: nowIso,
    subid_token: subidTokenForInsert,
    influencer_id: influencerId ?? null,
  };

  let mode: 'insert' | 'update' = 'insert';
  let err: any = null;

  const ins = await supabase.from('clicks').insert(clickInsert);

  if (ins.error) {
    if (ins.error.code === '23505') {
      mode = 'update';
      const upd = await supabase
        .from('clicks')
        .update({
          clicked_at: nowIso,
          influencer_id: influencerId ?? null,
        })
        .eq('user_id', user.id)
        .eq('offer_id', offerId)
        .or('redeemed.is.null,redeemed.eq.false');

      if (upd.error) err = upd.error;
    } else {
      err = ins.error;
    }
  }

  const { data: latest } = await supabase
    .from('clicks')
    .select(
      'id, subid_token, user_id, offer_id, clicked_at, redeemed, influencer_id'
    )
    .eq('user_id', user.id)
    .eq('offer_id', offerId)
    .order('clicked_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  const clickToken = latest?.subid_token ?? undefined;

  const dest =
    buildAffiliateUrl(offer.affiliate_url, {
      userId: user.id,
      offerId,
      influencerId,
      subId: partnerSubId ?? undefined,
      clickToken,
    }) || '/';

  if (dbg) {
    return NextResponse.json({
      ok: true,
      mode,
      err,
      user: user.id,
      offerId,
      influencerId,
      partnerSubId,
      clickToken,
      dest,
      row: latest,
    });
  }

  const res = NextResponse.redirect(dest, 302);

  if (refInfluencerId) {
    res.cookies.set('bn_ref', refInfluencerId, {
      maxAge: 60 * 60 * 24 * 30,
      path: '/',
    });
  }

  return res;
}
