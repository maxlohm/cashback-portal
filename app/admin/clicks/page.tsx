import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import AdminClicksClient from './AdminClicksClient'

export const dynamic = 'force-dynamic'

function parseIsAdmin(data: any): boolean {
  if (data === true) return true
  if (data === false || data == null) return false
  if (typeof data === 'object' && data.is_admin === true) return true
  if (Array.isArray(data) && data[0]?.is_admin === true) return true
  return false
}

export default async function AdminClicksPage() {
  const supabase = createServerComponentClient({ cookies })

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: isAdminData } = await supabase.rpc('is_admin')
  const isAdmin = parseIsAdmin(isAdminData)

  if (!isAdmin) redirect('/')

  return <AdminClicksClient />
}