// @ts-nocheck
import { cookies } from 'next/headers'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import Image from 'next/image'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function OfferPage(props: any) {
  const p = props?.params && typeof props.params.then === 'function'
    ? await props.params
    : props?.params
  const id = p?.id as string | undefined
  if (!id) return <div className="max-w-3xl mx-auto p-6">Ungültige URL.</div>

  const supabase = createServerComponentClient({ cookies })

  const { data: offer } = await supabase
    .from('offers')
    .select('*') // enthält auch "terms"
    .eq('id', id)
    .eq('active', true)
    .maybeSingle()

  if (!offer) {
    return <div className="max-w-3xl mx-auto p-6">Angebot nicht gefunden oder inaktiv.</div>
  }

  const img =
    (offer as any).image ||
    (offer as any).image_url ||
    '/placeholder.png'

  const terms = (offer as any).terms

  return (
    <div className="max-w-4xl mx-auto px-6 py-8 md:py-12">
      {/* Bild oben */}
      <div className="relative w-full overflow-hidden rounded-2xl border bg-white">
        <div className="relative aspect-[16/9]">
          <Image
            src={img}
            alt={offer.title ?? 'Angebot'}
            fill
            sizes="(max-width: 768px) 100vw, 768px"
            className="object-contain"
            priority={false}
          />
        </div>
      </div>

      {/* Titel & Beschreibung */}
      <div className="mt-8 space-y-3">
        <h1 className="text-3xl font-semibold text-[#003b5b]">{offer.title}</h1>
        {offer.description && (
          <p className="text-base text-gray-700 leading-relaxed">
            {offer.description}
          </p>
        )}
      </div>

      {/* Prämien-Badge + CTA */}
      <div className="mt-5 flex flex-col sm:flex-row gap-3">
        <span className="inline-flex h-10 items-center rounded-lg bg-[#003b5b]/5 px-4 text-sm font-semibold text-[#003b5b]">
          Prämie:&nbsp;{fmt(offer.reward_amount ?? 0)}
        </span>

        <Link
          href={`/r/${offer.id}`}
          target="_blank"
          className="inline-flex h-10 items-center justify-center rounded-lg bg-[#ca4b24] px-5 text-white text-sm md:text-base font-medium hover:bg-[#a33d1e] transition"
        >
          Zum Angebot
        </Link>
      </div>

      {/* Hinweis */}
      <p className="mt-3 text-xs text-gray-500">
        Details & Teilnahmebedingungen gelten beim Anbieter. Der Button öffnet die Angebotsseite in einem neuen Tab.
      </p>

      {/* Teilnahmebedingungen */}
      <section className="mt-10">
        <h2 className="text-xl font-semibold text-[#003b5b]">Teilnahmebedingungen</h2>
        <div className="mt-4 rounded-2xl border bg-white p-5">
          {typeof terms === 'string' && terms.trim().length > 0 ? (
            // String-Spalte: Zeilenumbrüche beibehalten
            <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
              {terms.trim()}
            </div>
          ) : Array.isArray(terms) && terms.length > 0 ? (
            // Optionaler Array-Fallback
            <ul className="list-disc pl-5 space-y-2 text-gray-700">
              {terms.map((t: string, i: number) => (
                <li key={i}>{t}</li>
              ))}
            </ul>
          ) : (
            // Placeholder, falls (noch) nichts hinterlegt ist
            <div className="space-y-2 text-gray-700">
              <p>Die detaillierten Teilnahmebedingungen werden hier angezeigt, sobald sie hinterlegt sind.</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Nur für Neuabschlüsse / Neukunden (sofern nicht anders angegeben).</li>
                <li>Keine Kombination mit anderen Aktionen/Cashbacks.</li>
                <li>Storno bei Widerruf oder Nicht-Erfüllung der Produktbedingungen.</li>
                <li>Auszahlung nach Bestätigung durch den Anbieter.</li>
              </ul>
            </div>
          )}
        </div>
      </section>

      {/* Optional: So funktioniert’s */}
      <section className="mt-10">
        <h2 className="text-xl font-semibold text-[#003b5b]">So funktioniert’s</h2>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            ['1', 'Angebot öffnen', 'Klicke auf „Zum Angebot“ und schließe beim Anbieter ab.'],
            ['2', 'Bestätigung abwarten', 'Wir erhalten die Bestätigung deines Abschlusses.'],
            ['3', 'Prämie erhalten', 'Nach Freigabe wird deine Prämie ausgezahlt.'],
          ].map(([step, title, text]) => (
            <div key={step} className="rounded-2xl border bg-white p-5">
              <div className="text-sm font-semibold text-[#ca4b24]">Schritt {step}</div>
              <div className="mt-1 font-medium">{title}</div>
              <div className="mt-1 text-sm text-gray-600">{text}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

function fmt(n: number) {
  return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(n || 0)
}
