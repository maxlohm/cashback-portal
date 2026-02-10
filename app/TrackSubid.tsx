// app/TrackSubid.tsx
'use client'

import { useEffect } from 'react'
import { supabase } from '@/utils/supabaseClient'

export default function TrackSubid() {
  useEffect(() => {
    let mounted = true

    const callClaimRef = () => {
      const params = new URLSearchParams(window.location.search)
      const ref = params.get('ref')
      const url = ref ? `/api/claim-ref?ref=${encodeURIComponent(ref)}` : '/api/claim-ref'
      fetch(url, { method: 'POST' }).catch(() => {})
    }

    const run = async () => {
      // Session holen – wenn noch keine da ist, passiert der Call beim Auth-Event
      const { data } = await supabase.auth.getSession()
      if (!mounted) return
      if (data.session) callClaimRef()
    }

    run()

    // Wichtig für Email-Confirm/Login: Session kommt oft erst später
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return
      if (session) callClaimRef()
    })

    return () => {
      mounted = false
      sub?.subscription.unsubscribe()
    }
  }, [])

  return null
}
