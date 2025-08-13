// components/DealCard.tsx
'use client'

import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { useMemo } from 'react'

type DealCardProps = {
  id: string
  name: string
  description?: string
  reward: number
  image?: string
  /** Interne Detail‑URL; wenn nicht gesetzt -> /angebot/<id> */
  url?: string
  onClick?: () => void
}

export default function DealCard({
  id,
  name,
  description,
  reward,
  image = '/placeholder.png',
  url,
  onClick,
}: DealCardProps) {
  const router = useRouter()
  const targetUrl = useMemo(() => url ?? `/angebot/${id}`, [url, id])

  const handleClick = () => {
    onClick?.()
    router.push(targetUrl) // nur intern zur Detailseite (Zwischenseite)
  }

  return (
    <article
      className="w-full md:w-[48%] flex flex-col items-center gap-4 p-6 bg-white rounded-xl border shadow hover:shadow-lg transition-all"
      aria-label={`Angebot: ${name}`}
    >
      <div className="flex items-center justify-center w-full bg-white p-2 h-[250px]">
        <Image
          src={image}
          alt={name}
          width={300}
          height={250}
          sizes="(max-width: 768px) 90vw, 300px"
          className="object-contain rounded"
        />
      </div>

      <div className="flex flex-col items-center text-center gap-2 w-full">
        <h3 className="text-lg font-semibold text-[#003b5b]">{name}</h3>
        {description && <p className="text-sm text-gray-600 line-clamp-2">{description}</p>}

        <div className="flex flex-col sm:flex-row items-center gap-3 mt-2">
          <div className="bg-[#ca4b24] text-white px-6 py-2 rounded-lg text-lg font-bold text-center min-w-[120px]">
            {fmt(reward)}
          </div>
          <button
            type="button"
            onClick={handleClick}
            className="bg-[#ca4b24] hover:bg-[#a33d1e] text-white px-6 py-2 rounded-lg text-lg font-medium transition min-w-[160px]"
            aria-label={`Jetzt sichern: ${name}`}
          >
            Jetzt sichern!
          </button>
        </div>

        <p className="text-xs text-gray-500 mt-1">Details & Teilnahmebedingungen auf der nächsten Seite</p>
      </div>
    </article>
  )
}

function fmt(n: number) {
  return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(n || 0)
}
