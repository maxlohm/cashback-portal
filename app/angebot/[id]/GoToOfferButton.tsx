// app/angebot/[id]/GoToOfferButton.tsx
'use client'

import { useMemo, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

type Props = {
  offerId: string
  refId?: string | null
}

export default function GoToOfferButton({ offerId, refId }: Props) {
  const router = useRouter()
  const supabase = useMemo(() => createClientComponentClient(), [])
  const [busy, setBusy] = useState(false)

  const go = useCallback(async () => {
    if (busy) return
    setBusy(true)

    try {
      // /r trackt, ref wird mitgegeben (canonical partners.id)
      const next = `/r/${offerId}${refId ? `?ref=${encodeURIComponent(refId)}` : ''}`

      const { data, error } = await supabase.auth.getSession()
      if (error) {
        // Bei Session-Fehlern lieber direkt zur Login-Seite mit next.
        router.push(`/login?next=${encodeURIComponent(next)}`)
        return
      }

      if (!data.session) {
        router.push(`/login?next=${encodeURIComponent(next)}`)
        return
      }

      // iOS Safari: Pop-ups vermeiden -> gleicher Tab
      // router.push geht, aber location.href ist am robustesten für Redirect-Chains
      window.location.href = next
    } finally {
      setBusy(false)
    }
  }, [busy, offerId, refId, router, supabase])

  return (
    <button
      type="button"
      onClick={go}
      disabled={busy}
      className="inline-flex h-10 items-center justify-center rounded-lg bg-[#ca4b24] px-5 text-white font-medium hover:bg-[#a33d1e] transition disabled:opacity-60"
    >
      {busy ? 'Öffne…' : 'Zum Angebot'}
    </button>
  )
}