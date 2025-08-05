'use client'

import { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'

export default function PartnerDashboardPage() {
  const supabase = createClientComponentClient()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [clicks, setClicks] = useState<any[]>([])
  const [user, setUser] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchUserAndData = async () => {
      const { data, error: userError } = await supabase.auth.getUser()

      if (userError || !data?.user) {
        router.push('/login')
        return
      }

      const currentUser = data.user
      setUser(currentUser)

      const { data: partnerData, error: partnerError } = await supabase
        .from('partners')
        .select('*')
        .eq('user_id', currentUser.id)
        .single()

      if (partnerError || !partnerData) {
        router.push('/login')
        return
      }

      const { data: clickData, error: clickError } = await supabase
        .from('clicks')
        .select('*')
        .eq('partner_id', currentUser.id)
        .order('clicked_at', { ascending: false })

      if (clickError) {
        setError('Fehler beim Laden der Daten.')
        return
      }

      setClicks(clickData || [])
      setLoading(false)
    }

    fetchUserAndData()
  }, [])

  if (loading) return <p className="p-4">Lade Dashboard...</p>
  if (error) return <p className="p-4 text-red-500">{error}</p>

  const totalLeads = clicks.length
  const confirmedDeals = clicks.filter((c) => c.amount > 0)
  const confirmedCount = confirmedDeals.length
  const confirmedAmount = confirmedDeals.reduce((sum, c) => sum + (c.amount || 0), 0)

  return (
    <div className="p-4 md:p-8">
      <h1 className="text-2xl font-bold mb-6">Partner Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatBox label="Leads insgesamt" value={totalLeads} />
        <StatBox label="Abgeschlossene Deals" value={confirmedCount} />
        <StatBox label="Provisionssumme" value={`${confirmedAmount.toFixed(2)} €`} />
      </div>

      <div className="bg-white rounded-xl shadow p-4">
        <h2 className="text-xl font-semibold mb-4">Lead-Verlauf</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500 border-b">
              <th className="py-2">Datum</th>
              <th className="py-2">Angebot</th>
              <th className="py-2">Betrag</th>
              <th className="py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {clicks.map((click) => (
              <tr key={click.id} className="border-b">
                <td className="py-2">{format(new Date(click.clicked_at), 'dd.MM.yyyy')}</td>
                <td className="py-2">{click.offer_id}</td>
                <td className="py-2">
                  {click.amount ? `${click.amount.toFixed(2)} €` : '-'}
                </td>
                <td className="py-2">
                  {click.amount && click.amount > 0
                    ? click.redeemed
                      ? 'Ausbezahlt'
                      : 'Offen'
                    : 'Unbestätigt'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function StatBox({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-white rounded-xl shadow p-4">
      <p className="text-gray-500 text-sm mb-1">{label}</p>
      <p className="text-3xl font-bold">{value}</p>
    </div>
  )
}
