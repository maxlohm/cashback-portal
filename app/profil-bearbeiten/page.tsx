// app/profil-bearbeiten/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/utils/supabaseClient'

export default function ProfilBearbeitenPage() {
  const [email, setEmail] = useState('')
  const [vorname, setVorname] = useState('')
  const [nachname, setNachname] = useState('')
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')

  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    ;(async () => {
      const { data: uRes } = await supabase.auth.getUser()
      const user = uRes?.user
      if (!user) {
        window.location.href = '/login'
        return
      }

      // E-Mail aus Auth
      setEmail(user.email ?? '')

      // Namen aus profiles (PK = id)
      const { data: profile, error: profErr } = await supabase
        .from('profiles')
        .select('first_name, last_name')
        .eq('id', user.id)
        .maybeSingle()

      if (profErr) {
        console.error(profErr.message)
      } else {
        setVorname(profile?.first_name ?? '')
        setNachname(profile?.last_name ?? '')
      }
    })()
  }, [])

  const handleSave = async () => {
    setError('')
    setSuccess('')

    // Passwortwechsel nur, wenn altes Passwort angegeben wurde
    if (newPassword && !oldPassword) {
      setError('Bitte altes Passwort eingeben, um ein neues zu setzen.')
      return
    }

    const ops: Promise<any>[] = []
    ops.push(supabase.auth.updateUser({ email }))
    if (newPassword) ops.push(supabase.auth.updateUser({ password: newPassword }))

    const results = await Promise.all(ops)
    const hasErr = results.some(r => r?.error)

    if (hasErr) {
      console.error(results)
      setError('Fehler beim Speichern.')
      return
    }

    setSuccess('Änderungen erfolgreich gespeichert.')
    setNewPassword('')
    setOldPassword('')
    setTimeout(() => setSuccess(''), 2000)
  }

  return (
    <div className="min-h-screen bg-[#f0fbff] text-[#003b5b] px-4 sm:px-6 lg:px-8 py-10">
      <div className="max-w-2xl mx-auto bg-white border border-blue-200 p-6 sm:p-8 rounded-2xl shadow space-y-6">
        <h1 className="text-xl sm:text-2xl font-bold text-center">👤 Mein Profil</h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium">Vorname</label>
            <input
              type="text"
              value={vorname}
              disabled
              className="w-full mt-1 p-2 border border-blue-300 rounded bg-gray-100 text-gray-600 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Nachname</label>
            <input
              type="text"
              value={nachname}
              disabled
              className="w-full mt-1 p-2 border border-blue-300 rounded bg-gray-100 text-gray-600 text-sm"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium">E-Mail</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full mt-1 p-2 border border-blue-300 rounded bg-white text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Altes Passwort (Pflicht zur Bestätigung)</label>
          <input
            type="password"
            value={oldPassword}
            onChange={e => setOldPassword(e.target.value)}
            className="w-full mt-1 p-2 border border-blue-300 rounded bg-white text-sm"
            placeholder="••••••••"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Neues Passwort (optional)</label>
          <input
            type="password"
            value={newPassword}
            onChange={e => setNewPassword(e.target.value)}
            className="w-full mt-1 p-2 border border-blue-300 rounded bg-white text-sm"
            placeholder="••••••••"
          />
        </div>

        {success && <p className="text-green-600 text-center text-sm">{success}</p>}
        {error && <p className="text-red-600 text-center text-sm">{error}</p>}

        <button
          onClick={handleSave}
          className="w-full bg-[#003b5b] hover:bg-[#002a40] text-white py-2 rounded-xl font-medium text-sm"
        >
          Änderungen speichern
        </button>
      </div>
    </div>
  )
}
