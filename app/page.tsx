'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'

import KategorieNavigation from './components/KategorieNavigation'
import DealCard from './components/DealCard'
import OffersGrid from './components/OffersGrid'

import { supabase } from '@/utils/supabaseClient'
import { getActiveOffers, type Offer } from '@/utils/offers'

export default function AlleAngebotePage() {
  const [items, setItems] = useState<Offer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    ;(async () => {
      try {
        const offers = await getActiveOffers(supabase)
        setItems(offers)
      } catch (e: any) {
        setError(e?.message ?? 'Fehler beim Laden')
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  return (
    <div>
      {/* ✅ Banner NUR Desktop (Mobile komplett ausblenden) */}
      <div className="hidden md:block relative w-full h-[300px]">
        <Image
          src="/bannerrichtig.png"
          alt="Alle Angebote"
          fill
          className="object-cover"
          priority
        />
      </div>

      <KategorieNavigation />

      <main className="max-w-6xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
        {loading && <div className="text-sm text-gray-500">Lade Angebote…</div>}

        {!loading && error && (
          <div className="text-sm text-red-600">Fehler: {error}</div>
        )}

        {!loading && !error && (
          <OffersGrid>
            {items.map(offer => (
              <DealCard
                key={offer.id}
                id={offer.id}
                name={offer.name}
                description={offer.description}
                reward={offer.reward}
                providerBonusAmount={offer.providerBonusAmount ?? null}
                providerBonusText={offer.providerBonusText ?? null}
                image={offer.image ?? '/placeholder.png'}
                url={`/angebot/${offer.id}`}
              />
            ))}

            {items.length === 0 && (
              <div className="col-span-full text-sm text-gray-500 text-center">
                Aktuell keine Angebote verfügbar.
              </div>
            )}
          </OffersGrid>
        )}
      </main>
    </div>
  )
}