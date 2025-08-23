// app/r/[offerId]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { buildAffiliateUrl } from '@/utils/offers';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const UUIDV4 =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function GET(
  req: NextRequest,
  { params }: { params: { offerId: string } }
) {
  const supabase = createRouteHandlerClient({ cookies });

  const offerId = params.offerId;
  if (!offerId) return NextResponse.redirect(new URL('/', req.url), 302);

  const url = new URL(req.url);
  const dbg = url.searchParams.get('dbg') === '1';

  // 1) ?ref= als Influencer-Id prüfen
  const ref = url.searchParams.get('ref');
  const refInfluencerId = ref && UUIDV4.test(ref) ? ref : null;

  // 2) Auth
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    const loginUrl = new URL('/login', url);
    // Preserve ref im next-Param
    loginUrl.searchParams.set(
      'next',
      `/r/${offerId}${refInfluencerId ? `?ref=${refInfluencerId}` : ''}`
    );
    const res = NextResponse.redirect(loginUrl, 302);
    if (refInfluencerId)
      res.cookies.set('bn_ref', refInfluencerId, {
        maxAge: 60 * 60 * 24 * 30,
        path: '/',
      });
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
      ? NextResponse.json({
          ok: false,
          reason: 'no-offer',
          error: offerErr?.message,
        })
      : NextResponse.redirect(loc, 302);
  }

  // 4) Influencer bestimmen: Query → Cookie → Profil.partner_id
  const refFromCookie = cookies().get('bn_ref')?.value ?? null;
  let influencerId: string | null = refInfluencerId ?? refFromCookie;
  if (!influencerId) {
    const { data: p } = await supabase
      .from('profiles')
      .select('partner_id')
      .eq('id', user.id)
      .maybeSingle();
    influencerId = (p as any)?.partner_id ?? null;
  }

  // 5) Idempotenter Click (influencer_id schreiben)
  const nowIso = new Date().toISOString();
  const row: Record<string, any> = {
    user_id: user.id,
    offer_id: offerId,
    clicked_at: nowIso,
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
        .or('redeemed.is.null,redeemed.eq.false'); // Reihenfolge egal, nur korrektes OR-Format
      if (upd.error) err = upd.error.message;
    } else {
      err = ins.error.message;
    }
  }

  // 6) Den neuesten Click holen (für den subid_token)
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

  const clickToken = (latest as any)?.subid_token ?? null;

  if (dbg) {
    const dest =
      buildAffiliateUrl(offer.affiliate_url, {
        userId: user.id,
        offerId,
        influencerId,
        clickToken,
      }) || null;

    return NextResponse.json({
      ok: true,
      user: user.id,
      offerId,
      influencerIdUsed: influencerId,
      mode,
      err,
      row: latest ?? null,
      dest,
    });
  }

  // 7) Redirect + Cookie
  const dest =
    buildAffiliateUrl(offer.affiliate_url, {
      userId: user.id,
      offerId,
      influencerId,
      clickToken,
    }) || '/';

  const res = NextResponse.redirect(dest, 302);
  if (refInfluencerId)
    res.cookies.set('bn_ref', refInfluencerId, {
      maxAge: 60 * 60 * 24 * 30,
      path: '/',
    });
  return res;
}
