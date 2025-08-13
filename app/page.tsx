'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import KategorieNavigation from './navigation/page';
import DealCard from './components/DealCard';

import { supabase } from '@/utils/supabaseClient';
import { getActiveOffers, type Offer } from '@/utils/offers';

export default function AlleAngebotePage() {
  const [items, setItems] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      try {
        const offers = await getActiveOffers(supabase);
        setItems(offers);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  return (
    <div className="mt-0 p-0">
      {/* Banner */}
      <div className="w-full mx-auto">
        <Image
          src="/bannerrichtig.png"
          alt="Alle Angebote"
          width={1920}
          height={300}
          className="w-full h-auto object-cover"
          priority
        />
      </div>

      {/* Kategorien */}
      <KategorieNavigation />

      {/* Angebote */}
      <main className="max-w-6xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
        {loading ? (
          <div className="text-sm text-gray-500">Lade Angebote…</div>
        ) : (
          <div className="flex flex-wrap gap-6">
            {items.map((offer) => (
              <DealCard
                key={offer.id}
                name={offer.name}
                description={offer.description}
                reward={offer.reward}
                image={offer.image ?? '/placeholder.png'}
                offerId={offer.id}
                url={`/angebot/${offer.id}`}  // Teilnahmebedingungen-Seite
              />
            ))}
            {items.length === 0 && (
              <div className="text-sm text-gray-500">Aktuell keine Angebote verfügbar.</div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
