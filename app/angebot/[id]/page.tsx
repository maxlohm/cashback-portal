// app/go/[offerId]/route.ts
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { getOfferById, buildAffiliateUrl } from '@/utils/offers'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(req: Request, { params }: { params: { offerId: string } }) {
  const offerId = params?.offerId
  if (!offerId) {
    return NextResponse.redirect(new URL('/', req.url))
  }

  const supabase = createRouteHandlerClient({ cookies })

  // user optional
  const { data: userRes } = await supabase.auth.getUser()
  const userId = userRes?.user?.id ?? null

  // Offer laden
  const offer = await getOfferById(supabase, offerId).catch(() => null)
  if (!offer?.affiliateUrl) {
    return NextResponse.redirect(new URL('/', req.url))
  }

  // Click best effort loggen (Fehler ignorieren)
  if (userId) {
    try {
      await supabase.from('clicks').insert({
        user_id: userId,
        offer_id: offer.id,
        influencer_id: null,
        clicked_at: new Date().toISOString(),
        redeemed: false,
      })
    } catch {}
  }

  // Affiliate-URL bauen & redirecten (externes Ziel)
  const target =
    buildAffiliateUrl(offer.affiliateUrl, userId ?? 'anon', offer.id) ??
    offer.affiliateUrl

  return NextResponse.redirect(target)
}
