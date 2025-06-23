'use client'

import Header from '../components/header'
import Footer from '../components/footer'

export default function DatenschutzPage() {
  return (
    <>
      <Header />
      <main className="max-w-4xl mx-auto p-6 md:p-10 text-gray-800 space-y-6">
        <h1 className="text-3xl font-bold">Datenschutzerklärung</h1>
        <p><strong>Gültig ab:</strong> Juni 2025</p>

        <section>
          <h2 className="text-xl font-semibold mt-6">1. Verantwortlicher</h2>
          <p>
            Jan Biefang & Max Lohmann<br />
            djfdsghjfj 3<br />
            53445 Haas<br />
            E-Mail:{' '}
            <a href="mailto:hydroahsdjdsfgd@gmail.com" className="text-blue-600 underline">
              hydroahsdjdsfgd@gmail.com
            </a>
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mt-6">2. Erhebung und Verarbeitung personenbezogener Daten</h2>
          <p>
            Wir erheben personenbezogene Daten, wenn du dich auf unserer Plattform registrierst, Angebote wahrnimmst oder mit uns in Kontakt trittst. Dazu gehören: Name, E-Mail-Adresse, Nutzungsverhalten, IP-Adresse sowie ggf. Informationen zur Prämienauszahlung und Partnerverfolgung.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mt-6">3. Zweck der Verarbeitung</h2>
          <p>
            Die Datenverarbeitung erfolgt zum Zweck der Vertragsdurchführung, Prämienabwicklung, Betrugsvermeidung sowie zur Nutzeranalyse (z. B. Newsletterversand, Empfehlungsprogramme).
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mt-6">4. Weitergabe an Dritte</h2>
          <p>
            HydroCash arbeitet mit Partnerfirmen und Affiliate-Netzwerken zusammen. Zu diesem Zweck können Trackingdaten pseudonymisiert oder anonymisiert an diese Partner übermittelt werden.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mt-6">5. Cookies und Tracking</h2>
          <p>
            Wir verwenden Cookies, um die Funktionalität der Plattform sicherzustellen. Zudem setzen wir Tracking ein, um Partnervergütungen korrekt zuordnen zu können. Du kannst dem Setzen von Cookies in deinem Browser widersprechen.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mt-6">6. Newsletter</h2>
          <p>
            Wenn du dich für unseren Newsletter anmeldest, speichern wir deine E-Mail-Adresse und senden dir regelmäßig Informationen über neue Angebote. Du kannst dich jederzeit über einen Link im Newsletter abmelden.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mt-6">7. Speicherdauer</h2>
          <p>
            Daten werden gelöscht, sobald sie für den Zweck der Verarbeitung nicht mehr erforderlich sind oder gesetzliche Aufbewahrungspflichten enden.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mt-6">8. Deine Rechte</h2>
          <p>
            Du hast das Recht auf Auskunft, Berichtigung, Löschung, Einschränkung der Verarbeitung, Datenübertragbarkeit und Widerspruch. Wende dich dazu bitte an:{' '}
            <a href="mailto:hydroahsdjdsfgd@gmail.com" className="text-blue-600 underline">
              hydroahsdjdsfgd@gmail.com
            </a>
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mt-6">9. Beschwerderecht</h2>
          <p>
            Du hast das Recht, dich bei einer Datenschutzaufsichtsbehörde über die Verarbeitung deiner personenbezogenen Daten zu beschweren.
          </p>
        </section>
      </main>
      <Footer />
    </>
  )
}