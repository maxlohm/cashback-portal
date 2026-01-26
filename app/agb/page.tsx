// app/agb/page.tsx
'use client'

export default function AGBPage() {
  return (
    <main className="max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 text-gray-800">
      <div className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-bold text-center sm:text-left">
          Allgemeine Geschäftsbedingungen
        </h1>
        <p className="text-xs text-gray-500">Stand: 26.01.2026</p>
      </div>

      <div className="space-y-8 text-sm sm:text-base leading-relaxed">
        <section>
          <h2 className="text-lg sm:text-xl font-semibold">1. Allgemeines</h2>
          <p>
            Diese Nutzungsbedingungen regeln die Nutzung der Plattform <strong>www.bonus-nest.de</strong> (nachfolgend
            „Plattform“), betrieben von{' '}
            <strong>Felix Maximilian Lohmann, Grindelallee 44, 20146 Hamburg</strong> als Einzelunternehmen (nachfolgend
            „Bonus-Nest“).
          </p>
        </section>

        <section>
          <h2 className="text-lg sm:text-xl font-semibold">2. Leistungen</h2>
          <p>
            Bonus-Nest bietet registrierten Nutzern die Möglichkeit, durch Teilnahme an Partneraktionen Prämienguthaben
            zu sammeln. Das Guthaben kann nach erfolgreicher Bestätigung durch die Anbieter in Form von Auszahlungen
            oder Gutscheinen eingelöst werden.
          </p>
        </section>

        <section>
          <h2 className="text-lg sm:text-xl font-semibold">3. Registrierung und Teilnahme</h2>
          <p>
            Für die Nutzung der Plattform ist eine kostenlose Registrierung erforderlich. Teilnahmeberechtigt sind
            ausschließlich volljährige Personen mit Wohnsitz in Deutschland. Alle Angaben im Registrierungsprozess
            müssen korrekt und vollständig sein.
          </p>
        </section>

        <section>
          <h2 className="text-lg sm:text-xl font-semibold">4. Prämien und Auszahlungen</h2>
          <p>
            Prämien werden gutgeschrieben, sobald Partnerprogramme oder Advertiser eine Aktion bestätigt haben.
            Bonus-Nest behält sich vor, unbestätigte oder als ungültig markierte Aktionen nicht zu vergüten.
            Auszahlungen erfolgen ausschließlich über die angebotenen Auszahlungsmethoden im Nutzerkonto.
          </p>
        </section>

        <section>
          <h2 className="text-lg sm:text-xl font-semibold">5. Empfehlungs- und Partnerprogramme</h2>
          <p>
            Bonus-Nest arbeitet mit Affiliates, Influencern und Kooperationspartnern zusammen, denen individuelle
            Partnerlinks bereitgestellt werden. Vergütungen erfolgen nur bei gültigen und bestätigten Aktionen.
            Bonus-Nest behält sich das Recht vor, fehlerhafte oder manipulierte Leads abzulehnen.
          </p>
        </section>

        <section>
          <h2 className="text-lg sm:text-xl font-semibold">6. Missbrauch und Sperrung</h2>
          <p>
            Bei Verdacht auf Betrug, Mehrfachregistrierungen, Manipulation oder sonstigem Missbrauch kann Bonus-Nest
            Konten sperren, Prämien einbehalten oder Nutzer dauerhaft ausschließen – ohne vorherige Ankündigung.
          </p>
        </section>

        <section>
          <h2 className="text-lg sm:text-xl font-semibold">7. Haftung</h2>
          <p>
            Bonus-Nest übernimmt keine Haftung für Inhalte oder Angebote von Drittanbietern. Leistungs- und
            Vertragsverhältnisse entstehen ausschließlich zwischen dem Nutzer und dem jeweiligen Anbieter. Für
            technische Ausfälle und Datenverluste wird keine Gewähr übernommen.
          </p>
        </section>

        <section>
          <h2 className="text-lg sm:text-xl font-semibold">8. Änderungen der Bedingungen</h2>
          <p>
            Bonus-Nest kann diese AGB jederzeit mit Wirkung für die Zukunft ändern. Registrierte Nutzer werden über
            wesentliche Änderungen informiert. Die fortgesetzte Nutzung der Plattform gilt als Zustimmung zur
            aktualisierten Fassung.
          </p>
        </section>

        <section>
          <h2 className="text-lg sm:text-xl font-semibold">
            9. Guthaben, Verfall und Beendigung des Dienstes
          </h2>
          <p>
            Nicht eingelöste Prämienguthaben bleiben dem Nutzer grundsätzlich erhalten und können über die angebotenen
            Auszahlungsmethoden angefordert werden. Bonus-Nest ist jedoch berechtigt, nicht abgerufene Guthaben
            verfallen zu lassen, wenn ein Nutzerkonto über einen Zeitraum von{' '}
            <strong>12 Monaten keine Aktivität</strong> aufweist (z.&nbsp;B. kein Login, keine neue bestätigte Aktion,
            keine Auszahlungsanforderung). Vor dem Verfall informiert Bonus-Nest die betroffenen Nutzer rechtzeitig per
            E-Mail.
          </p>
          <p className="mt-3">
            Stellt Bonus-Nest den Dienst dauerhaft ein, haben Nutzer für einen Zeitraum von <strong>30 Tagen</strong>{' '}
            nach entsprechender Ankündigung die Möglichkeit, noch auszahlbares Guthaben anzufordern. Nach Ablauf dieser
            Frist können keine weiteren Ansprüche geltend gemacht werden.
          </p>
          <p className="mt-3">
            Entscheidungen über den Verfall von Guthaben erfolgen unter Beachtung der gesetzlichen Verjährungsfristen.
            Für als ungültig bewertete oder von Partnern abgelehnte Aktionen besteht kein Anspruch auf Auszahlung.
          </p>
        </section>

        <section>
          <h2 className="text-lg sm:text-xl font-semibold">10. Kontakt</h2>
          <p>
            Bei Fragen erreichst du uns unter:{' '}
            <a href="mailto:info@bonus-nest.de" className="text-blue-600 underline break-all">
              info@bonus-nest.de
            </a>
            <br />
            Felix Maximilian Lohmann, Grindelallee 44, 20146 Hamburg
          </p>
        </section>
      </div>
    </main>
  )
}
