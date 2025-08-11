'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { offers } from '@/utils/offers'
import { supabase } from '@/utils/supabaseClient'

export default function OfferDetailPage() {
  const params = useParams()
  const id =
    typeof params.id === 'string'
      ? params.id
      : Array.isArray(params.id)
      ? params.id[0]
      : ''
  const router = useRouter()

  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const offer = offers.find((o) => o.id === id)

  useEffect(() => {
    const getUser = async () => {
      const { data, error } = await supabase.auth.getUser()
      if (error || !data?.user) {
        router.push('/login')
      } else {
        setUser(data.user)
      }
      setLoading(false)
    }

    getUser()
  }, [router])

  const handleClick = async () => {
    if (!user || !offer) return

    const partner_id = localStorage.getItem('partner_id') || null

    const { error } = await supabase.from('clicks').insert({
      user_id: user.id,
      offer_id: offer.id,
      clicked_at: new Date().toISOString(),
      redeemed: false,
      amount: offer.reward,
      partner_id,
    })

    if (error) {
      console.error('❌ Klick konnte nicht gespeichert werden:', error)
    }

    window.open(offer.affiliateUrl, '_blank') // Weiterleitung unabhängig vom Fehler
  }

  if (loading) {
    return <p className="text-center text-gray-600 mt-10">Lade Angebot...</p>
  }

  if (!offer) {
    return <p className="text-center text-gray-600 mt-10">Angebot nicht gefunden.</p>
  }

  return (
    <div className="max-w-4xl mx-auto py-10 px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Bild */}
      <div className="flex justify-center">
        <img
          src={offer.image}
          alt={offer.name || 'Angebot'}
          className="rounded-lg shadow-md max-w-full"
          style={{ maxWidth: 500 }}
        />
      </div>

      {/* Teilnahmebedingungen */}
      {Array.isArray(offer.terms) && offer.terms.length > 0 && (
  <div className="bg-gray-100 p-6 rounded-lg border">
    <h2 className="text-lg font-semibold mb-4">Teilnahmebedingungen</h2>
    <ul className="list-disc list-inside space-y-2 text-sm text-gray-800">
      {offer.terms.map((term, index) => (
        <li key={index}>{term}</li>
      ))}
    </ul>
  </div>
)}

      {/* CTA Button */}
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
