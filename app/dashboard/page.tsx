'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/utils/supabaseClient'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { de } from 'date-fns/locale'

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [dealHistory, setDealHistory] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const [pendingAmount, setPendingAmount] = useState(0)
  const [confirmedAmount, setConfirmedAmount] = useState(0)
  const [availableAmount, setAvailableAmount] = useState(0)

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

      // Guthaben aus View laden
      const { data: balanceData, error: balanceError } = await supabase
        .from('v_user_balance')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (!balanceError && balanceData) {
        setPendingAmount(balanceData.pending_amount || 0)
        setConfirmedAmount(balanceData.confirmed_amount || 0)
        setAvailableAmount(balanceData.available_to_redeem || 0)
      }

      // Historie aus Clicks & Leads
      const { data: history } = await supabase
        .from('clicks')
        .select('clicked_at, offer_id, id')
        .eq('user_id', user.id)
        .order('clicked_at', { ascending: false })

      const leadMap = new Map<string, any>()
      const { data: leads } = await supabase
        .from('leads')
        .select('click_id, confirmed, amount')

      leads?.forEach((lead) => {
        leadMap.set(lead.click_id, lead)
      })

      const enrichedHistory = history?.map((click) => {
        const lead = leadMap.get(click.id)
        return {
          ...click,
          amount: lead?.amount || 0,
          redeemed: lead?.confirmed || false,
        }
      }) || []

      setDealHistory(enrichedHistory)
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

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-10">
      <h1 className="text-3xl font-bold">Dein Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow p-6">
          <p className="text-gray-600 mb-1">Vorgemerktes Guthaben</p>
          <p className="text-yellow-600 text-3xl font-semibold">
            {formatCurrency(pendingAmount)}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow p-6">
          <p className="text-gray-600 mb-1">Bestätigtes Guthaben</p>
          <p className="text-green-600 text-3xl font-semibold">
            {formatCurrency(confirmedAmount)}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow p-6">
          <p className="text-gray-600 mb-1">Auszahlbar</p>
          <p className="text-blue-600 text-3xl font-semibold">
            {formatCurrency(availableAmount)}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-xl font-bold mb-4">Abschlussverlauf</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-gray-500 uppercase">Datum</th>
                <th className="px-4 py-2 text-left text-gray-500 uppercase">Deal</th>
                <th className="px-4 py-2 text-left text-gray-500 uppercase">Betrag</th>
                <th className="px-4 py-2 text-left text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
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
              {dealHistory.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-4 text-center text-gray-500">
                    Noch keine Deals abgeschlossen.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
