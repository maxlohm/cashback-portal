// app/admin/partners/page.tsx
import { createClient } from '@/utils/supabaseServer'
import PartnersClient from './PartnersClient'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function AdminPartnersPage() {
  const supabase = createClient()

  const { data: isAdmin } = await supabase.rpc('is_admin')
  if (!isAdmin) {
    return (
      <div className="mx-auto max-w-4xl p-6">
        <h1 className="text-2xl font-semibold">Kein Zugriff</h1>
      </div>
    )
  }

  return <PartnersClient />
}