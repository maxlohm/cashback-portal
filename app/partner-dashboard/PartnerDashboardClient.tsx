'use client'

import React, { useEffect, useMemo, useRef, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts'

type Stats = {
  total_clicks: number
  total_leads: number
  total_earnings: number | null
}

type LeadRow = {
  id: string
  amount: number | null
  confirmed: boolean
  payout_ready: boolean | null
  confirmed_at: string | null
  clicked_at: string | null
  offer_id: string
  offer_title: string
  influencer_paid: boolean | null
}

type RedemptionRow = {
  id: string
  amount: number
  status: string
  provider: string | null
  sku: string | null
  created_at: string
}

type SeriesPoint = { d: string; amount: number }
type Offer = { id: string; title: string }

type PartnerInfo = {
  id: string
  commission_rate: number | null
  name?: string | null
}

type OfferPerfRow = {
  offer_id: string
  title: string
  clicks: number
  leads: number
  cr: number
  revenue: number
}

const fmtEUR = (n: number) => `${Number(n || 0).toFixed(2)} €`
const fmtPct = (n: number) => `${(Number(n || 0) * 100).toFixed(0)} %`
const monthKey = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`

function toISODate(d: Date) {
  return d.toISOString().slice(0, 10)
}
function addDays(d: Date, days: number) {
  const x = new Date(d)
  x.setDate(x.getDate() + days)
  return x
}

export default function PartnerDashboardClient() {
  const supabase = useMemo(() => createClientComponentClient(), [])

  // Global filters
  const [statusFilter, setStatusFilter] =
    useState<'all' | 'open' | 'confirmed' | 'ready'>('all')

  const [month, setMonth] = useState<string>('all') // all | YYYY-MM | custom
  const [customFrom, setCustomFrom] = useState<string>('')
  const [customTo, setCustomTo] = useState<string>('')

  // Global Deal filter (applies everywhere)
  const [qOffer, setQOffer] = useState('')
  const [selectedOfferId, setSelectedOfferId] = useState<string | null>(null)

  // Deal-performance sort (table only)
  const [perfSort, setPerfSort] = useState<'revenue' | 'clicks' | 'leads' | 'cr'>(
    'revenue',
  )

  // Data
  const [stats, setStats] = useState<Stats | null>(null)
  const [leads, setLeads] = useState<LeadRow[]>([])
  const [redemptions, setRedemptions] = useState<RedemptionRow[]>([])
  const [series, setSeries] = useState<SeriesPoint[]>([])
  const [offers, setOffers] = useState<Offer[]>([])
  const [clicksByOffer, setClicksByOffer] = useState<Record<string, number>>({})

  const [userId, setUserId] = useState<string | null>(null)
  const [partnerInfo, setPartnerInfo] = useState<PartnerInfo | null>(null)

  // UI
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [openLinks, setOpenLinks] = useState(true)
  const [openPerf, setOpenPerf] = useState(true)
  const [openPayout, setOpenPayout] = useState(true)
  const [openLeads, setOpenLeads] = useState(true)
  const [openPayouts, setOpenPayouts] = useState(false)

  // Promo link offer dropdown (independent of filtering; just for link building)
  const [promoOfferId, setPromoOfferId] = useState<string | null>(null)

  // Copy toast
  const [toast, setToast] = useState<string | null>(null)
  const toastTimer = useRef<any>(null)

  const siteUrl = useMemo(() => {
    if (typeof window !== 'undefined') {
      return process.env.NEXT_PUBLIC_SITE_URL || window.location.origin || ''
    }
    return process.env.NEXT_PUBLIC_SITE_URL || ''
  }, [])

  // Zeitraum: customTo wird "inklusive" interpretiert, DB-Query nutzt toDate exclusive (= customTo + 1 Tag)
  const { fromDate, toDate } = useMemo(() => {
    if (month === 'all') return { fromDate: null, toDate: null }
    if (month === 'custom') {
      const fd = customFrom ? new Date(customFrom) : null
      const tdRaw = customTo ? new Date(customTo) : null
      const td = tdRaw ? addDays(tdRaw, 1) : null // exclusive
      return { fromDate: fd, toDate: td }
    }
    const [y, m] = month.split('-').map(Number)
    return { fromDate: new Date(y, m - 1, 1), toDate: new Date(y, m, 1) } // exclusive
  }, [month, customFrom, customTo])

  const showToast = (msg: string) => {
    setToast(msg)
    if (toastTimer.current) clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToast(null), 1200)
  }

  const copy = async (text: string, label = 'Kopiert') => {
    if (!text) return
    try {
      await navigator.clipboard.writeText(text)
      showToast(label)
    } catch {
      showToast('Kopieren fehlgeschlagen')
    }
  }

  // Quick-range: setzt Custom Range
  const applyQuickRange = (kind: '24h' | '7d') => {
    const today = new Date()
    const end = new Date(today.getFullYear(), today.getMonth(), today.getDate()) // heute 00:00
    if (kind === '24h') {
      const start = addDays(end, -1)
      setMonth('custom')
      setCustomFrom(toISODate(start))
      setCustomTo(toISODate(end))
      return
    }
    const start = addDays(end, -6) // 7 Tage inkl. heute
    setMonth('custom')
    setCustomFrom(toISODate(start))
    setCustomTo(toISODate(end))
  }

  // Offer suggestions (autocomplete) - from OFFERS (not advertisers)
  const offerSuggestions = useMemo(() => {
    const q = qOffer.trim().toLowerCase()
    if (!q) return []
    return offers
      .filter(o => o.title.toLowerCase().includes(q))
      .slice(0, 8)
  }, [qOffer, offers])

  const chooseOffer = (o: Offer) => {
    setSelectedOfferId(o.id)
    setQOffer(o.title)
  }

  const clearOfferFilter = () => {
    setSelectedOfferId(null)
    setQOffer('')
  }

  /** Initial load: Auth + PartnerInfo + Offers */
  useEffect(() => {
    ;(async () => {
      setError(null)

      const { data: u } = await supabase.auth.getUser()
      const uid = u.user?.id ?? null
      setUserId(uid)

      if (!uid) {
        setPartnerInfo(null)
        return
      }

      // partners: id, commission_rate, name
      const { data: ptn, error: ptnErr } = await supabase
        .from('partners')
        .select('id, commission_rate, name')
        .eq('user_id', uid)
        .maybeSingle()

      if (ptnErr) {
        console.error(ptnErr)
        setPartnerInfo(null)
      } else {
        setPartnerInfo(
          ptn
            ? {
                id: (ptn as any).id,
                commission_rate:
                  (ptn as any).commission_rate != null
                    ? Number((ptn as any).commission_rate)
                    : null,
                name: (ptn as any).name ?? null,
              }
            : null,
        )
      }

      const { data: off, error: offErr } = await supabase
        .from('offers')
        .select('id,title,active,created_at')
        .eq('active', true)
        .order('created_at', { ascending: false })

      if (offErr) {
        console.error(offErr)
        return
      }

      const list: Offer[] = (off ?? []).map((o: any) => ({
        id: o.id as string,
        title: o.title as string,
      }))
      setOffers(list)
      setPromoOfferId(list[0]?.id ?? null)
    })()
  }, [supabase])

  /** Load clicks per offer (for performance table) */
  const refreshClicks = async (
    partnerId: string,
    fromISO: string | null,
    toISO: string | null,
    offerId: string | null,
  ) => {
    let q = supabase
      .from('clicks')
      .select('offer_id, clicked_at')
      .eq('influencer_id', partnerId)

    if (fromISO) q = q.gte('clicked_at', fromISO)
    if (toISO) q = q.lt('clicked_at', toISO)
    if (offerId) q = q.eq('offer_id', offerId)

    const { data, error } = await q
    if (error) throw new Error(`clicks: ${error.message}`)

    const m: Record<string, number> = {}
    for (const r of data ?? []) {
      const oid = (r as any).offer_id as string
      m[oid] = (m[oid] ?? 0) + 1
    }
    setClicksByOffer(m)
  }

  /** Main refresh */
  const refresh = async () => {
    setLoading(true)
    setError(null)
    try {
      const leadParams = {
        p_status: statusFilter,
        p_from: fromDate ? toISODate(fromDate) : null,
        p_to: toDate ? toISODate(toDate) : null, // exclusive
        p_limit: 500,
        p_offset: 0,
      }
      const tsParams = { p_from: leadParams.p_from, p_to: leadParams.p_to }

      const rpc = async <T,>(name: string, params?: any): Promise<T> => {
        const { data, error } = await supabase.rpc(name, params)
        if (error) throw new Error(`${name}: ${error.message}`)
        return data as T
      }

      const [statsData, leadsData, tsData, redData] = await Promise.all([
        rpc<Stats>('get_partner_stats'),
        rpc<any[]>('get_partner_leads', leadParams),
        rpc<any[]>('get_partner_revenue_timeseries', tsParams),
        rpc<RedemptionRow[]>('get_user_redemptions'),
      ])

      setStats(statsData)

      // Apply offer filter client-side (no DB change needed)
      const rawLeads: LeadRow[] = (leadsData ?? []).map((r: any) => ({ ...r }))
      const filteredLeads = selectedOfferId
        ? rawLeads.filter(l => l.offer_id === selectedOfferId)
        : rawLeads
      setLeads(filteredLeads)

      setSeries(
        (tsData ?? []).map((r: any) => ({
          d: r.d as string,
          amount: Number(r.amount || 0),
        })),
      )
      setRedemptions(redData ?? [])

      // Clicks per offer (respects offer filter)
      if (partnerInfo?.id) {
        await refreshClicks(
          partnerInfo.id,
          leadParams.p_from,
          leadParams.p_to,
          selectedOfferId,
        )
      } else {
        setClicksByOffer({})
      }
    } catch (e: any) {
      console.error(e)
      setError(e?.message || 'Fehler beim Laden')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refresh()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, month, customFrom, customTo, partnerInfo?.id, selectedOfferId])

  // KPIs are now based on filtered leads + filtered clicksByOffer
  const totalClicksFiltered = useMemo(() => {
    return Object.values(clicksByOffer).reduce((a, b) => a + Number(b || 0), 0)
  }, [clicksByOffer])

  const kpis = useMemo(() => {
    const open = leads.filter(x => !x.confirmed).length
    const confirmed = leads.filter(x => x.confirmed).length

    const readyLeads = leads.filter(x => x.payout_ready && !x.influencer_paid)
    const ready = readyLeads.length

    const sumReady = readyLeads.reduce((a, b) => a + Number(b.amount || 0), 0)
    const sumPeriod = leads.reduce((a, b) => a + Number(b.amount || 0), 0)

    return { open, confirmed, ready, sumReady, sumPeriod }
  }, [leads])

  const topOffers = useMemo(() => {
    const m = new Map<string, { title: string; sum: number; count: number }>()
    for (const l of leads) {
      const cur =
        m.get(l.offer_id) ?? { title: l.offer_title, sum: 0, count: 0 }
      cur.sum += Number(l.amount || 0)
      cur.count += 1
      m.set(l.offer_id, cur)
    }
    return [...m.entries()]
      .map(([id, v]) => ({ id, ...v }))
      .sort((a, b) => b.sum - a.sum)
      .slice(0, 5)
  }, [leads])

  const offerPerf = useMemo((): OfferPerfRow[] => {
    const leadAgg = new Map<
      string,
      { title: string; leads: number; revenue: number }
    >()

    for (const l of leads) {
      const cur =
        leadAgg.get(l.offer_id) ?? {
          title: l.offer_title,
          leads: 0,
          revenue: 0,
        }
      cur.leads += 1
      cur.revenue += Number(l.amount || 0)
      leadAgg.set(l.offer_id, cur)
    }

    const allIds = new Set<string>()
    for (const oid of Object.keys(clicksByOffer)) allIds.add(oid)
    for (const oid of leadAgg.keys()) allIds.add(oid)

    const rows: OfferPerfRow[] = []
    for (const oid of allIds) {
      const title =
        offers.find(o => o.id === oid)?.title ??
        leadAgg.get(oid)?.title ??
        'Unbekanntes Offer'

      const clicks = Number(clicksByOffer[oid] ?? 0)
      const leadsCount = Number(leadAgg.get(oid)?.leads ?? 0)
      const revenue = Number(leadAgg.get(oid)?.revenue ?? 0)
      const cr = clicks > 0 ? leadsCount / clicks : 0

      if (clicks === 0 && leadsCount === 0) continue
      rows.push({
        offer_id: oid,
        title,
        clicks,
        leads: leadsCount,
        cr,
        revenue,
      })
    }

    // Sort
    rows.sort((a, b) => {
      if (perfSort === 'clicks') return b.clicks - a.clicks
      if (perfSort === 'leads') return b.leads - a.leads
      if (perfSort === 'cr') return b.cr - a.cr
      return b.revenue - a.revenue
    })

    return rows
  }, [offers, clicksByOffer, leads, perfSort])

  const hasOpenRequest = useMemo(
    () =>
      redemptions.some(r =>
        ['pending', 'approved', 'processing'].includes(r.status),
      ),
    [redemptions],
  )

  async function requestPayout() {
    alert(
      'Für Auszahlungen sende uns bitte deine Rechnung über dein offenes Guthaben.\n\n' +
        'Alle Infos findest du im Dashboard bei „Auszahlungen“.\n' +
        'Wir zahlen wie vereinbart aus.',
    )
  }

  // Promo Links (canonical ref = partners.id)
  const partnerId = partnerInfo?.id ?? null
  const landingLink = partnerId ? `${siteUrl}/?ref=${partnerId}` : ''
  const dealLink = (offerId: string | null) =>
    partnerId && offerId ? `${siteUrl}/angebot/${offerId}?ref=${partnerId}` : ''

  const last12 = useMemo(() => {
    const arr: string[] = []
    const d = new Date()
    for (let i = 0; i < 12; i++) {
      arr.push(monthKey(new Date(d.getFullYear(), d.getMonth() - i, 1)))
    }
    return arr
  }, [])

  return (
    <div className="space-y-6 relative">
      {/* Toast */}
      <div
        className={[
          'fixed left-1/2 top-6 -translate-x-1/2 z-50',
          'transition-all duration-200',
          toast
            ? 'opacity-100 translate-y-0'
            : 'opacity-0 -translate-y-2 pointer-events-none',
        ].join(' ')}
      >
        <div className="rounded-xl bg-[#003b5b] text-white text-sm px-4 py-2 shadow-lg">
          {toast ?? ''}
        </div>
      </div>

      {/* Commission Banner */}
      <div className="bg-white border rounded p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
        <div>
          <div className="text-xs text-gray-500">Dein Provisionssatz</div>
          <div className="text-lg font-semibold">
            {partnerInfo?.commission_rate != null
              ? fmtPct(partnerInfo.commission_rate)
              : '—'}
          </div>
          <div className="text-xs text-gray-500">
            Anteil an der Marge: (Netzwerkbetrag − User-Cashback) × Provisionssatz
          </div>
        </div>
        <div className="text-xs text-gray-500">
          {partnerInfo?.name ? `Partner: ${partnerInfo.name}` : ''}
        </div>
      </div>

      {/* Promo Links */}
      <Section
        title="Meine Promo-Links"
        open={openLinks}
        onToggle={() => setOpenLinks(v => !v)}
      >
        {!partnerId && (
          <div className="mb-4 rounded-xl border bg-white p-4 text-sm text-amber-700">
            Partner-ID nicht gefunden. Du bist entweder nicht als Partner angelegt
            oder `partners.user_id` ist nicht gesetzt.
          </div>
        )}

        <div className="flex flex-col gap-3">
          <div className="flex flex-col md:flex-row gap-2 md:items-center">
            <label className="text-sm w-44">Landing-Link</label>
            <input
              className="flex-1 border rounded px-3 py-2 text-sm"
              readOnly
              value={landingLink}
            />
            <button
              className="px-3 py-2 border rounded bg-white text-sm hover:bg-gray-50 active:scale-[0.98] transition disabled:opacity-60"
              onClick={() => copy(landingLink, 'Landing-Link kopiert')}
              disabled={!landingLink}
            >
              kopieren
            </button>
          </div>

          <div className="flex flex-col md:flex-row gap-2 md:items-center">
            <label className="text-sm w-44">Deal-Link</label>

            <select
              className="border rounded px-2 py-2 text-sm bg-white"
              value={promoOfferId ?? ''}
              onChange={e => setPromoOfferId(e.target.value)}
              disabled={offers.length === 0}
            >
              {offers.map(o => (
                <option key={o.id} value={o.id}>
                  {o.title}
                </option>
              ))}
            </select>

            <input
              className="flex-1 border rounded px-3 py-2 text-sm"
              readOnly
              value={dealLink(promoOfferId) || ''}
            />

            <button
              className="px-3 py-2 border rounded bg-white text-sm hover:bg-gray-50 active:scale-[0.98] transition disabled:opacity-60"
              onClick={() => copy(dealLink(promoOfferId) || '', 'Deal-Link kopiert')}
              disabled={!dealLink(promoOfferId)}
            >
              kopieren
            </button>
          </div>

          <p className="text-xs text-gray-500">
            Tracking passiert beim Klick auf „Jetzt Angebot sichern“.
          </p>
        </div>
      </Section>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Kpi title="Klicks gesamt" value={totalClicksFiltered} />
        <Kpi title="Leads bestätigt" value={kpis.confirmed} />
        <Kpi title="Einnahmen (Zeitraum)" value={fmtEUR(kpis.sumPeriod)} />
        <Kpi title="Auszahlbar" value={fmtEUR(kpis.sumReady)} />
        <Kpi title="Einnahmen gesamt" value={fmtEUR(stats?.total_earnings ?? 0)} />
      </div>

      {/* GLOBAL FILTER BAR (everything in one row) */}
      <div className="bg-white border rounded p-3">
        <div className="flex flex-wrap items-center gap-2">
          {/* Status */}
          {(['all', 'open', 'confirmed', 'ready'] as const).map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-2 rounded border text-sm ${
                statusFilter === s
                  ? 'bg-[#003b5b] text-white'
                  : 'bg-white hover:bg-gray-50'
              }`}
            >
              {s === 'all'
                ? 'Alle'
                : s === 'open'
                ? 'Offen'
                : s === 'confirmed'
                ? 'Bestätigt'
                : 'Auszahlbar'}
            </button>
          ))}

          <div className="mx-1 h-7 w-px bg-gray-200 hidden md:block" />

          {/* Quick ranges */}
          <button
            className="px-3 py-2 border rounded text-sm bg-white hover:bg-gray-50"
            onClick={() => applyQuickRange('24h')}
          >
            Letzte 24h
          </button>
          <button
            className="px-3 py-2 border rounded text-sm bg-white hover:bg-gray-50"
            onClick={() => applyQuickRange('7d')}
          >
            Letzte 7 Tage
          </button>

          <div className="mx-1 h-7 w-px bg-gray-200 hidden md:block" />

          {/* Month / custom */}
          <select
            className="border rounded px-2 py-2 text-sm bg-white"
            value={month}
            onChange={e => setMonth(e.target.value)}
          >
            <option value="all">Alle Monate</option>
            {last12.map(m => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
            <option value="custom">Benutzerdefiniert…</option>
          </select>

          {month === 'custom' && (
            <>
              <input
                type="date"
                className="border rounded px-2 py-2 text-sm"
                value={customFrom}
                onChange={e => setCustomFrom(e.target.value)}
              />
              <span className="text-sm text-gray-500">bis</span>
              <input
                type="date"
                className="border rounded px-2 py-2 text-sm"
                value={customTo}
                onChange={e => setCustomTo(e.target.value)}
              />
            </>
          )}

          <div className="mx-1 h-7 w-px bg-gray-200 hidden md:block" />

          {/* Offer autocomplete filter */}
          <div className="relative min-w-[240px]">
            <input
              className="border rounded px-3 py-2 text-sm bg-white w-full"
              placeholder="Deal filtern (z.B. cons)…"
              value={qOffer}
              onChange={e => setQOffer(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Escape') clearOfferFilter()
              }}
            />
            {qOffer.trim() && offerSuggestions.length > 0 && (
              <div className="absolute z-20 mt-1 w-full bg-white border rounded shadow-sm overflow-hidden">
                {offerSuggestions.map(o => (
                  <button
                    key={o.id}
                    type="button"
                    className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50"
                    onClick={() => chooseOffer(o)}
                  >
                    {o.title}
                  </button>
                ))}
              </div>
            )}
          </div>

          {selectedOfferId && (
            <button
              className="px-3 py-2 border rounded text-sm bg-white hover:bg-gray-50"
              onClick={clearOfferFilter}
              title="Deal-Filter entfernen"
            >
              Deal-Filter: an ✕
            </button>
          )}

          <div className="mx-1 h-7 w-px bg-gray-200 hidden md:block" />

          {/* Table sort */}
          <select
            className="border rounded px-2 py-2 text-sm bg-white"
            value={perfSort}
            onChange={e => setPerfSort(e.target.value as any)}
            title="Sortierung (Deal-Performance)"
          >
            <option value="revenue">Sort: Umsatz</option>
            <option value="clicks">Sort: Clicks</option>
            <option value="leads">Sort: Leads</option>
            <option value="cr">Sort: CR</option>
          </select>

          <button
            className="px-3 py-2 border rounded text-sm bg-white hover:bg-gray-50"
            onClick={() => {
              setStatusFilter('all')
              setMonth('all')
              setCustomFrom('')
              setCustomTo('')
              clearOfferFilter()
              setPerfSort('revenue')
            }}
          >
            Reset
          </button>
        </div>
      </div>

      {/* Chart */}
      <div className="w-full h-64 bg-white border rounded p-3">
        {series.length === 0 ? (
          <div className="h-full flex items-center justify-center text-sm text-gray-500">
            Noch keine Umsätze im Zeitraum.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={series}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="d" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="amount" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Deal-Performance */}
      <Section
        title="Deal-Performance"
        subtitle="Clicks vs. Leads pro Deal (im Zeitraum)"
        open={openPerf}
        onToggle={() => setOpenPerf(v => !v)}
      >
        <div className="overflow-auto bg-white border rounded">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <Th>Offer</Th>
                <Th className="text-right">Clicks</Th>
                <Th className="text-right">Leads</Th>
                <Th className="text-right">CR</Th>
                <Th className="text-right">Umsatz</Th>
              </tr>
            </thead>
            <tbody>
              {offerPerf.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center p-6 text-gray-500">
                    Noch keine Daten im Zeitraum.
                  </td>
                </tr>
              )}
              {offerPerf.map(r => (
                <tr key={r.offer_id} className="border-t">
                  <Td className="font-medium">{r.title}</Td>
                  <Td className="text-right">{r.clicks}</Td>
                  <Td className="text-right">{r.leads}</Td>
                  <Td className="text-right">{(r.cr * 100).toFixed(1)} %</Td>
                  <Td className="text-right">{fmtEUR(r.revenue)}</Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="text-xs text-gray-500 mt-2">
          Clicks = Klicks auf unsere Website über deine Links (bei uns getrackt).
        </p>
      </Section>

      {/* Auszahlung */}
      <Section
        title="Auszahlung beantragen"
        open={openPayout}
        onToggle={() => setOpenPayout(v => !v)}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Kpi title="Auszahlbares Guthaben" value={fmtEUR(kpis.sumReady)} />
          <div className="flex items-center md:col-span-2 justify-end gap-3">
            {hasOpenRequest && kpis.sumReady > 0 && (
              <span className="text-xs text-amber-700 bg-amber-50 px-2 py-1 rounded">
                Es gibt bereits eine offene Auszahlungsanfrage.
              </span>
            )}
            <button
              className="px-4 py-2 rounded bg-[#003b5b] text-white disabled:opacity-60 hover:opacity-95 active:scale-[0.99] transition"
              onClick={requestPayout}
              disabled={kpis.sumReady <= 0}
            >
              Auszahlung anfordern
            </button>
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Hinweis: Influencer erhalten Auszahlungen per Rechnung.
        </p>
      </Section>

      {/* Top Offers */}
      <Section
        title="Top-Offers (Umsatz im Zeitraum)"
        open={true}
        onToggle={() => {}}
      >
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          {topOffers.length === 0 && (
            <div className="text-sm text-gray-500">Noch keine Daten.</div>
          )}
          {topOffers.map(t => (
            <div key={t.id} className="bg-white border rounded p-3">
              <div className="text-sm font-medium">{t.title}</div>
              <div className="text-xs text-gray-500">{t.count} Lead(s)</div>
              <div className="text-lg font-semibold mt-1">{fmtEUR(t.sum)}</div>
            </div>
          ))}
        </div>
      </Section>

      {/* Leads */}
      <Section
        title="Leads"
        subtitle="Deine Leads im Zeitraum"
        open={openLeads}
        onToggle={() => setOpenLeads(v => !v)}
      >
        <div className="overflow-auto bg-white border rounded">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <Th>Datum</Th>
                <Th>Offer</Th>
                <Th>Status</Th>
                <Th className="text-right">Betrag</Th>
              </tr>
            </thead>
            <tbody>
              {leads.length === 0 && (
                <tr>
                  <td colSpan={4} className="text-center p-6 text-gray-500">
                    Keine Leads gefunden.
                  </td>
                </tr>
              )}
              {leads.map(l => {
                const date = l.confirmed_at || l.clicked_at
                const status = l.influencer_paid
                  ? 'abgerechnet'
                  : l.payout_ready
                  ? 'auszahlbar'
                  : l.confirmed
                  ? 'bestätigt'
                  : 'offen'
                return (
                  <tr key={l.id} className="border-t">
                    <Td>
                      {date ? new Date(date).toLocaleString('de-DE') : '-'}
                    </Td>
                    <Td className="font-medium">{l.offer_title}</Td>
                    <Td>
                      <span
                        className={`px-2 py-1 rounded text-xs ${
                          status === 'auszahlbar'
                            ? 'bg-green-100 text-green-700'
                            : status === 'bestätigt'
                            ? 'bg-blue-100 text-blue-700'
                            : status === 'abgerechnet'
                            ? 'bg-purple-100 text-purple-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {status}
                      </span>
                    </Td>
                    <Td className="text-right">{fmtEUR(Number(l.amount || 0))}</Td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Section>

      {/* Auszahlungen */}
      <Section
        title="Auszahlungen"
        subtitle="Historie"
        open={openPayouts}
        onToggle={() => setOpenPayouts(v => !v)}
      >
        <div className="overflow-auto bg-white border rounded">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <Th>Datum</Th>
                <Th>Status</Th>
                <Th>Provider</Th>
                <Th>SKU</Th>
                <Th className="text-right">Betrag</Th>
              </tr>
            </thead>
            <tbody>
              {redemptions.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center p-6 text-gray-500">
                    Noch keine Auszahlungen.
                  </td>
                </tr>
              )}
              {redemptions.map(r => (
                <tr key={r.id} className="border-t">
                  <Td>{new Date(r.created_at).toLocaleString('de-DE')}</Td>
                  <Td>{r.status}</Td>
                  <Td>{r.provider ?? '-'}</Td>
                  <Td>{r.sku ?? '-'}</Td>
                  <Td className="text-right">{fmtEUR(Number(r.amount || 0))}</Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      {loading && <div className="text-sm text-gray-500">Lade Daten…</div>}
      {error && <div className="text-sm text-red-600">Fehler: {error}</div>}
    </div>
  )
}

/* UI helpers */
function Kpi({ title, value }: { title: string; value: number | string }) {
  return (
    <div className="bg-white border rounded p-4">
      <div className="text-xs text-gray-500">{title}</div>
      <div className="text-2xl font-semibold mt-1">{value}</div>
    </div>
  )
}

function Section({
  title,
  subtitle,
  open,
  onToggle,
  children,
}: {
  title: string
  subtitle?: string
  open: boolean
  onToggle: () => void
  children: React.ReactNode
}) {
  return (
    <div className="bg-[#fafafa] border rounded">
      <button
        onClick={onToggle}
        className="w-full text-left px-4 py-3 flex items-center justify-between"
        type="button"
      >
        <div>
          <div className="font-semibold">{title}</div>
          {subtitle && <div className="text-xs text-gray-500">{subtitle}</div>}
        </div>
        <span className="text-xl">{open ? '▾' : '▸'}</span>
      </button>
      {open && <div className="p-4">{children}</div>}
    </div>
  )
}

function Th({ children, className = '' }: any) {
  return (
    <th className={`text-left px-3 py-2 font-semibold ${className}`}>
      {children}
    </th>
  )
}

function Td({ children, className = '' }: any) {
  return <td className={`px-3 py-2 ${className}`}>{children}</td>
}