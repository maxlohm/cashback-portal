// app/admin/redemptions/Client.tsx
'use client'

import { useMemo, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

type Row = {
  redemption_id: string
  user_id: string
  user_email: string
  amount: number | string
  status: 'pending' | 'approved' | 'processing' | 'paid' | 'rejected' | string
  provider: string | null
  sku: string | null
  created_at: string
}

export default function Client({ initialRows }: { initialRows: Row[] }) {
  const supabase = createClientComponentClient()
  const [rows, setRows] = useState<Row[]>(initialRows)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [monthFilter, setMonthFilter] = useState<string>('all') // YYYY-MM | all
  const [q, setQ] = useState<string>('') // email search
  const [busyId, setBusyId] = useState<string | null>(null)
  const [notice, setNotice] = useState<{ type: 'ok' | 'err'; msg: string } | null>(null)

  const months = useMemo(() => {
    const s = new Set<string>()
    rows.forEach(r => s.add(r.created_at.slice(0, 7)))
    return Array.from(s).sort().reverse()
  }, [rows])

  const filtered = useMemo(() => {
    return rows.filter(r => {
      if (statusFilter !== 'all' && r.status !== statusFilter) return false
      if (monthFilter !== 'all' && r.created_at.slice(0, 7) !== monthFilter) return false
      if (q && !r.user_email?.toLowerCase().includes(q.toLowerCase())) return false
      return true
    })
  }, [rows, statusFilter, monthFilter, q])

  const total = useMemo(
    () => filtered.reduce((sum, r) => sum + Number(r.amount ?? 0), 0),
    [filtered]
  )

  async function setStatus(id: string, newStatus: Row['status']) {
    try {
      setBusyId(id)
      setNotice(null)
      const { data, error } = await supabase.rpc('admin_update_redemption_status', {
        p_redemption_id: id,
        p_new_status: newStatus,
      })
      if (error) throw error
      // lokal updaten
      setRows(prev =>
        prev.map(r =>
          r.redemption_id === id ? { ...r, status: newStatus } : r
        )
      )
      setNotice({ type: 'ok', msg: `Status aktualisiert: ${newStatus}` })
    } catch (e: any) {
      setNotice({ type: 'err', msg: e?.message ?? 'Unbekannter Fehler' })
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className="space-y-4">
      {notice && (
        <div
          className={`p-3 rounded-md ${
            notice.type === 'ok'
              ? 'bg-green-50 text-green-800'
              : 'bg-red-50 text-red-700'
          }`}
        >
          {notice.msg}
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-end">
        <div className="flex flex-col">
          <label className="text-sm text-gray-600">Status</label>
          <select
            className="border rounded-md px-2 py-1"
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
          >
            <option value="all">alle</option>
            <option value="pending">pending</option>
            <option value="approved">approved</option>
            <option value="processing">processing</option>
            <option value="paid">paid</option>
            <option value="rejected">rejected</option>
          </select>
        </div>

        <div className="flex flex-col">
          <label className="text-sm text-gray-600">Monat</label>
          <select
            className="border rounded-md px-2 py-1"
            value={monthFilter}
            onChange={e => setMonthFilter(e.target.value)}
          >
            <option value="all">alle</option>
            {months.map(m => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col w-full sm:w-64">
          <label className="text-sm text-gray-600">E-Mail Suche</label>
          <input
            className="border rounded-md px-2 py-1"
            placeholder="name@domain.de"
            value={q}
            onChange={e => setQ(e.target.value)}
          />
        </div>

        <div className="ml-auto text-sm text-gray-700">
          Summe (gefiltert): <span className="font-semibold">{total.toFixed(2)} €</span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-200 rounded-md">
          <thead className="bg-gray-50">
            <tr className="text-left text-sm text-gray-600">
              <th className="p-2">Datum</th>
              <th className="p-2">E-Mail</th>
              <th className="p-2">Betrag</th>
              <th className="p-2">Status</th>
              <th className="p-2">Provider</th>
              <th className="p-2">SKU</th>
              <th className="p-2">Aktionen</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(r => (
              <tr key={r.redemption_id} className="border-t text-sm">
                <td className="p-2 whitespace-nowrap">{new Date(r.created_at).toLocaleString()}</td>
                <td className="p-2 whitespace-nowrap">{r.user_email}</td>
                <td className="p-2 whitespace-nowrap">{Number(r.amount ?? 0).toFixed(2)} €</td>
                <td className="p-2 whitespace-nowrap">
                  <span className="px-2 py-0.5 rounded bg-gray-100">{r.status}</span>
                </td>
                <td className="p-2">{r.provider ?? '-'}</td>
                <td className="p-2">{r.sku ?? '-'}</td>
                <td className="p-2">
                  <div className="flex gap-2">
                    <button
                      className="px-2 py-1 rounded bg-green-600 text-white disabled:opacity-50"
                      disabled={busyId === r.redemption_id}
                      onClick={() => setStatus(r.redemption_id, 'approved')}
                    >
                      Approve
                    </button>
                    <button
                      className="px-2 py-1 rounded bg-yellow-600 text-white disabled:opacity-50"
                      disabled={busyId === r.redemption_id}
                      onClick={() => setStatus(r.redemption_id, 'processing')}
                    >
                      Processing
                    </button>
                    <button
                      className="px-2 py-1 rounded bg-blue-600 text-white disabled:opacity-50"
                      disabled={busyId === r.redemption_id}
                      onClick={() => setStatus(r.redemption_id, 'paid')}
                    >
                      Paid
                    </button>
                    <button
                      className="px-2 py-1 rounded bg-red-600 text-white disabled:opacity-50"
                      disabled={busyId === r.redemption_id}
                      onClick={() => setStatus(r.redemption_id, 'rejected')}
                    >
                      Reject
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {filtered.length === 0 && (
              <tr>
                <td className="p-4 text-center text-gray-500" colSpan={7}>
                  Keine Einträge für die aktuellen Filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
