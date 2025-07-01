'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/utils/supabaseClient'
import { offers } from '@/utils/offers'
import Link from 'next/link'
import Image from 'next/image'

export default function Home() {
  const [loggedIn, setLoggedIn] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getUser()
      if (data?.user) {
        setLoggedIn(true)
        setUserId(data.user.id)
      }
    }
    checkAuth()
  }, [])

  const handleClick = async (offerId: string, link: string) => {
    if (!loggedIn || !userId) {
      window.location.href = '/login'
      return
    }

    await supabase.from('clicks').insert([
      {
        user_id: userId,
        offer_id: offerId,
        clicked_at: new Date().toISOString(),
      },
    ])

    window.open(link, '_blank')
  }

  return (
    <>
      {/* 🔥 Banner mit Maus */}
      <div className="w-full bg-[#fdf7ee]">
        <Image
          src="/Banner.png"
          alt="Banner"
          width={1920}
          height={500}
          className="w-full h-auto object-cover"
          priority
        />
      </div>

      {/* 🔠 Kategorienavigation */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-wrap gap-4 text-sm font-medium text-gray-700">
          <button className="text-[#003b5b] border-b-2 border-[#003b5b] pb-1">Alle Deals</button>
          <button className="hover:text-[#003b5b]">Finanzen</button>
          <button className="hover:text-[#003b5b]">Mobilfunk</button>
          <button className="hover:text-[#003b5b]">Gratis</button>
          <button className="hover:text-[#003b5b]">Shopping</button>
          <button className="hover:text-[#003b5b]">Vergleiche</button>
        </div>
      </div>

      {/* 💸 Angebote als Karten */}
      <div className="bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 px-4">
          {offers.map((offer) => (
            <div
              key={offer.id}
              className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 flex flex-col justify-between hover:shadow-md transition"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="text-lg font-bold text-[#003b5b]">{offer.name}</div>
                <div className="text-green-600 font-semibold">{offer.reward} €</div>
              </div>
              <p className="text-sm text-gray-600 mb-4">{offer.description}</p>
              <button
                onClick={() => handleClick(offer.id, offer.link)}
                className="w-full bg-[#003b5b] hover:bg-[#005b91] text-white py-2 px-4 rounded-lg font-medium transition"
              >
                Zum Deal
              </button>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
