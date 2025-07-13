'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../utils/supabaseClient'
import { offers } from '../../utils/offers'

interface Click {
  id: string
  offer_id: string
  clicked_at: string
  redeemed: boolean
  confirmed?: boolean
}

export default function DashboardPage() {
  const [userName, setUserName] = useState<string>('')
  const [clicks, setClicks] = useState<Click[]>([])
  const [totalReward, setTotalReward] = useState<number>(0)
  const [confirmedReward, setConfirmedReward] = useState<number>(0)

  useEffect(() => {
    const fetchData = async () => {
      const { data: userData } = await supabase.auth.getUser()
      if (!userData?.user?.id) {
        window.location.href = '/login'
        return
      }

      // 🔐 Profil prüfen – falls nicht vorhanden, anlegen aus user_metadata
      const { data: existingProfile, error: profileFetchError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', userData.user.id)
        .single()

      if (!existingProfile) {
        const { email, user_metadata } = userData.user
        const { username, firstName, lastName } = user_metadata || {}

        const { error: profileInsertError } = await supabase.from('profiles').insert({
          id: userData.user.id,
          email,
          username,
          firstName,
          lastName,
        })

        if (profileInsertError) {
          console.error('Profil konnte nicht gespeichert werden:', profileInsertError)
        }
      }

      // 🧾 Profil-Name holen
      const { data: profile } = await supabase
        .from('profiles')
        .select('firstName, lastName')
        .eq('id', userData.user.id)
        .single()

      if (profile) {
        setUserName(`${profile.firstName} ${profile.lastName}`)
      }

      // 💾 Klickdaten holen
      const { data: clickData, error } = await supabase
        .from('clicks')
        .select('*')
        .eq('user_id', userData.user.id)

      if (clickData) {
        setClicks(clickData)

        const unconfirmedRewards = clickData
          .filter((c) => !c.redeemed)
          .map((c) => offers.find((o) => o.id === c.offer_id)?.reward || 0)

        const confirmedRewards = clickData
          .filter((c) => c.confirmed && !c.redeemed)
          .map((c) => offers.find((o) => o.id === c.offer_id)?.reward || 0)

        setTotalReward(unconfirmedRewards.reduce((sum, val) => sum + val, 0))
        setConfirmedReward(confirmedRewards.reduce((sum, val) => sum + val, 0))
      }

      if (error) {
        console.error('Fehler beim Laden:', error)
      }
    }

    fetchData()
  }, [])

  return (
    <div className="min-h-screen bg-[#f9fafa] text-[#003b5b] px-4 py-10">
      <div className="max-w-7xl mx-auto space-y-10">
        <h1 className="text-2xl sm:text-3xl font-bold text-center">
          Willkommen im Dashboard, <span className="text-orange-500">{userName}</span>
        </h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          <div className="bg-[#d0f0f7] border border-blue-200 p-6 rounded-xl shadow text-center">
            <p className="text-sm sm:text-base text-[#003b5b]">Bestätigtes Guthaben</p>
            <p className="text-2xl sm:text-3xl font-bold text-green-600">
              {confirmedReward.toFixed(2)} €
            </p>
            <button
              onClick={() => window.location.href = '/einloesen'}
              className="mt-4 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded w-full"
            >
              Prämie einlösen
            </button>
          </div>

          <div className="bg-[#d0f0f7] border border-blue-200 p-6 rounded-xl shadow text-center">
            <p className="text-sm sm:text-base text-[#003b5b]">Vorgemerktes Guthaben</p>
            <p className="text-2xl sm:text-3xl font-bold text-yellow-500">
              {totalReward.toFixed(2)} €
            </p>
            <button
              onClick={() => window.location.href = '/verlauf'}
              className="mt-4 bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded w-full"
            >
              Offene Teilnahmen
            </button>
          </div>

          <div className="bg-[#d0f0f7] border border-blue-200 p-6 rounded-xl shadow text-center">
            <p className="text-sm sm:text-base text-[#003b5b]">Prämienverlauf</p>
            <p className="text-2xl sm:text-3xl font-bold text-blue-600">
              {clicks.length}
            </p>
            <button
              onClick={() => window.location.href = '/verlauf'}
              className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded w-full"
            >
              Prämienverlauf
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
