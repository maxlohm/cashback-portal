// app/dashboard/page.tsx

import { cookies } from 'next/headers'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import UserDashboardClient from './UserDashboardClient'

export default async function DashboardPage() {
  const supabase = createServerComponentClient({ cookies })

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Falls nicht eingeloggt → hier optional redirect()
  if (!user) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4">
        <div className="rounded-xl border border-slate-200 bg-white p-6 text-center shadow-sm">
          <h1 className="text-lg font-semibold text-slate-900">
            Bitte einloggen
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Du musst eingeloggt sein, um dein Dashboard zu sehen.
          </p>
        </div>
      </div>
    )
  }

  let firstName = 'Nutzer'

  const { data: profile } = await supabase
    .from('profiles')
    .select('first_name')
    .eq('id', user.id)
    .single()

  if (profile?.first_name) {
    firstName = profile.first_name
  }

  return (
    <div className="w-full overflow-x-hidden">
      {/* Outer Container – verhindert seitliches Scrollen */}
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Header */}
        <header className="space-y-2">
          <h1 className="text-2xl md:text-3xl font-semibold text-slate-900">
            Willkommen im Nest, {firstName}
          </h1>
          <p className="text-sm text-slate-600">
            Hier findest du dein Guthaben, deine Deals und deine Auszahlungen.
          </p>
        </header>

        {/* Dashboard Client */}
        <UserDashboardClient />

      </div>
    </div>
  )
}