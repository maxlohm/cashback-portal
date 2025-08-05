'use client'

import { trackClick } from '@/utils/trackClick'
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
}

export default function DealCard({
  name,
  description,
  reward,
  image,
  offerId,
  url,
}: DealCardProps) {
  const router = useRouter()

  const handleClick = async () => {
    const { data, error } = await supabase.auth.getUser()

    if (error || !data?.user) {
      router.push('/login')
      return
    }

    const user = data.user
    const trackedUrl = `${url}&subid=${user.id}|${offerId}`

    try {
      await trackClick({
        userId: user.id,
        offerId,
        amount: reward,
        url: trackedUrl,
      })

      // Optional: Seite neu laden oder redirect
      // window.open(trackedUrl, '_blank')
    } catch (err) {
      console.error('Fehler beim Tracken des Klicks:', err)
    }
  }

  return (
    <div className="w-full md:w-[48%] flex flex-col md:flex-row items-center gap-6 p-6 bg-white rounded-xl border shadow hover:shadow-lg transition-all">
      {/* Bildbereich */}
      <div className="flex-shrink-0 bg-white flex items-center justify-center" style={{ width: 300, height: 250 }}>
        <Image
          src={image}
          alt={`Bild zu ${name}`}
          width={300}
          height={250}
          className="object-contain rounded"
        />
      </div>

      {/* Infobereich */}
      <div className="flex flex-col items-center gap-5 text-center">
        <h3 className="text-lg font-semibold text-[#003b5b]">{name}</h3>
        <p className="text-sm text-gray-600">{description}</p>
        <div className="bg-[#ca4b24] text-white px-8 py-3 rounded-lg text-xl font-bold min-w-[160px]">
          {reward} €
        </div>
        <button
          onClick={handleClick}
          className="cursor-pointer bg-[#ca4b24] hover:bg-[#a33d1e] text-white px-8 py-3 rounded-lg text-lg font-medium min-w-[160px] transition"
          aria-label={`Jetzt sichern für ${name}`}
        >
          Jetzt sichern!
        </button>
      </div>
    </div>
  )
}
