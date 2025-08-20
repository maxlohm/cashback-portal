// app/go/[offerId]/route.ts
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { getOfferById, buildAffiliateUrl } from '@/utils/offers'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// Achtung: Next 15 prüft die Signatur streng.
// Wir typisieren das 2. Argument bewusst breit, damit es mit allen Next-Versionen baut.
export async function GET(
  req: Request,
  context: any
) {
  const { offerId } = (context?.params ?? {}) as { offerId: string }

  if (!offerId) {
    // Fallback: zurück zur Startseite
    return NextResponse.redirect(new URL('/', req.url))
  }

  const cookieStore = cookies()
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

  // Benutzer (optional) holen
  const { data: userRes } = await supabase.auth.getUser()
  const userId = userRes?.user?.id ?? null

  // Offer holen
  const offer = await getOfferById(supabase, offerId).catch(() => null)
  if (!offer?.affiliateUrl) {
    return NextResponse.redirect(new URL('/', req.url))
  }

  // Click loggen (best effort)
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
      // Logging-Fehler ignorieren, Redirect trotzdem durchführen
    }
  }

  // Affiliate-URL mit SubID bauen und weiterleiten
  const target =
    buildAffiliateUrl(offer.affiliateUrl, userId ?? 'anon', offer.id) ??
    offer.affiliateUrl

  return NextResponse.redirect(target)
}
