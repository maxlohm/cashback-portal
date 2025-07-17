'use client'

import { useState } from 'react'
import { supabase } from '@/utils/supabaseClient'
import { useRouter } from 'next/navigation'

export default function RegisterPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [consent, setConsent] = useState(false)
  const [policyConsent, setPolicyConsent] = useState(false)

  const validatePassword = (pw: string) => {
    const pattern = /^(?=.*[A-Z])(?=.*\d).{8,}$/
    return pattern.test(pw)
  }

  const handleRegister = async () => {
    setError(null)
    setSuccess(null)

    if (!username || !firstName || !lastName || !email || !password) {
      setError('Bitte fülle alle Felder aus.')
      return
    }

    if (!validatePassword(password)) {
      setError('Passwort muss mindestens 8 Zeichen lang sein, eine Zahl und einen Großbuchstaben enthalten.')
      return
    }

    if (!consent) {
      setError('Bitte akzeptiere die Datenschutzbestimmungen und AGB.')
      return
    }

    if (!policyConsent) {
      setError('Bitte bestätige, dass du nur ein Konto nutzt.')
      return
    }

    // Prüfen, ob Benutzername oder E-Mail schon vorhanden ist
    const { data: existingUsers, error: fetchError } = await supabase
      .from('profiles')
      .select('id')
      .or(`username.eq.${username},email.eq.${email}`)

    if (fetchError) {
      setError('Fehler beim Prüfen bestehender Benutzer.')
      return
    }

    if (existingUsers && existingUsers.length > 0) {
      setError('Benutzername oder E-Mail ist bereits registriert.')
      return
    }

    // Registrierung mit Supabase Auth
    const { error: signupError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username,
          firstName,
          lastName,
        },
        // Optional: automatische Weiterleitung nach Bestätigung
        // emailRedirectTo: 'https://bonus-nest.de/dashboard'
      },
    })

    if (signupError) {
      setError('Registrierung fehlgeschlagen. Bitte versuche es erneut.')
      return
    }

    setSuccess('✅ Registrierung erfolgreich! Bitte bestätige deine E-Mail-Adresse über den Link in deinem Posteingang.')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f7f3e6] text-[#003b5b] px-4 sm:px-6">
      <div className="w-full max-w-md bg-[#f1e8cc] p-6 sm:p-8 rounded-xl shadow-lg">
        <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-center">✍️ Registrierung</h1>

        <input
          className="w-full border border-gray-300 bg-white px-4 py-2 rounded mb-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#003b5b]"
          type="text"
          placeholder="Benutzername *"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          className="w-full border border-gray-300 bg-white px-4 py-2 rounded mb-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#003b5b]"
          type="text"
          placeholder="Vorname *"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
        />
        <input
          className="w-full border border-gray-300 bg-white px-4 py-2 rounded mb-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#003b5b]"
          type="text"
          placeholder="Nachname *"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
        />
        <input
          className="w-full border border-gray-300 bg-white px-4 py-2 rounded mb-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#003b5b]"
          type="email"
          placeholder="E-Mail *"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          className="w-full border border-gray-300 bg-white px-4 py-2 rounded mb-6 text-sm focus:outline-none focus:ring-2 focus:ring-[#003b5b]"
          type="password"
          placeholder="Passwort *"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <label className="flex items-start text-sm mb-4">
          <input
            type="checkbox"
            checked={consent}
            onChange={(e) => setConsent(e.target.checked)}
            className="mt-1 mr-2 accent-[#003b5b]"
          />
          <span>
            Ich akzeptiere die{' '}
            <a href="/agb" className="underline text-blue-600">Nutzungsbedingungen</a>{' '}
            und die{' '}
            <a href="/datenschutz" className="underline text-blue-600">Datenschutzbestimmungen</a>.
          </span>
        </label>

        <label className="flex items-start text-sm mb-4 bg-orange-50 border border-orange-300 p-3 rounded-md">
          <input
            type="checkbox"
            checked={policyConsent}
            onChange={(e) => setPolicyConsent(e.target.checked)}
            className="mt-1 mr-2 accent-[#003b5b]"
          />
          <span>
            <strong className="text-orange-700">⚠️ Achtung:</strong> Mehrere Konten pro Person sind nicht erlaubt. Bei Verstoß können alle Accounts gesperrt und Prämien storniert werden.
          </span>
        </label>

        <button
          className="w-full bg-[#003b5b] hover:bg-[#005b91] text-white py-2 rounded-lg font-medium transition"
          onClick={handleRegister}
        >
          Registrieren
        </button>

        {error && <p className="text-red-600 mt-3 text-sm text-center">{error}</p>}
        {success && <p className="text-green-700 mt-3 text-sm text-center">{success}</p>}

        <p className="mt-6 text-sm text-center">
          Schon registriert?{' '}
          <a href="/login" className="text-blue-600 hover:underline">
            Zum Login
          </a>
        </p>
      </div>
    </div>
  )
}
