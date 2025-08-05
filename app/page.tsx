// app/page.tsx
'use client'

import { useEffect, useState } from 'react'
import KategorieNavigation from './navigation/page'
import { offers, Offer } from '@/utils/offers'
import DealCard from './components/DealCard'
import { useRouter } from 'next/navigation'
import { supabase } from '@/utils/supabaseClient'
import Image from 'next/image'

export default function AlleAngebotePage() {
  const [user, setUser] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getUser()
      if (data?.user) {
        setUser(data.user)
      }
    }
    checkUser()
  }, [])

  const handleGoToDetailPage = (offerId: string) => {
    router.push(`/angebot/${offerId}`)
  }

  return (
    <div className="mt-0 p-0">
      {/* Banner oben */}
      <div className="w-full max-w-none mx-auto p-0">
        <Image
          src="/bannerrichtig.png"
          alt="Alle Angebote Banner"
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
          {offers.map((offer: Offer) => (
            <div
              key={offer.id}
              className="w-full md:w-[48%] flex flex-col md:flex-row items-center gap-6 p-6 bg-white rounded-lg border shadow hover:shadow-lg transition-all"
            >
              {/* Bildbereich */}
              <div
                style={{ width: 300, height: 250 }}
                className="flex-shrink-0 flex items-center justify-center bg-white"
              >
                <img
                  src={offer.image}
                  alt={offer.name}
                  width={300}
                  height={250}
                  loading="lazy"
                  style={{ objectFit: 'contain', maxWidth: '100%', maxHeight: '100%' }}
                  className="rounded"
                />
              </div>

              {/* Infobereich */}
              <div className="flex flex-col items-center gap-4 text-center">
                <div className="bg-[#ca4b24] text-white px-6 py-2 rounded-lg text-lg font-bold min-w-[120px]">
                  {offer.reward} €
                </div>
                <button
                  onClick={() => handleGoToDetailPage(offer.id)}
                  className="cursor-pointer bg-[#ca4b24] hover:bg-[#a33d1e] text-white px-6 py-2 rounded-lg text-base font-medium min-w-[120px] transition"
                >
                  Jetzt sichern!
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
