'use client'

import Image from 'next/image'
import Link from 'next/link'

export default function PartnerPage() {
  return (
    <div className="min-h-screen bg-[#f7f3e6] text-[#003b5b]">
      {/* Banner oben */}
      <div className="w-full max-w-none mx-auto p-0">
        <Image
          src="/Banner_Partner_werden.png"
          alt="Partner werden bei Bonus-Nest"
          width={1920}
          height={300}
          className="w-full h-auto object-cover block"
          priority
        />
      </div>

      {/* Inhalt */}
      <section className="max-w-4xl mx-auto px-6 py-16 bg-[#f1e8cc] rounded-xl mt-10 shadow-md">
      <h2 className="text-3xl font-semibold mb-6 text-center">
  Werde Teil von Bonus-Nest
</h2>
<p className="text-lg mb-6 text-center">
  Du hast eine Community, Website oder ein Netzwerk? Dann nutze dein Potenzial – wir
  bieten dir eine einfache Möglichkeit, mit unseren exklusiven Bonus-Angeboten
  Geld zu verdienen. Kein technisches Know-how nötig – einfach starten, Deals teilen,
  und von jedem geworbenen User profitieren.
</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          <div className="bg-white p-6 rounded-xl shadow">
            <h3 className="text-xl font-bold mb-2">Faire Vergütung</h3>
            <p>Verdiene an jedem User, den du bringst – bis zu 1 Jahr lang. Transparent & leistungsbasiert.</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow">
            <h3 className="text-xl font-bold mb-2">Gutscheine statt Werbung</h3>
            <p>Du bewirbst keine Banner – du bewirbst echte Mehrwerte: Gutscheine, Cashback, Prämien.</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow">
            <h3 className="text-xl font-bold mb-2">Sofort starten</h3>
            <p>Keine Integration, keine technischen Hürden. Einfach registrieren & loslegen.</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow">
            <h3 className="text-xl font-bold mb-2">Laufend neue Aktionen</h3>
            <p>Wir versorgen dich regelmäßig mit frischen, attraktiven Deals für deine Zielgruppe.</p>
          </div>
        </div>

        <div className="text-center">
          <Link
            href="/support?type=Kooperationsanfrage"
            className="inline-block bg-yellow-500 text-black font-semibold py-3 px-6 rounded-xl hover:bg-yellow-600 transition"
          >
            Jetzt kostenlos Partner werden
          </Link>
        </div>
      </section>
    </div>
  )
}
