'use client'

import { useEffect, useMemo, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

type Balance = {
  pending_balance: number
  available_balance: number
  total_paid: number
}

type LeadRow = {
  id: string
  offer_title: string
  offer_image?: string
  amount: number | null
  confirmed: boolean
  payout_ready: boolean
  confirmed_at: string | null
  created_at: string
}

type RedemptionRow = {
  id: string
  amount: number
  status: 'pending' | 'approved' | 'processing' | 'paid' | 'rejected'
  created_at: string
  payout_method: 'voucher' | 'bank_transfer' | null
  voucher_type: string | null
  voucher_code: string | null
}

type VoucherOption = {
  id: string
  label: string
  minAmount: number
  amounts: number[] // auswählbare Beträge
}

const VOUCHERS: VoucherOption[] = [
  { id: 'Amazon', label: 'Amazon', minAmount: 1, amounts: [1, 5, 10, 15, 25, 50] },
  { id: 'Zalando', label: 'Zalando', minAmount: 5, amounts: [5, 10, 15, 25, 50] },
  { id: 'Otto', label: 'Otto', minAmount: 5, amounts: [5, 10, 15, 25, 50] },
  { id: 'IKEA', label: 'IKEA', minAmount: 5, amounts: [5, 10, 15, 25, 50] },
  { id: 'MediaMarkt', label: 'MediaMarkt', minAmount: 5, amounts: [5, 10, 15, 25, 50] },
  { id: 'Aral', label: 'Aral Gutschein', minAmount: 10, amounts: [10, 15, 25, 50] },
  { id: 'Rossmann', label: 'Rossmann', minAmount: 5, amounts: [5, 10, 15, 25] },
  { id: 'Rewe', label: 'Rewe', minAmount: 5, amounts: [5, 10, 15, 25, 50] },
  { id: 'airbnb', label: 'airbnb', minAmount: 50, amounts: [50, 100, 150] },
  { id: 'Apple', label: 'Apple Gift Card', minAmount: 10, amounts: [10, 15, 25, 50] },
  { id: 'GooglePlay', label: 'Google Play Gift Card', minAmount: 5, amounts: [5, 10, 15, 25, 50] },
  { id: 'Netflix', label: 'Netflix', minAmount: 25, amounts: [25, 50] },
  { id: 'Spotify', label: 'Spotify', minAmount: 5, amounts: [5, 10, 15, 25] },
  { id: 'Steam', label: 'Steam', minAmount: 5, amounts: [5, 10, 15, 25, 50] },
  { id: 'Lidl', label: 'Lidl', minAmount: 5, amounts: [5, 10, 15, 25, 50] },
  { id: 'eBay', label: 'eBay', minAmount: 5, amounts: [5, 10, 15, 25, 50] },
]

const fmtMoney = new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' })

const MAX_OPEN_REQUESTS = 3

export default function UserDashboardClient() {
  const supabase = useMemo(() => createClientComponentClient(), [])

  const [balance, setBalance] = useState<Balance | null>(null)
  const [leads, setLeads] = useState<LeadRow[]>([])
  const [redemptions, setRedemptions] = useState<RedemptionRow[]>([])
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const [selectedVoucherId, setSelectedVoucherId] = useState<string>(VOUCHERS[0]?.id ?? 'Amazon')
  const selectedVoucher = VOUCHERS.find(v => v.id === selectedVoucherId) ?? VOUCHERS[0]

  const [selectedAmount, setSelectedAmount] = useState<number>(selectedVoucher?.amounts?.[0] ?? selectedVoucher?.minAmount ?? 5)

  useEffect(() => {
    // Wenn Gutschein wechselt: auf kleinsten Betrag springen
    setSelectedAmount(selectedVoucher?.amounts?.[0] ?? selectedVoucher?.minAmount ?? 5)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedVoucherId])

  const load = async () => {
    setLoading(true)
    setError(null)

    try {
      // Balance
      const { data: balRaw, error: balErr } = await supabase.rpc('get_user_balance')
      if (balErr) throw balErr

      const bal = Array.isArray(balRaw) ? (balRaw[0] as Balance) : (balRaw as Balance)
      setBalance(bal ?? null)

      // Leads
      const { data: leadRows, error: leadErr } = await supabase
        .from('leads')
        .select('id, confirmed, payout_ready, confirmed_at, clicks(clicked_at, offers(title,image_url,reward_amount))')
        .order('confirmed_at', { ascending: false })
        .limit(30)

      if (leadErr) throw leadErr

      const leadsMapped: LeadRow[] = (leadRows || []).map((row: any) => {
        const clickedAt = row.clicks?.clicked_at as string | null | undefined
        const confirmedAt = row.confirmed_at as string | null | undefined
        const effectiveDate = confirmedAt ?? clickedAt ?? new Date().toISOString()

        return {
          id: row.id,
          offer_title: row.clicks?.offers?.title ?? 'Deal',
          offer_image: row.clicks?.offers?.image_url ?? undefined,
          amount: row.clicks?.offers?.reward_amount ?? null,
          confirmed: !!row.confirmed,
          payout_ready: !!row.payout_ready,
          confirmed_at: confirmedAt ?? null,
          created_at: effectiveDate,
        }
      })
      setLeads(leadsMapped)

      // Redemptions
      const { data: redRows, error: redErr } = await supabase.rpc('get_user_redemptions')
      if (redErr) throw redErr

      const mapped: RedemptionRow[] = (redRows || []).map((r: any) => ({
        id: r.redemption_id,
        amount: Number(r.amount),
        status: r.status,
        created_at: r.created_at,
        payout_method: r.payout_method,
        voucher_type: r.voucher_type,
        voucher_code: r.voucher_code,
      }))
      setRedemptions(mapped)
    } catch (e: any) {
      console.error(e)
      setError(e?.message ?? 'Fehler beim Laden der Daten.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const openRequests = redemptions.filter(r => ['pending','approved','processing'].includes(r.status))
  const openCount = openRequests.length

  const available = Number(balance?.available_balance ?? 0)
  const pending = Number(balance?.pending_balance ?? 0)
  const paid = Number(balance?.total_paid ?? 0)

  const minOk = selectedAmount >= (selectedVoucher?.minAmount ?? 1)
  const amountOk = selectedAmount <= available
  const canRequest = minOk && amountOk && openCount < MAX_OPEN_REQUESTS && !busy

  const requestPayout = async () => {
    if (!canRequest) return

    setBusy(true)
    setError(null)
    setNotice(null)

    try {
      const { error: rpcError } = await supabase.rpc('create_redemption_request', {
        p_amount: selectedAmount,
        p_voucher_type: selectedVoucher.id,
      })

      if (rpcError) {
        setError(humanizeError(rpcError.message))
        return
      }

      setNotice(`Auszahlungsanfrage erstellt: ${fmtMoney.format(selectedAmount)} (${selectedVoucher.label})`)
      await load()
      setTimeout(() => setNotice(null), 2500)
    } finally {
      setBusy(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 shadow-sm">
          Lade Daten …
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 overflow-x-hidden">
      {/* Header */}
      <header className="space-y-1">
        <h1 className="text-xl md:text-2xl font-semibold text-slate-900">Dein Bonus-Nest Dashboard</h1>
        <p className="text-sm text-slate-600">Guthaben, Transaktionen und Auszahlungen.</p>
      </header>

      {/* KPI Cards */}
      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <BalanceCard label="Auszahlbar" hint="Direkt verfügbar (abzgl. offener Anfragen)." value={available} tone="dark" />
        <BalanceCard label="In Bearbeitung" hint="Summe offener Auszahlungen." value={pending} tone="amber" rightBadge={`${openCount}/${MAX_OPEN_REQUESTS}`} />
        <BalanceCard label="Bereits ausgezahlt" hint="Summe aller ausgezahlten Gutscheine." value={paid} tone="emerald" />
      </section>

      {/* Auszahlung */}
      <section className="rounded-2xl border border-slate-200 bg-white p-4 md:p-5 shadow-sm">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
            <div className="space-y-1">
              <h2 className="text-lg font-semibold text-slate-900">Gutschein anfordern</h2>
              <p className="text-sm text-slate-600">
                Du kannst bis zu {MAX_OPEN_REQUESTS} Auszahlungen parallel anfragen. Guthaben wird sofort reserviert.
              </p>
            </div>

            <div className="inline-flex items-center gap-2 self-start rounded-full bg-slate-50 px-3 py-1 text-xs text-slate-600">
              Offene Anfragen: <span className="font-semibold text-slate-900">{openCount}/{MAX_OPEN_REQUESTS}</span>
            </div>
          </div>

          {/* Gutschein Auswahl */}
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
              <div className="text-xs font-medium uppercase tracking-wide text-slate-500">Gutschein</div>
              <div className="mt-2 flex flex-wrap gap-2">
                {VOUCHERS.map(v => {
                  const active = v.id === selectedVoucherId
                  return (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => setSelectedVoucherId(v.id)}
                      className={[
                        'rounded-full border px-3 py-1 text-sm',
                        active ? 'border-slate-900 bg-white text-slate-900' : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300',
                      ].join(' ')}
                    >
                      {v.label}
                    </button>
                  )
                })}
              </div>
              <div className="mt-2 text-xs text-slate-500">
                Mindestbetrag: <span className="font-medium text-slate-900">{fmtMoney.format(selectedVoucher.minAmount)}</span>
              </div>
            </div>

            {/* Betrag Auswahl */}
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
              <div className="text-xs font-medium uppercase tracking-wide text-slate-500">Betrag</div>
              <div className="mt-2 flex flex-wrap gap-2">
                {selectedVoucher.amounts.map(a => {
                  const active = a === selectedAmount
                  const disabled = a > available
                  return (
                    <button
                      key={a}
                      type="button"
                      disabled={disabled}
                      onClick={() => setSelectedAmount(a)}
                      className={[
                        'rounded-full border px-3 py-1 text-sm',
                        disabled ? 'cursor-not-allowed opacity-40' : 'hover:border-slate-300',
                        active ? 'border-slate-900 bg-white text-slate-900' : 'border-slate-200 bg-white text-slate-700',
                      ].join(' ')}
                      title={disabled ? 'Nicht genug auszahlbares Guthaben' : 'Betrag wählen'}
                    >
                      {fmtMoney.format(a)}
                    </button>
                  )
                })}
              </div>

              <div className="mt-2 text-xs text-slate-500">
                Auszahlbar aktuell: <span className="font-medium text-slate-900">{fmtMoney.format(available)}</span>
              </div>
            </div>
          </div>

          {/* Action */}
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <button
              onClick={requestPayout}
              disabled={!canRequest}
              className="inline-flex w-full md:w-auto items-center justify-center rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              {busy ? 'Sende …' : `Auszahlung anfordern (${fmtMoney.format(selectedAmount)})`}
            </button>

            <div className="text-xs text-slate-500">
              {openCount >= MAX_OPEN_REQUESTS ? 'Limit erreicht (max. 3 offene Anfragen).' : null}
              {!minOk ? ` Mindestbetrag für ${selectedVoucher.label} ist ${fmtMoney.format(selectedVoucher.minAmount)}.` : null}
              {minOk && !amountOk ? ' Nicht genug auszahlbares Guthaben für diesen Betrag.' : null}
            </div>
          </div>

          {notice && (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
              {notice}
            </div>
          )}
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              Fehler: {error}
            </div>
          )}
        </div>
      </section>

      {/* Offene Auszahlungen Überblick */}
      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-900">Offene Auszahlungen</h2>
          <span className="text-xs text-slate-500">{openCount} offen</span>
        </div>

        {openCount === 0 ? (
          <div className="mt-3 rounded-xl border border-dashed border-slate-200 bg-slate-50 px-3 py-4 text-center text-sm text-slate-500">
            Keine offenen Auszahlungsanfragen.
          </div>
        ) : (
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            {openRequests.map(r => (
              <div key={r.id} className="rounded-xl border border-slate-200 bg-white p-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-sm font-semibold text-slate-900">{fmtMoney.format(r.amount)}</div>
                    <div className="text-xs text-slate-600">{r.voucher_type ?? 'Gutschein'}</div>
                    <div className="mt-1 text-[11px] text-slate-500">
                      {new Date(r.created_at).toLocaleString('de-DE')}
                    </div>
                  </div>
                  <RedemptionBadge status={r.status} />
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Verlauf: Mobile als Cards, Desktop als Table */}
      <section className="grid gap-6 md:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-900">Transaktionen</h2>
            <span className="text-xs text-slate-500">Letzte {leads.length}</span>
          </div>

          {leads.length === 0 ? (
            <Empty label="Noch keine Transaktionen." />
          ) : (
            <>
              {/* Mobile Cards */}
              <div className="space-y-3 md:hidden">
                {leads.map(l => (
                  <div key={l.id} className="rounded-xl border border-slate-200 p-3">
                    <div className="flex items-center gap-2">
                      {l.offer_image ? (
                        <img src={l.offer_image} alt="" className="h-9 w-9 rounded border border-slate-200 bg-white object-contain" />
                      ) : null}
                      <div className="min-w-0">
                        <div className="truncate text-sm font-medium text-slate-900">{l.offer_title}</div>
                        <div className="text-xs text-slate-500">{new Date(l.created_at).toLocaleDateString('de-DE')}</div>
                      </div>
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                      <div className="text-sm text-slate-700">{l.amount != null ? fmtMoney.format(l.amount) : '–'}</div>
                      <LeadStatusBadge confirmed={l.confirmed} payoutReady={l.payout_ready} />
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop Table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="min-w-full border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-left">
                      <th className="px-2 py-1.5 font-medium text-slate-600">Datum</th>
                      <th className="px-2 py-1.5 font-medium text-slate-600">Deal</th>
                      <th className="px-2 py-1.5 font-medium text-slate-600">Betrag</th>
                      <th className="px-2 py-1.5 font-medium text-slate-600">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leads.map(l => (
                      <tr key={l.id} className="border-b border-slate-100 last:border-0">
                        <td className="px-2 py-1.5 text-slate-700">
                          {new Date(l.created_at).toLocaleDateString('de-DE')}
                        </td>
                        <td className="px-2 py-1.5">
                          <div className="flex items-center gap-2">
                            {l.offer_image ? (
                              <img src={l.offer_image} alt="" className="h-7 w-7 rounded border border-slate-200 bg-white object-contain" />
                            ) : null}
                            <span className="truncate text-slate-800">{l.offer_title}</span>
                          </div>
                        </td>
                        <td className="px-2 py-1.5 text-slate-700">
                          {l.amount != null ? fmtMoney.format(l.amount) : '–'}
                        </td>
                        <td className="px-2 py-1.5">
                          <LeadStatusBadge confirmed={l.confirmed} payoutReady={l.payout_ready} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-900">Auszahlungen</h2>
            <span className="text-xs text-slate-500">Letzte {redemptions.length}</span>
          </div>

          {redemptions.length === 0 ? (
            <Empty label="Noch keine Auszahlungen." />
          ) : (
            <>
              {/* Mobile Cards */}
              <div className="space-y-3 md:hidden">
                {redemptions.map(r => (
                  <div key={r.id} className="rounded-xl border border-slate-200 p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-sm font-semibold text-slate-900">{fmtMoney.format(r.amount)}</div>
                        <div className="text-xs text-slate-600">{r.voucher_type ?? '–'}</div>
                        <div className="mt-1 text-[11px] text-slate-500">{new Date(r.created_at).toLocaleString('de-DE')}</div>
                      </div>
                      <RedemptionBadge status={r.status} />
                    </div>

                    <div className="mt-2 text-xs text-slate-600">
                      Code:{' '}
                      {r.payout_method === 'voucher' && r.status === 'paid' && r.voucher_code ? (
                        <CopyableCode code={r.voucher_code} />
                      ) : (
                        <span className="text-slate-400">Noch nicht verfügbar</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop Table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="min-w-full border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-left">
                      <th className="px-2 py-1.5 font-medium text-slate-600">Datum</th>
                      <th className="px-2 py-1.5 font-medium text-slate-600">Betrag</th>
                      <th className="px-2 py-1.5 font-medium text-slate-600">Status</th>
                      <th className="px-2 py-1.5 font-medium text-slate-600">Gutschein</th>
                      <th className="px-2 py-1.5 font-medium text-slate-600">Code</th>
                    </tr>
                  </thead>
                  <tbody>
                    {redemptions.map(r => (
                      <tr key={r.id} className="border-b border-slate-100 last:border-0">
                        <td className="px-2 py-1.5 text-slate-700">
                          {new Date(r.created_at).toLocaleString('de-DE')}
                        </td>
                        <td className="px-2 py-1.5 text-slate-700">{fmtMoney.format(r.amount)}</td>
                        <td className="px-2 py-1.5">
                          <RedemptionBadge status={r.status} />
                        </td>
                        <td className="px-2 py-1.5 text-slate-700">{r.voucher_type ?? '–'}</td>
                        <td className="px-2 py-1.5">
                          {r.payout_method === 'voucher' && r.status === 'paid' && r.voucher_code ? (
                            <CopyableCode code={r.voucher_code} />
                          ) : (
                            <span className="text-[11px] text-slate-400">Noch nicht verfügbar</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  )
}

/* ========== UI Bits ========== */

function BalanceCard({
  label,
  hint,
  value,
  tone,
  rightBadge,
}: {
  label: string
  hint?: string
  value: number
  tone: 'dark' | 'amber' | 'emerald'
  rightBadge?: string
}) {
  const safe = Number.isFinite(value) ? value : 0

  const toneMap = {
    dark: 'text-slate-900',
    amber: 'text-amber-700',
    emerald: 'text-emerald-700',
  } as const

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</div>
          {hint ? <div className="mt-1 text-[11px] text-slate-500">{hint}</div> : null}
        </div>
        {rightBadge ? (
          <div className="rounded-full bg-slate-50 px-2 py-0.5 text-xs text-slate-700">{rightBadge}</div>
        ) : null}
      </div>
      <div className={`mt-3 text-2xl font-semibold ${toneMap[tone]}`}>{safe.toFixed(2)} €</div>
    </div>
  )
}

function Empty({ label }: { label: string }) {
  return (
    <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-3 py-4 text-center text-sm text-slate-500">
      {label}
    </div>
  )
}

function LeadStatusBadge({ confirmed, payoutReady }: { confirmed: boolean; payoutReady: boolean }) {
  if (!confirmed) return <Badge className="bg-slate-100 text-slate-700">Offen</Badge>
  if (payoutReady) return <Badge className="bg-sky-100 text-sky-800">Auszahlbar</Badge>
  return <Badge className="bg-emerald-100 text-emerald-800">Bestätigt</Badge>
}

function RedemptionBadge({ status }: { status: RedemptionRow['status'] }) {
  const map: Record<string, { cls: string; label: string }> = {
    pending: { cls: 'bg-slate-100 text-slate-800', label: 'Offen' },
    approved: { cls: 'bg-sky-100 text-sky-800', label: 'Freigegeben' },
    processing: { cls: 'bg-amber-100 text-amber-800', label: 'In Bearbeitung' },
    paid: { cls: 'bg-emerald-100 text-emerald-800', label: 'Ausgezahlt' },
    rejected: { cls: 'bg-rose-100 text-rose-800', label: 'Abgelehnt' },
  }
  const it = map[status] ?? { cls: 'bg-slate-100 text-slate-800', label: status }
  return <Badge className={it.cls}>{it.label}</Badge>
}

function Badge({ children, className }: { children: React.ReactNode; className: string }) {
  return <span className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium ${className}`}>{children}</span>
}

function CopyableCode({ code }: { code: string }) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 1200)
    } catch {
      // ignore
    }
  }

  return (
    <button
      onClick={handleCopy}
      className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-[11px] font-mono text-slate-800 hover:bg-slate-100"
      title="Code kopieren"
    >
      <span className="truncate max-w-[140px]">{code}</span>
      <span className="text-[10px] text-slate-500">{copied ? 'Kopiert' : 'Kopieren'}</span>
    </button>
  )
}

function humanizeError(msg: string) {
  const m = (msg || '').toLowerCase()
  if (m.includes('too_many_open_requests')) return 'Du hast bereits 3 offene Auszahlungsanfragen.'
  if (m.includes('insufficient') || m.includes('balance')) return 'Nicht genügend auszahlbares Guthaben.'
  if (m.includes('minimum')) return 'Mindestbetrag für diesen Gutschein nicht erreicht.'
  if (m.includes('request_exists')) return 'Es gibt bereits eine identische offene Anfrage.'
  return msg
}