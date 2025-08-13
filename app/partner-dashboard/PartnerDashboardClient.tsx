'use client'

import { useEffect, useMemo, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

type Stats = { total_clicks: number; total_leads: number; total_earnings: number | null }
type Balance = { pending_balance: number; available_balance: number; total_paid: number }
type LeadRow = { id: string; confirmed: boolean; payout_ready: boolean | null; amount: number; confirmed_at: string | null; offer_id: string }
type RedemptionRow = { id: string; amount: number; status: string; provider: string | null; sku: string | null; created_at: string }
type InvoiceRow = { id: string; status: string; created_at: string; paid_at: string | null; net_amount: number; vat_rate: number; vat_amount: number; gross_amount: number }

export default function PartnerDashboardClient({ userId }: { userId: string }) {
  const supabase = useMemo(() => createClientComponentClient(), [])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<Stats | null>(null)
  const [balance, setBalance] = useState<Balance | null>(null)
  const [leads, setLeads] = useState<LeadRow[]>([])
  const [redemptions, setRedemptions] = useState<RedemptionRow[]>([])
  const [invoices, setInvoices] = useState<InvoiceRow[]>([])
  const [vatRate, setVatRate] = useState<number>(19) // UI preview only
  const [error, setError] = useState<string | null>(null)

  async function reload() {
    setLoading(true)
    setError(null)
    try {
      const [statsRes, balRes, profRes] = await Promise.all([
        supabase.rpc('get_partner_stats') as any,
        supabase.rpc('get_user_balance') as any,
        supabase.from('profiles').select('vat_rate').eq('id', userId).maybeSingle(),
      ])

      const s: Stats = statsRes?.data?.[0] ?? { total_clicks: 0, total_leads: 0, total_earnings: 0 }
      const b: Balance = balRes?.data?.[0] ?? { pending_balance: 0, available_balance: 0, total_paid: 0 }
      setStats(s); setBalance(b)
      setVatRate(profRes.data?.vat_rate ?? 19)

      const [{ data: leadsData }, { data: redData }, { data: invData }] = await Promise.all([
        supabase
          .from('leads')
          .select('id, amount, confirmed, payout_ready, confirmed_at, click_id, clicks!inner(user_id, offer_id)')
          .eq('clicks.user_id', userId)
          .order('confirmed_at', { ascending: false })
          .limit(50) as any,
        supabase
          .from('redemptions')
          .select('id, amount, status, provider, sku, created_at')
          .order('created_at', { ascending: false })
          .limit(50),
        supabase
          .from('partner_invoices')
          .select('id, status, created_at, paid_at, net_amount, vat_rate, vat_amount, gross_amount')
          .order('created_at', { ascending: false })
          .limit(50),
      ])

      const rows: LeadRow[] = (leadsData ?? []).map((r: any) => ({
        id: r.id,
        amount: r.amount,
        confirmed: r.confirmed,
        payout_ready: r.payout_ready,
        confirmed_at: r.confirmed_at,
        offer_id: r.clicks?.offer_id ?? '—',
      }))

      setLeads(rows)
      setRedemptions((redData ?? []) as any)
      setInvoices((invData ?? []) as any)
    } catch (e: any) {
      setError(e?.message ?? String(e))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { reload() }, [supabase, userId])

  if (loading) return <Skeleton />
  if (error)   return <div className="p-6 text-red-600">{error}</div>

  const available = Number(balance?.available_balance ?? 0)

  return (
    <div className="p-6 space-y-8">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Partner‑Dashboard</h1>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <KPI title="Klicks gesamt" value={stats?.total_clicks ?? 0} />
        <KPI title="Leads bestätigt" value={stats?.total_leads ?? 0} />
        <KPI title="Einnahmen (brutto)" value={fmt(stats?.total_earnings ?? 0)} />
        <KPI title="Ausgezahlt" value={fmt(balance?.total_paid ?? 0)} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card title="Vorgemerktes Guthaben">
          <div className="text-2xl font-semibold">{fmt(balance?.pending_balance ?? 0)}</div>
          <p className="text-sm text-gray-500 mt-1">Bestätigte Leads in Sperrfrist</p>
        </Card>
        <Card title="Auszahlbares Guthaben">
          <div className="text-2xl font-semibold">{fmt(available)}</div>
          <p className="text-sm text-gray-500 mt-1">Abzüglich bereits angeforderter Auszahlungen</p>
        </Card>
        <VatBox available={available} vatRate={vatRate} />
      </div>

      <InvoiceForm available={available} vatRate={vatRate} onCreated={reload} />

      <Section title="Rechnungen">
        <Table
          headers={['Datum', 'Status', 'Netto', 'MwSt.', 'Brutto', 'Bezahlt am']}
          rows={(invoices ?? []).map(r => [
            dt(r.created_at),
            cap(r.status),
            fmt(r.net_amount),
            `${fmt(r.vat_amount)} (${r.vat_rate} %)`,
            fmt(r.gross_amount),
            r.paid_at ? dt(r.paid_at) : '—'
          ])}
          empty="Noch keine Rechnungen."
        />
      </Section>

      <Section title="Leads">
        <Table
          headers={['Datum', 'Offer', 'Status', 'Betrag']}
          rows={leads.map(l => [
            l.confirmed_at ? dt(l.confirmed_at) : '—',
            <span className="font-mono" key={l.id}>{l.offer_id}</span>,
            l.confirmed ? (l.payout_ready ? 'auszahlbar' : 'vorgemerkt') : 'offen',
            fmt(l.amount),
          ])}
          empty="Keine Leads vorhanden."
        />
      </Section>

      <Section title="Auszahlungen">
        <Table
          headers={['Datum', 'Status', 'Provider', 'SKU', 'Betrag']}
          rows={redemptions.map(r => [
            dt(r.created_at),
            cap(r.status),
            r.provider ?? '—',
            <span className="font-mono" key={r.id}>{r.sku ?? '—'}</span>,
            fmt(r.amount),
          ])}
          empty="Noch keine Auszahlungen."
        />
      </Section>
    </div>
  )
}

/* ===== UI pieces ===== */

function InvoiceForm({ available, vatRate, onCreated }: { available: number; vatRate: number; onCreated: () => void }) {
  const [amount, setAmount] = useState<string>('')
  const [mode, setMode] = useState<'gross'|'net'>('gross')
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)

  const val = Number(amount || 0)
  const isValid = Number.isFinite(val) && val > 0
  const eff = calcVat(val, vatRate, mode)

  const submit = async () => {
    setMsg(null)
    const pick = amount ? val : available
    if (!Number.isFinite(pick) || pick <= 0) { setMsg('Ungültiger Betrag.'); return }
    if (mode === 'gross' && pick > available) { setMsg('Betrag über verfügbarem Guthaben.'); return }

    setLoading(true)
    try {
      const res = await fetch('/api/partner-invoice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: pick, mode }),
      })
      const j = await res.json()
      if (!res.ok) throw new Error(j?.error || 'Fehler beim Erstellen der Rechnung')
      setMsg('Rechnung erstellt.')
      setAmount('')
      onCreated()
    } catch (e: any) {
      setMsg(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card title="Rechnung erstellen">
      <div className="flex flex-col md:flex-row gap-4 md:items-end">
        <div className="flex items-center gap-3">
          <label className="text-sm">Modus</label>
          <select value={mode} onChange={e => setMode(e.target.value as any)} className="border rounded px-3 py-2">
            <option value="gross">Brutto</option>
            <option value="net">Netto</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="number" min={0} step="0.01"
            value={amount}
            placeholder={mode === 'gross' ? available.toFixed(2) : 'Netto…'}
            onChange={(e) => setAmount(e.target.value)}
            className="border rounded px-3 py-2 w-44"
          />
          <button
            onClick={submit}
            disabled={loading || (mode==='gross' && available<=0) || (!isValid && !amount)}
            className="rounded bg-black text-white px-4 py-2 disabled:opacity-50"
          >
            {loading ? 'Sende…' : 'Rechnung anlegen'}
          </button>
        </div>
        <div className="text-sm text-gray-500">Verfügbar: {fmt(available)}</div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
        <MiniStat label="Netto" value={fmt(eff.net)} />
        <MiniStat label={`MwSt. (${vatRate} %)`} value={fmt(eff.vat)} />
        <MiniStat label="Brutto" value={fmt(eff.gross)} />
        <MiniStat label="Modus" value={mode === 'gross' ? 'Brutto → Netto' : 'Netto → Brutto'} />
      </div>
      {msg && <div className="text-sm mt-2">{msg}</div>}
    </Card>
  )
}

function VatBox({ available, vatRate }: { available: number; vatRate: number }) {
  const eff = calcVat(available, vatRate, 'gross')
  return (
    <Card title="MwSt.-Vorschau (auszahlbar)">
      <div className="grid grid-cols-3 gap-2">
        <MiniStat label="Netto" value={fmt(eff.net)} />
        <MiniStat label={`MwSt. (${vatRate} %)`} value={fmt(eff.vat)} />
        <MiniStat label="Brutto" value={fmt(eff.gross)} />
      </div>
      <p className="text-xs text-gray-500 mt-2">
        Hinweis: Der angewendete Satz kommt aus deinem Profil. Standard ist 19 %.
      </p>
    </Card>
  )
}

function KPI({ title, value }: { title: string; value: string | number }) {
  return (
    <div className="rounded-2xl border p-4 bg-white shadow-sm">
      <div className="text-sm text-gray-500">{title}</div>
      <div className="text-2xl font-semibold mt-1">{value}</div>
    </div>
  )
}
function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border p-4 bg-white shadow-sm">
      <div className="text-sm text-gray-500">{title}</div>
      <div className="mt-2">{children}</div>
    </section>
  )
}
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-xl font-semibold mb-2">{title}</h2>
      {children}
    </section>
  )
}
function Table({ headers, rows, empty }: { headers: string[]; rows: React.ReactNode[][]; empty: string }) {
  return (
    <div className="overflow-x-auto border rounded-2xl bg-white shadow-sm">
      <table className="min-w-full text-sm">
        <thead className="bg-gray-50">
          <tr>
            {headers.map(h => <th key={h} className="text-left px-3 py-2 font-medium">{h}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.length > 0 ? rows.map((r, idx) => (
            <tr key={idx} className="border-t">
              {r.map((c, i) => <td key={i} className={`px-3 py-2 ${i === r.length-1 ? 'text-right' : ''}`}>{c}</td>)}
            </tr>
          )) : (
            <tr><td colSpan={headers.length} className="text-center py-6 text-gray-500">{empty}</td></tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border px-3 py-2">
      <div className="text-xs text-gray-500">{label}</div>
      <div className="font-medium">{value}</div>
    </div>
  )
}
function Skeleton() {
  return (
    <div className="p-6 space-y-6 animate-pulse">
      <div className="h-6 w-40 bg-gray-200 rounded" />
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_,i)=><div key={i} className="h-24 bg-gray-200 rounded-2xl" />)}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[...Array(3)].map((_,i)=><div key={i} className="h-28 bg-gray-200 rounded-2xl" />)}
      </div>
      <div className="h-64 bg-gray-200 rounded-2xl" />
    </div>
  )
}

/* ===== utils ===== */

function fmt(n: number) {
  return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(n || 0)
}
function dt(s: string) {
  return new Date(s).toLocaleString()
}
function cap(s: string) {
  return s ? s[0].toUpperCase() + s.slice(1) : s
}
function calcVat(input: number, rate: number, mode: 'gross'|'net') {
  const r = (Number(rate) || 0) / 100
  if (!Number.isFinite(input) || input <= 0) return { net: 0, vat: 0, gross: 0 }
  if (mode === 'gross') {
    const net = round2(input / (1 + r))
    const vat = round2(input - net)
    return { net, vat, gross: round2(input) }
  } else {
    const vat = round2(input * r)
    const gross = round2(input + vat)
    return { net: round2(input), vat, gross }
  }
}
function round2(n: number) { return Math.round((n + Number.EPSILON) * 100) / 100 }
