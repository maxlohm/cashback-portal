// app/partner-dashboard/page.tsx

export const dynamic = 'force-dynamic'

import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export default async function PartnerDashboard() {
  // 1. Supabase Client mit Zugriff auf Cookies
  const supabase = createServerComponentClient({ cookies })

  // 2. Eingeloggten Nutzer holen
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  // 3. Wenn kein Nutzer → weiterleiten zum Login
  if (!user || userError) {
    console.error('❌ Kein eingeloggter Nutzer:', userError)
    redirect('/login')
  }

  // 4. Debug-Ausgabe der User-ID
  console.log('✅ Eingeloggter Nutzer:', user.id)

  // 5. Temporäre Rückgabe (nur zur Prüfung)
  return (
    <main className="max-w-4xl mx-auto py-20 px-6">
      <h1 className="text-3xl font-bold mb-4">🔐 Partner-Dashboard</h1>
      <p className="text-lg text-gray-700">Willkommen, Partner!</p>
      <p className="mt-4 text-sm text-gray-500">
        Deine ID: <span className="font-mono">{user.id}</span>
      </p>
    </main>
  )
}
