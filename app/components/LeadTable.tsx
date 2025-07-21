'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/utils/supabaseClient'
import dayjs from 'dayjs'
import isoWeek from 'dayjs/plugin/isoWeek'

dayjs.extend(isoWeek)

type AggregatedLead = {
  offerName: string
  today: number
  yesterday: number
  thisWeek: number
  total: number
}

export default function LeadTable({ partnerId }: { partnerId: string }) {
  const [leads, setLeads] = useState<AggregatedLead[]>([])

  useEffect(() => {
    const fetchLeads = async () => {
      const { data: rawLeads, error } = await supabase
        .from('leads')
        .select('clicked_at, offer_id, offers(name)')
        .eq('partner_id', partnerId)

      if (error || !rawLeads) return

      const grouped: Record<string, AggregatedLead> = {}

      rawLeads.forEach((lead: any) => {
        const date = dayjs(lead.clicked_at)
        const offerName = lead.offers?.name ?? 'Unbekannt'

        if (!grouped[offerName]) {
          grouped[offerName] = {
            offerName,
            today: 0,
            yesterday: 0,
            thisWeek: 0,
            total: 0,
          }
        }

        const today = dayjs()
        const yesterday = today.subtract(1, 'day')
        const weekStart = today.startOf('isoWeek')

        grouped[offerName].total++

        if (date.isSame(today, 'day')) {
          grouped[offerName].today++
        } else if (date.isSame(yesterday, 'day')) {
          grouped[offerName].yesterday++
        }

        if (date.isAfter(weekStart)) {
          grouped[offerName].thisWeek++
        }
      })

      setLeads(Object.values(grouped))
    }

    fetchLeads()
  }, [partnerId])

  return (
    <div className="mt-10">
      <h2 className="text-xl font-bold mb-4">📊 Generierte Leads</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-200 text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 text-left">Aktionsname</th>
              <th className="px-4 py-2 text-center">Heute</th>
              <th className="px-4 py-2 text-center">Gestern</th>
              <th className="px-4 py-2 text-center">Diese Woche</th>
              <th className="px-4 py-2 text-center">Insgesamt</th>
            </tr>
          </thead>
          <tbody>
            {leads.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-4 text-gray-400">
                  Noch keine Leads erfasst.
                </td>
              </tr>
            ) : (
              leads.map((lead) => (
                <tr key={lead.offerName} className="border-t">
                  <td className="px-4 py-2">{lead.offerName}</td>
                  <td className="px-4 py-2 text-center">{lead.today}</td>
                  <td className="px-4 py-2 text-center">{lead.yesterday}</td>
                  <td className="px-4 py-2 text-center">{lead.thisWeek}</td>
                  <td className="px-4 py-2 text-center">{lead.total}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
