'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/utils/supabaseClient'

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [confirmedSum, setConfirmedSum] = useState<number>(0)
  const [pendingSum, setPendingSum] = useState<number>(0)
  const [leadCount, setLeadCount] = useState<number>(0)

  useEffect(() => {
    const fetchData = async () => {
      const { data: userData } = await supabase.auth.getUser()
      const userId = userData?.user?.id

      if (!userId) return

      setUser(userId)

      const { data: confirmed, error: errorConfirmed } = await supabase
        .from('leads')
        .select('amount')
        .eq('user_id', userId)
        .eq('confirmed', true)

      const { data: pending, error: errorPending } = await supabase
        .from('leads')
        .select('amount')
        .eq('user_id', userId)
        .eq('confirmed', false)

      const { count, error: errorCount } = await supabase
        .from('leads')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)

      if (confirmed) {
        const sum = confirmed.reduce((acc, lead) => acc + (lead.amount ?? 0), 0)
        setConfirmedSum(sum)
      }

      if (pending) {
        const sum = pending.reduce((acc, lead) => acc + (lead.amount ?? 0), 0)
        setPendingSum(sum)
      }

      if (count !== null) {
        setLeadCount(count)
      }
    }

    fetchData()
  }, [])

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-bold mb-6">🎉 Dein Bonus-Nest Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600">🟡 Vorgemerktes Guthaben</p>
          <p className="text-xl font-bold">{pendingSum.toFixed(2)} €</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600">📗 Bestätigtes Guthaben</p>
          <p className="text-xl font-bold">{confirmedSum.toFixed(2)} €</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600">🔁 Klickzähler</p>
          <p className="text-xl font-bold">{leadCount}</p>
        </div>
      </div>

      <div className="mt-8 text-center">
        <a
          href="/einloesen"
          className="bg-yellow-500 text-white py-2 px-4 rounded hover:bg-yellow-600"
        >
          Prämie einlösen
        </a>
      </div>
    </div>
  )
}
