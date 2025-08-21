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
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      go()
    }
  }

  return (
    <article
      role="button"
      tabIndex={0}
      onKeyDown={onKey}
      onClick={go}
      aria-label={`Angebot: ${name}`}
      className={[
        'h-full group flex flex-col rounded-2xl border border-gray-200 bg-white',
        'shadow-sm hover:shadow-md transition-shadow focus:outline-none',
        'focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#ca4b24]',
        className,
      ].join(' ')}
    >
      {/* Bild mit konsistenter Höhe/Ratio */}
      <div className="p-4 pb-0">
        <div className="relative aspect-[16/9] w-full overflow-hidden rounded-xl border bg-white">
          <Image
            src={image}
            alt={name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 320px"
            className="object-contain"
            priority={false}
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col gap-3 p-4 pt-3 flex-1">
        <h3 className="text-base sm:text-lg font-semibold text-[#003b5b] line-clamp-2">
          {name}
        </h3>

        {description && (
          <p className="text-sm text-gray-600 line-clamp-2">{description}</p>
        )}

        {/* Spacer drückt CTA nach unten, damit Buttons bündig sind */}
        <div className="mt-auto" />

        {/* CTA-Zeile */}
        <div className="flex items-center justify-between gap-3">
          <span className="inline-flex h-9 items-center rounded-lg bg-[#003b5b]/5 px-3 text-sm font-semibold text-[#003b5b]">
            {fmt(reward)} Bonus
          </span>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              go()
            }}
            className="h-10 px-4 inline-flex items-center justify-center rounded-lg bg-[#ca4b24] text-white text-sm sm:text-base font-medium hover:bg-[#a33d1e] transition"
            aria-label={`Jetzt sichern: ${name}`}
          >
            Jetzt sichern
          </button>
        </div>

        <p className="text-xs text-gray-500">
          Details & Teilnahmebedingungen auf der nächsten Seite
        </p>
      </div>
    </article>
  )
}

function fmt(n: number) {
  return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(n || 0)
}
