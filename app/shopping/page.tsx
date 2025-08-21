'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import KategorieNavigation from '../navigation/page'
import DealCard from '../components/DealCard'
import OffersGrid from '../components/OffersGrid'
import { supabase } from '@/utils/supabaseClient'
import { getActiveOffersByCategories, type Offer } from '@/utils/offers'

export default function ShoppingPage() {
  const [items, setItems] = useState<Offer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    (async () => {
      try {
        const offers = await getActiveOffersByCategories(supabase, ['shopping'])
        setItems(offers)
      } catch (e: any) {
        setError(e?.message ?? 'Fehler beim Laden')
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  return (
    <div className="mt-0 p-0">
      <Image
        src="/bannerrichtig.png"
        alt="Shopping Banner"
        width={1920}
        height={300}
        className="w-full h-auto object-cover"
        priority
      />

      <KategorieNavigation />

      <main className="max-w-6xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
        {loading && <div className="text-sm text-gray-500">Lade Angebote…</div>}
        {!loading && error && (
          <div className="text-sm text-red-600">Fehler: {error}</div>
        )}
        {!loading && !error && (
          <OffersGrid>
            {items.map((offer) => (
              <DealCard
                key={offer.id}
                id={offer.id}
                name={offer.name}
                description={offer.description}
                reward={offer.reward}
                image={offer.image ?? '/placeholder.png'}
                url={`/angebot/${offer.id}`}
              />
            ))}
            {items.length === 0 && (
              <div className="col-span-full text-sm text-gray-500 text-center">
                Aktuell keine Shopping‑Angebote verfügbar.
              </div>
            )}
          </OffersGrid>
        )}
      </main>
    </div>
  )
}
