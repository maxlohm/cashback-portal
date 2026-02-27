'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

type ApplicationStatus = 'pending' | 'approved' | 'rejected'

type PartnerApplicationRow = {
  id: string
  user_id: string
  name: string | null
  email: string | null
  platform: string | null
  url: string | null
  reach: number | null
  pitch: string | null
  status: ApplicationStatus
  created_at: string
}

function pctToRate(pct: string) {
  const n = Number(String(pct).replace(',', '.'))
  if (!Number.isFinite(n)) return null
  return n / 100
}

function rateToPct(rate: number | null | undefined) {
  if (rate == null) return ''
  return String(Math.round(rate * 100))
}

export default function PartnerApplicationsClient() {
  const supabase = useMemo(() => createClientComponentClient(), [])

  const [items, setItems] = useState<PartnerApplicationRow[]>([])
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Filter
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<ApplicationStatus>('pending')

  // Approve Modal
  const [approveOpen, setApproveOpen] = useState(false)
  const [approveApp, setApproveApp] = useState<PartnerApplicationRow | null>(null)
  const [promoPct, setPromoPct] = useState('50')
  const [basePct, setBasePct] = useState('40')
  const [promoDays, setPromoDays] = useState('30')
  const [followerCount, setFollowerCount] = useState('')
  const [notes, setNotes] = useState('')

  async function load() {
    setLoading(true)
    setError(null)

    // Annahme: Ihr habt bereits admin_list_partner_applications
    // Falls der Name bei dir anders ist: hier anpassen.
    const { data, error } = await supabase.rpc('admin_list_partner_applications', {
      p_status: status,
      p_search: search || null,
      p_limit: 50,
      p_offset: 0,
    })

    if (error) {
      setError(error.message)
      setItems([])
    } else {
      setItems((data as any[])?.map((r) => ({
        id: r.id,
        user_id: r.user_id,
        name: r.name ?? r.user_name ?? null,
        email: r.email ?? null,
        platform: r.platform ?? null,
        url: r.url ?? null,
        reach: r.reach ?? r.reichweite ?? null,
        pitch: r.pitch ?? null,
        status: r.status,
        created_at: r.created_at,
      })) ?? [])
    }

    setLoading(false)
  }

  useEffect(() => {
    void load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function applyFilters() {
    await load()
  }

  function openApproveModal(app: PartnerApplicationRow) {
    setApproveApp(app)
    setApproveOpen(true)

    // Vorschlag automatisch: ab 10k → 50/40, sonst 40/30
    const reach = app.reach ?? 0
    if (reach >= 10000) {
      setPromoPct('50')
      setBasePct('40')
    } else {
      setPromoPct('40')
      setBasePct('30')
    }
    setPromoDays('30')
    setFollowerCount(reach ? String(reach) : '')
    setNotes('')
  }

  async function doApprove() {
    if (!approveApp) return

    const promoRate = pctToRate(promoPct)
    const baseRate = pctToRate(basePct)
    const days = Number(promoDays)
    const followers = followerCount ? Number(followerCount) : null

    if (promoRate == null || baseRate == null || !Number.isFinite(days)) {
      setError('Ungültige Eingabe.')
      return
    }

    setBusyId(approveApp.id)
    setError(null)

    const { error } = await supabase.rpc('admin_approve_partner_application', {
      p_application_id: approveApp.id,
      p_promo_rate: promoRate,
      p_base_rate: baseRate,
      p_promo_days: days,
      p_follower_count: followers,
      p_notes: notes || null,
    })

    if (error) {
      setError(error.message)
      setBusyId(null)
      return
    }

    setApproveOpen(false)
    setApproveApp(null)
    setBusyId(null)
    await load()
  }

  async function doReject(appId: string) {
    setBusyId(appId)
    setError(null)

    // Annahme: Ihr habt bereits admin_review_partner_application(p_application_id, p_action)
    // Falls anders: hier anpassen.
    const { error } = await supabase.rpc('admin_review_partner_application', {
      p_application_id: appId,
      p_action: 'reject',
    })

    if (error) {
      setError(error.message)
      setBusyId(null)
      return
    }

    setBusyId(null)
    await load()
  }

  return (
    <div className="mx-auto max-w-6xl p-6">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Partner-Bewerbungen</h1>
          <p className="text-sm text-gray-600">
            Approve erstellt (falls nötig) einen Partner, setzt Role und speichert Provision.
          </p>
        </div>

        <button
          onClick={() => load()}
          className="rounded-xl border px-4 py-2 text-sm hover:bg-gray-50"
        >
          Neu laden
        </button>
      </div>

      {error && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="mb-4 rounded-2xl border bg-white p-4">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-12 md:items-end">
          <div className="md:col-span-7">
            <label className="text-sm font-medium">Suche</label>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Email / Name / Plattform / URL"
              className="mt-1 w-full rounded-xl border px-3 py-2"
            />
          </div>

          <div className="md:col-span-3">
            <label className="text-sm font-medium">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as ApplicationStatus)}
              className="mt-1 w-full rounded-xl border px-3 py-2"
            >
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <button
              onClick={applyFilters}
              className="w-full rounded-xl bg-blue-900 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-950"
            >
              Anwenden
            </button>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border bg-white">
        <div className="border-b px-4 py-3 text-sm font-medium">
          {loading ? 'Lade…' : `${items.length} Bewerbungen`}
        </div>

        <div className="divide-y">
          {items.map((a) => (
            <div key={a.id} className="grid grid-cols-1 gap-3 p-4 md:grid-cols-12 md:items-center">
              <div className="md:col-span-3">
                <div className="font-semibold">{a.name ?? '—'}</div>
                <div className="text-xs text-gray-500">{a.user_id}</div>
                <div className="text-xs text-gray-500">{new Date(a.created_at).toLocaleString('de-DE')}</div>
              </div>

              <div className="md:col-span-4">
                <div className="text-sm">{a.email ?? '—'}</div>
                <div className="mt-1 line-clamp-2 text-xs text-gray-600">{a.pitch ?? ''}</div>
                {a.url && (
                  <a className="mt-1 inline-block text-xs text-blue-700 hover:underline" href={a.url} target="_blank" rel="noreferrer">
                    Profil öffnen
                  </a>
                )}
              </div>

              <div className="md:col-span-2 text-sm">
                <div className="font-medium">{a.platform ?? '—'}</div>
              </div>

              <div className="md:col-span-1 text-sm">
                {a.reach ?? '—'}
              </div>

              <div className="md:col-span-1">
                <span className="inline-flex items-center rounded-full border px-2 py-1 text-xs">
                  {a.status}
                </span>
              </div>

              <div className="md:col-span-1 flex gap-2 md:justify-end">
                {a.status === 'pending' ? (
                  <>
                    <button
                      disabled={busyId === a.id}
                      onClick={() => openApproveModal(a)}
                      className="rounded-xl border px-3 py-2 text-sm hover:bg-gray-50 disabled:opacity-50"
                    >
                      Approve
                    </button>
                    <button
                      disabled={busyId === a.id}
                      onClick={() => doReject(a.id)}
                      className="rounded-xl border px-3 py-2 text-sm hover:bg-gray-50 disabled:opacity-50"
                    >
                      Reject
                    </button>
                  </>
                ) : (
                  <span className="text-xs text-gray-500">—</span>
                )}
              </div>
            </div>
          ))}

          {!loading && items.length === 0 && (
            <div className="p-6 text-sm text-gray-600">Keine Bewerbungen gefunden.</div>
          )}
        </div>
      </div>

      {/* Approve Modal */}
      {approveOpen && approveApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-5 shadow-xl">
            <div className="mb-3">
              <div className="text-lg font-semibold">Provision festlegen</div>
              <div className="text-sm text-gray-600">
                {approveApp.name ?? '—'} • {approveApp.email ?? '—'}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <div>
                <label className="text-sm font-medium">Monat 1 (Promo) %</label>
                <input
                  value={promoPct}
                  onChange={(e) => setPromoPct(e.target.value)}
                  className="mt-1 w-full rounded-xl border px-3 py-2"
                  placeholder="z.B. 50"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Danach (Base) %</label>
                <input
                  value={basePct}
                  onChange={(e) => setBasePct(e.target.value)}
                  className="mt-1 w-full rounded-xl border px-3 py-2"
                  placeholder="z.B. 40"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Promo-Dauer (Tage)</label>
                <input
                  value={promoDays}
                  onChange={(e) => setPromoDays(e.target.value)}
                  className="mt-1 w-full rounded-xl border px-3 py-2"
                  placeholder="30"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Follower (optional)</label>
                <input
                  value={followerCount}
                  onChange={(e) => setFollowerCount(e.target.value)}
                  className="mt-1 w-full rounded-xl border px-3 py-2"
                  placeholder="z.B. 31000"
                />
              </div>

              <div className="md:col-span-2">
                <label className="text-sm font-medium">Notizen (optional)</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="mt-1 w-full rounded-xl border px-3 py-2"
                  rows={3}
                  placeholder="z.B. Sonderdeal vereinbart…"
                />
              </div>
            </div>

            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => {
                  setApproveOpen(false)
                  setApproveApp(null)
                }}
                className="rounded-xl border px-4 py-2 text-sm hover:bg-gray-50"
              >
                Abbrechen
              </button>
              <button
                onClick={doApprove}
                disabled={busyId === approveApp.id}
                className="rounded-xl bg-blue-900 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-950 disabled:opacity-50"
              >
                Partner anlegen & freischalten
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}