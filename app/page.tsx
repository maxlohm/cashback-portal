'use client'

import Image from 'next/image'
import KategorieNavigation from './navigation/page'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/utils/supabaseClient'

export default function VersicherungenPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getUser()
      if (data?.user) {
        setUser(data.user)
      }
    }
    checkUser()
  }, [])

  const handleAffiliateClick = async (url: string, offer_id: string) => {
    if (!user) {
      router.push('/login')
    } else {
      await supabase.from('clicks').insert({
        user_id: user.id,
        offer_id,
        clicked_at: new Date().toISOString(),
        redeemed: false,
      })
      window.open(url, '_blank')
    }
  }

  return (
    <div className="mt-0 p-0">
      {/* Banner oben */}
      <div className="w-full max-w-none mx-auto p-0">
        <Image
          src="/bannerrichtig.png"
          alt="Versicherungsangebote Banner"
          width={1920}
          height={300}
          className="w-full h-auto object-cover block"
          priority
        />
      </div>

      {/* Navigation */}
      <KategorieNavigation />

      {/* Inhalt */}
      <main className="max-w-6xl mx-auto py-10 px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="flex flex-wrap gap-6 justify-start">
          {/* 🦷 Gothaer Zahn */}
          <div className="w-full md:w-[48%] bg-white flex flex-col md:flex-row items-center gap-6 p-6 rounded-lg border border-gray-200 shadow hover:shadow-lg transition-all">
            <img
              src="https://www.financeads.net/tb.php?t=77500V191135896B"
              alt="Finanzen.de Banner"
              width={300}
              height={250}
              className="rounded"
              style={{ border: 0 }}
            />
            <div className="flex flex-col items-center gap-5">
              <div className="bg-[#ca4b24] text-white px-8 py-3 text-xl font-bold rounded-lg min-w-[160px] text-center">
                20 €
              </div>
              <button
                onClick={() =>
                  handleAffiliateClick('https://www.financeads.net/tc.php?t=77500C191135896B', 'gothaer-zahn')
                }
                className="bg-[#ca4b24] hover:bg-[#a33d1e] text-white px-8 py-3 rounded-lg text-lg font-medium min-w-[160px] text-center transition"
              >
                Jetzt sichern!
              </button>
            </div>
          </div>

          {/* 🚗 Kfz-Versicherung */}
          <div className="w-full md:w-[48%] bg-white flex flex-col md:flex-row items-center gap-6 p-6 rounded-lg border border-gray-200 shadow hover:shadow-lg transition-all">
            <img
              src="https://a.partner-versicherung.de/view.php?partner_id=191406&ad_id=1618"
              alt="Kfz-Versicherung Banner"
              width={300}
              height={250}
              className="rounded"
              style={{ border: 0 }}
            />
            <div className="flex flex-col items-center gap-5">
              <div className="bg-[#ca4b24] text-white px-8 py-3 text-xl font-bold rounded-lg min-w-[160px] text-center">
                20 €
              </div>
              <button
                onClick={() =>
                  handleAffiliateClick('https://a.partner-versicherung.de/click.php?partner_id=191406&ad_id=1618&deep=kfz-versicherung', 'kfz-versicherung')
                }
                className="bg-[#ca4b24] hover:bg-[#a33d1e] text-white px-8 py-3 rounded-lg text-lg font-medium min-w-[160px] text-center transition"
              >
                Jetzt sichern!
              </button>
            </div>
          </div>

          {/* 💰 Verivox Kredit */}
          <div className="w-full md:w-[48%] bg-white flex flex-col md:flex-row items-center gap-6 p-6 rounded-lg border border-gray-200 shadow hover:shadow-lg transition-all">
            <img
              src="https://www.financeads.net/tb.php?t=77500V276463218B"
              alt="Ratenkredit bei Verivox"
              width={300}
              height={250}
              className="rounded"
              style={{ border: 0 }}
            />
            <div className="flex flex-col items-center gap-5">
              <div className="bg-[#ca4b24] text-white px-8 py-3 text-xl font-bold rounded-lg min-w-[160px] text-center">
                20 €
              </div>
              <button
                onClick={() =>
                  handleAffiliateClick('https://www.financeads.net/tc.php?t=77500C276463218B', 'verivox-kredit')
                }
                className="bg-[#ca4b24] hover:bg-[#a33d1e] text-white px-8 py-3 rounded-lg text-lg font-medium min-w-[160px] text-center transition"
              >
                Jetzt sichern!
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
