'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/utils/supabaseClient'

export default function EinloesenPage() {
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getUser()
      if (!data.user) {
        window.location.href = '/login'
      } else {
        setUser(data.user)
      }
    }

    checkUser()
  }, [])

  if (!user) return null

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">🎁 Prämie einlösen</h1>
      <p className="text-gray-700 mb-4">Hier kannst du dein Guthaben für Gutscheine einlösen.</p>
      {/* Weitere UI wie Auswahlfelder, Betrag etc. */}
    </div>
  )
}
