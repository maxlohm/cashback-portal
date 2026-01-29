export const dynamic = 'force-dynamic'
export const revalidate = 0

import { cookies } from 'next/headers'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { redirect } from 'next/navigation'
import SupportClient from './SupportClient'

export default async function AdminSupportPage() {
  const supabase = createServerComponentClient({ cookies })
  const { data: isAdmin } = await supabase.rpc('is_admin')

  if (!isAdmin) redirect('/')

  return <SupportClient />
}

