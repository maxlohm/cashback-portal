'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/utils/supabaseClient'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { de } from 'date-fns/locale'

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [pendingDeals, setPendingDeals] = useState<any[]>([])
  const [confirmedDeals, setConfirmedDeals] = useState<any[]>([])
  const [dealHistory, setDealHistory] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const router = useRouter()

  useEffect(() => {
    const fetchUserAndData = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push('/login')
        return
      }

      setUser(user)

      const { data: pending } = await supabase
        .from('clicks')
        .select('amount')
        .eq('user_id', user.id)
        .gt('amount', 0)
        .eq('redeemed', false)

      const { data: confirmed } = await supabase
        .from('clicks')
        .select('amount')
        .eq('user_id', user.id)
        .gt('amount', 0)
        .eq('redeemed', true)

      const { data: history } = await supabase
        .from('clicks')
        .select('clicked_at, offer_id, amount, redeemed')
        .eq('user_id', user.id)
        .gt('amount', 0)
        .order('clicked_at', { ascending: false })

      setPendingDeals(pending || [])
      setConfirmedDeals(confirmed || [])
      setDealHistory(history || [])
      setIsLoading(false)
    }

    fetchUserAndData()
  }, [router])

  const formatCurrency = (amount: number) =>
    amount.toLocaleString('de-DE', {
      style: 'currency',
      currency: 'EUR',
    })

  const getStatusText = (redeemed: boolean) => (redeemed ? 'Bestätigt' : 'Offen')

  if (isLoading) return <div className="p-6">Lade Dashboard...</div>

  const vorgemerktesGuthaben = pendingDeals.reduce((sum, d) => sum + d.amount, 0)
  const bestaetigtesGuthaben = confirmedDeals.reduce((sum, d) => sum + d.amount, 0)
  const abgeschlosseneDeals = pendingDeals.length + confirmedDeals.length

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Dein Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow p-6">
          <p className="text-gray-600 mb-1">Bestätigtes Guthaben</p>
          <p className="text-green-600 text-3xl font-semibold">
            {formatCurrency(bestaetigtesGuthaben)}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow p-6">
          <p className="text-gray-600 mb-1">Offenes Guthaben</p>
          <p className="text-yellow-600 text-3xl font-semibold">
            {formatCurrency(vorgemerktesGuthaben)}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow p-6 mb-8">
        <h2 className="text-xl font-bold mb-4">Deal-Statistiken</h2>
        <p>Abgeschlossene Deals: {abgeschlosseneDeals}</p>
        <p>Bestätigte Abschlüsse: {confirmedDeals.length}</p>
        <p>Offene Abschlüsse: {pendingDeals.length}</p>
      </div>

      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-xl font-bold mb-4">Abschlussverlauf</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Datum</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Deal</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Betrag</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {dealHistory.map((deal, index) => (
                <tr key={index}>
                  <td className="px-4 py-2">
                    {format(new Date(deal.clicked_at), 'd.M.yyyy', { locale: de })}
                  </td>
                  <td className="px-4 py-2">{deal.offer_id}</td>
                  <td className="px-4 py-2">
                    {deal.amount ? formatCurrency(deal.amount) : '-'}
                  </td>
                  <td className="px-4 py-2">{getStatusText(deal.redeemed)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
