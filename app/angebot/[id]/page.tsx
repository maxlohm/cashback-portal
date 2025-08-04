'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { offers } from '@/utils/offers'
import { supabase } from '@/utils/supabaseClient'

export default function OfferDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const offer = offers.find(o => o.id === id)

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser()
      if (!data?.user) {
        router.push('/login')
      } else {
        setUser(data.user)
      }
    }
    getUser()
  }, [router])

  const handleClick = async () => {
    if (!user || !offer) return

    const partner_id = localStorage.getItem('partner_ref')

    const { error } = await supabase.from('leads').insert([
      {
        user_id: user.id,
        offer_id: offer.id,
        clicked_at: new Date().toISOString(),
        confirmed: false,
        partner_id: partner_id ?? null,
      },
    ])

    if (error) {
      console.error('❌ Fehler beim Speichern des Klicks:', error)
    } else {
      window.open(offer.affiliateUrl, '_blank')
    }
  }

  if (!offer) {
    return <p>Angebot nicht gefunden</p>
  }

  return (
    <div className="max-w-4xl mx-auto py-10 px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Deal-Bild */}
      <div className="flex justify-center">
        <img
          src={offer.image}
          alt={offer.name || 'Angebot'}
          className="rounded-lg shadow-md"
          style={{ maxWidth: 500 }}
        />
      </div>

      {/* Teilnahmebedingungen */}
      {offer.terms && (
        <div className="bg-gray-100 p-6 rounded-lg border">
          <h2 className="text-lg font-semibold mb-4">Teilnahmebedingungen</h2>
          <ul className="list-disc list-inside space-y-2 text-sm text-gray-800">
            {offer.terms.map((term, index) => (
              <li key={index}>{term}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Button */}
      <div className="text-center">
        <button
          onClick={handleClick}
          className="bg-orange-600 hover:bg-orange-700 text-white font-semibold py-3 px-6 rounded transition-all"
        >
          Jetzt Prämie sichern
        </button>
      </div>
    </div>
  )
}
