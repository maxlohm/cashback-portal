'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/utils/supabaseClient'
import { offers } from '@/utils/offers'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts'

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
  const [rewardByOffer, setRewardByOffer] = useState<{ name: string; value: number }[]>([])

  useEffect(() => {
    const fetchData = async () => {
      const { data: userData } = await supabase.auth.getUser()
      if (!userData?.user?.id) {
        window.location.href = '/login'
        return
      }

      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', userData.user.id)
        .single()

      if (!existingProfile) {
        const { email, user_metadata } = userData.user
        const { username, firstName, lastName } = user_metadata || {}

        await supabase.from('profiles').insert({
          id: userData.user.id,
          email,
          username,
          firstName,
          lastName,
        })
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('firstName, lastName')
        .eq('id', userData.user.id)
        .single()

      if (profile) {
        setUserName(`${profile.firstName} ${profile.lastName}`)
      }

      const { data: clickData } = await supabase
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

        const offerMap: { [key: string]: number } = {}
        clickData.forEach((click) => {
          const offer = offers.find((o) => o.id === click.offer_id)
          if (offer) {
            offerMap[offer.name] = (offerMap[offer.name] || 0) + (offer.reward || 0)
          }
        })

        const chartData = Object.entries(offerMap).map(([name, value]) => ({ name, value }))
        setRewardByOffer(chartData)
      }
    }

    fetchData()
  }, [])

  return (
    <div className="min-h-screen bg-[#f7f3e6] text-[#003b5b] px-4 py-10">
      <div className="max-w-5xl mx-auto space-y-12">
        <div className="text-center">
          <h1 className="text-3xl sm:text-4xl font-extrabold mb-2">
            Willkommen im Bonus-Nest 🪺
          </h1>
          <p className="text-lg sm:text-xl font-medium">
            Hallo <span className="text-orange-600 font-bold">{userName}</span>, schön, dass du da bist!
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-[#f1e8cc] border border-[#d6c4a1] rounded-2xl shadow p-6 flex flex-col justify-between">
            <div>
              <p className="text-sm text-[#003b5b] font-medium mb-1">✅ Bestätigtes Guthaben</p>
              <p className="text-3xl sm:text-4xl font-extrabold text-green-600">
                {confirmedReward.toFixed(2)} €
              </p>
            </div>
            <button
              onClick={() => window.location.href = '/einloesen'}
              className="mt-6 bg-green-700 hover:bg-green-800 text-white text-sm px-4 py-2 rounded-xl transition"
            >
              Prämie einlösen
            </button>
          </div>

          <div className="bg-[#f1e8cc] border border-[#d6c4a1] rounded-2xl shadow p-6 flex flex-col justify-between">
            <div>
              <p className="text-sm text-[#003b5b] font-medium mb-1">⏳ Vorgemerktes Guthaben</p>
              <p className="text-3xl sm:text-4xl font-extrabold text-yellow-600">
                {totalReward.toFixed(2)} €
              </p>
            </div>
            <button
              onClick={() => window.location.href = '/verlauf'}
              className="mt-6 bg-yellow-600 hover:bg-yellow-700 text-white text-sm px-4 py-2 rounded-xl transition"
            >
              Offene Teilnahmen
            </button>
          </div>

          <div className="bg-[#f1e8cc] border border-[#d6c4a1] rounded-2xl shadow p-6 flex flex-col justify-between">
            <div>
              <p className="text-sm text-[#003b5b] font-medium mb-1">📜 Prämienverlauf</p>
              <p className="text-3xl sm:text-4xl font-extrabold text-blue-600">
                {clicks.length}
              </p>
            </div>
            <button
              onClick={() => window.location.href = '/verlauf'}
              className="mt-6 bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-xl transition"
            >
              Verlauf anzeigen
            </button>
          </div>
        </div>

        <div className="bg-[#f1e8cc] border border-[#d6c4a1] rounded-2xl shadow p-6">
          <h2 className="text-xl font-semibold mb-4">🔎 Belohnungen nach Angeboten</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={rewardByOffer}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#f59e0b" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  )
}
