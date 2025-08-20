'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/utils/supabaseClient'
import { getOfferById, Offer } from '@/utils/offers'
import Link from 'next/link'

interface Click {
  id: string
  offer_id: string
  clicked_at: string
  redeemed: boolean
  confirmed?: boolean
}

export default function VerlaufPage() {
  const [userName, setUserName] = useState<string>('')
  const [clicks, setClicks] = useState<Click[]>([])
  const [offersMap, setOffersMap] = useState<Record<string, Offer>>({})
  const [totalReward, setTotalReward] = useState<number>(0)
  const [confirmedReward, setConfirmedReward] = useState<number>(0)

  useEffect(() => {
    const fetchData = async () => {
      const { data: userRes } = await supabase.auth.getUser()
      if (!userRes?.user?.id) {
        window.location.href = '/login'
        return
      }

      const userId = userRes.user.id

      // Profil laden/erstellen
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id, firstName, lastName')
        .eq('id', userId)
        .maybeSingle()

      if (!existingProfile) {
        const { email, user_metadata } = userRes.user
        const { username, firstName, lastName } = user_metadata || {}

        await supabase.from('profiles').insert({
          id: userId,
          email,
          username,
          firstName,
          lastName,
        })
        setUserName(`${firstName ?? ''} ${lastName ?? ''}`)
      } else {
        setUserName(`${existingProfile.firstName ?? ''} ${existingProfile.lastName ?? ''}`)
      }

      // Klicks laden
      const { data: clickData } = await supabase
        .from('clicks')
        .select('*')
        .eq('user_id', userId)

      if (!clickData) return

      setClicks(clickData)

      // Zu jedem Klick das Offer laden
      const offerMap: Record<string, Offer> = {}
      for (const c of clickData) {
        if (!offerMap[c.offer_id]) {
          const offer = await getOfferById(supabase, c.offer_id)
          if (offer) offerMap[c.offer_id] = offer
        }
      }
      setOffersMap(offerMap)

      // Rewards berechnen
      const unconfirmedRewards = clickData
        .filter((c) => !c.redeemed)
        .map((c) => offerMap[c.offer_id]?.reward || 0)

      const confirmedRewards = clickData
        .filter((c) => c.confirmed && !c.redeemed)
        .map((c) => offerMap[c.offer_id]?.reward || 0)

      setTotalReward(unconfirmedRewards.reduce((sum, val) => sum + val, 0))
      setConfirmedReward(confirmedRewards.reduce((sum, val) => sum + val, 0))
    }

    fetchData()
  }, [])

  const sortedTimeline = clicks
    .sort((a, b) => new Date(b.clicked_at).getTime() - new Date(a.clicked_at).getTime())
    .slice(0, 7)
    .map((click) => {
      const offer = offersMap[click.offer_id]
      return {
        id: click.id,
        name: offer?.name || 'Unbekanntes Angebot',
        reward: offer?.reward || 0,
        date: new Date(click.clicked_at).toLocaleDateString(),
      }
    })

  return (
    <div className="min-h-screen bg-[#f7f3e6] text-[#003b5b] px-4 py-10">
      <div className="max-w-5xl mx-auto space-y-12">
        <div className="text-center">
          <h1 className="text-3xl sm:text-4xl font-extrabold mb-2">Willkommen im Bonus-Nest 🪺</h1>
          <p className="text-lg sm:text-xl font-medium">
            Hallo <span className="text-orange-600 font-bold">{userName}</span>, schön, dass du da bist!
          </p>
        </div>

        {/* Stat Boxes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-[#f1e8cc] border border-[#d6c4a1] rounded-2xl shadow p-6 flex flex-col justify-between">
            <div>
              <p className="text-sm font-medium mb-1">✅ Bestätigtes Guthaben</p>
              <p className="text-3xl font-extrabold text-green-600">{confirmedReward.toFixed(2)} €</p>
            </div>
            <button
              onClick={() => (window.location.href = '/einloesen')}
              className="mt-6 bg-green-700 hover:bg-green-800 text-white text-sm px-4 py-2 rounded-xl"
            >
              Prämie einlösen
            </button>
          </div>

          <div className="bg-[#f1e8cc] border border-[#d6c4a1] rounded-2xl shadow p-6 flex flex-col justify-between">
            <div>
              <p className="text-sm font-medium mb-1">⏳ Vorgemerktes Guthaben</p>
              <p className="text-3xl font-extrabold text-yellow-600">{totalReward.toFixed(2)} €</p>
            </div>
            <button
              onClick={() => (window.location.href = '/verlauf')}
              className="mt-6 bg-yellow-600 hover:bg-yellow-700 text-white text-sm px-4 py-2 rounded-xl"
            >
              Offene Teilnahmen
            </button>
          </div>

          <div className="bg-[#f1e8cc] border border-[#d6c4a1] rounded-2xl shadow p-6 flex flex-col justify-between">
            <div>
              <p className="text-sm font-medium mb-1">📜 Prämienverlauf</p>
              <p className="text-3xl font-extrabold text-blue-600">{clicks.length}</p>
            </div>
            <button
              onClick={() => (window.location.href = '/verlauf')}
              className="mt-6 bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-xl"
            >
              Verlauf anzeigen
            </button>
          </div>
        </div>

        {/* Timeline */}
        <div className="bg-[#f1e8cc] border border-[#d6c4a1] rounded-2xl shadow p-6">
          <h2 className="text-xl font-semibold mb-6">🕒 Deine letzten Aktivitäten</h2>
          <ol className="relative border-l-4 border-[#003b5b] pl-6">
            {sortedTimeline.map((item) => (
              <li key={item.id} className="mb-6 group">
                <div className="absolute w-4 h-4 bg-[#003b5b] rounded-full -left-2 top-1.5 border-2 border-white"></div>
                <div className="p-4 bg-white rounded-xl shadow hover:bg-[#fef9ec] transition">
                  <div className="flex justify-between items-center">
                    <h3 className="font-bold text-md">{item.name}</h3>
                    <span className="text-sm text-green-700 font-semibold">+{item.reward.toFixed(2)} €</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">Am {item.date}</p>
                </div>
              </li>
            ))}
          </ol>
          <div className="mt-6 text-center">
            <Link
              href="/dashboard"
              className="inline-block bg-[#003b5b] hover:bg-[#002b45] text-white text-sm px-6 py-2 rounded-xl transition"
            >
              Zurück zum Dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
