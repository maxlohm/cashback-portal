'use client'

import Image from 'next/image'
import KategorieNavigation from '../navigation/page'

export default function VersicherungenPage() {
  return (
    <>
      {/* Banner oben */}
      <div className="w-full">
        <Image
          src="/bannerrichtig.png"
          alt="Versicherungsangebote Banner"
          width={1440}
          height={300}
          className="w-full h-auto object-cover"
          priority
        />
      </div>

      {/* Navigation */}
      <KategorieNavigation />

      {/* Inhalt */}
      <main className="max-w-6xl mx-auto py-10 px-4 sm:px-6 lg:px-8 space-y-10">
        <h1 className="text-3xl font-bold text-[#003b5b] mb-4">
        </h1>
        <p className="text-gray-700 mb-6">
        </p>

        {/* Deals nebeneinander */}
        <div className="flex flex-wrap gap-6 justify-start">
          {/* 🦷 Gothaer Zahn */}
          <div className="w-full md:w-[48%] bg-white flex flex-col md:flex-row items-center gap-6 p-6 rounded-lg border border-gray-200 shadow hover:shadow-lg transition-all">
            <img
              src="https://www.financeads.net/tb.php?t=77500V191135896B"
              alt="Finanzen.de Banner"
              width={300}
              height={250}
              className="rounded"
              style={{ border: 0 }}
            />
            <div className="flex flex-col items-center gap-5">
              <div className="bg-[#ca4b24] text-white px-8 py-3 text-xl font-bold rounded-lg min-w-[160px] text-center">
                20&nbsp;€
              </div>
              <a
                href="https://www.financeads.net/tc.php?t=77500C191135896B"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#ca4b24] hover:bg-[#a33d1e] text-white px-8 py-3 rounded-lg text-lg font-medium min-w-[160px] text-center transition"
              >
                Jetzt sichern!
              </a>
            </div>
          </div>

          {/* 🚗 Kfz-Versicherung */}
          <div className="w-full md:w-[48%] bg-white flex flex-col md:flex-row items-center gap-6 p-6 rounded-lg border border-gray-200 shadow hover:shadow-lg transition-all">
            <img
              src="https://a.partner-versicherung.de/view.php?partner_id=191406&ad_id=1618"
              alt="Kfz-Versicherung Banner"
              width={300}
              height={250}
              className="rounded"
              style={{ border: 0 }}
            />
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
        </div>
      </main>
    </>
  )
}
