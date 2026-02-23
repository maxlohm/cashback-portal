import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import PartnerApplicationsClient from './PartnerApplicationsClient'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function PartnerApplicationsPage() {
  const supabase = createServerComponentClient({ cookies })
  const { data: isAdmin } = await supabase.rpc('is_admin')
  if (!isAdmin) redirect('/')

  return <PartnerApplicationsClient />
}