// app/dashboard/page.tsx
import UserDashboardClient from './UserDashboardClient'
import { cookies } from 'next/headers'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'

export default async function DashboardPage() {
  const supabase = createServerComponentClient({ cookies })

  // eingeloggten User holen
  const {
    data: { user },
  } = await supabase.auth.getUser()

  let firstName = 'Nutzer'

  if (user) {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('first_name')
      .eq('id', user.id)
      .single()

    if (!error && profile?.first_name) {
      firstName = profile.first_name
    }
  }

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">
        Willkommen im Nest, {firstName}
      </h1>

      <UserDashboardClient />
    </div>
  )
}
