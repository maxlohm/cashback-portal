'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/utils/supabaseClient'
import { offers } from '@/utils/offers'
import Link from 'next/link'
import Header from './components/header'
import Footer from './components/footer'
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
      {/* Bannerbereich */}
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

      {/* Hauptinhalt */}
      <div className="bg-white text-gray-800">
        <div className="max-w-7xl mx-auto p-6 sm:p-8 md:p-10 space-y-10">
          <h2 className="text-3xl font-bold text-[#003b5b]">📢 Aktuelle Angebote</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {offers.map((offer) => (
              <div
                key={offer.id}
                className="bg-white border border-blue-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition"
              >
                <div className="h-40 bg-gray-100 rounded mb-4 flex items-center justify-center text-gray-400">
                  {/* Platzhalter für Bild */}
                  Bild hier
                </div>
                <h3 className="text-xl font-bold text-[#003b5b] mb-1">{offer.name}</h3>
                <p className="text-gray-600 text-sm mb-2">{offer.description}</p>
                <p className="text-green-600 font-semibold mb-4">
                  {offer.reward} € Prämie
                </p>
                <button
                  onClick={() => handleClick(offer.id, offer.link)}
                  className="w-full bg-[#003b5b] hover:bg-[#005b91] text-white py-2 px-4 rounded-lg font-medium transition"
                >
                  Jetzt teilnehmen
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>  
    </>
  )
}
