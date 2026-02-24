'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export default function GoToOfferButton({
  offerId,
  refId,
}: {
  offerId: string
  refId?: string | null
}) {
  const router = useRouter()
  const supabase = useMemo(() => createClientComponentClient(), [])
  const [busy, setBusy] = useState(false)

  const go = async () => {
    if (busy) return
    setBusy(true)
    try {
      // ✅ Hier ist die einzige Wahrheit: /r trackt, und ref wird mitgegeben
      const next = `/r/${offerId}${refId ? `?ref=${encodeURIComponent(refId)}` : ''}`

      const { data } = await supabase.auth.getSession()
      if (!data.session) {
        // Login erzwingen und danach genau da weiter machen
        router.push(`/login?next=${encodeURIComponent(next)}`)
        return
      }

      window.open(next, '_blank', 'noopener,noreferrer')
    } finally {
      setBusy(false)
    }
  }

  return (
    <button
      onClick={go}
      disabled={busy}
      className="inline-flex h-10 items-center justify-center rounded-lg bg-[#ca4b24] px-5 text-white font-medium hover:bg-[#a33d1e] transition disabled:opacity-60"
    >
      {busy ? 'Öffne…' : 'Zum Angebot'}
    </button>
  )
}