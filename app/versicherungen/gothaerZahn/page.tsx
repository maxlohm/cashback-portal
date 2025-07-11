'use client'

import KategorieNavigation from '@/app/navigation/page'

export default function GothaerZahnPage() {
  return (
    <>
      <KategorieNavigation />

      <main className="max-w-4xl mx-auto py-10 px-4 sm:px-6 lg:px-8 space-y-10">
        <h1 className="text-2xl sm:text-3xl font-bold text-[#003b5b] text-center sm:text-left">
          🦷 Gothaer Zahnzusatzversicherung
        </h1>

        <div className="rounded-lg border border-gray-200 p-4 shadow-md hover:shadow-lg transition-all duration-300 bg-white">
          <h2 className="text-lg font-semibold mb-2">Unser Partner: Finanzen.de</h2>
          <p className="text-sm text-gray-700 mb-4">
            Schließe eine Zahnzusatzversicherung über Finanzen.de ab oder fordere ein kostenloses Angebot an – und kassiere deine Prämie!
          </p>

          <div className="flex justify-center">
            <a
              href="https://www.financeads.net/tc.php?t=77500C191135896B"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img
                src="https://www.financeads.net/tb.php?t=77500V191135896B"
                alt="Gothaer Zahnzusatzversicherung"
                width={300}
                height={250}
                style={{ border: 0 }}
                className="rounded"
              />
            </a>
          </div>
        </div>
      </main>
    </>
  )
}
