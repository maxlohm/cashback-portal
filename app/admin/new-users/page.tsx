'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/utils/supabaseClient'

type Row = {
  partner_id: string
  partner_name: string
  new_users_today: number
  new_users_yesterday: number
  new_users_last_7_days: number
  new_users_total: number
}

export default function AdminNewUsersPage() {
  const [rows, setRows] = useState<Row[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.rpc('admin_get_new_users_overview')
      if (data) setRows(data)
      setLoading(false)
    }

    load()
  }, [])

  if (loading) return <div className="p-8">Lädt...</div>

  return (
    <div className="p-8">

      <h1 className="text-2xl font-bold mb-6">
        Neukunden Übersicht
      </h1>

      <table className="w-full border text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2 border">Partner</th>
            <th className="p-2 border">Heute</th>
            <th className="p-2 border">Gestern</th>
            <th className="p-2 border">Letzte 7 Tage</th>
            <th className="p-2 border">Gesamt</th>
          </tr>
        </thead>

        <tbody>
          {rows.map((r) => (
            <tr key={r.partner_id}>
              <td className="p-2 border">{r.partner_name}</td>
              <td className="p-2 border">{r.new_users_today}</td>
              <td className="p-2 border">{r.new_users_yesterday}</td>
              <td className="p-2 border">{r.new_users_last_7_days}</td>
              <td className="p-2 border">{r.new_users_total}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}