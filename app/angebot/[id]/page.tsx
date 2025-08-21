// @ts-nocheck   <-- Quick-Fix: verhindert den PageProps-Mismatch nur in dieser Datei
import { cookies } from 'next/headers'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function OfferPage(props: any) {
  // Manche Next-Typen erwarten Promise-params – wir normalisieren das:
  const p = props?.params && typeof props.params.then === 'function'
    ? await props.params
    : props?.params
  const id = p?.id as string | undefined

  if (!id) {
    return <div className="max-w-2xl mx-auto p-6">Ungültige URL.</div>
  }

  const supabase = createServerComponentClient({ cookies })
  const { data: offer } = await supabase
    .from('offers')
    .select('id, title, description, reward_amount, active')
    .eq('id', id)
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
