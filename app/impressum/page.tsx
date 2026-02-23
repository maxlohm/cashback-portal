export default function ImpressumPage() {
  return (
    <main className="max-w-3xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12 text-sm sm:text-base leading-relaxed text-[#003b5b]">
      <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-center sm:text-left">
        Impressum
      </h1>

      <p className="text-sm italic mb-6">
        Die Website Bonus-Nest wird betrieben von Felix Maximilian Lohmann.
      </p>

      <p><strong>Angaben gemäß § 5 DDG</strong></p>
      <p className="mt-2">
        Felix Maximilian Lohmann<br />
        Grindelallee 44<br />
        20146 Hamburg<br />
        Deutschland
      </p>

      <p className="mt-6">
        <strong>Rechtsform:</strong><br />
        Einzelunternehmen
      </p>

      <p className="mt-6">
        <strong>Inhaber:</strong><br />
        Felix Maximilian Lohmann
      </p>

      <p className="mt-6">
        <strong>Kontakt</strong><br />
        Telefon: 0157 35106870<br />
        E-Mail:{' '}
        <a
          href="mailto:info@bonus-nest.de"
          className="underline text-blue-600 break-all"
        >
          info@bonus-nest.de
        </a>
      </p>

      <p className="mt-6">
        <strong>Redaktionell verantwortlich:</strong><br />
        Felix Maximilian Lohmann<br />
        Grindelallee 44<br />
        20146 Hamburg
      </p>

      <p className="mt-6">
        <strong>Verbraucherstreitbeilegung</strong><br />
        Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren
        vor einer Verbraucherschlichtungsstelle teilzunehmen.
      </p>

      <p className="mt-6">
        <strong>Zentrale Kontaktstelle nach dem Digital Services Act (DSA):</strong><br />
        E-Mail: info@bonus-nest.de<br />
        Telefon: 0157 35106870<br />
        Sprachen: Deutsch, Englisch
      </p>

      <h2 className="text-xl font-semibold mt-10 mb-2">Haftung für Inhalte</h2>
      <p>
        Wir bemühen uns, die Inhalte unserer Website stets aktuell, vollständig
        und korrekt zu halten. Gemäß § 7 Abs. 1 TMG sind wir für eigene Inhalte
        auf diesen Seiten nach den allgemeinen Gesetzen verantwortlich. Eine
        Verpflichtung zur Überwachung übermittelter oder gespeicherter fremder
        Informationen besteht gemäß §§ 8 bis 10 TMG jedoch nicht.
      </p>
      <p>
        Sollten uns konkrete Hinweise auf rechtswidrige Inhalte bekannt werden,
        entfernen wir diese umgehend. Eine Haftung kommt frühestens ab dem
        Zeitpunkt der Kenntnis einer solchen Rechtsverletzung in Betracht.
      </p>

      <h2 className="text-xl font-semibold mt-10 mb-2">Haftung für externe Links</h2>
      <p>
        Unsere Website enthält Verlinkungen zu externen Internetseiten Dritter.
        Für deren Inhalte übernehmen wir keine Haftung, da wir keinen Einfluss
        auf die Gestaltung oder den Inhalt dieser Seiten haben. Zum Zeitpunkt
        der Verlinkung wurden die jeweiligen Seiten nach bestem Wissen geprüft
        und enthielten keine rechtswidrigen Inhalte.
      </p>
      <p>
        Eine dauerhafte inhaltliche Kontrolle externer Seiten ist uns ohne
        konkreten Anlass nicht zumutbar. Sollten Sie dennoch auf problematische
        Inhalte stoßen, informieren Sie uns bitte – wir entfernen den
        entsprechenden Link umgehend.
      </p>

      <h2 className="text-xl font-semibold mt-10 mb-2">Urheberrecht</h2>
      <p>
        Die Inhalte und Werke, die wir auf dieser Website bereitstellen,
        unterliegen dem deutschen Urheberrecht. Die Nutzung über die gesetzlich
        erlaubten Grenzen hinaus – etwa durch Kopieren, Verbreiten oder
        Verändern – ist nur mit ausdrücklicher schriftlicher Genehmigung
        gestattet.
      </p>
      <p>
        Texte, Grafiken und sonstige Inhalte Dritter sind entsprechend
        gekennzeichnet und werden nur verwendet, wenn eine Nutzung rechtlich
        erlaubt ist oder uns eine entsprechende Erlaubnis vorliegt. Falls Ihnen
        eine Urheberrechtsverletzung auffällt, bitten wir um eine Mitteilung.
        Wir prüfen den Vorgang umgehend und entfernen die betreffenden Inhalte,
        wenn erforderlich.
      </p>

      <p className="mt-6 text-xs">
        Quelle:{' '}
        <a
          href="https://www.e-recht24.de/impressum-generator.html"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 underline"
        >
          https://www.e-recht24.de/impressum-generator.html
        </a>
      </p>
    </main>
  );
}
