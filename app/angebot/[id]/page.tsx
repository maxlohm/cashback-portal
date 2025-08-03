'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/utils/supabaseClient'
import { offers } from '@/utils/offers'
import Image from 'next/image'

export default function AngebotsDetailPage() {
  const [user, setUser] = useState<any>(null)
  const [offer, setOffer] = useState<any>(null)
  const params = useParams()
  const router = useRouter()

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser()
      if (data?.user) setUser(data.user)
    }

    getUser()

    const id = params?.id as string
    const foundOffer = offers.find((o) => o.id === decodeURIComponent(id))
    setOffer(foundOffer)
  }, [params])

  const handleClick = async () => {
    if (!user) {
      router.push('/login')
    } else {
      await supabase.from('clicks').insert({
        user_id: user.id,
        offer_id: offer.id,
        clicked_at: new Date().toISOString(),
        redeemed: false,
      })
      window.open(offer.affiliateUrl, '_blank')
    }
  }

  if (!offer) {
    return (
      <div className="text-center text-red-600 font-semibold text-lg mt-10">
        ❌ Angebot nicht gefunden. (ID: {params?.id?.toString()})
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-6">
      <h1 className="text-3xl font-bold">{offer.name}</h1>

      <Image
        src={offer.image}
        alt={offer.name}
        width={1000}
        height={50}
        className="rounded-xl mx-auto"
      />

      <p className="text-lg text-gray-700">{offer.description}</p>

      {offer.terms && offer.terms.length > 0 && (
        <div className="bg-gray-100 p-6 rounded-xl shadow-sm">
          <h2 className="text-xl font-semibold mb-3">Teilnahmebedingungen</h2>
          <ul className="list-disc list-inside text-gray-800 space-y-1">
            {offer.terms.map((term: string, index: number) => (
              <li key={index}>{term}</li>
            ))}
          </ul>
        </div>
      )}

      <button
        onClick={handleClick}
        className="bg-orange-600 hover:bg-orange-700 text-white font-semibold px-6 py-3 rounded-xl transition w-full sm:w-auto"
      >
        Jetzt Prämie sichern
      </button>
    </div>
  )
}
