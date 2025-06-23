'use client'

import { useState } from 'react'
import { supabase } from '@/utils/supabaseClient'
import Header from '../components/header'
import Footer from '../components/footer'

export default function ResetPasswordPage() {
  const [newPassword, setNewPassword] = useState('')
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  const handleReset = async () => {
    setError('')
    setSuccess('')

    const { error } = await supabase.auth.updateUser({ password: newPassword })

    if (error) {
      setError('Fehler beim Zurücksetzen des Passworts.')
    } else {
      setSuccess('Passwort wurde erfolgreich geändert.')
      setNewPassword('')
    }
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-[#f9fafa] text-[#003b5b] px-4 py-10">
        <div className="max-w-md mx-auto bg-[#d0f0f7] border border-blue-200 p-8 rounded-xl shadow space-y-6">
          <h1 className="text-2xl font-bold text-center">Passwort zurücksetzen</h1>

          <div>
            <label className="block text-sm font-medium">Neues Passwort</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full mt-1 p-2 border border-blue-300 rounded bg-white"
            />
          </div>

          {success && <p className="text-green-600 text-center">{success}</p>}
          {error && <p className="text-red-600 text-center">{error}</p>}

          <button
            onClick={handleReset}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded"
          >
            Passwort speichern
          </button>
        </div>
      </main>
      <Footer />
    </>
  )
}
