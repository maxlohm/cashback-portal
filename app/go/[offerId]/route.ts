// app/go/[offerId]/route.ts
import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { buildAffiliateUrl } from '@/utils/offers'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic' // keine Edge-Runtime & kein Cache

export async function GET(req: Request, ctx: any) {
  const offerId = ctx?.params?.offerId as string | undefined
  if (!offerId) return NextResponse.redirect(new URL('/', req.url), 302)

  const supabase = createRouteHandlerClient({ cookies })
  const url = new URL(req.url)

  // Session holen (Login erzwingen)
  const { data: { session } } = await supabase.auth.getSession()
  const user = session?.user
  if (!user) {
    return NextResponse.redirect(new URL(`/login?next=/angebot/${offerId}`, url), 302)
  }

  // optionales Rate-Limit (Fehler ignorieren)
  try {
    await supabase.rpc('throttle_touch', {
      p_key: `go:${user.id}:${offerId}`,
      window_seconds: 5,
    })
  } catch {}

  // Offer prüfen (aktiv + Affiliate-URL)
  const { data: offer } = await supabase
    .from('offers')
    .select('id, affiliate_url, active')
    .eq('id', offerId)
    .eq('active', true)
    .maybeSingle()

  if (!offer?.affiliate_url) {
    return NextResponse.redirect(new URL(`/angebot/${offerId}?unavailable=1`, url), 302)
  }

  // Partner-Attribution aus Profil (optional)
  let influencerId: string | null = null
  try {
    const { data: profile } = await supabase
      .from('profiles')
      .select('partner_id')
      .eq('id', user.id)
      .maybeSingle()
    influencerId = (profile as any)?.partner_id ?? null
  } catch {}

  // Click best effort loggen
  try {
    await supabase.from('clicks').insert({
      user_id: user.id,
      offer_id: offerId,
      influencer_id: influencerId,
      clicked_at: new Date().toISOString(),
      redeemed: false,
    })
  } catch {}

  // Redirect zur Affiliate-URL
  const dest = buildAffiliateUrl(offer.affiliate_url, user.id, offerId) || '/'
  return NextResponse.redirect(dest, 302)
}
