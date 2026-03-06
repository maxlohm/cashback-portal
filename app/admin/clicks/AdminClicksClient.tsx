'use client'

import { useEffect, useMemo, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

type ClickRowRaw = {
  id: string
  clicked_at: string
  user_id: string | null
  offer_id: string
  influencer_id: string | null
  redeemed: boolean | null
  offers:
    | {
        id: string
        title: string
        slug: string | null
      }
    | {
        id: string
        title: string
        slug: string | null
      }[]
    | null
  partners:
    | {
        id: string
        name: string | null
        slug: string | null
      }
    | {
        id: string
        name: string | null
        slug: string | null
      }[]
    | null
}

type ClickRow = {
  id: string
  clicked_at: string
  user_id: string | null
  redeemed: boolean
  offer_id: string
  offer_title: string
  offer_slug: string | null
  influencer_id: string | null
  partner_name: string | null
  partner_slug: string | null
}

type OfferOption = {
  id: string
  title: string
}

type PartnerOption = {
  id: string
  name: string
}

function one<T>(value: T | T[] | null | undefined): T | null {
  if (!value) return null
  return Array.isArray(value) ? value[0] ?? null : value
}

function fmtDate(value: string) {
  return new Date(value).toLocaleString('de-DE')
}

export default function AdminClicksClient() {
  const supabase = useMemo(() => createClientComponentClient(), [])

  const [rows, setRows] = useState<ClickRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [q, setQ] = useState('')
  const [partnerFilter, setPartnerFilter] = useState('all')
  const [offerFilter, setOfferFilter] = useState('all')
  const [redeemedFilter, setRedeemedFilter] = useState<'all' | 'true' | 'false'>('all')
  const [limit, setLimit] = useState(500)

  useEffect(() => {
    let alive = true

    const load = async () => {
      setLoading(true)
      setError(null)

      try {
        const { data, error } = await supabase
          .from('clicks')
          .select(`
            id,
            clicked_at,
            user_id,
            offer_id,
            influencer_id,
            redeemed,
            offers:offer_id (
              id,
              title,
              slug
            ),
            partners:influencer_id (
              id,
              name,
              slug
            )
          `)
          .order('clicked_at', { ascending: false })
          .limit(limit)

        if (error) throw error
        if (!alive) return

        const mapped: ClickRow[] = (data ?? []).map((r: any) => {
          const offer = one(r.offers)
          const partner = one(r.partners)

          return {
            id: r.id,
            clicked_at: r.clicked_at,
            user_id: r.user_id ?? null,
            redeemed: !!r.redeemed,
            offer_id: r.offer_id,
            offer_title: offer?.title ?? 'Unbekanntes Offer',
            offer_slug: offer?.slug ?? null,
            influencer_id: r.influencer_id ?? null,
            partner_name: partner?.name ?? null,
            partner_slug: partner?.slug ?? null,
          }
        })

        setRows(mapped)
      } catch (e: any) {
        console.error(e)
        if (!alive) return
        setError(e?.message || 'Fehler beim Laden der Klicks')
      } finally {
        if (!alive) return
        setLoading(false)
      }
    }

    void load()

    return () => {
      alive = false
    }
  }, [supabase, limit])

  const partnerOptions = useMemo<PartnerOption[]>(() => {
    const map = new Map<string, string>()

    for (const r of rows) {
      if (!r.influencer_id) continue
      map.set(r.influencer_id, r.partner_name || 'Ohne Namen')
    }

    return [...map.entries()]
      .map(([id, name]) => ({ id, name }))
      .sort((a, b) => a.name.localeCompare(b.name, 'de'))
  }, [rows])

  const offerOptions = useMemo<OfferOption[]>(() => {
    const map = new Map<string, string>()

    for (const r of rows) {
      map.set(r.offer_id, r.offer_title)
    }

    return [...map.entries()]
      .map(([id, title]) => ({ id, title }))
      .sort((a, b) => a.title.localeCompare(b.title, 'de'))
  }, [rows])

  const filteredRows = useMemo(() => {
    const needle = q.trim().toLowerCase()

    return rows.filter(r => {
      if (partnerFilter !== 'all' && r.influencer_id !== partnerFilter) return false
      if (offerFilter !== 'all' && r.offer_id !== offerFilter) return false
      if (redeemedFilter === 'true' && !r.redeemed) return false
      if (redeemedFilter === 'false' && r.redeemed) return false

      if (!needle) return true

      const haystack = [
        r.id,
        r.user_id ?? '',
        r.offer_title ?? '',
        r.offer_slug ?? '',
        r.partner_name ?? '',
        r.partner_slug ?? '',
        r.influencer_id ?? '',
      ]
        .join(' ')
        .toLowerCase()

      return haystack.includes(needle)
    })
  }, [rows, q, partnerFilter, offerFilter, redeemedFilter])

  const stats = useMemo(() => {
    const total = filteredRows.length
    const redeemed = filteredRows.filter(r => r.redeemed).length
    const open = total - redeemed
    return { total, redeemed, open }
  }, [filteredRows])

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-[#003b5b]">Admin Klick-Übersicht</h1>
        <p className="text-sm text-gray-600 mt-1">
          Alle Klicks mit Offer und zugeordnetem Partner.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Kpi title="Gefilterte Klicks" value={stats.total} />
        <Kpi title="Offen" value={stats.open} />
        <Kpi title="Redeemed" value={stats.redeemed} />
      </div>

      <div className="bg-white border rounded p-4 space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <input
            className="border rounded px-3 py-2 text-sm"
            placeholder="Suche nach Partner, Offer, User-ID, Click-ID …"
            value={q}
            onChange={e => setQ(e.target.value)}
          />

          <select
            className="border rounded px-3 py-2 text-sm bg-white"
            value={partnerFilter}
            onChange={e => setPartnerFilter(e.target.value)}
          >
            <option value="all">Alle Partner</option>
            {partnerOptions.map(p => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>

          <select
            className="border rounded px-3 py-2 text-sm bg-white"
            value={offerFilter}
            onChange={e => setOfferFilter(e.target.value)}
          >
            <option value="all">Alle Offers</option>
            {offerOptions.map(o => (
              <option key={o.id} value={o.id}>
                {o.title}
              </option>
            ))}
          </select>

          <select
            className="border rounded px-3 py-2 text-sm bg-white"
            value={redeemedFilter}
            onChange={e => setRedeemedFilter(e.target.value as 'all' | 'true' | 'false')}
          >
            <option value="all">Alle Status</option>
            <option value="false">Nur offen</option>
            <option value="true">Nur redeemed</option>
          </select>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            className="px-3 py-2 border rounded text-sm bg-white hover:bg-gray-50"
            onClick={() => {
              setQ('')
              setPartnerFilter('all')
              setOfferFilter('all')
              setRedeemedFilter('all')
            }}
          >
            Filter zurücksetzen
          </button>

          <select
            className="border rounded px-3 py-2 text-sm bg-white"
            value={String(limit)}
            onChange={e => setLimit(Number(e.target.value))}
          >
            <option value="100">100 laden</option>
            <option value="250">250 laden</option>
            <option value="500">500 laden</option>
            <option value="1000">1000 laden</option>
          </select>
        </div>
      </div>

      <div className="overflow-auto bg-white border rounded">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <Th>Datum</Th>
              <Th>Partner</Th>
              <Th>Offer</Th>
              <Th>User ID</Th>
              <Th>Status</Th>
              <Th>Click ID</Th>
            </tr>
          </thead>
          <tbody>
            {!loading && filteredRows.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center p-6 text-gray-500">
                  Keine Klicks gefunden.
                </td>
              </tr>
            )}

            {filteredRows.map(r => (
              <tr key={r.id} className="border-t align-top">
                <Td>{fmtDate(r.clicked_at)}</Td>

                <Td>
                  <div className="font-medium">{r.partner_name ?? 'Direkt / Kein Partner'}</div>
                  <div className="text-xs text-gray-500">
                    {r.partner_slug ?? r.influencer_id ?? '-'}
                  </div>
                </Td>

                <Td>
                  <div className="font-medium">{r.offer_title}</div>
                  <div className="text-xs text-gray-500">{r.offer_slug ?? r.offer_id}</div>
                </Td>

                <Td className="text-xs break-all text-gray-700">{r.user_id ?? '-'}</Td>

                <Td>
                  <span
                    className={`inline-flex px-2 py-1 rounded text-xs ${
                      r.redeemed
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {r.redeemed ? 'redeemed' : 'offen'}
                  </span>
                </Td>

                <Td className="text-xs break-all text-gray-700">{r.id}</Td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {loading && <div className="text-sm text-gray-500">Lade Klicks…</div>}
      {error && <div className="text-sm text-red-600">Fehler: {error}</div>}
    </div>
  )
}

function Kpi({ title, value }: { title: string; value: number | string }) {
  return (
    <div className="bg-white border rounded p-4">
      <div className="text-xs text-gray-500">{title}</div>
      <div className="text-2xl font-semibold mt-1">{value}</div>
    </div>
  )
}

function Th({ children }: { children: React.ReactNode }) {
  return <th className="text-left px-3 py-2 font-semibold">{children}</th>
}

function Td({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <td className={`px-3 py-2 ${className}`}>{children}</td>
}