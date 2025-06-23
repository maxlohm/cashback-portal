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
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

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
    <div className="max-w-sm mx-auto mt-20 p-6 border rounded-xl shadow-lg">
      <h1 className="text-2xl font-bold mb-6">🔐 Login</h1>

      <input
        className="w-full border p-2 rounded mb-4"
        type="email"
        placeholder="E-Mail"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      {!isResetting && (
        <input
          className="w-full border p-2 rounded mb-4"
          type="password"
          placeholder="Passwort"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      )}

      {!isResetting ? (
        <button
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
          onClick={handleLogin}
        >
          Einloggen
        </button>
      ) : (
        <button
          className="w-full bg-yellow-500 text-white py-2 rounded hover:bg-yellow-600"
          onClick={handlePasswordReset}
        >
          Passwort zurücksetzen
        </button>
      )}

      {error && <p className="text-red-600 mt-2">{error}</p>}
      {message && <p className="text-green-600 mt-2">{message}</p>}

      <p className="mt-4 text-sm text-center">
        <button
          className="text-blue-600 hover:underline"
          onClick={() => setIsResetting(!isResetting)}
        >
          {isResetting ? 'Zurück zum Login' : 'Passwort vergessen?'}
        </button>
      </p>

      <p className="mt-4 text-sm text-center">
        Noch kein Konto?{' '}
        <a href="/register" className="text-blue-600 hover:underline">
          Jetzt registrieren
        </a>
      </p>
    </div>
  )
}