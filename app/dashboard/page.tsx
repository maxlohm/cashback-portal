'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../utils/supabaseClient'
import { offers } from '../../utils/offers'
import Header from '../components/header'
import Footer from '../components/footer'

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
      if (!userData?.user?.email || !userData?.user?.id) {
        window.location.href = '/login'
        return
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('vorname, nachname')
        .eq('id', userData.user.id)
        .single()

      if (profile) {
        setUserName(`${profile.vorname} ${profile.nachname}`)
      }

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

  const handleGiftcardTest = async () => {
    try {
      const res = await fetch('/api/redeem-gift-card', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'lohmannmax2003@gmail.com',
          value: 5,
          utid: 'U591998' // Amazon.de 5€ – gültig
        })
      })

      const result = await res.json()
      alert(result.success
        ? `🎉 Gutschein erfolgreich bestellt!\nCode: ${result.code}`
        : `❌ Fehler: ${JSON.stringify(result.error)}`)
    } catch (err: any) {
      alert(`❌ API-Fehler beim Einlösen:\n${err.message}`)
    }
  }

  return (
    <>
      <Header />

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

          <div className="text-center pt-10">
            <button
              onClick={handleGiftcardTest}
              className="bg-blue-700 hover:bg-blue-800 text-white px-6 py-3 rounded-xl shadow w-full max-w-xs mx-auto"
            >
              🎁 Test-Gutschein bestellen (5 € Amazon)
            </button>
          </div>
        </div>
      </div>

      <Footer />
    </>
  )
}
