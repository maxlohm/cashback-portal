import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies, cookies as getCookies } from 'next/headers'
import { redirect } from 'next/navigation'
import StatBox from '../components/StatBox'
import LeadTable from '../components/LeadTable'

export default async function PartnerDashboard() {
  // ✅ CookieStore richtig behandeln
  const cookieStore = cookies() // ✅ Richtig
  const supabase = createServerComponentClient({ cookies: () => cookieStore })

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  console.log('🔒 Aktuelle User-ID:', user?.id)
  if (!user || userError) {
    console.error('❌ Kein User eingeloggt oder Fehler:', userError)
    redirect('/')
  }

  const { data: partner, error: partnerError } = await supabase
    .from('partners')
    .select('*')
    .eq('id', user.id)
    .maybeSingle()

  if (!partner || partnerError) {
    console.log('❌ Kein Partner-Eintrag für User-ID:', user.id)
    redirect('/')
  }

  const { data: leads } = await supabase
    .from('leads')
    .select('*')
    .eq('partner_id', user.id)

  const { data: invoices } = await supabase
    .from('invoices')
    .select('*')
    .eq('partner_id', user.id)

  return (
    <main className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-8">🧑‍💼 Partner-Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-12">
        <StatBox label="Deine Provision" value={`${partner.provision}%`} highlight />
        <StatBox label="Leads insgesamt" value={leads?.length ?? 0} />
        <StatBox label="Rechnungen insgesamt" value={invoices?.length ?? 0} />
      </div>

      <LeadTable partnerId={user.id} />
    </main>
  )
}
