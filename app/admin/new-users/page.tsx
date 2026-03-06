'use client'

import { useEffect, useMemo, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

type AdminNewUsersRow = {
  partner_id: string
  partner_name: string | null
  today: number | string | null
  yesterday: number | string | null
  last_7_days: number | string | null
  total: number | string | null
}

function n(v: number | string | null | undefined) {
  return Number(v ?? 0)
}

export default function AdminNewUsersPage() {
  const supabase = useMemo(() => createClientComponentClient(), [])
  const [rows, setRows] = useState<AdminNewUsersRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      setError(null)

      try {
        const { data, error } = await supabase.rpc('admin_get_new_users_overview')

        if (error) throw error

        setRows((data ?? []) as AdminNewUsersRow[])
      } catch (e: any) {
        console.error(e)
        setError(e?.message || 'Fehler beim Laden')
      } finally {
        setLoading(false)
      }
    }

    void load()
  }, [supabase])

  const totals = useMemo(() => {
    return rows.reduce(
      (acc, row) => {
        acc.today += n(row.today)
        acc.yesterday += n(row.yesterday)
        acc.last_7_days += n(row.last_7_days)
        acc.total += n(row.total)
        return acc
      },
      { today: 0, yesterday: 0, last_7_days: 0, total: 0 },
    )
  }, [rows])

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Neukunden Übersicht</h1>
        <p className="text-sm text-gray-500 mt-1">
          Neue Registrierungen auf Basis von <code>profiles.partner_id</code>
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Kpi title="Heute gesamt" value={totals.today} />
        <Kpi title="Gestern gesamt" value={totals.yesterday} />
        <Kpi title="Letzte 7 Tage gesamt" value={totals.last_7_days} />
        <Kpi title="Gesamt" value={totals.total} />
      </div>

      <div className="bg-white border rounded overflow-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <Th>Partner</Th>
              <Th className="text-right">Heute</Th>
              <Th className="text-right">Gestern</Th>
              <Th className="text-right">Letzte 7 Tage</Th>
              <Th className="text-right">Gesamt</Th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={5} className="p-6 text-center text-gray-500">
                  Lädt...
                </td>
              </tr>
            )}

            {!loading && error && (
              <tr>
                <td colSpan={5} className="p-6 text-center text-red-600">
                  Fehler: {error}
                </td>
              </tr>
            )}

            {!loading && !error && rows.length === 0 && (
              <tr>
                <td colSpan={5} className="p-6 text-center text-gray-500">
                  Keine Daten gefunden.
                </td>
              </tr>
            )}

            {!loading &&
              !error &&
              rows.map((row) => (
                <tr key={row.partner_id} className="border-t">
                  <Td className="font-medium">{row.partner_name || '—'}</Td>
                  <Td className="text-right">{n(row.today)}</Td>
                  <Td className="text-right">{n(row.yesterday)}</Td>
                  <Td className="text-right">{n(row.last_7_days)}</Td>
                  <Td className="text-right">{n(row.total)}</Td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function Kpi({ title, value }: { title: string; value: number }) {
  return (
    <div className="bg-white border rounded p-4">
      <div className="text-xs text-gray-500">{title}</div>
      <div className="text-2xl font-semibold mt-1">{value}</div>
    </div>
  )
}

function Th({
  children,
  className = '',
}: {
  children: React.ReactNode
  className?: string
}) {
  return <th className={`px-4 py-3 text-left font-semibold ${className}`}>{children}</th>
}

function Td({
  children,
  className = '',
}: {
  children: React.ReactNode
  className?: string
}) {
  return <td className={`px-4 py-3 ${className}`}>{children}</td>
}