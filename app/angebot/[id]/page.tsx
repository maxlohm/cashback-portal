// app/angebot/[id]/page.tsx
import { cookies } from 'next/headers'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import Link from 'next/link'

export const dynamic = 'force-dynamic' // verhindert Caching

export default async function OfferPage(
  { params }: { params: { id: string } }   // ⬅️ KEIN PageProps!
) {
  const supabase = createServerComponentClient({ cookies })
  const { data: offer } = await supabase
    .from('offers')
    .select('id, title, description, reward_amount, active')
    .eq('id', params.id)
    .maybeSingle()

  if (!offer || !offer.active) {
    return <div className="max-w-2xl mx-auto p-6">Angebot nicht gefunden oder inaktiv.</div>
  }

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-semibold">{offer.title}</h1>
      {offer.description && <p>{offer.description}</p>}
      <div className="text-lg font-medium">Prämie: {offer.reward_amount} €</div>

      <Link
        href={`/r/${offer.id}`}
        target="_blank"
        className="inline-block rounded-lg border px-4 py-2 hover:bg-gray-100"
      >
        Zum Angebot
      </Link>
    </div>
  )
}
