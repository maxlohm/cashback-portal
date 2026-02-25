'use client'

import { useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

import KategorieNavigation from './components/KategorieNavigation'
import DealCard from './components/DealCard'
import OffersGrid from './components/OffersGrid'

import { getActiveOffers, type Offer } from '@/utils/offers'

export default function AlleAngebotePage() {
  const supabase = useMemo(() => createClientComponentClient(), [])

  const [items, setItems] = useState<Offer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let alive = true

    ;(async () => {
      try {
        setLoading(true)
        setError(null)

        const offers = await getActiveOffers(supabase as any)

        if (!alive) return
        setItems(offers)
      } catch (e: any) {
        if (!alive) return
        setError(e?.message ?? 'Fehler beim Laden')
      } finally {
        if (!alive) return
        setLoading(false)
      }
    })()

    return () => {
      alive = false
    }
  }, [supabase])

  return (
    <div>
      {/* Banner nur Desktop */}
      <div className="hidden md:block relative w-full h-[300px] pb-12">
        <Image
          src="/bannerrichtig.png"
          alt="Alle Angebote"
          fill
          className="object-cover"
          priority
        />
      </div>

      {/* Navigation separat */}
      <div className="w-full flex justify-center mt-16">
        <div className="max-w-6xl w-full px-4 sm:px-6 lg:px-8">
          <KategorieNavigation />
        </div>
      </div>

      <main className="max-w-6xl mx-auto pt-10 pb-12 px-4 sm:px-6 lg:px-8">
        {loading && (
          <div className="text-sm text-gray-500">Lade Angebote…</div>
        )}

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