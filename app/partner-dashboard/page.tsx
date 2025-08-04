'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/utils/supabaseClient'

export default function PartnerDashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [leads, setLeads] = useState<any[]>([])
  const [filteredLeads, setFilteredLeads] = useState<any[]>([])
  const [filter, setFilter] = useState<'today' | 'week' | 'month' | 'all'>('today')
  const [isPartner, setIsPartner] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUserAndData = async () => {
      const { data: userData } = await supabase.auth.getUser()
      const currentUser = userData?.user

      if (!currentUser) {
        window.location.href = '/login'
        return
      }

      setUser(currentUser)

      const { data: partner } = await supabase
        .from('partners')
        .select('id')
        .eq('id', currentUser.id)
        .maybeSingle()

      if (!partner) {
        window.location.href = '/login'
        return
      }

      setIsPartner(true)

      const { data: leadsData } = await supabase
        .from('clicks')
        .select('*')
        .eq('partner_id', currentUser.id)

      setLeads(leadsData || [])
      setLoading(false)
    }

    fetchUserAndData()
  }, [])

  useEffect(() => {
    if (!leads.length) return

    const now = new Date()

    const filtered = leads.filter((lead) => {
      const leadDate = new Date(lead.clicked_at)
      const diffTime = now.getTime() - leadDate.getTime()

      switch (filter) {
        case 'today':
          return leadDate.toDateString() === now.toDateString()
        case 'week':
          return diffTime < 7 * 24 * 60 * 60 * 1000
        case 'month':
          return (
            leadDate.getMonth() === now.getMonth() &&
            leadDate.getFullYear() === now.getFullYear()
          )
        case 'all':
        default:
          return true
      }
    })

    setFilteredLeads(filtered)
  }, [filter, leads])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  return (
    <>
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-2xl sm:text-3xl font-bold text-[#003b5b] text-center mb-6">
          👥 Partner-Dashboard
        </h1>

        {loading ? (
          <p className="text-center text-gray-600">Daten werden geladen…</p>
        ) : (
          <>
            <div className="flex justify-center gap-3 flex-wrap mb-8">
              <button
                className={`px-4 py-2 rounded-xl text-sm font-medium border transition ${
                  filter === 'today' ? 'bg-[#003b5b] text-white' : 'bg-white border-blue-300 text-[#003b5b]'
                }`}
                onClick={() => setFilter('today')}
              >
                Heute
              </button>
              <button
                className={`px-4 py-2 rounded-xl text-sm font-medium border transition ${
                  filter === 'week' ? 'bg-[#003b5b] text-white' : 'bg-white border-blue-300 text-[#003b5b]'
                }`}
                onClick={() => setFilter('week')}
              >
                Woche
              </button>
              <button
                className={`px-4 py-2 rounded-xl text-sm font-medium border transition ${
                  filter === 'month' ? 'bg-[#003b5b] text-white' : 'bg-white border-blue-300 text-[#003b5b]'
                }`}
                onClick={() => setFilter('month')}
              >
                Monat
              </button>
              <button
                className={`px-4 py-2 rounded-xl text-sm font-medium border transition ${
                  filter === 'all' ? 'bg-[#003b5b] text-white' : 'bg-white border-blue-300 text-[#003b5b]'
                }`}
                onClick={() => setFilter('all')}
              >
                Alle
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8 text-center">
              <div className="bg-white p-4 rounded-lg shadow border">
                <p className="text-sm text-gray-600">Gefiltert</p>
                <p className="text-xl font-bold text-[#003b5b]">{filteredLeads.length}</p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow border">
                <p className="text-sm text-gray-600">Gesamt</p>
                <p className="text-xl font-bold text-[#003b5b]">{leads.length}</p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow border">
              <h2 className="text-lg font-semibold text-[#003b5b] mb-4">📋 Lead-Übersicht</h2>
              <div className="overflow-auto">
                <table className="min-w-full text-sm text-left border">
                  <thead>
                    <tr className="bg-[#f0fbff] border-b">
                      <th className="px-4 py-2">Offer-ID</th>
                      <th className="px-4 py-2">Datum</th>
                      <th className="px-4 py-2">Eingelöst</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredLeads.map((lead, index) => (
                      <tr key={index} className="border-t">
                        <td className="px-4 py-2">{lead.offer_id}</td>
                        <td className="px-4 py-2">{formatDate(lead.clicked_at)}</td>
                        <td className="px-4 py-2">
                          {lead.redeemed ? '✅ Ja' : '⏳ Nein'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filteredLeads.length === 0 && (
                  <p className="text-center text-sm text-gray-500 py-4">
                    Keine Leads im gewählten Zeitraum.
                  </p>
                )}
              </div>
            </div>
          </>
        )}
      </main>
    </>
  )
}
