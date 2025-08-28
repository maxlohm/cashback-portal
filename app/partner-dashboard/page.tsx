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

  // Auth
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login?next=/partner-dashboard')

  // Admin darf immer rein; sonst Rollen-Guard
  const { data: isAdmin } = await supabase.rpc('is_admin')
  if (!isAdmin) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, soft_deleted_at')
      .eq('id', user.id)
      .maybeSingle()

    const role = profile?.role ?? ''
    const allowed = role === 'partner' || role === 'influencer'
    if (!allowed || profile?.soft_deleted_at) {
      return <div className="p-6 text-red-600">Kein Zugriff auf das Partner-Dashboard.</div>
    }
  }

  return <PartnerDashboardClient />
}
