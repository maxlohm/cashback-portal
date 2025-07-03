'use client'

import Header from '../components/header'
import Footer from '../components/footer'

export default function DatenschutzPage() {
  return (
    <>
      <main className="max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 text-[#003b5b]">
        <h1 className="text-2xl sm:text-3xl font-bold text-center sm:text-left">Datenschutzerklärung</h1>
        <p className="text-sm sm:text-base"><strong>Gültig ab:</strong> Juni 2025</p>

        <section>
          <h2 className="text-lg sm:text-xl font-semibold mt-6">1. Verantwortlicher</h2>
          <p className="text-sm sm:text-base leading-relaxed">
            TOMORROW.AM Deutsche Beratungs- und Beteiligungs GmbH<br />
            Freseniusstraße 5<br />
            65193 Wiesbaden<br />
            E-Mail:{' '}
            <a
              href="mailto:info@bonus-nest.de"
              className="text-blue-600 underline break-all"
            >
              info@bonus-nest.de
            </a>
          </p>
        </section>

        <section>
          <h2 className="text-lg sm:text-xl font-semibold mt-6">2. Erhebung und Verarbeitung personenbezogener Daten</h2>
          <p className="text-sm sm:text-base leading-relaxed">
            Wir erheben personenbezogene Daten, wenn du dich auf unserer Plattform registrierst, Angebote wahrnimmst
            oder mit uns in Kontakt trittst. Dazu gehören: Name, E-Mail-Adresse, Nutzungsverhalten, IP-Adresse sowie
            ggf. Informationen zur Prämienabwicklung und Partnerverfolgung.
          </p>
        </section>

        <section>
          <h2 className="text-lg sm:text-xl font-semibold mt-6">3. Zweck der Verarbeitung</h2>
          <p className="text-sm sm:text-base leading-relaxed">
            Die Datenverarbeitung erfolgt zum Zweck der Vertragsdurchführung, Prämienabwicklung, Betrugsvermeidung
            sowie zur Nutzeranalyse (z. B. Newsletterversand, Empfehlungsprogramme).
          </p>
        </section>

        <section>
          <h2 className="text-lg sm:text-xl font-semibold mt-6">4. Weitergabe an Dritte</h2>
          <p className="text-sm sm:text-base leading-relaxed">
            Bonus-Nest arbeitet mit Partnerfirmen und Affiliate-Netzwerken zusammen. Zu diesem Zweck können
            Trackingdaten pseudonymisiert oder anonymisiert an diese Partner übermittelt werden.
          </p>
        </section>

        <section>
          <h2 className="text-lg sm:text-xl font-semibold mt-6">5. Cookies und Tracking</h2>
          <p className="text-sm sm:text-base leading-relaxed">
            Wir verwenden Cookies, um die Funktionalität der Plattform sicherzustellen. Zudem setzen wir Tracking ein,
            um Partnervergütungen korrekt zuordnen zu können. Du kannst dem Setzen von Cookies in deinem Browser
            widersprechen.
          </p>
        </section>

        <section>
          <h2 className="text-lg sm:text-xl font-semibold mt-6">6. Newsletter</h2>
          <p className="text-sm sm:text-base leading-relaxed">
            Wenn du dich für unseren Newsletter anmeldest, speichern wir deine E-Mail-Adresse und senden dir
            regelmäßig Informationen über neue Angebote. Du kannst dich jederzeit über einen Link im Newsletter
            abmelden.
          </p>
        </section>

        <section>
          <h2 className="text-lg sm:text-xl font-semibold mt-6">7. Speicherdauer</h2>
          <p className="text-sm sm:text-base leading-relaxed">
            Daten werden gelöscht, sobald sie für den Zweck der Verarbeitung nicht mehr erforderlich sind oder
            gesetzliche Aufbewahrungspflichten enden.
          </p>
        </section>

        <section>
          <h2 className="text-lg sm:text-xl font-semibold mt-6">8. Deine Rechte</h2>
          <p className="text-sm sm:text-base leading-relaxed">
            Du hast das Recht auf Auskunft, Berichtigung, Löschung, Einschränkung der Verarbeitung,
            Datenübertragbarkeit und Widerspruch. Wende dich dazu bitte an:{' '}
            <a
              href="mailto:info@bonus-nest.de"
              className="text-blue-600 underline break-all"
            >
              info@bonus-nest.de
            </a>
          </p>
        </section>

        <section>
          <h2 className="text-lg sm:text-xl font-semibold mt-6">9. Beschwerderecht</h2>
          <p className="text-sm sm:text-base leading-relaxed">
            Du hast das Recht, dich bei einer Datenschutzaufsichtsbehörde über die Verarbeitung deiner
            personenbezogenen Daten zu beschweren.
          </p>
        </section>
      </main>
    </>
  )
}