'use client'

import { useEffect, useState, ChangeEvent, FormEvent } from 'react'
import { useSearchParams } from 'next/navigation'
import { supabase } from '@/utils/supabaseClient'

export default function SupportClientForm() {
  const [formData, setFormData] = useState({
    requestType: 'Sonstiges',
    email: '',
    firstName: '',
    lastName: '',
    subject: '',
    message: '',
    consent: false,
  })

  const [errors, setErrors] = useState<{ consent?: string }>({})
  const [loggedIn, setLoggedIn] = useState(false)
  const searchParams = useSearchParams()

  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser()
      const user = data?.user
      if (user) {
        setLoggedIn(true)
        const fullName = user.user_metadata?.full_name || ''
        const [first, ...last] = fullName.split(' ')
        setFormData((prev) => ({
          ...prev,
          email: user.email || '',
          firstName: first || '',
          lastName: last?.join(' ') || '',
        }))
      }
    }
    fetchUser()
  }, [])

  useEffect(() => {
    const requestedType = searchParams.get('type')
    if (requestedType) {
      setFormData((prev) => ({
        ...prev,
        requestType: requestedType,
      }))
    }
  }, [searchParams])

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const target = e.target
    const name = target.name
    const value = target.value
    const isCheckbox = target instanceof HTMLInputElement && target.type === 'checkbox'
    const checked = isCheckbox ? target.checked : undefined
    setFormData((prev) => ({
      ...prev,
      [name]: isCheckbox ? checked : value,
    }))
    if (name === 'consent') {
      setErrors((prev) => ({ ...prev, consent: '' }))
    }
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!formData.consent) {
      setErrors({ consent: 'Bitte akzeptiere die Datenschutzerklärung.' })
      return
    }

    try {
      const res = await fetch('/api/send-support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const result = await res.json()

      if (result.success) {
        alert('Vielen Dank! Deine Supportanfrage wurde gesendet.')
        setFormData({
          requestType: 'Sonstiges',
          email: '',
          firstName: '',
          lastName: '',
          subject: '',
          message: '',
          consent: false,
        })
        setLoggedIn(false)
      } else {
        console.error(result.error)
        alert('Fehler beim Senden der Anfrage. Bitte versuche es später erneut.')
      }
    } catch (error) {
      console.error(error)
      alert('Ein unerwarteter Fehler ist aufgetreten.')
    }
  }

  return (
    <div className="min-h-screen bg-[#f7f3e6] py-10 px-4">
      <main className="max-w-2xl mx-auto text-[#003b5b] bg-[#f1e8cc] p-6 rounded-xl shadow-md">
        <h1 className="text-2xl font-bold text-center mb-8">📬 Neue Supportanfrage</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <select
            name="requestType"
            value={formData.requestType}
            onChange={handleChange}
            className="w-full border rounded px-4 py-2 bg-white"
          >
            <option>Sonstiges</option>
            <option>Technisches Problem</option>
            <option>Prämienfrage</option>
            <option>Account / Login</option>
            <option>Kooperationsanfrage</option>
          </select>

          <input
            type="email"
            name="email"
            placeholder={loggedIn ? '' : 'Trage deine E-Mail hier ein *'}
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full border rounded px-4 py-2 bg-white"
          />

          <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-4 sm:space-y-0">
            <input
              type="text"
              name="firstName"
              placeholder="Vorname *"
              value={formData.firstName}
              onChange={handleChange}
              required
              className="w-full border rounded px-4 py-2 bg-white"
            />
            <input
              type="text"
              name="lastName"
              placeholder="Nachname *"
              value={formData.lastName}
              onChange={handleChange}
              required
              className="w-full border rounded px-4 py-2 bg-white"
            />
          </div>

          <input
            type="text"
            name="subject"
            placeholder="Betreff *"
            value={formData.subject}
            onChange={handleChange}
            required
            className="w-full border rounded px-4 py-2 bg-white"
          />

          <textarea
            name="message"
            placeholder="Nachricht *"
            value={formData.message}
            onChange={handleChange}
            required
            className="w-full border rounded px-4 py-2 bg-white h-32"
          />

          <div className="space-y-2 text-sm">
            <label className="flex items-start space-x-2">
              <input
                type="checkbox"
                name="consent"
                checked={formData.consent}
                onChange={handleChange}
                className="mt-1 accent-[#003b5b]"
              />
              <span>
                Ich akzeptiere die{' '}
                <a
                  href="/datenschutz"
                  className="underline text-blue-600"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Datenschutzerklärung
                </a>{' '}
                und stimme der elektronischen Verarbeitung meiner Angaben zur Bearbeitung der Anfrage zu.
              </span>
            </label>
            {errors.consent && <p className="text-red-600">{errors.consent}</p>}
          </div>

          <button
            type="submit"
            disabled={!formData.consent}
            className={`w-full bg-[#003b5b] hover:bg-[#005b91] text-white py-2 rounded-lg font-medium transition ${
              !formData.consent ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            Anfrage absenden
          </button>
        </form>
      </main>
    </div>
  )
}