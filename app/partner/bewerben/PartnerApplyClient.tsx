'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'

const PLATFORMS = [
  'TikTok',
  'Instagram',
  'YouTube',
  'Website/Blog',
  'WhatsApp/Telegram',
  'Sonstiges',
] as const

export default function PartnerApplyClient() {
  const [name, setName] = useState('')
  const [platform, setPlatform] = useState<(typeof PLATFORMS)[number]>('TikTok')
  const [profileUrl, setProfileUrl] = useState('')
  const [reach, setReach] = useState('')
  const [pitch, setPitch] = useState('')

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const canSubmit = useMemo(() => {
    const urlOk = profileUrl.trim().length >= 8
    const pitchOk = pitch.trim().length >= 20
    return urlOk && pitchOk && !loading
  }, [profileUrl, pitch, loading])

  const submit = async () => {
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const res = await fetch('/api/partner/apply', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          name,
          platform,
          profile_url: profileUrl,
          reach,
          pitch,
        }),
      })

      const j = await res.json().catch(() => null)

      if (!res.ok) {
        setError(j?.error ?? 'Fehler beim Absenden')
        setLoading(false)
        return
      }

      if (j?.status === 'exists') {
        setSuccess('Du hast bereits eine offene Bewerbung. Wir melden uns.')
      } else {
        setSuccess('Bewerbung eingereicht. Wir melden uns zeitnah.')
      }
    } catch (e: any) {
      setError(e?.message ?? 'Netzwerkfehler')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="rounded-2xl border bg-emerald-50 p-5">
        <div className="text-sm font-semibold text-emerald-900">
          ✅ {success}
        </div>
        <p className="mt-2 text-sm text-emerald-900/80">
          Du kannst jetzt zurück zu den Angeboten. Sobald wir dich freigeschaltet haben, erscheint dein Partner-Dashboard im Menü.
        </p>

        <div className="mt-4 flex flex-col sm:flex-row gap-3">
          <Link
            href="/"
            className="h-11 px-5 inline-flex items-center justify-center rounded-xl bg-[#003b5b] text-white font-semibold hover:opacity-90"
          >
            Zur Startseite
          </Link>
          <Link
            href="/partner"
            className="h-11 px-5 inline-flex items-center justify-center rounded-xl border bg-white font-semibold hover:bg-slate-50"
          >
            Zur Partner-Seite
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
      {/* Form */}
      <div className="lg:col-span-3">
        <div className="rounded-2xl border bg-white p-5 sm:p-6">
          <div className="text-sm font-semibold text-slate-900">
            Deine Angaben
          </div>
          <p className="mt-1 text-sm text-slate-600">
            Felder mit * sind Pflicht. Bitte echte Profil-URL angeben.
          </p>

          <div className="mt-5 space-y-4">
            <Field label="Name (optional)">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full h-11 rounded-xl border px-3"
                placeholder="Max Mustermann"
              />
            </Field>

            <Field label="Plattform *">
              <select
                value={platform}
                onChange={(e) => setPlatform(e.target.value as any)}
                className="w-full h-11 rounded-xl border px-3 bg-white"
              >
                {PLATFORMS.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Profil-URL *" hint="z. B. Instagram/TikTok/Website Link">
              <input
                value={profileUrl}
                onChange={(e) => setProfileUrl(e.target.value)}
                className="w-full h-11 rounded-xl border px-3"
                placeholder="https://www.instagram.com/..."
              />
              <InlineHint ok={profileUrl.trim().length >= 8}>
                Bitte eine gültige URL eintragen.
              </InlineHint>
            </Field>

            <Field label="Reichweite (optional)" hint="Follower, Abos oder Monatsbesucher">
              <input
                value={reach}
                onChange={(e) => setReach(e.target.value)}
                className="w-full h-11 rounded-xl border px-3"
                placeholder="10000"
              />
            </Field>

            <Field label="Pitch / Wie willst du bewerben? *" hint="Kurz & konkret: Content, Frequenz, Zielgruppe">
              <textarea
                value={pitch}
                onChange={(e) => setPitch(e.target.value)}
                className="w-full min-h-[140px] rounded-xl border px-3 py-2"
                placeholder="Ich poste 3x/Woche Deal-Videos, Schwerpunkt Finance/Shopping, Zielgruppe 18–30..."
              />
              <InlineHint ok={pitch.trim().length >= 10}>
                Mindestens 10 Zeichen
              </InlineHint>
            </Field>

            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                Fehler: {error}
              </div>
            )}

            <button
              onClick={submit}
              disabled={!canSubmit}
              className={[
                'w-full h-11 rounded-xl font-semibold text-white',
                'bg-[#ca4b24] hover:bg-[#a33d1e] transition',
                !canSubmit ? 'opacity-60 cursor-not-allowed' : '',
              ].join(' ')}
            >
              {loading ? 'Sende…' : 'Bewerbung absenden'}
            </button>

            <div className="text-xs text-slate-500">
              Zurück zur{' '}
              <Link href="/partner" className="underline">
                Partner-Seite
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="lg:col-span-2">
        <div className="rounded-2xl border bg-slate-50 p-5 sm:p-6">
          <div className="text-sm font-semibold text-slate-900">
            Was passiert danach?
          </div>

          <div className="mt-4 space-y-3">
            <Step n="1" title="Bewerbung prüfen" text="Wir schauen uns deine Angaben an." />
            <Step n="2" title="Freischaltung" text="Bei Zusage bekommst du Zugriff aufs Partner-Dashboard." />
            <Step n="3" title="Links kopieren" text="Du bekommst Landing- und Deal-Links, die sauber tracken." />
          </div>

          <div className="mt-5 rounded-xl border bg-white p-4 text-xs text-slate-600 space-y-2">
            <p>
              <b>Wichtig:</b> Bitte keine Fake-Reichweiten. Wir prüfen Profile stichprobenartig.
            </p>
            <p>
              Bei Fragen: <Link href="/support?type=Kooperationsanfrage" className="underline">Support</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

function Field({
  label,
  hint,
  children,
}: {
  label: string
  hint?: string
  children: React.ReactNode
}) {
  return (
    <div>
      <div className="text-sm font-semibold text-slate-700">{label}</div>
      {hint ? <div className="text-xs text-slate-500 mt-0.5">{hint}</div> : null}
      <div className="mt-2">{children}</div>
    </div>
  )
}

function InlineHint({ ok, children }: { ok: boolean; children: React.ReactNode }) {
  return (
    <div className={['mt-1 text-xs', ok ? 'text-slate-400' : 'text-amber-700'].join(' ')}>
      {children}
    </div>
  )
}

function Step({ n, title, text }: { n: string; title: string; text: string }) {
  return (
    <div className="rounded-xl border bg-white p-4">
      <div className="text-xs font-semibold text-[#ca4b24]">Schritt {n}</div>
      <div className="mt-1 font-semibold text-slate-900">{title}</div>
      <div className="mt-1 text-sm text-slate-600">{text}</div>
    </div>
  )
}