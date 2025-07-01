'use client'

import Header from '../components/header'
import Footer from '../components/footer'

export default function AGBPage() {
  return (
    <>
      <Header />

      <main className="max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 text-gray-800">
        <h1 className="text-2xl sm:text-3xl font-bold text-center sm:text-left">
          Allgemeine Geschäftsbedingungen
        </h1>
        <p className="text-center sm:text-left text-sm sm:text-base">
          <strong>Gültig ab:</strong> Juni 2025
        </p>

        <div className="space-y-8 text-sm sm:text-base leading-relaxed">
          <section>
            <h2 className="text-lg sm:text-xl font-semibold">1. Allgemeines</h2>
            <p>
              Diese Nutzungsbedingungen regeln die Nutzung der Plattform <strong>www.hydrocash.de</strong> (nachfolgend
              „Plattform“), betrieben von <strong>Jan Biefang & Max Lohmann</strong> (nachfolgend „HydroCash“).
            </p>
          </section>

          <section>
            <h2 className="text-lg sm:text-xl font-semibold">2. Leistungen</h2>
            <p>
              HydroCash bietet Nutzern die Möglichkeit, durch Teilnahme an Partneraktionen Prämienpunkte zu sammeln,
              die anschließend im Prämienportal in Gutscheine (z. B. Amazon, eBay, Aral) umgewandelt werden können.
            </p>
          </section>

          <section>
            <h2 className="text-lg sm:text-xl font-semibold">3. Registrierung und Teilnahme</h2>
            <p>
              Die Nutzung der Plattform setzt eine kostenlose Registrierung voraus. Teilnahmeberechtigt sind
              ausschließlich volljährige Personen mit Wohnsitz in Deutschland. Die bei der Registrierung gemachten
              Angaben müssen wahrheitsgemäß sein.
            </p>
          </section>

          <section>
            <h2 className="text-lg sm:text-xl font-semibold">4. Prämien und Auszahlungen</h2>
            <p>
              Prämien werden nach erfolgreicher Validierung durch Partnerprogramme gutgeschrieben. Eine Barauszahlung
              ist ausgeschlossen. Guthaben kann nur im internen Prämienportal eingelöst werden.
            </p>
          </section>

          <section>
            <h2 className="text-lg sm:text-xl font-semibold">5. Influencer-Partnerprogramme</h2>
            <p>
              HydroCash arbeitet mit Influencern zusammen, denen ein individueller Empfehlungslink bereitgestellt
              wird. Für jede erfolgreiche Neukundenregistrierung über diesen Link erhält der Influencer eine
              anteilige Vergütung (bis zu 50 %).
            </p>
          </section>

          <section>
            <h2 className="text-lg sm:text-xl font-semibold">6. Missbrauch und Sperrung</h2>
            <p>
              HydroCash behält sich das Recht vor, Nutzerkonten bei Verdacht auf Manipulation, Missbrauch oder
              Falschangaben ohne Vorankündigung zu sperren oder zu löschen.
            </p>
          </section>

          <section>
            <h2 className="text-lg sm:text-xl font-semibold">7. Haftung</h2>
            <p>
              HydroCash übernimmt keine Haftung für die Angebote oder Inhalte von Drittanbietern. Verträge kommen
              ausschließlich zwischen dem Nutzer und dem Drittanbieter zustande.
            </p>
          </section>

          <section>
            <h2 className="text-lg sm:text-xl font-semibold">8. Änderungen der Bedingungen</h2>
            <p>
              HydroCash behält sich vor, diese Nutzungsbedingungen jederzeit zu ändern. Nutzer werden über Änderungen
              rechtzeitig informiert.
            </p>
          </section>

          <section>
            <h2 className="text-lg sm:text-xl font-semibold">9. Kontakt</h2>
            <p>
              Bei Fragen erreichst du uns unter:{' '}
              <a href="mailto:hydroahsdjdsfgd@gmail.com" className="text-blue-600 underline break-all">
                hydroahsdjdsfgd@gmail.com
              </a>
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </>
  )
}
