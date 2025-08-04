'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/utils/supabaseClient'

type Lead = {
  id: string
  offer_id: string
  clicked_at: string
  confirmed: boolean
  amount: number
}

type FilterType = 'all' | 'today' | 'week' | 'month'

export default function PartnerDashboard() {
  const [authorized, setAuthorized] = useState<boolean | null>(null)
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<FilterType>('all')
  const router = useRouter()

  useEffect(() => {
    const checkAccessAndLoadData = async () => {
      const { data: userData, error: userError } = await supabase.auth.getUser()
      if (userError || !userData?.user) {
        router.push('/login')
        return
      }

      const userId = userData.user.id

      const { data: partnerData } = await supabase
        .from('partners')
        .select('id')
        .eq('id', userId)
        .single()

      if (!partnerData) {
        setAuthorized(false)
        router.push('/login')
        return
      }

      setAuthorized(true)

      const { data: leadsData, error: leadsError } = await supabase
        .from('leads')
        .select('*')
        .eq('partner_id', userId)

      if (leadsError) {
        setError('Fehler beim Laden der Leads.')
      } else {
        setLeads(leadsData || [])
      }

      setLoading(false)
    }

    checkAccessAndLoadData()
  }, [router])

  if (loading) return <div className="p-10 text-center">🔄 Lade Dashboard...</div>
  if (!authorized) return null

  // 🧠 FILTER-LOGIK
  const now = new Date()
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const startOfWeek = new Date(startOfToday)
  startOfWeek.setDate(startOfToday.getDate() - startOfToday.getDay()) // Sonntag als Wochenstart
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

  const filteredLeads = leads.filter((lead) => {
    const clickedAt = new Date(lead.clicked_at)
    if (filter === 'today') return clickedAt >= startOfToday
    if (filter === 'week') return clickedAt >= startOfWeek
    if (filter === 'month') return clickedAt >= startOfMonth
    return true
  })

  const confirmedLeads = filteredLeads.filter((lead) => lead.confirmed)
  const sumConfirmed = confirmedLeads.reduce((sum, lead) => sum + (lead.amount || 0), 0)

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-4">📊 Partner-Dashboard</h1>
      <p className="mb-6 text-gray-800">Hier sehen nur bestätigte Partner ihre Statistiken.</p>

      {/* FILTER DROPDOWN */}
      <div className="mb-6">
        <label className="mr-2 font-medium">Filter:</label>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as FilterType)}
          className="border px-3 py-1 rounded"
        >
          <option value="all">Alle Leads</option>
          <option value="today">Heute</option>
          <option value="week">Diese Woche</option>
          <option value="month">Diesen Monat</option>
        </select>
      </div>

      {/* ZÄHLER */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        <div className="p-4 bg-white rounded shadow border">
          <div className="text-sm text-gray-500">👥 Leads ({filter})</div>
          <div className="text-xl font-bold">{filteredLeads.length}</div>
        </div>
        <div className="p-4 bg-white rounded shadow border">
          <div className="text-sm text-gray-500">✅ Bestätigt</div>
          <div className="text-xl font-bold">{confirmedLeads.length}</div>
        </div>
        <div className="p-4 bg-white rounded shadow border">
          <div className="text-sm text-gray-500">💶 Betrag</div>
          <div className="text-xl font-bold">{sumConfirmed} €</div>
        </div>
      </div>

      {/* FEHLERANZEIGE */}
      {error && <p className="text-red-600">{error}</p>}

      {/* LEAD-LISTE */}
      <div>
        <h2 className="text-xl font-semibold mb-2">🎯 Leads</h2>
        {filteredLeads.length === 0 ? (
          <p>Keine Leads vorhanden.</p>
        ) : (
          filteredLeads.map((lead) => (
            <div key={lead.id} className="border p-4 mb-4 rounded bg-white shadow-sm">
              <p><strong>Lead-ID:</strong> {lead.id}</p>
              <p><strong>Offer:</strong> {lead.offer_id}</p>
              <p><strong>Geklickt am:</strong> {new Date(lead.clicked_at).toLocaleString()}</p>
              <p>
                <strong>Bestätigt:</strong>{' '}
                {lead.confirmed ? <span className="text-green-600">✔ Ja</span> : <span className="text-red-600">❌ Nein</span>}
              </p>
              <p><strong>Betrag:</strong> {lead.amount} €</p>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
