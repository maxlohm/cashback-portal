// app/angebot/[id]/page.tsx
// @ts-nocheck
import { cookies } from 'next/headers'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import Image from 'next/image'
import ReactMarkdown from 'react-markdown'
import OfferReviewsClient from './OfferReviewsClient'
import GoToOfferButton from './GoToOfferButton'

export const dynamic = 'force-dynamic'

export default async function OfferPage(props: any) {
  const p =
    props?.params && typeof props.params.then === 'function'
      ? await props.params
      : props?.params
  const id = p?.id as string | undefined

  const sp =
    props?.searchParams && typeof props.searchParams.then === 'function'
      ? await props.searchParams
      : props?.searchParams

  // ref kommt aus URL: /angebot/<id>?ref=<partners.id>
  const refId = (sp?.ref as string | undefined) ?? null

  if (!id) return <div className="max-w-3xl mx-auto p-6">Ungültige URL.</div>

  const supabase = createServerComponentClient({ cookies })

  const { data: offer } = await supabase
    .from('offers')
    .select('*')
    .eq('id', id)
    .eq('active', true)
    .maybeSingle()

  if (!offer) {
    return (
      <div className="max-w-3xl mx-auto p-6">
        Angebot nicht gefunden oder inaktiv.
      </div>
    )
  }

  const { data: ratingRow } = await supabase
    .rpc('get_offer_rating', { p_offer_id: id })
    .maybeSingle()

  const avgRating = Number(ratingRow?.avg_rating ?? 0)
  const reviewCount = Number(ratingRow?.review_count ?? 0)

  const img = offer.image || offer.image_url || '/placeholder.png'
  const terms = offer.terms

  return (
    <div className="max-w-4xl mx-auto px-6 py-8 md:py-12">
      <div className="relative w-full overflow-hidden rounded-2xl border bg-white">
        <div className="relative aspect-[16/9]">
          <Image
            src={img}
            alt={offer.title ?? 'Angebot'}
            fill
            className="object-contain"
          />
        </div>
      </div>

      <div className="mt-8 space-y-3">
        <h1 className="text-3xl font-semibold text-[#003b5b]">{offer.title}</h1>
        <RatingSummary avg={avgRating} count={reviewCount} />

        {offer.description && (
          <p className="text-base text-gray-700 leading-relaxed">
            {offer.description}
          </p>
        )}
      </div>

      <div className="mt-5 flex flex-col sm:flex-row gap-3">
        <span className="inline-flex h-10 items-center rounded-lg bg-[#003b5b]/5 px-4 text-sm font-semibold text-[#003b5b]">
          Prämie:&nbsp;{fmt(offer.reward_amount ?? 0)}
        </span>

        {/* ✅ Wichtig: ref aus /angebot/... wird an /r weitergereicht */}
        <GoToOfferButton offerId={offer.id} refId={refId} />
      </div>

      {/* Pflicht-Hinweise */}
      <div className="mt-4 rounded-xl border bg-white p-4 text-xs text-gray-600 space-y-2">
        <p>
          <strong>Hinweis:</strong> Der Button öffnet einen{' '}
          <strong>Werbelink (Partnerlink)</strong>. Wenn du darüber beim Anbieter
          abschließt, erhalten wir ggf. eine Provision.
        </p>
        <p>
          Die <strong>Prämie</strong> wird nur gutgeschrieben, wenn die
          Teilnahmebedingungen erfüllt sind und der Abschluss vom Partner
          bestätigt wird. Das kann je nach Partner <strong>30–90 Tage</strong>{' '}
          dauern.
        </p>
        <p>Bei Storno, Widerruf oder Retoure entfällt die Prämie.</p>
      </div>

      <section className="mt-10">
        <h2 className="text-xl font-semibold text-[#003b5b]">
          Teilnahmebedingungen
        </h2>

        <div className="mt-4 rounded-2xl border bg-white p-5">
          {typeof terms === 'string' && terms.trim().length > 0 ? (
            <div className="prose prose-sm max-w-none text-gray-700">
              <ReactMarkdown>{terms}</ReactMarkdown>
            </div>
          ) : (
            <div className="space-y-2 text-gray-700">
              <p>Die Teilnahmebedingungen folgen.</p>
            </div>
          )}
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-semibold text-[#003b5b]">So funktioniert’s</h2>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            ['1', 'Angebot öffnen', 'Klicke auf „Zum Angebot“ und schließe beim Anbieter ab.'],
            ['2', 'Bestätigung abwarten', 'Der Partner prüft den Abschluss und bestätigt ihn (i. d. R. 30–90 Tage).'],
            ['3', 'Prämie erhalten', 'Nach Freigabe kannst du die Prämie im Konto auszahlen lassen.'],
          ].map(([step, title, text]) => (
            <div key={step} className="rounded-2xl border bg-white p-5">
              <div className="text-sm font-semibold text-[#ca4b24]">
                Schritt {step}
              </div>
              <div className="mt-1 font-medium">{title}</div>
              <div className="mt-1 text-sm text-gray-600">{text}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-semibold text-[#003b5b]">Bewertungen</h2>
        <div className="mt-4">
          <OfferReviewsClient offerId={id} />
        </div>
      </section>
    </div>
  )
}

function fmt(n: number) {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
  }).format(n || 0)
}

function RatingSummary({ avg, count }: { avg: number; count: number }) {
  const rounded = Math.round(avg * 2) / 2

  return (
    <div className="flex items-center gap-2 text-sm text-gray-700">
      <div className="flex text-base">
        {[1, 2, 3, 4, 5].map(i => (
          <span key={i}>{rounded >= i ? '★' : '☆'}</span>
        ))}
      </div>
      {count > 0 ? (
        <>
          <span className="font-medium">{avg.toFixed(1)} / 5</span>
          <span className="text-gray-500">({count} Bewertungen)</span>
        </>
      ) : (
        <span className="text-gray-500">Noch keine Bewertungen</span>
      )}
    </div>
  )
}