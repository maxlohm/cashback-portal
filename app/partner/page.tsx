'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { supabase } from '@/utils/supabaseClient'

export default function PartnerPage() {
  const [loggedIn, setLoggedIn] = useState(false)
  const [loadingAuth, setLoadingAuth] = useState(true)

  useEffect(() => {
    let isMounted = true

    const checkUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!isMounted) return
      setLoggedIn(!!user)
      setLoadingAuth(false)
    }

    checkUser()

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (!isMounted) return
        setLoggedIn(!!session?.user)
        setLoadingAuth(false)
      },
    )

    return () => {
      isMounted = false
      authListener?.subscription.unsubscribe()
    }
  }, [])

  const applyHref = '/partner/bewerben'
  const loginHref = '/login?next=/partner/bewerben'
  const registerHref = '/register?next=/partner/bewerben'

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
          bieten dir eine einfache Möglichkeit, mit unseren exklusiven Bonus-Angeboten Geld zu
          verdienen. Kein technisches Know-how nötig – einfach starten, Deals teilen, und von
          jedem geworbenen User profitieren.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          <div className="bg-white p-6 rounded-xl shadow">
            <h3 className="text-xl font-bold mb-2">Faire Vergütung</h3>
            <p>Verdiene an jedem User, den du bringst – transparent & leistungsbasiert.</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow">
            <h3 className="text-xl font-bold mb-2">Gutscheine statt Werbung</h3>
            <p>Du bewirbst echte Mehrwerte: Gutscheine, Cashback, Prämien.</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow">
            <h3 className="text-xl font-bold mb-2">Einfach starten</h3>
            <p>Keine Integration. Registrieren, bewerben, freischalten lassen.</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow">
            <h3 className="text-xl font-bold mb-2">Laufend neue Aktionen</h3>
            <p>Wir liefern regelmäßig frische Deals für deine Zielgruppe.</p>
          </div>
        </div>

        {/* Ablauf + CTA */}
        <div className="bg-white/70 border border-[#d6c4a1] rounded-xl p-6">
          <h3 className="text-xl font-bold mb-3 text-center">So läuft’s ab</h3>
          <ol className="list-decimal pl-5 space-y-2 text-[#003b5b]/90 max-w-2xl mx-auto">
            <li>Account erstellen oder einloggen</li>
            <li>Bewerbung ausfüllen</li>
            <li>Manuelle Prüfung durch uns</li>
            <li>Freischaltung + Zugriff auf Partner-Dashboard & Promo-Links</li>
          </ol>

          <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
            {loadingAuth ? (
              <button
                disabled
                className="inline-block bg-yellow-500/70 text-black font-semibold py-3 px-6 rounded-xl"
              >
                Lade…
              </button>
            ) : loggedIn ? (
              <Link
                href={applyHref}
                className="inline-block bg-yellow-500 text-black font-semibold py-3 px-6 rounded-xl hover:bg-yellow-600 transition text-center"
              >
                Jetzt Bewerbung starten
              </Link>
            ) : (
              <>
                <Link
                  href={registerHref}
                  className="inline-block bg-yellow-500 text-black font-semibold py-3 px-6 rounded-xl hover:bg-yellow-600 transition text-center"
                >
                  Registrieren & bewerben
                </Link>
                <Link
                  href={loginHref}
                  className="inline-block border border-[#003b5b] text-[#003b5b] font-semibold py-3 px-6 rounded-xl hover:bg-white/60 transition text-center"
                >
                  Einloggen
                </Link>
              </>
            )}
          </div>

          <p className="mt-4 text-center text-xs text-[#003b5b]/80">
            Hinweis: Partner werden nicht automatisch freigeschaltet. Jede Bewerbung wird geprüft.
          </p>
        </div>
      </section>
    </div>
  )
}
