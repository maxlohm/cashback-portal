import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import PartnerApplyClient from './PartnerApplyClient'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function PartnerBewerbenPage() {
  const supabase = createServerComponentClient({ cookies })

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  // nicht eingeloggt → Login mit Rücksprung
  if (!user || error) {
    redirect('/login?next=/partner/bewerben')
  }

  return (
    <PartnerApplyClient
      userId={user.id}
      userEmail={user.email ?? ''}
    />
  )
}
