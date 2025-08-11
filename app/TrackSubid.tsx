'use client'

import { useEffect } from 'react'

export default function TrackSubid() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const subid = params.get('subid')
    if (subid) {
      localStorage.setItem('ref_partner_id', subid)
    }
  }, [])

  return null
}
