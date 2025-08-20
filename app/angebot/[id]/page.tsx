// app/go/[offerId]/route.ts
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { getOfferById, buildAffiliateUrl } from '@/utils/offers'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// WICHTIG: KEINE Typisierung des 2. Arguments! (kein { params: { offerId: string } } usw.)
export async function GET(req: Request, ctx: any) {
  const offerId = ctx?.params?.offerId as string | undefined

  if (!offerId) {
    return NextResponse.redirect(new URL('/', req.url))
  }

  const cookieStore = cookies()
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

  // user optional
  const { data: userRes } = await supabase.auth.getUser()
  const userId = userRes?.user?.id ?? null

  // Offer laden
  const offer = await getOfferById(supabase, offerId).catch(() => null)
  if (!offer?.affiliateUrl) {
    return NextResponse.redirect(new URL('/', req.url))
  }

  // Click best effort loggen
  if (userId) {
    try {
      await supabase.from('clicks').insert({
        user_id: userId,
        offer_id: offer.id,
        influencer_id: null,
        clicked_at: new Date().toISOString(),
        redeemed: false,
      })
    } catch {
      // ignore
    }
  }

  // Affiliate-URL bauen & redirecten
  const target =
    buildAffiliateUrl(offer.affiliateUrl, userId ?? 'anon', offer.id) ??
    offer.affiliateUrl

  return NextResponse.redirect(target)
}
