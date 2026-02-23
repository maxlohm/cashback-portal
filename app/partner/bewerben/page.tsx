import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import Image from 'next/image'
import PartnerApplyClient from './PartnerApplyClient'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function PartnerApplyPage() {
  const supabase = createServerComponentClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login?next=/partner/bewerben')

  return (
    <div className="min-h-screen bg-[#f7f3e6] text-[#003b5b]">
      {/* Banner */}
      <div className="w-full max-w-none mx-auto p-0">
        <Image
          src="/Banner_Partner_werden.png"
          alt="Partner werden bei Bonus-Nest"
          width={1920}
          height={300}
          className="w-full h-auto object-cover block"
          priority
        />
      </div>

      <main className="max-w-5xl mx-auto px-6 py-10">
        <div className="rounded-2xl border bg-white shadow-[0_12px_35px_rgba(0,0,0,0.08)] overflow-hidden">
          <div className="p-6 sm:p-8 border-b bg-[#003b5b]/[0.03]">
            <h1 className="text-2xl sm:text-3xl font-semibold text-[#003b5b]">
              Partner-Bewerbung
            </h1>
            <p className="mt-2 text-sm sm:text-base text-slate-600">
              Sag uns kurz, wer du bist und wie du Bonus-Nest bewerben willst. Danach prüfen wir manuell und schalten dich frei.
            </p>
          </div>

          <div className="p-6 sm:p-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              {[
                ['Schnell', '2 Minuten Formular', 'Kein technisches Setup nötig.'],
                ['Transparent', 'Klare Vergütung', 'Du bekommst eine faire Provision pro bestätigtem Lead.'],
                ['Skalierbar', 'Promo-Links ready', 'Nach Freigabe bekommst du deine Links sofort im Dashboard.'],
              ].map(([t1, t2, t3]) => (
                <div key={t1} className="rounded-2xl border bg-slate-50 p-5">
                  <div className="text-xs font-semibold text-[#ca4b24]">{t1}</div>
                  <div className="mt-1 font-semibold text-slate-900">{t2}</div>
                  <div className="mt-1 text-sm text-slate-600">{t3}</div>
                </div>
              ))}
            </div>

            <PartnerApplyClient />
          </div>
        </div>
      </main>
    </div>
  )
}