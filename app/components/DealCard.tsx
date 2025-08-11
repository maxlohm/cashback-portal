'use client'

import { supabase } from '@/utils/supabaseClient'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

type DealCardProps = {
  name: string
  description: string
  reward: number
  image: string
  offerId: string
  url: string
  onClick?: () => void
}

export default function DealCard({
  name,
  description,
  reward,
  image,
  offerId,
  url,
  onClick,
}: DealCardProps) {
  const router = useRouter()

  const handleClick = async () => {
    const { data: { user }, error } = await supabase.auth.getUser()

    if (error || !user) {
      router.push('/login')
      return
    }

    // Profil mit partner_id holen
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('partner_id')
      .eq('id', user.id)
      .maybeSingle()

    const partnerId = profile?.partner_id || null

    // Klick speichern
    await supabase.from('clicks').insert({
      user_id: user.id,
      offer_id: offerId,
      partner_id: partnerId,
      clicked_at: new Date().toISOString(),
    })

    // Affiliate-Link öffnen
    window.open(url, '_blank')
  }

  return (
    <div className="w-full md:w-[48%] flex flex-col items-center gap-4 p-6 bg-white rounded-xl border shadow hover:shadow-lg transition-all">
      {/* Bild */}
      <div className="flex items-center justify-center w-full bg-white p-2" style={{ height: 250 }}>
        <Image
          src={image}
          alt={`Bild zu ${name}`}
          width={300}
          height={250}
          className="object-contain rounded"
        />
      </div>

      {/* Inhalt */}
      <div className="flex flex-col items-center text-center gap-2 w-full">
        <h3 className="text-lg font-semibold text-[#003b5b]">{name}</h3>
        <p className="text-sm text-gray-600">{description}</p>

        <div className="flex flex-col sm:flex-row items-center gap-3 mt-2">
          <div className="bg-[#ca4b24] text-white px-8 py-3 rounded-lg text-xl font-bold text-center min-w-[120px]">
            {reward} €
          </div>
          <button
            onClick={handleClick}
            className="bg-[#ca4b24] hover:bg-[#a33d1e] text-white px-8 py-3 rounded-lg text-lg font-medium transition min-w-[160px]"
            aria-label={`Jetzt sichern für ${name}`}
          >
            Jetzt sichern!
          </button>
        </div>
      </div>
    </div>
  )
}
