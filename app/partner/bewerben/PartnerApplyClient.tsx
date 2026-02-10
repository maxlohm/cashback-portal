'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/utils/supabaseClient'

type Props = {
  userId: string
  userEmail: string
}

export default function PartnerApplyClient({ userId, userEmail }: Props) {
  const [loading, setLoading] = useState(true)
  const [existingStatus, setExistingStatus] = useState<'pending' | 'approved' | 'rejected' | null>(null)

  const [name, setName] = useState('')
  const [platform, setPlatform] = useState('TikTok')
  const [profileUrl, setProfileUrl] = useState('')
  const [reach, setReach] = useState('')
  const [pitch, setPitch] = useState('')

  const [error, setError] = useState<string | null>(null)
  const [ok, setOk] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    let mounted = true

    const load = async () => {
      setLoading(true)
      setError(null)

      const { data, error } = await supabase
        .from('partner_applications')
        .select('status,name,platform,profile_url,reach,pitch')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (!mounted) return

      if (error) {
        setError('Konnte Bewerbungsstatus nicht laden.')
        setLoading(false)
        return
      }

      if (data?.status) {
        setExistingStatus(data.status)
        setName(data.name ?? '')
        setPlatform(data.platform ?? 'TikTok')
        setProfileUrl(data.profile_url ?? '')
        setReach(data.reach ?? '')
        setPitch(data.pitch ?? '')
      }

      setLoading(false)
    }

    load()
    return () => {
      mounted = false
    }
  }, [userId])

  const locked = existingStatus === 'pending' || existingStatus === 'approved'

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setOk(null)

    if (locked) return

    if (!name.trim()) return setError('Bitte Name angeben.')
    if (!profileUrl.trim()) return setError('Bitte Profil-URL angeben.')
    if (!pitch.trim()) return setError('Bitte kurz beschreiben, wie du Bonus-Nest bewerben willst.')

    setSubmitting(true)

    const { error } = await supabase.from('partner_applications').insert({
      user_id: userId,
      email: userEmail,
      name: name.trim(),
      platform,
      profile_url: profileUrl.trim(),
      reach: reach.trim() || null,
      pitch: pitch.trim(),
      status: 'pending',
    })

    if (error) {
      setSubmitting(false)
      setError('Bewerbung konnte nicht gespeichert werden. Wenn du schon beworben bist, warte auf die Prüfung.')
      return
    }

    setExistingStatus('pending')
    setOk('Bewerbung ist raus. Wir prüfen das und schalten dich frei.')
    setSubmitting(false)
  }

  return (
    <main className="min-h-screen bg-[#f7f3e6] text-[#003b5b] px-4 sm:px-6 py-10">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-semibold">Partner-Bewerbung</h1>

        {loading ? (
          <div className="mt-6 text-[#003b5b]/70">Lade…</div>
        ) : (
          <>
            {existingStatus === 'pending' && (
              <div className="mt-6 rounded-lg border border-[#d6c4a1] bg-[#F1E8CB] p-4">
                Status: <b>In Prüfung</b>
              </div>
            )}

            {error && (
              <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4 text-red-900">
                {error}
              </div>
            )}

            {ok && (
              <div className="mt-6 rounded-lg border border-green-200 bg-green-50 p-4 text-green-900">
                {ok}
              </div>
            )}

            <form onSubmit={onSubmit} className="mt-6 space-y-4">
              <div>
                <label className="block text-sm font-medium">Name</label>
                <input
                  className="mt-1 w-full rounded-lg border border-[#d6c4a1] bg-white px-3 py-2"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={locked || submitting}
                />
              </div>

              <div>
                <label className="block text-sm font-medium">Plattform</label>
                <select
                  className="mt-1 w-full rounded-lg border border-[#d6c4a1] bg-white px-3 py-2"
                  value={platform}
                  onChange={(e) => setPlatform(e.target.value)}
                  disabled={locked || submitting}
                >
                  <option>TikTok</option>
                  <option>Instagram</option>
                  <option>YouTube</option>
                  <option>Website</option>
                  <option>Sonstiges</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium">Profil-URL</label>
                <input
                  className="mt-1 w-full rounded-lg border border-[#d6c4a1] bg-white px-3 py-2"
                  value={profileUrl}
                  onChange={(e) => setProfileUrl(e.target.value)}
                  disabled={locked || submitting}
                />
              </div>

              <div>
                <label className="block text-sm font-medium">Reichweite (optional)</label>
                <input
                  className="mt-1 w-full rounded-lg border border-[#d6c4a1] bg-white px-3 py-2"
                  value={reach}
                  onChange={(e) => setReach(e.target.value)}
                  disabled={locked || submitting}
                />
              </div>

              <div>
                <label className="block text-sm font-medium">Wie willst du Bonus-Nest bewerben?</label>
                <textarea
                  className="mt-1 w-full rounded-lg border border-[#d6c4a1] bg-white px-3 py-2 min-h-[140px]"
                  value={pitch}
                  onChange={(e) => setPitch(e.target.value)}
                  disabled={locked || submitting}
                />
              </div>

              <button
                type="submit"
                disabled={locked || submitting}
                className="inline-flex items-center justify-center rounded-lg bg-yellow-500 px-5 py-3 font-semibold text-black hover:bg-yellow-600 transition disabled:opacity-60"
              >
                {submitting ? 'Sende…' : 'Bewerbung absenden'}
              </button>
            </form>
          </>
        )}
      </div>
    </main>
  )
}
