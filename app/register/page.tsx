'use client'

import { useState } from 'react'
import { supabase } from '@/utils/supabaseClient'
import { useRouter } from 'next/navigation'
import Header from '../components/header'
import Footer from '../components/footer'

export default function RegisterPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [consent, setConsent] = useState(false)

  const handleRegister = async () => {
    setError(null)

    if (!username || !firstName || !lastName || !email || !password) {
      setError('Bitte fülle alle Felder aus.')
      return
    }

    if (!consent) {
      setError('Bitte stimme der Datenschutzerklärung zu.')
      return
    }

    const { error: signupError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username,
          firstName,
          lastName,
        },
      },
    })

    if (signupError) {
      setError('Registrierung fehlgeschlagen. E-Mail möglicherweise schon vergeben.')
    } else {
      router.push('/dashboard')
    }
  }

  return (
    <>
      <Header />
      <div className="min-h-screen flex items-center justify-center bg-[#f9fafa] text-[#003b5b] px-4 sm:px-6">
        <div className="w-full max-w-md bg-[#d0f0f7] p-6 sm:p-8 rounded-xl shadow-lg border border-blue-200">
          <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-center">✍️ Registrierung</h1>

          <input
            className="w-full border border-blue-300 bg-white px-4 py-2 rounded mb-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            type="text"
            placeholder="Benutzername *"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <input
            className="w-full border border-blue-300 bg-white px-4 py-2 rounded mb-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            type="text"
            placeholder="Vorname *"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
          />
          <input
            className="w-full border border-blue-300 bg-white px-4 py-2 rounded mb-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            type="text"
            placeholder="Nachname *"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
          />
          <input
            className="w-full border border-blue-300 bg-white px-4 py-2 rounded mb-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            type="email"
            placeholder="E-Mail *"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            className="w-full border border-blue-300 bg-white px-4 py-2 rounded mb-6 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
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

          <button
            className="w-full bg-[#003b5b] hover:bg-[#005b91] text-white py-2 rounded-lg font-medium transition"
            onClick={handleRegister}
          >
            Registrieren
          </button>

          {error && <p className="text-red-600 mt-3 text-sm text-center">{error}</p>}

          <p className="mt-6 text-sm text-center">
            Schon registriert?{' '}
            <a href="/login" className="text-blue-600 hover:underline">
              Zum Login
            </a>
          </p>
        </div>
      </div>
      <Footer />
    </>
  )
}
