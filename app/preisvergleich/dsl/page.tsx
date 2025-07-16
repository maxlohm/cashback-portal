'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { supabase } from '@/utils/supabaseClient'

export default function VerivoxPage() {
  const [isOpen, setIsOpen] = useState(false)
  const [user, setUser] = useState<any>(null)
  const router = useRouter()

  const openModal = () => setIsOpen(true)
  const closeModal = () => setIsOpen(false)

  const handleAffiliateClick = async () => {
    if (!user) {
      router.push('/login')
    } else {
      await supabase.from('clicks').insert({
        user_id: user.id,
        offer_id: 'verivox-kredit',
        clicked_at: new Date().toISOString(),
        redeemed: false,
      })
      window.open('https://www.financeads.net/tc.php?t=77500C276463218B', '_blank')
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="bg-white rounded-lg shadow p-6 flex flex-col items-center gap-5">
        <Image
          src="https://www.financeads.net/tb.php?t=77500V276463218B"
          alt="Verivox Kredit"
          width={300}
          height={250}
          className="rounded"
        />
        <div className="bg-[#ca4b24] text-white px-8 py-3 text-xl font-bold rounded-lg min-w-[160px] text-center">
          20 €
        </div>
        <button
          onClick={openModal}
          className="bg-[#ca4b24] hover:bg-[#a33d1e] text-white px-8 py-3 rounded-lg text-lg font-medium min-w-[160px] text-center transition"
        >
          Jetzt sichern!
        </button>
      </div>

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md relative">
            <button
              onClick={closeModal}
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 text-2xl"
            >
              &times;
            </button>
            <h2 className="text-xl font-semibold mb-4">Mehr Informationen zum Angebot</h2>
            <p className="text-sm mb-4">
              Verivox bietet dir die Möglichkeit, günstige Ratenkredite zu vergleichen und schnell Geld auf dein Konto zu bekommen. Schon ab 0,68 % effektiver Jahreszins – mit einer Prämie von 20 € bei erfolgreichem Abschluss über Bonus-Nest!
            </p>
            <button
              onClick={handleAffiliateClick}
              className="bg-[#ca4b24] hover:bg-[#a33d1e] text-white px-6 py-2 rounded-lg font-medium w-full"
            >
              Zur Angebotsseite
            </button>
          </div>
        </div>
      )}
    </div>
  )
}