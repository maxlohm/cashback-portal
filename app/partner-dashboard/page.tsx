// app/partner-dashboard/page.tsx
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import PartnerDashboardClient from './PartnerDashboardClient'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'

export default async function PartnerDashboardPage() {
  const cookieStore = cookies()
  const supabase = createServerComponentClient({ cookies: () => cookieStore })

  const { data: { user }, error: userErr } = await supabase.auth.getUser()
  if (!user || userErr) redirect('/login?next=/partner-dashboard')

  // Server‑Guard auf Rolle bleibt (gut so)
  const { data: profile, error: profErr } = await supabase
    .from('profiles')
    .select('role, soft_deleted_at')
    .eq('id', user.id)
    .maybeSingle()

  if (profErr) {
    return <div className="p-6 text-red-600">Fehler beim Laden des Profils: {profErr.message}</div>
  }

  const role = profile?.role ?? ''
  const allowed = role === 'partner' || role === 'influencer' || role === 'admin'
  if (!allowed || profile?.soft_deleted_at) {
    return <div className="p-6 text-red-600">Kein Zugriff auf das Partner-Dashboard.</div>
  }

  // ✅ Client erwartet nur noch userId
  return <PartnerDashboardClient userId={user.id} />
}
