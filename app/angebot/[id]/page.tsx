// app/angebot/[id]/page.tsx
import { cookies } from 'next/headers'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { getOfferById } from '@/utils/offers'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// kein GET/POST Export hier!
export default async function OfferDetailPage(
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const cookieStore = cookies()
  const supabase = createServerComponentClient({ cookies: () => cookieStore })

  const offer = await getOfferById(supabase, id).catch(() => null)
  if (!offer || offer.active === false) return notFound()

  const terms: string[] | undefined = offer.terms

  return (
    <main className="max-w-3xl mx-auto p-6 space-y-8">
      <header className="text-center space-y-2">
        <h1 className="text-3xl font-semibold">{offer.name}</h1>
        {offer.description && <p className="text-gray-600">{offer.description}</p>}
      </header>

      <div className="flex justify-center">
        <Image
          src={offer.image ?? '/placeholder.png'}
          alt={offer.name}
          width={400}
          height={250}
          sizes="(max-width: 640px) 90vw, 400px"
          className="w-full max-w-[400px] h-auto object-contain rounded-xl"
          priority
        />
      </div>

      <section className="rounded-xl border bg-white p-5 text-center">
        <h2 className="text-xl font-semibold mb-3">Teilnahmebedingungen</h2>
        <ul className="list-disc pl-6 space-y-1 text-sm text-gray-700 inline-block text-left">
          {Array.isArray(terms) && terms.length > 0 ? (
            terms.map((t, i) => <li key={i}>{t}</li>)
          ) : (
            <>
              <li>Abschluss/Bestellung muss über den „Jetzt sichern“-Button erfolgen.</li>
              <li>Prämiengutschrift nach Bestätigung durch den Advertiser.</li>
              <li>Stornierungen/Retours, Mehrfach- oder Eigenabschlüsse sind ausgeschlossen.</li>
              <li>Auszahlung gemäß Portal-AGB nach Ablauf der Sperrfrist.</li>
            </>
          )}
        </ul>
      </section>

      <div className="flex flex-col items-center gap-3">
        <a
          href={`/r/${offer.id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center rounded-xl px-6 py-3 text-white bg-[#ca4b24] hover:bg-[#a33d1e] text-lg"
        >
          Jetzt sichern
        </a>
        <p className="text-xs text-gray-500">
          Beim Klick wird das Tracking gestartet und du wirst zum Anbieter weitergeleitet.
        </p>
      </div>

      <nav className="flex justify-center">
        <Link href="/" className="text-sm text-gray-600 hover:underline">
          Zurück zur Übersicht
        </Link>
      </nav>
    </main>
  )
}
