// components/DealCard.tsx
'use client'

import { useRouter } from 'next/navigation'
import Image from 'next/image'

type DealCardProps = {
  id: string
  name: string
  description?: string
  reward: number

  /** Anbieter-Bonus (optional) */
  providerBonusAmount?: number | null
  providerBonusText?: string | null

  image?: string

  /**
   * Deprecated: DealCard navigiert IMMER zur Detailseite /angebot/[id].
   * (bewusst, damit Login erst bei "Zum Angebot" auf der Detailseite passiert)
   */
  url?: string

  onClick?: () => void
  className?: string
}

export default function DealCard({
  id,
  name,
  description,
  reward,
  providerBonusAmount = null,
  providerBonusText = null,
  image = '/placeholder.png',
  onClick,
  className = '',
}: DealCardProps) {
  const router = useRouter()

  // WICHTIG: immer nur Detailseite – nie /r
  const targetUrl = `/angebot/${id}`

  const go = () => {
    onClick?.()
    router.push(targetUrl)
  }

  const providerDisplay = (() => {
    const t = (providerBonusText ?? '').trim()
    if (t.length > 0) return t
    if (typeof providerBonusAmount === 'number' && providerBonusAmount > 0)
      return fmt(providerBonusAmount)
    return '—'
  })()

  return (
    <article
      aria-label={`Angebot: ${name}`}
      className={[
        'h-full group flex flex-col rounded-2xl border border-black/5 bg-white',
        'shadow-[0_10px_25px_rgba(0,0,0,0.06)]',
        'transition-all duration-200',
        'hover:-translate-y-0.5 hover:shadow-[0_18px_45px_rgba(0,0,0,0.12)]',
        className,
      ].join(' ')}
    >
      {/* Bildbereich */}
      <div className="p-4 pb-0">
        <div className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl border border-black/5 bg-white">
          <Image
            src={image}
            alt={name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 320px"
            className="object-contain p-2"
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col gap-3 p-4 pt-4 flex-1">
        <div className="space-y-1">
          <h3 className="text-base sm:text-lg font-semibold text-[#003b5b] leading-snug line-clamp-2">
            {name}
          </h3>

          {description ? (
            <p className="text-sm text-slate-600 leading-relaxed line-clamp-2">
              {description}
            </p>
          ) : (
            <p className="text-sm text-slate-500">
              Details auf der nächsten Seite.
            </p>
          )}
        </div>

        <div className="mt-auto" />

        {/* Bonus-Bereich */}
        <div className="rounded-2xl border border-black/5 bg-slate-50 p-3">
          <div className="flex items-center gap-3">
            {/* Bonus-Nest */}
            <div className="flex-1 min-w-0">
              <div className="text-[11px] font-semibold text-slate-600">
                Bonus-Nest Prämie
              </div>
              <div className="text-lg font-extrabold text-[#003b5b] leading-tight">
                {fmt(reward)}
              </div>
            </div>

            {/* PLUS */}
            <div className="shrink-0 h-8 w-8 flex items-center justify-center rounded-full bg-white border border-black/5 text-gray-500 font-semibold">
              +
            </div>

            {/* Anbieterbonus */}
            <div className="flex-1 min-w-0 text-right">
              <div className="text-[11px] font-semibold text-slate-600">
                Anbieter-Bonus
              </div>
              <div className="text-lg font-extrabold leading-tight text-slate-900 truncate">
                {providerDisplay}
              </div>
            </div>
          </div>

          {/* CTA */}
          <button
            type="button"
            onClick={go}
            className={[
              'mt-3 w-full h-11',
              'inline-flex items-center justify-center rounded-xl',
              'bg-[#ca4b24] text-white text-sm sm:text-base font-semibold',
              'hover:bg-[#a33d1e] transition',
              'shadow-[0_10px_22px_rgba(202,75,36,0.25)] hover:shadow-[0_14px_28px_rgba(202,75,36,0.30)]',
            ].join(' ')}
            aria-label={`Jetzt sichern: ${name}`}
          >
            Jetzt sichern
          </button>

          <p className="mt-2 text-[11px] text-slate-500">
            Details & Teilnahmebedingungen auf der nächsten Seite
          </p>
        </div>
      </div>
    </article>
  )
}

function fmt(n: number) {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
  }).format(n || 0)
}