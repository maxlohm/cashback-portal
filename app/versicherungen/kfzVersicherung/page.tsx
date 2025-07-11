'use client'

import KategorieNavigation from '@/app/navigation/page'

export default function KfzVersicherungPage() {
  return (
    <>
      {/* Navigation */}
      <KategorieNavigation />

      {/* Inhalt */}
      <main className="max-w-6xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-[#003b5b] mb-6 text-center sm:text-left">
          🚗 Kfz-Versicherung mit Prämie
        </h1>

        {/* Deal-Box */}
        <div className="flex flex-col md:flex-row items-center justify-start gap-8 bg-white border border-gray-200 rounded-lg shadow p-6 hover:shadow-lg transition-all max-w-[600px]">
          {/* Werbebanner */}
          <img
            src="https://a.partner-versicherung.de/view.php?partner_id=191406&ad_id=1618"
            alt="Kfz-Versicherung Banner"
            width={300}
            height={250}
            className="rounded"
            style={{ border: 0 }}
          />

          {/* 20€ + Button */}
          <div className="flex flex-col items-center gap-5">
            <div className="bg-[#ca4b24] text-white px-8 py-3 text-xl font-bold rounded-lg min-w-[160px] text-center">
              20&nbsp;€
            </div>

            <a
              href="https://a.partner-versicherung.de/click.php?partner_id=191406&ad_id=1618&deep=kfz-versicherung"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#ca4b24] hover:bg-[#a33d1e] text-white px-8 py-3 rounded-lg text-lg font-medium min-w-[160px] text-center transition"
            >
              Jetzt sichern!
            </a>
          </div>
        </div>
      </main>
    </>
  )
}
