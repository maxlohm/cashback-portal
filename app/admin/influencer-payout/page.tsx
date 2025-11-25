// app/admin/influencer-payout/page.tsx
import { createClient } from '@/utils/supabaseServer'
import InfluencerPayoutClient from './InfluencerPayoutClient'

export const dynamic = 'force-dynamic'
export const revalidate = 0

type PartnerRow = {
  id: string
  name: string | null
  email: string | null
}

export default async function Page() {
  const supabase = createClient()

  const { data: isAdmin, error } = await supabase.rpc('is_admin')

  if (error || !isAdmin) {
    return (
      <div className="p-6 text-sm text-red-600">
        Kein Zugriff – Admin-Rechte erforderlich.
      </div>
    )
  }

  const { data: partners, error: partnersError } = await supabase
    .from('partners')
    .select('id, name, email')
    .order('name', { ascending: true })

  if (partnersError) {
    console.error(partnersError)
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <InfluencerPayoutClient
        partners={(partners ?? []) as PartnerRow[]}
      />
    </div>
  )
}
