'use client'

import KategorieNavigation from '../navigation/page'
import { useEffect, useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { supabase } from '@/utils/supabaseClient'

export default function PreisvergleichPage() {
  const [user, setUser] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getUser()
      if (data?.user) {
        setUser(data.user)
      }
    }
    checkUser()
  }, [])

  const handleAffiliateClick = async () => {
    const url = 'https://a.check24.net/misc/click.php?pid=1153771&aid=82&deep=dsl-anbieterwechsel&cat=4'
    const offer_id = 'check24-dsl'
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
    <>
      {/* Banner */}
      <div className="w-full">
        <Image
          src="/bannerrichtig.png"
          alt="Preisvergleich Banner"
          width={1440}
          height={300}
          className="w-full h-auto object-cover"
          priority
        />
      </div>

      {/* Navigation */}
      <KategorieNavigation />

      {/* Inhalt */}
      <main className="max-w-6xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap gap-6 justify-start">
          {/* CHECK24 DSL-Deal ohne Popup-Logik, statisches Bild */}
          <div className="w-full md:w-[48%] bg-white flex flex-col md:flex-row items-center gap-6 p-6 rounded-lg border border-gray-200 shadow hover:shadow-lg transition-all">
            <div
              className="flex-shrink-0 flex items-center justify-center bg-white"
              style={{ width: 300, height: 250 }}
            >
              <img
                src="https://a.check24.net/misc/view.php?pid=1153771&aid=82&cat=4"
                width={300}
                height={250}
                className="rounded"
                style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                alt="CHECK24 DSL Banner"
              />
            </div>
            <div className="flex flex-col items-center gap-5">
              <div className="bg-[#ca4b24] text-white px-8 py-3 text-xl font-bold rounded-lg min-w-[160px] text-center">
                20 €
              </div>
              <button
                onClick={handleAffiliateClick}
                className="bg-[#ca4b24] hover:bg-[#a33d1e] text-white px-8 py-3 rounded-lg text-lg font-medium min-w-[160px] text-center transition"
              >
                Jetzt sichern!
              </button>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
