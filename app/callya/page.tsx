// app/callya/page.tsx

'use client'

import { useEffect } from 'react'

export default function CallyaRedirectPage() {
  useEffect(() => {
    const trackingUrl =
      'https://www.vodafone.de/freikarten/partner/callya/?b_id=1740&void=33333954&c_id=affl_cic_12331:fq0_D_nta_sta_per_&aid=202506242339192793328053X124747C1169137404TSNV00rg&affiliate=124747&VFAffID=12331&extProvId=315&extProvApi=129048&extPu=12331&extLi=124747&extPm=124747&extCr=137404'

    // Schritt 1: Tracking-Link öffnen
    window.open(trackingUrl, '_blank')

    // Schritt 2: Nach 1,5 Sekunden weiterleiten
    setTimeout(() => {
      window.location.href =
        'https://www.vodafone.de/freikarten/partner/callya/allnet-flat-l.html'
    }, 1500)
  }, [])

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#fdf7ee] text-[#003b5b] px-4 py-10 sm:py-16 text-center">
      <div className="space-y-5 sm:space-y-6 max-w-md w-full">
        <h1 className="text-xl sm:text-2xl font-semibold">🚀 Weiterleitung läuft...</h1>
        <p className="text-sm sm:text-base">
          Du wirst jetzt zum Vodafone-Angebot <strong>CallYa Allnet Flat L</strong> weitergeleitet.
        </p>
        <p className="text-sm sm:text-base">
          Sollte es nicht automatisch funktionieren,&nbsp;
          <a
            href="https://www.vodafone.de/freikarten/partner/callya/allnet-flat-l.html"
            className="text-blue-600 underline"
          >
            klicke hier
          </a>.
        </p>
      </div>
    </main>
  )
}
