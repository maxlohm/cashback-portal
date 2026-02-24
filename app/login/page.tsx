'use client'

import { useState } from 'react'
import { supabase } from '@/utils/supabaseClient'
import { useRouter, useSearchParams } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const sp = useSearchParams()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isResetting, setIsResetting] = useState(false)
  const [loading, setLoading] = useState(false)

  async function waitForSession(maxMs = 2500) {
    const start = Date.now()
    while (Date.now() - start < maxMs) {
      const { data } = await supabase.auth.getSession()
      if (data.session) return true
      await new Promise(r => setTimeout(r, 120))
    }
    return false
  }

  const getSafeNext = () => {
    const raw = sp?.get('next') ?? '/'
    // decode defensiv (falls encoded)
    let next = raw
    try {
      next = decodeURIComponent(raw)
    } catch {
      next = raw
    }

    // nur interne Pfade erlauben
    if (!next.startsWith('/')) return '/'
    // blocke protocol-relative //...
    if (next.startsWith('//')) return '/'
    // blocke encoded // (z.B. /%2F%2Fevil.com)
    const lowered = next.toLowerCase()
    if (lowered.includes('%2f%2f')) return '/'

    return next
  }

  const handleLogin = async () => {
    setError(null)
    setLoading(true)

    const { error: signInErr } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (signInErr) {
      const msg = signInErr.message?.toLowerCase() ?? ''
      if (msg.includes('invalid login credentials'))
        setError('E-Mail oder Passwort ist falsch.')
      else if (msg.includes('email not confirmed'))
        setError('Bitte bestätige zuerst deine E-Mail-Adresse.')
      else setError('Login fehlgeschlagen.')
      setLoading(false)
      return
    }

    // Cookie/Session sauber ankommen lassen
    await waitForSession()

    const safeNext = getSafeNext()
    router.replace(safeNext)

    // KEIN router.refresh() hier. Das macht in deinem Flow mehr kaputt als es hilft.
    setLoading(false)
  }

  const handlePasswordReset = async () => {
    setError(null)
    setLoading(true)
    try {
      const { error: resetErr } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${location.origin}/reset-password`,
      })
      if (resetErr) setError('Fehler beim Versenden der Zurücksetzungs-Mail.')
      else alert('E-Mail zum Zurücksetzen wurde gesendet.')
    } finally {
      setLoading(false)
    }
  }

  const nextForLinks = (() => {
    const n = sp?.get('next')
    return n ? `?next=${encodeURIComponent(n)}` : ''
  })()

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f7f3e6] px-4 sm:px-6 py-12">
      <div className="w-full max-w-sm bg-[#f1e8cc] rounded-xl shadow p-6 sm:p-8 space-y-4">
        <h1 className="text-xl sm:text-2xl font-bold text-center text-[#003b5b]">
          🔐 Login
        </h1>

        <input
          className="w-full border border-gray-300 p-2 rounded text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#003b5b]"
          type="email"
          placeholder="E-Mail"
          value={email}
          onChange={e => setEmail(e.target.value)}
          autoComplete="email"
        />

        {!isResetting && (
          <input
            className="w-full border border-gray-300 p-2 rounded text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#003b5b]"
            type="password"
            placeholder="Passwort"
            value={password}
            onChange={e => setPassword(e.target.value)}
            autoComplete="current-password"
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

        <div className="text-center">
          <button
            className="mt-2 text-[#003b5b] hover:underline text-sm"
            onClick={() => setIsResetting(!isResetting)}
            type="button"
          >
            {isResetting ? 'Zurück zum Login' : 'Passwort vergessen?'}
          </button>
        </div>

        <p className="text-center text-sm">
          Noch kein Konto?{' '}
          <a
            href={`/register${nextForLinks}`}
            className="text-[#003b5b] underline hover:text-[#005b91]"
          >
            Jetzt registrieren
          </a>
        </p>
      </div>
    </div>
  )
}