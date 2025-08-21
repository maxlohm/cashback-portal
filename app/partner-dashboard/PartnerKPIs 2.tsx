'use client'

import { useEffect, useMemo, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'

type Stats = { total_clicks: number; total_leads: number; total_earnings: number | null }
type Balance = { pending_balance: number; available_balance: number; total_paid: number }

export default function PartnerKPIs() {
  const supabase = useMemo(() => createClientComponentClient(), [])
  const router = useRouter()

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState<Stats>({ total_clicks: 0, total_leads: 0, total_earnings: 0 })
  const [balance, setBalance] = useState<Balance>({ pending_balance: 0, available_balance: 0, total_paid: 0 })

  useEffect(() => {
    const run = async () => {
      setLoading(true)
      setError(null)

      const { data: userRes } = await supabase.auth.getUser()
      const user = userRes?.user
      if (!user) {
        router.push('/login?next=/partner-dashboard')
        return
      }

      // Rollen‑Guard: partner | influencer | admin
      const { data: profile, error: profErr } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      if (profErr || !profile || !['partner','influencer','admin'].includes(profile.role)) {
        setError('Kein Zugriff auf das Partner-Dashboard.')
        setLoading(false)
        return
      }

      const [statsRes, balRes] = await Promise.all([
        supabase.rpc('get_partner_stats') as any,
        supabase.rpc('get_user_balance') as any
      ])

      const s = statsRes.data?.[0] ?? { total_clicks: 0, total_leads: 0, total_earnings: 0 }
      const b = balRes.data?.[0] ?? { pending_balance: 0, available_balance: 0, total_paid: 0 }
      setStats(s)
      setBalance(b)
      setLoading(false)
    }
    run()
  }, [supabase, router])

  if (loading) return <div className="p-6">Lade…</div>
  if (error) return <div className="p-6 text-red-600">{error}</div>

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Partner-Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <KPI title="Klicks gesamt" value={stats.total_clicks} />
        <KPI title="Leads bestätigt" value={stats.total_leads} />
        <KPI title="Einnahmen gesamt" value={fmt(stats.total_earnings ?? 0)} />
        <KPI title="Ausgezahlt" value={fmt(balance.total_paid)} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card title="Vorgemerktes Guthaben">
          <div className="text-2xl font-semibold">{fmt(balance.pending_balance)}</div>
          <p className="text-sm text-muted-foreground mt-1">Bestätigte Leads in Sperrfrist</p>
        </Card>
        <Card title="Auszahlbares Guthaben">
          <div className="text-2xl font-semibold">{fmt(balance.available_balance)}</div>
          <p className="text-sm text-muted-foreground mt-1">Abzüglich bereits angeforderter Auszahlungen</p>
        </Card>
      </div>
    </div>
  )
}

function KPI({ title, value }: { title: string; value: string | number }) {
  return (
    <div className="rounded-lg border p-4 bg-white">
      <div className="text-sm text-gray-500">{title}</div>
      <div className="text-2xl font-semibold mt-1">{value}</div>
    </div>
  )
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border p-4 bg-white">
      <div className="text-sm text-gray-500">{title}</div>
      <div className="mt-2">{children}</div>
    </div>
  )
}

function fmt(n: number) {
  return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(n || 0)
}
