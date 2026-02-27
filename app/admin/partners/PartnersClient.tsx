'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

type PartnerRow = {
  partner_id: string
  user_id: string | null
  email: string | null
  name: string | null
  follower_count: number | null
  commission_rate_base: number
  commission_rate_promo: number | null
  commission_promo_until: string | null
  first_confirmed_lead_at: string | null
  total_confirmed_leads: number
  total_clicks: number
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

function toDateInputValue(iso: string | null) {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

export default function PartnersClient() {
  const supabase = useMemo(() => createClientComponentClient(), [])

  const [items, setItems] = useState<PartnerRow[]>([])
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const [search, setSearch] = useState('')

  // Edit Modal
  const [editOpen, setEditOpen] = useState(false)
  const [editPartner, setEditPartner] = useState<PartnerRow | null>(null)
  const [promoPct, setPromoPct] = useState('')
  const [basePct, setBasePct] = useState('')
  const [promoUntil, setPromoUntil] = useState('') // YYYY-MM-DD oder ''
  const [followers, setFollowers] = useState('')
  const [notes, setNotes] = useState('')

  async function load() {
    setLoading(true)
    setError(null)

    const { data, error } = await supabase.rpc('admin_list_partners', {
      p_search: search || null,
      p_limit: 100,
      p_offset: 0,
    })

    if (error) {
      setError(error.message)
      setItems([])
    } else {
      setItems((data as any[]) as PartnerRow[])
    }

    setLoading(false)
  }

  useEffect(() => {
    void load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function openEdit(p: PartnerRow) {
    setEditPartner(p)
    setEditOpen(true)

    setPromoPct(rateToPct(p.commission_rate_promo))
    setBasePct(rateToPct(p.commission_rate_base))
    setPromoUntil(toDateInputValue(p.commission_promo_until))

    setFollowers(p.follower_count != null ? String(p.follower_count) : '')
    setNotes('')
  }

  async function saveEdit() {
    if (!editPartner) return

    const baseRate = pctToRate(basePct)
    const promoRate = promoPct.trim() ? pctToRate(promoPct) : null
    const followerCount = followers.trim() ? Number(followers) : null

    if (baseRate == null || baseRate < 0 || baseRate > 1) {
      setError('Ungültige Base-Rate.')
      return
    }
    if (promoPct.trim() && (promoRate == null || promoRate < 0 || promoRate > 1)) {
      setError('Ungültige Promo-Rate.')
      return
    }

    // Wichtig: leeres Datum => null
    const promoUntilTs =
      promoUntil.trim().length === 10
        ? new Date(`${promoUntil}T00:00:00.000Z`).toISOString()
        : null

    // Optional, aber sauber: wenn kein Promo-Enddatum gesetzt ist, Promo-Rate auf null
    const promoRateFinal = promoUntilTs ? promoRate : null

    setBusyId(editPartner.partner_id)
    setError(null)

    const { error } = await supabase.rpc('admin_update_partner_commission', {
      p_partner_id: editPartner.partner_id,
      p_base_rate: baseRate,
      p_promo_rate: promoRateFinal,
      p_promo_until: promoUntilTs,
      p_follower_count: followerCount,
      p_notes: notes || null,
    })

    if (error) {
      setError(error.message)
      setBusyId(null)
      return
    }

    setBusyId(null)
    setEditOpen(false)
    setEditPartner(null)
    await load()
  }

  return (
    <div className="mx-auto max-w-6xl p-6">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Partner-Verwaltung</h1>
          <p className="text-sm text-gray-600">
            Übersicht + Provision jederzeit ändern. „Erster bestätigter Lead“ basiert auf confirmed Leads.
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
          <div className="md:col-span-10">
            <label className="text-sm font-medium">Suche</label>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Name / Email"
              className="mt-1 w-full rounded-xl border px-3 py-2"
            />
          </div>
          <div className="md:col-span-2">
            <button
              onClick={() => load()}
              className="w-full rounded-xl bg-blue-900 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-950"
            >
              Anwenden
            </button>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border bg-white">
        <div className="border-b px-4 py-3 text-sm font-medium">
          {loading ? 'Lade…' : `${items.length} Partner`}
        </div>

        <div className="divide-y">
          {items.map((p) => {
            const promoActive =
              p.commission_rate_promo != null &&
              p.commission_promo_until != null &&
              new Date(p.commission_promo_until).getTime() > Date.now()

            return (
              <div
                key={p.partner_id}
                className="grid grid-cols-1 gap-3 p-4 md:grid-cols-12 md:items-center"
              >
                <div className="md:col-span-3">
                  <div className="font-semibold">{p.name ?? '—'}</div>
                  <div className="text-sm text-gray-700">{p.email ?? '—'}</div>
                  <div className="mt-1 text-xs text-gray-500">Partner-ID: {p.partner_id}</div>
                </div>

                <div className="md:col-span-2 text-sm">
                  <div>Follower: {p.follower_count ?? '—'}</div>
                  <div className="text-xs text-gray-500">Clicks: {p.total_clicks}</div>
                </div>

                <div className="md:col-span-3 text-sm">
                  <div>
                    Promo:{' '}
                    {p.commission_rate_promo != null
                      ? `${Math.round(p.commission_rate_promo * 100)}%`
                      : '—'}
                    {promoActive && (
                      <span className="ml-2 rounded-full border px-2 py-0.5 text-xs">aktiv</span>
                    )}
                  </div>
                  <div>Base: {Math.round(p.commission_rate_base * 100)}%</div>
                  <div className="text-xs text-gray-500">
                    Promo bis:{' '}
                    {p.commission_promo_until
                      ? new Date(p.commission_promo_until).toLocaleDateString('de-DE')
                      : '—'}
                  </div>
                </div>

                <div className="md:col-span-3 text-sm">
                  <div>Confirmed Leads: {p.total_confirmed_leads}</div>
                  <div className="text-xs text-gray-500">
                    Erster bestätigter Lead:{' '}
                    {p.first_confirmed_lead_at
                      ? new Date(p.first_confirmed_lead_at).toLocaleDateString('de-DE')
                      : '—'}
                  </div>
                  <div className="text-xs text-gray-500">
                    Partner seit: {new Date(p.created_at).toLocaleDateString('de-DE')}
                  </div>
                </div>

                <div className="md:col-span-1 flex md:justify-end">
                  <button
                    onClick={() => openEdit(p)}
                    className="rounded-xl border px-3 py-2 text-sm hover:bg-gray-50"
                  >
                    Bearbeiten
                  </button>
                </div>
              </div>
            )
          })}

          {!loading && items.length === 0 && (
            <div className="p-6 text-sm text-gray-600">Keine Partner gefunden.</div>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      {editOpen && editPartner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-5 shadow-xl">
            <div className="mb-3">
              <div className="text-lg font-semibold">Partner Provision bearbeiten</div>
              <div className="text-sm text-gray-600">
                {editPartner.name ?? '—'} • {editPartner.email ?? '—'}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <div>
                <label className="text-sm font-medium">Promo % (optional)</label>
                <input
                  value={promoPct}
                  onChange={(e) => setPromoPct(e.target.value)}
                  className="mt-1 w-full rounded-xl border px-3 py-2"
                  placeholder="z.B. 50"
                />
                <div className="mt-1 text-xs text-gray-500">
                  Promo gilt nur, wenn „Promo bis“ gesetzt ist.
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Base %</label>
                <input
                  value={basePct}
                  onChange={(e) => setBasePct(e.target.value)}
                  className="mt-1 w-full rounded-xl border px-3 py-2"
                  placeholder="z.B. 40"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Promo bis (optional)</label>

                <div className="mt-1 flex gap-2">
                  <input
                    type="date"
                    value={promoUntil} // '' oder YYYY-MM-DD
                    onChange={(e) => setPromoUntil(e.target.value)} // kann '' sein
                    className="w-full rounded-xl border px-3 py-2"
                  />
                  <button
                    type="button"
                    onClick={() => setPromoUntil('')}
                    className="shrink-0 rounded-xl border px-3 py-2 text-sm hover:bg-gray-50"
                  >
                    Löschen
                  </button>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Follower (optional)</label>
                <input
                  value={followers}
                  onChange={(e) => setFollowers(e.target.value)}
                  className="mt-1 w-full rounded-xl border px-3 py-2"
                  placeholder="z.B. 10000"
                />
              </div>

              <div className="md:col-span-2">
                <label className="text-sm font-medium">Notizen (optional)</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="mt-1 w-full rounded-xl border px-3 py-2"
                  rows={3}
                  placeholder="z.B. Sondervereinbarung…"
                />
              </div>
            </div>

            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => {
                  setEditOpen(false)
                  setEditPartner(null)
                }}
                className="rounded-xl border px-4 py-2 text-sm hover:bg-gray-50"
              >
                Abbrechen
              </button>

              <button
                onClick={saveEdit}
                disabled={busyId === editPartner.partner_id}
                className="rounded-xl bg-blue-900 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-950 disabled:opacity-50"
              >
                Speichern
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}