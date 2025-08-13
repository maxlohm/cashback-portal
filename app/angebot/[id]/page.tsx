// app/angebot/[id]/page.tsx
import { cookies } from 'next/headers'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { getOfferById } from '@/utils/offers'

export default async function OfferDetailPage({ params }: { params: { id: string } }) {
  const supabase = createServerComponentClient({ cookies })
  const offer = await getOfferById(supabase, params.id)
  if (!offer) return notFound()

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-3xl font-semibold text-center">{offer.name}</h1>
      <p className="text-gray-600 mt-3 text-center">{offer.description}</p>

      {/* kleines, zentriertes Bild */}
      <div className="my-6 flex justify-center">
        <Image
          src={offer.image ?? '/placeholder.png'}
          alt={offer.name}
          width={800}
          height={450}
          sizes="(max-width: 640px) 90vw, 520px"
          className="w-full max-w-[520px] h-auto object-contain rounded-xl"
          priority
        />
      </div>

      {/* Text + Button mittig */}
      <section className="mb-10 flex flex-col items-center text-center">
        <h2 className="text-xl font-semibold mb-3">Teilnahmebedingungen</h2>
        <ul className="list-disc pl-6 space-y-1 text-sm text-gray-700 text-left max-w-xl">
          {offer.terms?.length ? (
            offer.terms.map((t, i) => <li key={i}>{t}</li>)
          ) : (
            <>
              <li>Abschluss über den Aktionslink notwendig.</li>
              <li>Prämiengutschrift nach Bestätigung durch den Anbieter.</li>
              <li>Nur für Neukunden, sofern nicht anders angegeben.</li>
            </>
          )}
        </ul>
      </section>
<div className="flex justify-center">
  <a
    href={`/r/${offer.id}`}
    target="_blank"
    rel="noopener noreferrer"
    className="inline-flex items-center justify-center rounded-xl px-6 py-3 text-white bg-[#ca4b24] hover:bg-[#a33d1e] text-lg"
  >
    Jetzt sichern
  </a>
</div>

    </div>
  )
}
