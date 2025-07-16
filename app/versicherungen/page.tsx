'use client'

import { useEffect, useState } from 'react'
import KategorieNavigation from '../navigation/page'
import { offers, Offer } from '@/utils/offers'
import DealCard from '../components/DealCard'
import { useRouter } from 'next/navigation'
import { supabase } from '@/utils/supabaseClient'
import Image from 'next/image'

export default function VersicherungenPage() {
  const [user, setUser] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getUser()
      if (data?.user) setUser(data.user)
    }
    checkUser()
  }, [])

  const handleAffiliateClick = async (affiliateUrl: string, offerId: string) => {
    if (!user) {
      router.push('/login')
    } else {
      await supabase.from('clicks').insert({
        user_id: user.id,
        offer_id: offerId,
        clicked_at: new Date().toISOString(),
        redeemed: false,
      })
      window.open(affiliateUrl, '_blank')
    }
  }

  return (
    <div className="mt-0 p-0">
      {/* Banner oben */}
      <div className="w-full max-w-none mx-auto p-0">
        <Image
          src="/bannerrichtig.png"
          alt="Versicherungsangebote Banner"
          width={1920}
          height={300}
          className="w-full h-auto object-cover block"
          priority
        />
      </div>

      {/* Navigation */}
      <KategorieNavigation />

      {/* Inhalt */}
      <main className="max-w-6xl mx-auto py-10 px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="flex flex-wrap gap-6 justify-start">
          {offers
            .filter((offer: Offer) => offer.category === 'versicherung')
            .map((offer: Offer) => (
              <DealCard
                key={offer.id}
                name={offer.name}
                description={offer.description}
                reward={offer.reward}
                image={offer.image}
                onClick={() => handleAffiliateClick(offer.affiliateUrl, offer.id)}
              />
            ))}
        </div>
      </main>
    </div>
  )
}
