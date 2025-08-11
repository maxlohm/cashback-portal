'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { format } from 'date-fns'
import { de } from 'date-fns/locale'

export default function PartnerDashboardPage() {
  const supabase = createClientComponentClient()
  const [leads, setLeads] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchLeads = async () => {
      const { data, error } = await supabase
        .from('partner_leads_cache')
        .select('*')
        .order('clicked_at', { ascending: false })

      if (error) {
        console.error('Fehler beim Laden der Partner-Leads:', error.message)
      } else {
        setLeads(data || [])
      }

      setLoading(false)
    }

    fetchLeads()
  }, [])

  const confirmedLeads = leads.filter(lead => lead.confirmed)
  const pendingLeads = leads.filter(lead => !lead.confirmed)
  const totalAmount = confirmedLeads.reduce((sum, lead) => sum + Number(lead.amount || 0), 0)

  const formatCurrency = (amount: number) =>
    amount.toLocaleString('de-DE', {
      style: 'currency',
      currency: 'EUR',
    })

  const getStatus = (confirmed: boolean) =>
    confirmed ? '✅ Bestätigt' : '⏳ Offen'

  return (
    <div className="p-4 md:p-8">
      <h1 className="text-2xl font-bold mb-6">Partner Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatBox label="Leads insgesamt" value={leads.length} />
        <StatBox label="Abgeschlossene Deals" value={confirmedLeads.length} />
        <StatBox label="Provisionssumme" value={formatCurrency(totalAmount)} />
      </div>

      <div className="bg-white rounded-xl shadow p-4">
        <h2 className="text-xl font-semibold mb-4">Lead-Verlauf</h2>
        {loading ? (
          <p>Lade Daten...</p>
        ) : leads.length === 0 ? (
          <p>Keine Leads gefunden.</p>
        ) : (
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
              {leads.map((lead, index) => (
                <tr key={index} className="border-b">
                  <td className="py-2">
                    {format(new Date(lead.clicked_at), 'dd.MM.yyyy', { locale: de })}
                  </td>
                  <td className="py-2">{lead.offer_id || '-'}</td>
                  <td className="py-2">{lead.amount ? formatCurrency(lead.amount) : '-'}</td>
                  <td className="py-2">{getStatus(lead.confirmed)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
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
