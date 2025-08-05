'use client'

import Image from 'next/image'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/utils/supabaseClient'
import KategorieNavigation from '../navigation/page'
import { offers, Offer } from '@/utils/offers'
import DealCard from '../components/DealCard'

export default function FinanzenPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getUser()
      if (data?.user) setUser(data.user)
    }
    checkUser()
  }, [])

  return (
    <>
      {/* Banner oben */}
      <div className="w-full">
        <Image
          src="/bannerrichtig.png"
          alt="Finanzen Banner"
          width={1440}
          height={300}
          className="w-full h-auto object-cover"
          priority
        />
      </div>

      {/* Navigation */}
      <KategorieNavigation />

      {/* Inhalt */}
      <main className="max-w-6xl mx-auto py-10 px-4 sm:px-6 lg:px-8 space-y-10">
        <h1 className="text-3xl font-bold text-[#003b5b] mb-4"></h1>
        <div className="flex flex-wrap gap-6 justify-start">
          {offers
            .filter(
              (offer: Offer) =>
                offer.category === 'kredit' ||
                offer.category === 'finanzen'
            )
            .map((offer: Offer) => (
              <DealCard
                key={offer.id}
                name={offer.name}
                description={offer.description}
                reward={offer.reward}
                image={offer.image}
                offerId={offer.id}               // ✅ hinzugefügt
                url={offer.affiliateUrl}         // ✅ hinzugefügt
              />
            ))}
        </div>
      </main>
    </>
  )
}
