// app/dashboard/AccountBalance.tsx
'use client'

import { useEffect, useMemo, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

type Balance = {
  pending_balance: number
  available_balance: number
  total_paid: number
}

export default function AccountBalance() {
  const supabase = useMemo(() => createClientComponentClient(), [])
  const [balance, setBalance] = useState<Balance | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)
  const [err, setErr] = useState<string | null>(null)

  const load = async () => {
    setLoading(true)
    setErr(null)
    const { data, error } = await supabase.rpc('get_user_balance')
    if (error) setErr(error.message)
    else setBalance(data as Balance)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const requestPayout = async () => {
    setSubmitting(true)
    setErr(null); setMsg(null)
    try {
      const res = await fetch('/api/me/payout-request', { method: 'POST' })
      const json = await res.json()
      if (!res.ok) {
        setErr(json?.error || 'Fehler')
      } else {
        setMsg(`Auszahlung angefordert: ${Number(json.amount).toFixed(2)} €`)
        // Nach Erfolg neu laden
        await load()
      }
    } catch (e: any) {
      setErr(e?.message || 'Unbekannter Fehler')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <div className="p-4 rounded border">Lade Kontostand…</div>

  const available = Number(balance?.available_balance || 0)
  const pending = Number(balance?.pending_balance || 0)
  const paid = Number(balance?.total_paid || 0)

  const canRequest = available >= 5 && !submitting

  return (
    <div className="p-4 rounded-2xl border shadow bg-white flex flex-col gap-3">
      <div className="text-xl font-semibold">Dein Kontostand</div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <Stat label="Auszahlbar" value={`${available.toFixed(2)} €`} />
        <Stat label="Ausstehend" value={`${pending.toFixed(2)} €`} />
        <Stat label="Bereits ausgezahlt" value={`${paid.toFixed(2)} €`} />
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={requestPayout}
          disabled={!canRequest}
          className={`px-4 py-2 rounded-xl border ${canRequest ? 'hover:shadow' : 'opacity-50 cursor-not-allowed'}`}
          title={available < 5 ? 'Mindestbetrag 5 €' : 'Auszahlung anfordern'}
        >
          {submitting ? 'Sende…' : 'Auszahlung anfordern'}
        </button>
        <span className="text-sm text-gray-500">Mindestbetrag: 5 €</span>
      </div>

      {msg && <div className="text-green-600 text-sm">{msg}</div>}
      {err && <div className="text-red-600 text-sm">{err}</div>}
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-3 rounded-xl border bg-gray-50">
      <div className="text-sm text-gray-600">{label}</div>
      <div className="text-lg font-semibold">{value}</div>
    </div>
  )
}
