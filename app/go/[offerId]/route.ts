// app/go/[offerId]/route.ts
import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { buildAffiliateUrl } from '@/utils/offers'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic' // keine Cache-Falle

export async function GET(req: Request, { params }: { params: { offerId: string } }) {
  const supabase = createRouteHandlerClient({ cookies })
  const offerId = params.offerId
  const url = new URL(req.url)

  // robust: explizit Session holen
  const { data: { session } } = await supabase.auth.getSession()
  const user = session?.user
  if (!user) {
    return NextResponse.redirect(new URL(`/login?next=/angebot/${offerId}`, url), 302)
  }

  // (optional) Rate-Limit
  try {
    await supabase.rpc('throttle_touch', { p_key: `go:${user.id}:${offerId}`, window_seconds: 5 })
  } catch {}

  // Offer -> Affiliate-URL
  const { data: offer } = await supabase
    .from('offers')
    .select('id, affiliate_url, active')
    .eq('id', offerId).eq('active', true)
    .maybeSingle()
  if (!offer?.affiliate_url) {
    return NextResponse.redirect(new URL(`/angebot/${offerId}?unavailable=1`, url), 302)
  }

  // Profil für Attribution (optional)
  let influencerId: string | null = null
  try {
    const { data: profile } = await supabase.from('profiles')
      .select('partner_id').eq('id', user.id).maybeSingle()
    influencerId = (profile as any)?.partner_id ?? null
  } catch {}

  // Klick speichern (best effort)
  try {
    await supabase.from('clicks').insert({
      user_id: user.id,
      offer_id: offerId,
      influencer_id: influencerId,
      clicked_at: new Date().toISOString(),
      redeemed: false,
    })
  } catch {}

  const dest = buildAffiliateUrl(offer.affiliate_url, user.id, offerId) || '/'
  return NextResponse.redirect(dest, 302)
}
