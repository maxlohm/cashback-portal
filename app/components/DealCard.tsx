// components/DealCard.tsx
'use client'

import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { useMemo, KeyboardEvent } from 'react'

type DealCardProps = {
  id: string
  name: string
  description?: string
  reward: number
  image?: string
  /** Interne Detail-URL; wenn nicht gesetzt -> /angebot/<id> */
  url?: string
  onClick?: () => void
  className?: string
}

export default function DealCard({
  id,
  name,
  description,
  reward,
  image = '/placeholder.png',
  url,
  onClick,
  className = '',
}: DealCardProps) {
  const router = useRouter()
  const targetUrl = useMemo(() => url ?? `/angebot/${id}`, [url, id])

  const go = () => {
    onClick?.()
    router.push(targetUrl)
  }

  const onKey = (e: KeyboardEvent<HTMLElement>) => {
    if (e.key === 'Enter') go()
  }

  return (
    <article
      role="group"
      tabIndex={0}
      onKeyDown={onKey}
      className={`w-full flex flex-col items-center gap-4 p-6 bg-white rounded-xl border shadow hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#ca4b24] transition ${className}`}
      aria-label={`Angebot: ${name}`}
    >
      {/* Bild: einheitliche Höhe für konsistente Karten */}
      <div className="flex items-center justify-center w-full bg-white p-2 h-48">
        <Image
          src={image}
          alt={name}
          width={320}
          height={192}
          sizes="(max-width: 1024px) 50vw, 320px"
          className="object-contain rounded"
        />
      </div>

      <div className="flex flex-col items-center text-center gap-2 w-full">
        <h3 className="text-lg font-semibold text-[#003b5b]">{name}</h3>
        {description && (
          <p className="text-sm text-gray-600 line-clamp-2">{description}</p>
        )}

        {/* Preis + CTA: identische Höhen für ruhiges Layout */}
        <div className="flex flex-col sm:flex-row items-center gap-3 mt-2">
          <div className="h-11 px-6 inline-flex items-center justify-center bg-[#ca4b24] text-white rounded-lg text-lg font-bold min-w-[120px]">
            {fmt(reward)}
          </div>
          <button
            type="button"
            onClick={go}
            className="h-11 inline-flex items-center justify-center bg-[#ca4b24] hover:bg-[#a33d1e] text-white px-6 rounded-lg text-lg font-medium transition min-w-[160px]"
            aria-label={`Jetzt sichern: ${name}`}
          >
            Jetzt sichern!
          </button>
        </div>

        <p className="text-xs text-gray-500 mt-1">
          Details & Teilnahmebedingungen auf der nächsten Seite
        </p>
      </div>
    </article>
  )
}

function fmt(n: number) {
  return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(n || 0)
}
