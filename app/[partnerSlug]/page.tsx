// app/[partnerSlug]/page.tsx
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'

export const dynamic = 'force-dynamic'

export default async function PartnerLandingPage({
  params,
}: {
  params: { partnerSlug: string }
}) {
  const supabase = createServerComponentClient({ cookies })

  const partnerSlug = params.partnerSlug

  const { data: partnerId, error } = await supabase.rpc('resolve_partner_slug', {
    p_slug: partnerSlug,
  })

  if (error || !partnerId) redirect('/')

  // KEIN cookies().set hier!
  // Einfach ref in die URL hängen, damit dein bestehender Flow es sauber übernimmt.
  redirect(`/?ref=${partnerId}`)
}