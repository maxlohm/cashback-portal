'use client'

import Header from '../components/header'
import Footer from '../components/footer'

export default function AGBPage() {
  return (
    <>
      <main className="max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 text-gray-800">
        <h1 className="text-2xl sm:text-3xl font-bold text-center sm:text-left">
          Allgemeine Geschäftsbedingungen
        </h1>
        <p className="text-center sm:text-left text-sm sm:text-base">
        </p>

        <div className="space-y-8 text-sm sm:text-base leading-relaxed">
          <section>
            <h2 className="text-lg sm:text-xl font-semibold">1. Allgemeines</h2>
            <p>
              Diese Nutzungsbedingungen regeln die Nutzung der Plattform <strong>www.bonus-nest.de</strong> (nachfolgend
              „Plattform“), betrieben von der <strong>TOMORROW.AM Deutsche Beratungs- und Beteiligungs GmbH</strong>,
              Freseniusstraße 5, 65193 Wiesbaden (nachfolgend „Bonus-Nest“).
            </p>
          </section>

          <section>
            <h2 className="text-lg sm:text-xl font-semibold">2. Leistungen</h2>
            <p>
              Bonus-Nest bietet registrierten Nutzern die Möglichkeit, durch Teilnahme an Partneraktionen Prämienguthaben
              zu sammeln, das anschließend im internen Prämienbereich gegen Gutscheine (z. B. Amazon, eBay, Aral)
              eingelöst werden kann.
            </p>
          </section>

          <section>
            <h2 className="text-lg sm:text-xl font-semibold">3. Registrierung und Teilnahme</h2>
            <p>
              Die Nutzung der Plattform erfordert eine kostenlose Registrierung. Teilnahmeberechtigt sind ausschließlich
              volljährige Personen mit Wohnsitz in Deutschland. Alle im Registrierungsprozess angegebenen Informationen
              müssen der Wahrheit entsprechen.
            </p>
          </section>

          <section>
            <h2 className="text-lg sm:text-xl font-semibold">4. Prämien und Auszahlungen</h2>
            <p>
              Prämiengutschriften erfolgen nach erfolgreicher Validierung durch Partnerprogramme. Eine Auszahlung in
              Bargeld ist ausgeschlossen. Das Guthaben ist ausschließlich im Prämienbereich der Plattform einlösbar.
            </p>
          </section>

          <section>
            <h2 className="text-lg sm:text-xl font-semibold">5. Empfehlungs- und Partnerprogramme</h2>
            <p>
              Bonus-Nest arbeitet mit Kooperationspartnern und Empfehlungsgebern (z. B. Influencer) zusammen, denen
              individuelle Partnerlinks zur Verfügung gestellt werden. Für jede gültige Registrierung über einen solchen
              Link kann eine anteilige Vergütung erfolgen.
            </p>
          </section>

          <section>
            <h2 className="text-lg sm:text-xl font-semibold">6. Missbrauch und Sperrung</h2>
            <p>
              Bei Verdacht auf Manipulation, Falschangaben oder anderweitigem Missbrauch behält sich Bonus-Nest das Recht
              vor, Nutzerkonten vorübergehend zu sperren oder dauerhaft zu löschen – auch ohne vorherige Ankündigung.
            </p>
          </section>

          <section>
            <h2 className="text-lg sm:text-xl font-semibold">7. Haftung</h2>
            <p>
              Bonus-Nest übernimmt keine Haftung für Inhalte, Angebote oder Leistungen von Drittanbietern.
              Vertragsverhältnisse entstehen ausschließlich zwischen dem Nutzer und dem jeweiligen Drittanbieter.
            </p>
          </section>

          <section>
            <h2 className="text-lg sm:text-xl font-semibold">8. Änderungen der Bedingungen</h2>
            <p>
              Bonus-Nest behält sich das Recht vor, diese AGB jederzeit mit Wirkung für die Zukunft zu ändern. Änderungen
              werden registrierten Nutzern rechtzeitig in geeigneter Form mitgeteilt.
            </p>
          </section>

          <section>
            <h2 className="text-lg sm:text-xl font-semibold">9. Kontakt</h2>
            <p>
              Bei Fragen oder Anliegen erreichst du uns unter:{' '}
              <a href="mailto:info@bonus-nest.de" className="text-blue-600 underline break-all">
                info@bonus-nest.de
              </a><br />
            </p>
          </section>
        </div>
      </main>
    </>
  )
}
