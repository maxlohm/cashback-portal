export default function ImpressumPage() {
  return (
    <main className="max-w-3xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12 text-sm sm:text-base leading-relaxed text-[#003b5b]">
      <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-center sm:text-left">Impressum</h1>

      <p><strong>Angaben gemäß § 5 TMG</strong></p>
      <p className="mt-2">
        Bonus-Nest<br />
        Max Lohmann<br />
        Grindelallee 44<br />
        20146 Hamburg<br />
        Deutschland
      </p>

      <p className="mt-6">
        <strong>Kontakt</strong><br />
        E-Mail:{' '}
        <a
          href="mailto:info@bonus-nest.de"
          className="underline text-blue-600 break-all"
        >
          info@bonus-nest.de
        </a>
      </p>

      <p className="mt-6">
        <strong>Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV:</strong><br />
        Bonus-Nest<br />
        Grindelallee 44<br />
        20146 Hamburg
      </p>

      <p className="mt-6">
        <strong>EU-Streitschlichtung</strong><br />
        Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit:{' '}
        <a
          href="https://ec.europa.eu/consumers/odr"
          className="text-blue-600 underline break-all"
          target="_blank"
          rel="noopener noreferrer"
        >
          https://ec.europa.eu/consumers/odr
        </a>.
      </p>

      <p className="mt-6">
        <strong>Verbraucherstreitbeilegung</strong><br />
        Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.
      </p>
    </main>
  )
}
