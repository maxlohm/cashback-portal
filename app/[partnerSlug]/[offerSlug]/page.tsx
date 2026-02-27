// app/[partnerSlug]/[offerSlug]/page.tsx
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'

export const dynamic = 'force-dynamic'

export default async function PartnerOfferPage({
  params,
}: {
  params: { partnerSlug: string; offerSlug: string }
}) {
  const supabase = createServerComponentClient({ cookies })

  const { partnerSlug, offerSlug } = params

  const [{ data: partnerId }, { data: offerId }] = await Promise.all([
    supabase.rpc('resolve_partner_slug', { p_slug: partnerSlug }),
    supabase.rpc('resolve_offer_slug', { p_slug: offerSlug }),
  ])

  if (!partnerId || !offerId) redirect('/')

  // KEIN cookies().set hier!
  // Weiterleitung auf Angebot + ref.
  // Tracking passiert weiterhin erst beim Klick auf "Jetzt Angebot sichern" -> /r/[offerId]
  redirect(`/angebot/${offerId}?ref=${partnerId}`)
}