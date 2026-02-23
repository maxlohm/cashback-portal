'use client'

import { useEffect, useMemo, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

type ApplicationRow = {
  id: string
  user_id: string
  email: string
  name: string | null
  platform: string | null
  profile_url: string | null
  reach: string | null   // <<< weil DB reach text ist
  pitch: string | null
  status: 'pending' | 'approved' | 'rejected' | string
  reviewed_by: string | null
  reviewed_at: string | null
  created_at: string
}

export default function PartnerApplicationsClient() {
  const supabase = useMemo(() => createClientComponentClient(), [])

  const [rows, setRows] = useState<ApplicationRow[]>([])
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  const [status, setStatus] = useState<string>('pending')
  const [search, setSearch] = useState<string>('')

  const load = async () => {
    setLoading(true)
    setError(null)
    setNotice(null)

    const { data, error } = await supabase.rpc('admin_list_partner_applications', {
      p_status: status || null,
      p_search: search.trim() || null,
      p_limit: 100,
      p_offset: 0,
    })

    if (error) {
      setError(error.message)
      setRows([])
    } else {
      setRows((data ?? []) as ApplicationRow[])
    }

    setLoading(false)
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const review = async (id: string, action: 'approve' | 'reject') => {
    setBusyId(id)
    setError(null)
    setNotice(null)

    const { data, error } = await supabase.rpc('admin_review_partner_application', {
      p_application_id: id,
      p_action: action,
      p_commission_rate: 0.5,
      p_public_code: null,
    })

    if (error) {
      setError(error.message)
      setBusyId(null)
      return
    }

    setNotice(`OK: ${(data as any)?.status ?? action}`)
    setBusyId(null)
    await load()
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-[#003b5b]">Partner-Bewerbungen</h1>
          <p className="mt-1 text-sm text-slate-600">
            Approve erstellt (falls nötig) einen Partner + setzt Role.
          </p>
        </div>

        <button
          onClick={load}
          className="h-10 px-4 rounded-xl border bg-white hover:bg-slate-50 text-sm font-semibold"
        >
          Neu laden
        </button>
      </div>

      <div className="mt-6 rounded-2xl border bg-white p-4">
        <div className="flex flex-col md:flex-row gap-3 md:items-end">
          <div className="flex-1">
            <div className="text-sm font-semibold text-slate-700">Suche</div>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Email / Name / Plattform / URL"
              className="mt-1 w-full h-11 rounded-xl border px-3"
            />
          </div>

          <div className="w-full md:w-56">
            <div className="text-sm font-semibold text-slate-700">Status</div>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="mt-1 w-full h-11 rounded-xl border px-3 bg-white"
            >
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="">Alle</option>
            </select>
          </div>

          <button
            onClick={load}
            className="h-11 px-5 rounded-xl bg-[#003b5b] text-white font-semibold hover:opacity-90"
          >
            Anwenden
          </button>
        </div>

        {error && <div className="mt-3 text-sm text-red-600">Fehler: {error}</div>}
        {notice && <div className="mt-3 text-sm text-emerald-700">{notice}</div>}
      </div>

      <div className="mt-6 rounded-2xl border bg-white overflow-hidden">
        <div className="px-4 py-3 border-b bg-slate-50 text-sm font-semibold text-slate-700">
          {loading ? 'Lade…' : `${rows.length} Bewerbungen`}
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-[980px] w-full text-sm">
            <thead className="bg-white">
              <tr className="text-left text-slate-600">
                <th className="px-4 py-3">User</th>
                <th className="px-4 py-3">Kontakt</th>
                <th className="px-4 py-3">Plattform</th>
                <th className="px-4 py-3">Reichweite</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Aktion</th>
              </tr>
            </thead>
            <tbody>
              {!loading && rows.length === 0 && (
                <tr>
                  <td className="px-4 py-6 text-slate-500" colSpan={6}>
                    Keine Treffer.
                  </td>
                </tr>
              )}

              {rows.map((r) => {
                const busy = busyId === r.id
                return (
                  <tr key={r.id} className="border-t">
                    <td className="px-4 py-3">
                      <div className="font-semibold text-slate-800">{r.name ?? '—'}</div>
                      <div className="text-xs text-slate-500">{r.user_id}</div>
                      <div className="text-xs text-slate-500">
                        {new Date(r.created_at).toLocaleString('de-DE')}
                      </div>
                    </td>

                    <td className="px-4 py-3">
                      <div className="text-slate-800">{r.email}</div>
                      {r.profile_url ? (
                        <a
                          href={r.profile_url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs text-blue-600 hover:underline"
                        >
                          Profil öffnen
                        </a>
                      ) : (
                        <div className="text-xs text-slate-500">—</div>
                      )}
                      {r.pitch ? (
                        <div className="mt-2 text-xs text-slate-600 line-clamp-3">
                          {r.pitch}
                        </div>
                      ) : null}
                    </td>

                    <td className="px-4 py-3">{r.platform ?? '—'}</td>
                    <td className="px-4 py-3">{r.reach ?? '—'}</td>

                    <td className="px-4 py-3">
                      <span className={badge(r.status)}>{r.status}</span>
                      {r.reviewed_at ? (
                        <div className="mt-1 text-xs text-slate-500">
                          reviewed {new Date(r.reviewed_at).toLocaleString('de-DE')}
                        </div>
                      ) : null}
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          disabled={busy || r.status === 'approved'}
                          onClick={() => review(r.id, 'approve')}
                          className={[
                            'h-9 px-3 rounded-xl text-sm font-semibold',
                            'border bg-white hover:bg-slate-50',
                            busy || r.status === 'approved' ? 'opacity-50 cursor-not-allowed' : '',
                          ].join(' ')}
                        >
                          Approve
                        </button>

                        <button
                          disabled={busy || r.status === 'rejected'}
                          onClick={() => review(r.id, 'reject')}
                          className={[
                            'h-9 px-3 rounded-xl text-sm font-semibold',
                            'border bg-white hover:bg-slate-50',
                            busy || r.status === 'rejected' ? 'opacity-50 cursor-not-allowed' : '',
                          ].join(' ')}
                        >
                          Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function badge(status: string) {
  const base =
    'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border'
  if (status === 'pending') return `${base} bg-amber-50 text-amber-700 border-amber-200`
  if (status === 'approved') return `${base} bg-emerald-50 text-emerald-700 border-emerald-200`
  if (status === 'rejected') return `${base} bg-rose-50 text-rose-700 border-rose-200`
  return `${base} bg-slate-50 text-slate-700 border-slate-200`
}