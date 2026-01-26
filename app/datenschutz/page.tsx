// app/datenschutz/page.tsx
'use client'

export default function DatenschutzPage() {
  return (
    <main className="max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 text-[#003b5b]">
      <div className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-bold text-center sm:text-left">
          Datenschutzerklärung
        </h1>
        <p className="text-xs text-gray-500">Stand: 26.01.2026</p>
      </div>

      <section>
        <h2 className="text-lg sm:text-xl font-semibold mt-6">1. Verantwortlicher</h2>
        <p className="text-sm sm:text-base leading-relaxed">
          Bonus-Nest<br />
          Felix Maximilian Lohmann (Einzelunternehmen)<br />
          Grindelallee 44<br />
          20146 Hamburg<br />
          Deutschland<br />
          E-Mail:{' '}
          <a href="mailto:info@bonus-nest.de" className="text-blue-600 underline break-all">
            info@bonus-nest.de
          </a>
        </p>
      </section>

      <section>
        <h2 className="text-lg sm:text-xl font-semibold mt-6">
          2. Erhebung und Verarbeitung personenbezogener Daten
        </h2>
        <p className="text-sm sm:text-base leading-relaxed">
          Wir verarbeiten personenbezogene Daten, wenn du dich registrierst, Angebote wahrnimmst oder mit uns in
          Kontakt trittst. Dazu gehören insbesondere: E-Mail-Adresse, ggf. Profilangaben, technische Daten (z. B.
          IP-Adresse, Logdaten) sowie Informationen zur Prämienabwicklung und Partnerzuordnung.
        </p>
      </section>

      <section>
        <h2 className="text-lg sm:text-xl font-semibold mt-6">3. Zweck der Verarbeitung</h2>
        <p className="text-sm sm:text-base leading-relaxed">
          Die Datenverarbeitung erfolgt zur Bereitstellung der Plattform, zur Durchführung der Prämienabwicklung,
          zur Betrugsvermeidung sowie zur Kommunikation mit dir (z. B. Support). Newsletter/Marketing erfolgt nur,
          wenn du ausdrücklich eingewilligt hast.
        </p>
      </section>

      <section>
        <h2 className="text-lg sm:text-xl font-semibold mt-6">4. Weitergabe an Dritte</h2>
        <p className="text-sm sm:text-base leading-relaxed">
          Bonus-Nest arbeitet mit Partnerfirmen und Affiliate-Netzwerken zusammen. Zur Zuordnung von Abschlüssen
          können pseudonymisierte Tracking-/Zuordnungsdaten an diese Partner übermittelt werden.
        </p>
      </section>

      <section>
        <h2 className="text-lg sm:text-xl font-semibold mt-6">5. Cookies und Tracking</h2>
        <p className="text-sm sm:text-base leading-relaxed">
          Wir nutzen technisch notwendige Mechanismen zur Bereitstellung der Plattform (z. B. Login/Sessions). Für
          die Zuordnung von Partnerabschlüssen kann eine pseudonymisierte Zuordnung (z. B. via Sub-ID) verwendet
          werden. Du kannst Einstellungen in deinem Browser anpassen.
        </p>
      </section>

      <section>
        <h2 className="text-lg sm:text-xl font-semibold mt-6">6. Speicherdauer</h2>
        <p className="text-sm sm:text-base leading-relaxed">
          Daten werden gelöscht, sobald sie für den Zweck nicht mehr erforderlich sind, sofern keine gesetzlichen
          Aufbewahrungspflichten entgegenstehen.
        </p>
      </section>

      <section>
        <h2 className="text-lg sm:text-xl font-semibold mt-6">7. Deine Rechte</h2>
        <p className="text-sm sm:text-base leading-relaxed">
          Du hast das Recht auf Auskunft, Berichtigung, Löschung, Einschränkung der Verarbeitung, Datenübertragbarkeit
          und Widerspruch. Wende dich dazu bitte an:{' '}
          <a href="mailto:info@bonus-nest.de" className="text-blue-600 underline break-all">
            info@bonus-nest.de
          </a>
        </p>
      </section>

      <section>
        <h2 className="text-lg sm:text-xl font-semibold mt-6">8. Beschwerderecht</h2>
        <p className="text-sm sm:text-base leading-relaxed">
          Du hast das Recht, dich bei einer Datenschutzaufsichtsbehörde über die Verarbeitung deiner personenbezogenen
          Daten zu beschweren.
        </p>
      </section>
    </main>
  )
}
