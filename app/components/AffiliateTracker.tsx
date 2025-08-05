'use client'
import { useEffect } from 'react'

export default function AffiliateTracker() {
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search)
    const partnerId = searchParams.get('ref')

    if (partnerId) {
      localStorage.setItem('partner_id', partnerId)

      const expiresAt = new Date()
      expiresAt.setDate(expiresAt.getDate() + 30)
      localStorage.setItem('partner_id_expires', expiresAt.toISOString())
    }
  }, [])

  return null
}
