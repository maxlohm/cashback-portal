'use client'

import { useState } from 'react'
import { supabase } from '@/utils/supabaseClient'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [isResetting, setIsResetting] = useState(false)

  const handleLogin = async () => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError('Login fehlgeschlagen. Bitte prüfe deine Eingaben.')
    } else {
      router.push('/dashboard')
    }
  }

  const handlePasswordReset = async () => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${location.origin}/reset-password`,
    })

    if (error) {
      setError('Fehler beim Versenden der Zurücksetzungs-Mail.')
    } else {
      setMessage('E-Mail zum Zurücksetzen des Passworts wurde gesendet.')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f9fafa] px-4 sm:px-6 py-12">
      <div className="w-full max-w-sm bg-white border border-blue-100 rounded-xl shadow-lg p-6 sm:p-8 space-y-4">
        <h1 className="text-xl sm:text-2xl font-bold text-center text-[#003b5b]">🔐 Login</h1>

        <input
          className="w-full border border-blue-300 p-2 rounded text-sm"
          type="email"
          placeholder="E-Mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        {!isResetting && (
          <input
            className="w-full border border-blue-300 p-2 rounded text-sm"
            type="password"
            placeholder="Passwort"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        )}

        {!isResetting ? (
          <button
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 text-sm font-medium"
            onClick={handleLogin}
          >
            Einloggen
          </button>
        ) : (
          <button
            className="w-full bg-yellow-500 text-white py-2 rounded hover:bg-yellow-600 text-sm font-medium"
            onClick={handlePasswordReset}
          >
            Passwort zurücksetzen
          </button>
        )}

        {error && <p className="text-red-600 text-sm">{error}</p>}
        {message && <p className="text-green-600 text-sm">{message}</p>}

        <div className="text-center">
          <button
            className="mt-2 text-blue-600 hover:underline text-sm"
            onClick={() => setIsResetting(!isResetting)}
          >
            {isResetting ? 'Zurück zum Login' : 'Passwort vergessen?'}
          </button>
        </div>

        <p className="text-center text-sm">
          Noch kein Konto?{' '}
          <a href="/register" className="text-blue-600 hover:underline">
            Jetzt registrieren
          </a>
        </p>
      </div>
    </div>
  )
}
