'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

type RedemptionStatus = 'pending' | 'approved' | 'processing' | 'paid' | 'rejected'

type RedemptionRow = {
  redemption_id: string
  user_id: string
  user_email: string
  amount: number
  status: RedemptionStatus
  created_at: string

  payout_method?: 'voucher' | 'bank_transfer' | null
  voucher_type?: string | null
  voucher_code?: string | null
}

const fmtMoney = new Intl.NumberFormat('de-DE', {
  style: 'currency',
  currency: 'EUR',
})

const STATUS_LABEL: Record<RedemptionStatus, string> = {
  pending: 'Offen',
  approved: 'Freigegeben',
  processing: 'In Bearbeitung',
  paid: 'Ausgezahlt',
  rejected: 'Abgelehnt',
}

const STATUS_COLORS: Record<RedemptionStatus, string> = {
  pending: 'bg-slate-100 text-slate-800',
  approved: 'bg-sky-100 text-sky-800',
  processing: 'bg-amber-100 text-amber-800',
  paid: 'bg-emerald-100 text-emerald-800',
  rejected: 'bg-rose-100 text-rose-800',
}

export default function RedemptionsClient() {
  const supabase = useMemo(() => createClientComponentClient(), [])

  const [rows, setRows] = useState<RedemptionRow[]>([])
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  const [statusFilter, setStatusFilter] = useState<'all' | RedemptionStatus>('all')
  const [monthFilter, setMonthFilter] = useState<string>('all') // 'all' | 'YYYY-MM'
  const [search, setSearch] = useState<string>('')

  // ======= Load =======
  const load = async () => {
    setLoading(true)
    setError(null)

    try {
      const { data, error: rpcError } = await supabase.rpc('admin_get_redemptions')
      if (rpcError) throw rpcError

      const mapped: RedemptionRow[] = (data || []).map((r: any) => ({
        redemption_id: r.redemption_id,
        user_id: r.user_id,
        user_email: r.user_email,
        amount: Number(r.amount ?? 0),
        status: r.status as RedemptionStatus,
        created_at: r.created_at,
        payout_method: r.payout_method ?? null,
        voucher_type: r.voucher_type ?? null,
        voucher_code: r.voucher_code ?? null,
      }))

      setRows(mapped)
    } catch (e: any) {
      console.error(e)
      setError(e?.message ?? 'Fehler beim Laden der Auszahlungen.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ======= Filters =======
  const monthOptions = useMemo(() => {
    const set = new Set<string>()
    rows.forEach((r) => {
      const d = new Date(r.created_at)
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      set.add(key)
    })
    return Array.from(set).sort().reverse()
  }, [rows])

  const filteredRows = useMemo(() => {
    const s = search.trim().toLowerCase()

    return rows.filter((r) => {
      if (statusFilter !== 'all' && r.status !== statusFilter) return false

      if (monthFilter !== 'all') {
        const d = new Date(r.created_at)
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
        if (key !== monthFilter) return false
      }

      if (s) {
        const hay = [
          r.user_email,
          r.voucher_type ?? '',
          r.voucher_code ?? '',
          r.payout_method ?? '',
          r.status,
        ]
          .join(' ')
          .toLowerCase()
        if (!hay.includes(s)) return false
      }

      return true
    })
  }, [rows, statusFilter, monthFilter, search])

  // ======= KPI =======
  const kpis = useMemo(() => {
    const total = rows.reduce((a, r) => a + r.amount, 0)
    const open = rows
      .filter((r) => ['pending', 'approved', 'processing'].includes(r.status))
      .reduce((a, r) => a + r.amount, 0)
    const paid = rows
      .filter((r) => r.status === 'paid')
      .reduce((a, r) => a + r.amount, 0)

    return { total, open, paid }
  }, [rows])

  // ======= RPC helpers =======
  const setVoucherCodeViaRpc = async (row: RedemptionRow, code: string) => {
    const trimmed = code.trim()
    const { error: rpcErr } = await supabase.rpc('admin_set_voucher_code', {
      p_redemption_id: row.redemption_id,
      p_voucher_code: trimmed,
    })
    if (rpcErr) throw rpcErr
  }

  const setStatusViaRpc = async (row: RedemptionRow, newStatus: RedemptionStatus) => {
    const { error: rpcError } = await supabase.rpc('admin_update_redemption_status', {
      redemption_id: row.redemption_id,
      new_status: newStatus,
    })
    if (rpcError) throw rpcError
  }

  // ======= Actions =======
  // Approve: nur möglich wenn Code vorhanden -> setzt Code per RPC, dann status=paid
  const approve = async (row: RedemptionRow, draftCode: string) => {
    const code = draftCode.trim()
    if (!code) {
      setError('Bitte zuerst einen Gutscheincode eingeben, dann kannst du approven.')
      return
    }

    setBusyId(row.redemption_id)
    setError(null)
    setNotice(null)

    try {
      // 1) Gutscheincode setzen (immer über RPC, damit RLS egal ist)
      // nur wenn anders als aktuell, sonst sparen
      if (code !== (row.voucher_code ?? '').trim()) {
        await setVoucherCodeViaRpc(row, code)
      }

      // 2) Status auf paid (User-Dashboard zeigt dann paid/Code)
      await setStatusViaRpc(row, 'paid')

      setNotice(`Auszahlung ausgezahlt: ${row.user_email} (${fmtMoney.format(row.amount)})`)
      await load()
    } catch (e: any) {
      console.error(e)
      setError(humanizeAdminError(e?.message ?? 'Fehler beim Approve.'))
    } finally {
      setBusyId(null)
      setTimeout(() => setNotice(null), 2500)
    }
  }

  const reject = async (row: RedemptionRow) => {
    setBusyId(row.redemption_id)
    setError(null)
    setNotice(null)

    try {
      await setStatusViaRpc(row, 'rejected')
      setNotice(`Auszahlung abgelehnt: ${row.user_email}`)
      await load()
    } catch (e: any) {
      console.error(e)
      setError(humanizeAdminError(e?.message ?? 'Fehler beim Ablehnen.'))
    } finally {
      setBusyId(null)
      setTimeout(() => setNotice(null), 2500)
    }
  }

  // ======= Render =======
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold text-slate-900">Admin – Auszahlungen</h1>
        <p className="text-sm text-slate-600">Code eintragen → Approve (setzt auf paid) oder Reject.</p>
      </header>

      {/* KPIs */}
      <section className="grid gap-4 md:grid-cols-3">
        <Kpi label="Gesamtvolumen" value={fmtMoney.format(kpis.total)} hint="Summe aller Auszahlungen" />
        <Kpi label="Offen / Bearbeitung" value={fmtMoney.format(kpis.open)} hint="pending / approved / processing" />
        <Kpi label="Ausgezahlt" value={fmtMoney.format(kpis.paid)} hint="status = paid" />
      </section>

      {/* Filter */}
      <section className="flex flex-wrap items-center gap-3">
        <div className="flex flex-wrap gap-2">
          {(['all', 'pending', 'paid', 'rejected'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={[
                'rounded border px-3 py-1.5 text-xs',
                statusFilter === s ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-200 bg-white text-slate-800',
              ].join(' ')}
            >
              {s === 'all' ? 'Alle' : s === 'pending' ? 'Offen' : s === 'paid' ? 'Ausgezahlt' : 'Abgelehnt'}
            </button>
          ))}
        </div>

        <select
          className="rounded border border-slate-200 bg-white px-2 py-1.5 text-xs"
          value={monthFilter}
          onChange={(e) => setMonthFilter(e.target.value)}
        >
          <option value="all">Alle Monate</option>
          {monthOptions.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>

        <input
          type="text"
          placeholder="Suche: E-Mail / Gutschein / Code…"
          className="min-w-[180px] flex-1 rounded border border-slate-200 px-2 py-1.5 text-xs"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </section>

      {/* Table */}
      <section className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full text-xs">
          <thead className="border-b border-slate-200 bg-slate-50">
            <tr>
              <Th>Datum</Th>
              <Th>User</Th>
              <Th>Betrag</Th>
              <Th>Art</Th>
              <Th>Gutschein</Th>
              <Th>Code</Th>
              <Th>Status</Th>
              <Th>Aktionen</Th>
            </tr>
          </thead>

          <tbody>
            {filteredRows.length === 0 && (
              <tr>
                <td colSpan={8} className="py-8 text-center text-slate-500">
                  Keine Auszahlungen gefunden.
                </td>
              </tr>
            )}

            {filteredRows.map((r) => (
              <RedemptionRowView
                key={r.redemption_id}
                row={r}
                busy={busyId === r.redemption_id}
                onApprove={approve}
                onReject={reject}
              />
            ))}
          </tbody>
        </table>
      </section>

      {loading && <div className="text-xs text-slate-500">Lade Daten …</div>}
      {notice && (
        <div className="rounded border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-700">
          {notice}
        </div>
      )}
      {error && (
        <div className="rounded border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
          Fehler: {error}
        </div>
      )}
    </div>
  )
}

/* ========= Row Component ========= */

function RedemptionRowView(props: {
  row: RedemptionRow
  busy: boolean
  onApprove: (row: RedemptionRow, code: string) => void
  onReject: (row: RedemptionRow) => void
}) {
  const { row, busy, onApprove, onReject } = props

  const [code, setCode] = useState(row.voucher_code ?? '')

  useEffect(() => {
    setCode(row.voucher_code ?? '')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [row.redemption_id, row.voucher_code])

  const canApprove =
    !!code.trim() &&
    !busy &&
    row.status !== 'paid' &&
    row.status !== 'rejected'

  const canReject =
    !busy &&
    row.status !== 'paid' &&
    row.status !== 'rejected'

  const methodLabel =
    row.payout_method === 'voucher'
      ? 'Gutschein'
      : row.payout_method === 'bank_transfer'
      ? 'Überweisung'
      : '–'

  return (
    <tr className="border-b border-slate-100 last:border-0">
      <Td>{new Date(row.created_at).toLocaleString('de-DE')}</Td>

      <Td className="max-w-[260px]">
        <div className="flex flex-col">
          <span className="font-medium text-slate-900">{row.user_email}</span>
          <span className="text-[10px] text-slate-400">{row.user_id}</span>
        </div>
      </Td>

      <Td>{fmtMoney.format(row.amount)}</Td>

      <Td>{methodLabel}</Td>

      <Td>{row.voucher_type ?? '–'}</Td>

      <Td>
        <input
          type="text"
          className={[
            'w-44 rounded border px-2 py-1 text-[11px]',
            'border-slate-200 focus:border-slate-900 focus:outline-none',
          ].join(' ')}
          placeholder="Gutscheincode…"
          value={code}
          disabled={busy || row.status === 'rejected'}
          onChange={(e) => setCode(e.target.value)}
        />
      </Td>

      <Td>
        <span
          className={[
            'inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium',
            STATUS_COLORS[row.status],
          ].join(' ')}
        >
          {STATUS_LABEL[row.status]}
        </span>
      </Td>

      <Td>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => onApprove(row, code)}
            disabled={!canApprove}
            className={[
              'rounded-lg px-3 py-1 text-[11px] font-medium',
              canApprove
                ? 'bg-slate-900 text-white hover:bg-slate-800'
                : 'bg-slate-200 text-slate-500 cursor-not-allowed',
            ].join(' ')}
            title={!code.trim() ? 'Code fehlt' : 'Approve (setzt auf paid)'}
          >
            Approve
          </button>

          <button
            onClick={() => onReject(row)}
            disabled={!canReject}
            className={[
              'rounded-lg border px-3 py-1 text-[11px] font-medium',
              canReject
                ? 'border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100'
                : 'border-slate-200 bg-slate-100 text-slate-400 cursor-not-allowed',
            ].join(' ')}
            title="Ablehnen"
          >
            Reject
          </button>
        </div>
      </Td>
    </tr>
  )
}

/* ========= UI Helpers ========= */

function Kpi({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</div>
      <div className="mt-1 text-xl font-semibold text-slate-900">{value}</div>
      {hint ? <div className="mt-1 text-[11px] text-slate-500">{hint}</div> : null}
    </div>
  )
}

function Th({ children }: { children: React.ReactNode }) {
  return <th className="px-3 py-2 text-left text-[11px] font-semibold text-slate-600">{children}</th>
}

function Td({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <td className={`px-3 py-2 align-top text-[11px] text-slate-800 ${className}`}>{children}</td>
}

function humanizeAdminError(msg: string) {
  const m = (msg || '').toLowerCase()
  if (m.includes('not_admin')) return 'Keine Admin-Berechtigung.'
  if (m.includes('voucher_code_required')) return 'Bitte einen Gutscheincode eingeben.'
  if (m.includes('redemption_not_found')) return 'Auszahlung nicht gefunden.'
  return msg
}