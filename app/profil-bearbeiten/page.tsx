'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/utils/supabaseClient'
import Header from '../components/header'
import Footer from '../components/footer'

export default function ProfilBearbeitenPage() {
  const [user, setUser] = useState<any>(null)
  const [email, setEmail] = useState('')
  const [vorname, setVorname] = useState('')
  const [nachname, setNachname] = useState('')
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchUser = async () => {
      const { data, error } = await supabase.auth.getUser()
      if (data?.user) {
        setUser(data.user)
        setEmail(data.user.email || '')

        const { data: profile } = await supabase
          .from('profiles')
          .select('vorname, nachname')
          .eq('id', data.user.id)
          .single()

        if (profile) {
          setVorname(profile.vorname || '')
          setNachname(profile.nachname || '')
        }
      } else {
        window.location.href = '/login'
      }
    }
    fetchUser()
  }, [])

  const handleSave = async () => {
    setError('')
    setSuccess('')

    if (newPassword && !oldPassword) {
      setError('Bitte altes Passwort eingeben, um ein neues zu setzen.')
      return
    }

    const emailUpdate = await supabase.auth.updateUser({ email })
    const passwordUpdate = newPassword ? await supabase.auth.updateUser({ password: newPassword }) : null

    if (emailUpdate.error || passwordUpdate?.error) {
      setError('Fehler beim Speichern.')
    } else {
      setSuccess('Änderungen erfolgreich gespeichert.')
      setNewPassword('')
      setOldPassword('')
    }
  }

  return (
    <>
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
              onChange={(e) => setEmail(e.target.value)}
              className="w-full mt-1 p-2 border border-blue-300 rounded bg-white text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Altes Passwort (Pflicht zur Bestätigung)</label>
            <input
              type="password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              className="w-full mt-1 p-2 border border-blue-300 rounded bg-white text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Neues Passwort (optional)</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full mt-1 p-2 border border-blue-300 rounded bg-white text-sm"
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
    </>
  )
}
