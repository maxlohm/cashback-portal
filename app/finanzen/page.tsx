'use client'

import Image from 'next/image'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/utils/supabaseClient'
import KategorieNavigation from '../navigation/page'

export default function FinanzenPage() {
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

  const handleClick = () => {
    if (!user) {
      router.push('/login')
    } else {
      window.open('https://www.financeads.net/tc.php?t=77500C276463218B', '_blank')
    }
  }

  return (
    <>
      {/* Banner oben */}
      <div className="w-full">
        <Image
          src="/bannerrichtig.png"
          alt="Finanzen Banner"
          width={1440}
          height={300}
          className="w-full h-auto object-cover"
          priority
        />
      </div>

      {/* Navigation */}
      <KategorieNavigation />

      {/* Inhalt */}
      <main className="max-w-6xl mx-auto py-10 px-4 sm:px-6 lg:px-8 space-y-10">
        <h1 className="text-3xl font-bold text-[#003b5b] mb-4">
          💰 Finanzen – deine Prämienangebote
        </h1>

        {/* Partner-Angebot */}
        <div className="flex flex-wrap gap-6 justify-start">
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
                20 €
              </div>
              <button
                onClick={handleClick}
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
