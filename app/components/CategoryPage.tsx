'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'

import KategorieNavigation from './KategorieNavigation'
import DealCard from './DealCard'
import OffersGrid from './OffersGrid'

import { supabase } from '@/utils/supabaseClient'
import { getActiveOffersByCategories, type Offer, type OfferCategory } from '@/utils/offers'

type Props = {
  title: string
  categories: OfferCategory[]
  emptyText?: string
  bannerAlt?: string
  bannerSrc?: string
}

export default function CategoryPage({
  title,
  categories,
  emptyText = 'Aktuell keine Angebote verfügbar.',
  bannerAlt,
  bannerSrc = '/bannerrichtig.png',
}: Props) {
  const [items, setItems] = useState<Offer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    ;(async () => {
      try {
        setLoading(true)
        setError(null)

        const offers = await getActiveOffersByCategories(supabase, categories)
        setItems(offers)
      } catch (e: any) {
        setError(e?.message ?? 'Fehler beim Laden')
      } finally {
        setLoading(false)
      }
    })()
  }, [categories.join('|')])

  return (
    <div>
      <Image
        src={bannerSrc}
        alt={bannerAlt ?? title}
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
                providerBonusAmount={offer.providerBonusAmount ?? null}
                providerBonusText={offer.providerBonusText ?? null}
                image={offer.image ?? '/placeholder.png'}
                url={`/angebot/${offer.id}`}
              />
            ))}

            {items.length === 0 && (
              <div className="col-span-full text-sm text-gray-500 text-center">
                {emptyText}
              </div>
            )}
          </OffersGrid>
        )}
      </main>
    </div>
  )
}