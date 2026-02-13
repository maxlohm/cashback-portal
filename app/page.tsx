'use client'

import { useEffect, useMemo, useState } from 'react'
import Image from 'next/image'

import DealCard from './components/DealCard'
import OffersGrid from './components/OffersGrid'

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { getActiveOffers, type Offer } from '../utils/offers'

// WICHTIG: Navigation-Route NICHT in Client importieren.
// Wenn du Navigation brauchst, machen wir daraus als nächstes eine echte Component.

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

        const offers = await getActiveOffers(supabase, { limit: 200 })
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
      <Image
        src="/bannerrichtig.png"
        alt="Alle Angebote"
        width={1920}
        height={300}
        className="w-full h-auto object-cover"
        priority
      />

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
                Aktuell keine Angebote verfügbar.
              </div>
            )}
          </OffersGrid>
        )}
      </main>
    </div>
  )
}
