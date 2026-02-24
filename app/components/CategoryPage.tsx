'use client'

import { useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

import KategorieNavigation from './KategorieNavigation'
import DealCard from './DealCard'
import OffersGrid from './OffersGrid'

import {
  getActiveOffersByCategories,
  type Offer,
  type OfferCategory,
} from '@/utils/offers'

type Props = {
  title: string
  categories: OfferCategory[]
  emptyText?: string
  bannerAlt?: string
  bannerSrc?: string | null
}

export default function CategoryPage({
  title,
  categories,
  emptyText = 'Aktuell keine Angebote verfügbar.',
  bannerAlt = 'Banner',
  bannerSrc = '/bannerrichtig.png',
}: Props) {
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
        const offers = await getActiveOffersByCategories(
          supabase as any,
          categories,
        )
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
  }, [supabase, categories.join('|')])

  return (
    <div>
      {/* ✅ Banner NUR Desktop (Mobile komplett ausblenden) */}
      {bannerSrc ? (
        <div className="hidden md:block relative w-full h-[300px]">
          <Image
            src={bannerSrc}
            alt={bannerAlt}
            fill
            className="object-cover"
            priority
          />
        </div>
      ) : null}

      <KategorieNavigation />

      <main className="max-w-6xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl md:text-3xl font-bold text-[#003b5b] mb-6">
          {title}
        </h1>

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
                {emptyText}
              </div>
            )}
          </OffersGrid>
        )}
      </main>
    </div>
  )
}