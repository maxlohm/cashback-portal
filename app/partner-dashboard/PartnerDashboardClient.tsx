'use client'

import { useEffect, useMemo, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'

type Stats = { total_clicks: number; total_leads: number; total_earnings: number | null }
type Balance = { pending_balance: number; available_balance: number; total_paid: number }
type LeadRow = {
  id: string
  amount: number | null
  confirmed: boolean
  payout_ready: boolean | null
  confirmed_at: string | null
  clicked_at: string | null
  offer_id: string
  offer_title: string
}
type RedemptionRow = { id: string; amount: number; status: string; provider: string | null; sku: string | null; created_at: string }
type SeriesPoint = { d: string; amount: number }
type Offer = { id: string; title: string }

const supabase = createClientComponentClient()
const fmtEUR = (n: number) => `${n.toFixed(2)} €`
const monthKey = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`

export default function PartnerDashboardClient() {
  // Filters
  const [statusFilter, setStatusFilter] = useState<'all' | 'open' | 'confirmed' | 'ready'>('all')
  const [month, setMonth] = useState<string>('all') // 'all' | 'YYYY-MM' | 'custom'
  const [customFrom, setCustomFrom] = useState<string>('')
  const [customTo, setCustomTo] = useState<string>('')

  // Data
  const [stats, setStats] = useState<Stats | null>(null)
  const [balance, setBalance] = useState<Balance | null>(null)
  const [leads, setLeads] = useState<LeadRow[]>([])
  const [redemptions, setRedemptions] = useState<RedemptionRow[]>([])
  const [series, setSeries] = useState<SeriesPoint[]>([])
  const [offers, setOffers] = useState<Offer[]>([])
  const [userId, setUserId] = useState<string | null>(null)
  const [vatRate, setVatRate] = useState<number>(19)

  // UI
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [openPayout, setOpenPayout] = useState(true)
  const [openLeads, setOpenLeads] = useState(true)
  const [openPayouts, setOpenPayouts] = useState(false)
  const [openLinks, setOpenLinks] = useState(true)
  const [selectedOfferId, setSelectedOfferId] = useState<string | null>(null)

  // month -> from/to
  const { fromDate, toDate } = useMemo(() => {
    if (month === 'all') return { fromDate: null as Date | null, toDate: null as Date | null }
    if (month === 'custom') {
      const from = customFrom ? new Date(customFrom) : null
      const to = customTo ? new Date(customTo) : null
      return { fromDate: from, toDate: to }
    }
    const [y, m] = month.split('-').map(Number)
    return { fromDate: new Date(y, m - 1, 1), toDate: new Date(y, m, 1) }
  }, [month, customFrom, customTo])

  // initial: user, offers, VAT
  useEffect(() => {
    ;(async () => {
      const { data: u } = await supabase.auth.getUser()
      setUserId(u.user?.id ?? null)

      // aktive Offers (für Promo-Links)
      const { data: off } = await supabase
        .from('offers')
        .select('id,title,active')
        .eq('active', true)
        .order('created_at', { ascending: false })
      const list = (off ?? []).map(o => ({ id: o.id as string, title: (o as any).title as string }))
      setOffers(list)
      setSelectedOfferId(list[0]?.id ?? null)

      // VAT-Rate aus Profil (fallback 19 %)
      const { data: prof } = await supabase.from('profiles').select('vat_rate').maybeSingle()
      if (prof?.vat_rate != null) setVatRate(Number(prof.vat_rate))
    })()
  }, [])

  const refresh = async () => {
    setLoading(true)
    setError(null)
    try {
     // in PartnerDashboardClient.tsx, im refresh():
const leadParams = {
  p_status: statusFilter,
  p_from: fromDate ? fromDate.toISOString().slice(0,10) : null,
  p_to:   toDate   ? toDate.toISOString().slice(0,10)   : null,
  p_limit: 500,
  p_offset: 0,
}
const tsParams = { p_from: leadParams.p_from, p_to: leadParams.p_to }

const [sStats, sLeads, sTs, sBal, sRed] = await Promise.all([
  supabase.rpc('get_partner_stats'),
  supabase.rpc('get_partner_leads', leadParams),
  supabase.rpc('get_partner_revenue_timeseries', tsParams),
  supabase.rpc('get_user_balance'),
  supabase.rpc('get_user_redemptions'),   // <- bleibt gleich
])

      if (sStats.error) throw sStats.error
      if (sLeads.error) throw sLeads.error
      if (sTs.error) throw sTs.error
      if (sBal.error) throw sBal.error
      if (sRed.error) throw sRed.error

      setStats(sStats.data as Stats)
      setLeads(((sLeads.data ?? []) as any[]).map((r: any) => ({ ...r })))
      setSeries(((sTs.data ?? []) as any[]).map(r => ({ d: r.d, amount: Number(r.amount || 0) })))
      setBalance(sBal.data as Balance)
      setRedemptions((sRed.data ?? []) as RedemptionRow[])
    } catch (e: any) {
      setError(e.message ?? 'Fehler beim Laden')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refresh()
  }, [statusFilter, month, customFrom, customTo])

  // KPIs
  const kpis = useMemo(() => {
    const open = leads.filter(x => !x.confirmed).length
    const confirmed = leads.filter(x => x.confirmed).length
    const ready = leads.filter(x => x.payout_ready).length
    const sumReady = leads.filter(x => x.payout_ready).reduce((a, b) => a + Number(b.amount || 0), 0)
    const sumPeriod = leads.reduce((a, b) => a + Number(b.amount || 0), 0)
    return { open, confirmed, ready, sumReady, sumPeriod }
  }, [leads])

  // Top Offers
  const topOffers = useMemo(() => {
    const m = new Map<string, { title: string; sum: number; count: number }>()
    for (const l of leads) {
      const key = l.offer_id
      const cur = m.get(key) ?? { title: l.offer_title || '—', sum: 0, count: 0 }
      cur.sum += Number(l.amount || 0)
      cur.count += 1
      m.set(key, cur)
    }
    return [...m.entries()]
      .map(([id, v]) => ({ id, ...v }))
      .sort((a, b) => b.sum - a.sum)
      .slice(0, 5)
  }, [leads])

  // VAT-Vorschau
  const vatPreview = useMemo(() => {
    const gross = balance?.available_balance ?? 0
    const net = gross / (1 + vatRate / 100)
    const vat = gross - net
    return { gross, net, vat }
  }, [balance, vatRate])

  async function requestPayout() {
    const { error } = await supabase.rpc('create_redemption_request', {})
    if (error) {
      alert(`Auszahlung nicht möglich: ${error.message}`)
      return
    }
    alert('Auszahlung beantragt – wir melden uns.')
    refresh()
  }

  function csvExport() {
    const rows = [
      ['Datum', 'Offer', 'Status', 'Betrag'],
      ...leads.map(l => {
        const date = l.confirmed_at || l.clicked_at || ''
        const status = l.payout_ready ? 'auszahlbar' : l.confirmed ? 'bestätigt' : 'offen'
        return [date, l.offer_title || '', status, String(Number(l.amount || 0).toFixed(2)).replace('.', ',')]
      }),
    ]
    const csv = rows.map(r => r.map(x => `"${String(x).replace(/"/g, '""')}"`).join(';')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `leads_${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL || (typeof window !== 'undefined' ? window.location.origin : '')
  const landingLink = userId ? `${siteUrl}/?ref=${userId}` : ''
  const dealLink = (offerId: string | null) =>
    userId && offerId ? `${siteUrl}/r/${offerId}?ref=${userId}` : ''
  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
    } catch {}
  }

  const last12 = useMemo(() => {
    const arr: string[] = []
    const d = new Date()
    for (let i = 0; i < 12; i++) arr.push(monthKey(new Date(d.getFullYear(), d.getMonth() - i, 1)))
    return arr
  }, [])

  return (
    <div className="space-y-6">
      {/* Promo-Links */}
      <Section title="Meine Promo-Links" open={openLinks} onToggle={() => setOpenLinks(v => !v)}>
        <div className="flex flex-col gap-3">
          <div className="flex flex-col md:flex-row gap-2 md:items-center">
            <label className="text-sm w-44">Landing-Link</label>
            <input className="flex-1 border rounded px-3 py-2 text-sm" readOnly value={landingLink} />
            <button className="px-3 py-2 border rounded bg-white" onClick={() => copy(landingLink)}>
              kopieren
            </button>
          </div>

          <div className="flex flex-col md:flex-row gap-2 md:items-center">
            <label className="text-sm w-44">Deal-Link</label>
            <select
              className="border rounded px-2 py-2 text-sm bg-white"
              value={selectedOfferId ?? ''}
              onChange={e => setSelectedOfferId(e.target.value)}
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
              value={dealLink(selectedOfferId) || ''}
            />
            <button
              className="px-3 py-2 border rounded bg-white"
              onClick={() => copy(dealLink(selectedOfferId) || '')}
            >
              kopieren
            </button>
          </div>

          <p className="text-xs text-gray-500">
            Deine Sub-ID wird beim Redirect automatisch angehängt (AWIN=clickref, FinanceAds=subid, Belboon=smc1).
          </p>
        </div>
      </Section>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Kpi title="Klicks gesamt" value={stats?.total_clicks ?? 0} />
        <Kpi title="Leads bestätigt" value={kpis.confirmed} />
        <Kpi title="Einnahmen (brutto)" value={fmtEUR(Number(stats?.total_earnings ?? 0))} />
        <Kpi title="Auszahlbar" value={fmtEUR(kpis.sumReady)} />
        <Kpi title="Ausgezahlt" value={fmtEUR(Number(balance?.total_paid ?? 0))} />
      </div>

      {/* Filter */}
      <div className="flex flex-wrap items-center gap-2">
        {(['all', 'open', 'confirmed', 'ready'] as const).map(s => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-3 py-2 rounded border text-sm ${
              statusFilter === s ? 'bg-[#003b5b] text-white' : 'bg-white'
            }`}
          >
            {s === 'all' ? 'Alle' : s === 'open' ? 'Offen' : s === 'confirmed' ? 'Bestätigt' : 'Auszahlbar'}
          </button>
        ))}
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
          <div className="flex items-center gap-2">
            <input
              type="date"
              className="border rounded px-2 py-1 text-sm"
              value={customFrom}
              onChange={e => setCustomFrom(e.target.value)}
            />
            <span className="text-sm">bis</span>
            <input
              type="date"
              className="border rounded px-2 py-1 text-sm"
              value={customTo}
              onChange={e => setCustomTo(e.target.value)}
            />
            <button className="px-3 py-2 border rounded text-sm bg-white" onClick={refresh}>
              Anwenden
            </button>
          </div>
        )}
        <button className="ml-auto px-3 py-2 border rounded text-sm bg-white" onClick={csvExport}>
          CSV exportieren
        </button>
      </div>

      {/* Umsatz-Chart */}
      <div className="w-full h-64 bg-white border rounded p-3">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={series}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="d" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="amount" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Auszahlung */}
      <Section title="Auszahlung beantragen" open={openPayout} onToggle={() => setOpenPayout(v => !v)}>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Kpi title="Auszahlbares Guthaben (brutto)" value={fmtEUR(vatPreview.gross)} />
          <Kpi title={`MwSt. (${vatRate} %)`} value={fmtEUR(vatPreview.vat)} />
          <Kpi title="Netto (Vorschau)" value={fmtEUR(vatPreview.net)} />
          <div className="flex items-center justify-end">
            <button
              className="px-4 py-2 rounded bg-[#003b5b] text-white disabled:opacity-60"
              onClick={requestPayout}
              disabled={(balance?.available_balance ?? 0) <= 0}
            >
              Auszahlung anfordern
            </button>
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Hinweis: Mindestauszahlung & Sperrfristen gelten. Bereits laufende Anträge werden zuerst abgewickelt.
        </p>
      </Section>

      {/* Top-Offers */}
      <Section title="Top-Offers (Umsatz im Zeitraum)" open onToggle={() => {}}>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          {topOffers.length === 0 && <div className="text-sm text-gray-500">Noch keine Daten.</div>}
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
        subtitle="Deine Leads im gewählten Zeitraum"
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
                const status = l.payout_ready ? 'auszahlbar' : l.confirmed ? 'bestätigt' : 'offen'
                return (
                  <tr key={l.id} className="border-t">
                    <Td>{date ? new Date(date).toLocaleString() : '-'}</Td>
                    <Td className="font-medium">{l.offer_title || '—'}</Td>
                    <Td>
                      <span
                        className={`px-2 py-1 rounded text-xs ${
                          status === 'auszahlbar'
                            ? 'bg-green-100 text-green-700'
                            : status === 'bestätigt'
                            ? 'bg-blue-100 text-blue-700'
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
      <Section title="Auszahlungen" subtitle="Historie" open={openPayouts} onToggle={() => setOpenPayouts(v => !v)}>
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
                  <Td>{new Date(r.created_at).toLocaleString()}</Td>
                  <Td>{r.status}</Td>
                  <Td>{r.provider ?? '-'}</Td>
                  <Td>{r.sku ?? '-'}</Td>
                  <Td className="text-right">{fmtEUR(Number(r.amount))}</Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      {loading && <div className="text-sm text-gray-500">Lade Daten…</div>}
      {error && <div className="text-sm text-red-600">{error}</div>}
    </div>
  )
}

/* UI-Helpers */
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
  children: any
}) {
  return (
    <div className="bg-[#fafafa] border rounded">
      <button onClick={onToggle} className="w-full text-left px-4 py-3 flex items-center justify-between">
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
  return <th className={`text-left px-3 py-2 font-semibold ${className}`}>{children}</th>
}
function Td({ children, className = '' }: any) {
  return <td className={`px-3 py-2 ${className}`}>{children}</td>
}
