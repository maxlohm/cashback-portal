'use client'

import KategorieNavigation from '../navigation/page'
import Link from 'next/link'
import Image from 'next/image'

export default function Page() {
  return (
    <>
      <KategorieNavigation />

      <div className="w-full">
        <Image
          src="/Banner.png"
          alt="Banner"
          width={1440}
          height={270}
          className="w-full h-auto object-cover"
          priority
        />
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-4">🛡️ Versicherungen</h1>
        <p className="mb-6">
          Hier findest du aktuelle Versicherungsangebote mit Bonus. Jetzt abschließen & Prämie sichern!
        </p>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-2">Unser Partner: Finanzen.de</h2>
          <p className="mb-4">
            Schließe eine Versicherung ab oder fordere ein kostenloses Angebot ein – und kassiere eine Prämie!
          </p>

          <Link href="/versicherungen/gothaerZahn">
            <img
              src="/gothaer-banner.jpg"
              alt="Gothaer Zahnzusatzversicherung"
              width={500}
              height={300}
              className="cursor-pointer hover:opacity-90 transition"
            />
          </Link>
        </div>
      </div>
    </>
  )
}
