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
      <Header />

      {/* Beige Fläche unter dem Header */}
      <div className="bg-[#fdf7ee] h-48 relative flex items-center">
        <div className="max-w-7xl mx-auto w-full px-6 md:px-10 flex justify-end">
          <div className="relative w-40 h-40">
            <Image
  src="/mouse-v2.png"
  alt="Maus"
  fill
  className="object-contain"
  priority
/>

          </div>
        </div>
      </div>

      <div className="bg-white text-gray-800 min-h-screen">
        <div className="space-y-10 p-6 md:p-10 max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold">📢 Aktuelle Angebote:</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {offers.map((offer) => (
              <div
                key={offer.id}
                className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition"
              >
                <div className="h-40 bg-gray-100 rounded mb-4 flex items-center justify-center">
                  <span className="text-gray-400">Bild hier</span>
                </div>
                <h3 className="text-xl font-bold">{offer.name}</h3>
                <p className="text-gray-600 mb-2">{offer.description}</p>
                <p className="text-green-600 font-semibold mb-4">
                  {offer.reward} € Prämie
                </p>
                <button
                  onClick={() => handleClick(offer.id, offer.link)}
                  className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg"
                >
                  Jetzt teilnehmen
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Footer />
    </>
  )
}
