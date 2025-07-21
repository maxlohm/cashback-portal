// app/partner-dashboard/page.tsx
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import StatBox from '../components/StatBox'
import LeadTable from '../components/LeadTable'

export default async function PartnerDashboard() {
  // Supabase Server Client mit den aktuellen Cookies (Session)
  const cookieStore = cookies()
  const supabase = createServerComponentClient({ cookies: () => cookieStore })

  // Auth: Hole eingeloggten User
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (!user || userError) {
    // Nicht eingeloggt
    return (
      <main className="max-w-xl mx-auto px-4 py-10 text-center">
        <h1 className="text-2xl font-bold mb-4">Zugriff verweigert</h1>
        <p className="mb-8">
          Du musst eingeloggt sein, um das Partner-Dashboard zu sehen.
        </p>
        <a href="/login" className="text-blue-600 underline">
          Zum Login
        </a>
      </main>
    )
  }

  // Partner-Check: Gibt es einen Partner mit dieser User-ID?
  const {
    data: partner,
    error: partnerError,
  } = await supabase
    .from('partners')
    .select('*')
    .eq('id', user.id)
    .maybeSingle()

  if (!partner || partnerError) {
    // Kein Partner-Eintrag gefunden
    return (
      <main className="max-w-xl mx-auto px-4 py-10 text-center">
        <h1 className="text-2xl font-bold mb-4">Kein Partnerzugang</h1>
        <p className="mb-8">
          Dein Konto hat keinen Zugriff aufs Partner-Dashboard.
          <br />
          <a href="/partner" className="text-blue-600 underline">
            Jetzt Partner werden!
          </a>
        </p>
      </main>
    )
  }

  // Leads abfragen
  const { data: leads } = await supabase
    .from('leads')
    .select('*')
    .eq('partner_id', user.id)

  // Rechnungen abfragen
  const { data: invoices } = await supabase
    .from('invoices')
    .select('*')
    .eq('partner_id', user.id)

  // Dashboard-Ansicht für Partner
  return (
    <main className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-8">🧑‍💼 Partner-Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-12">
        <StatBox
          label="Deine Provision"
          value={`${partner.provision ?? 0}%`}
          highlight
        />
        <StatBox label="Leads insgesamt" value={leads?.length ?? 0} />
        <StatBox
          label="Rechnungen insgesamt"
          value={invoices?.length ?? 0}
        />
      </div>

      <LeadTable partnerId={user.id} />
    </main>
  )
}
