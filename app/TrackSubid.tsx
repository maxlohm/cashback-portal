'use client'

import { useEffect } from 'react'

export default function TrackSubid() {
  useEffect(() => {
    // nur im Browser & pro Sitzung genau einmal
    if (typeof window === 'undefined') return
    const KEY = 'bn_claim_ref_done'
    if (sessionStorage.getItem(KEY) === '1') return
    sessionStorage.setItem(KEY, '1')

    fetch('/api/claim-ref', { method: 'POST' }).catch(() => {
      // still – wir wollen hier nie UI-Fehler
    })
  }, [])

  return null
}
