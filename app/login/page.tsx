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
  const [loading, setLoading] = useState(false)

  const handleLogin = async () => {
    setError(null); setMessage(null); setLoading(true)
    try {
      const { error: signInErr } = await supabase.auth.signInWithPassword({ email, password })
      if (signInErr) {
        // Häufige Fälle klar anzeigen
        if (signInErr.message?.toLowerCase().includes('email not confirmed')) {
          setError('Bitte bestätige zuerst deine E-Mail. Prüfe deinen Posteingang.')
        } else if (signInErr.message?.toLowerCase().includes('invalid login credentials')) {
          setError('E-Mail oder Passwort ist falsch.')
        } else {
          setError('Login fehlgeschlagen. Bitte Eingaben prüfen.')
        }
        return
      }

      // Session/User laden
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        // Optionale Partner-Attribution aus localStorage übernehmen
        const refPartnerId = localStorage.getItem('ref_partner_id')
        if (refPartnerId) {
          // Profile aktualisieren (nur wenn leer)
          await supabase
            .from('profiles')
            .update({ partner_id: refPartnerId })
            .eq('id', user.id)
            .is('partner_id', null) // nur wenn noch nicht gesetzt
        }
      }

      router.replace('/') // oder '/dashboard'
    } catch (e) {
      setError('Unerwarteter Fehler beim Login.')
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordReset = async () => {
    setError(null); setMessage(null); setLoading(true)
    try {
      const { error: resetErr } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${location.origin}/reset-password`,
      })
      if (resetErr) {
        setError('Fehler beim Versenden der Zurücksetzungs-Mail.')
        return
      }
      setMessage('E-Mail zum Zurücksetzen des Passworts wurde gesendet.')
    } catch {
      setError('Unerwarteter Fehler beim Zurücksetzen.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f7f3e6] px-4 sm:px-6 py-12">
      <div className="w-full max-w-sm bg-[#f1e8cc] rounded-xl shadow p-6 sm:p-8 space-y-4">
        <h1 className="text-xl sm:text-2xl font-bold text-center text-[#003b5b]">🔐 Login</h1>

        <input
          className="w-full border border-gray-300 p-2 rounded text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#003b5b]"
          type="email"
          placeholder="E-Mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        {!isResetting && (
          <input
            className="w-full border border-gray-300 p-2 rounded text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#003b5b]"
            type="password"
            placeholder="Passwort"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        )}

        {!isResetting ? (
          <button
            className="w-full bg-[#003b5b] text-white py-2 rounded hover:bg-[#005b91] text-sm font-medium transition disabled:opacity-60"
            onClick={handleLogin}
            disabled={loading}
          >
            {loading ? 'Wird eingeloggt…' : 'Einloggen'}
          </button>
        ) : (
          <button
            className="w-full bg-yellow-500 text-white py-2 rounded hover:bg-yellow-600 text-sm font-medium transition disabled:opacity-60"
            onClick={handlePasswordReset}
            disabled={loading || !email}
          >
            Passwort zurücksetzen
          </button>
        )}

        {error && <p className="text-red-600 text-sm text-center">{error}</p>}
        {message && <p className="text-green-600 text-sm text-center">{message}</p>}

        <div className="text-center">
          <button
            className="mt-2 text-[#003b5b] hover:underline text-sm"
            onClick={() => setIsResetting(!isResetting)}
          >
            {isResetting ? 'Zurück zum Login' : 'Passwort vergessen?'}
          </button>
        </div>

        <p className="text-center text-sm">
          Noch kein Konto?{' '}
          <a href="/register" className="text-[#003b5b] underline hover:text-[#005b91]">
            Jetzt registrieren
          </a>
        </p>
      </div>
    </div>
  )
}
