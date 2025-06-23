'use client'

import Header from '../components/header'
import Footer from '../components/footer'
import { useState, ChangeEvent, FormEvent } from 'react'

export default function SupportPage() {
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

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const target = e.target
    const name = target.name as keyof typeof formData
    const value = target.type === 'checkbox' ? (target as HTMLInputElement).checked : target.value

    setFormData({
      ...formData,
      [name]: value,
    })

    if (name === 'consent') setErrors({ ...errors, consent: '' })
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()

    if (!formData.consent) {
      setErrors({ consent: 'Bitte akzeptiere die Datenschutzerklärung.' })
      return
    }

    console.log('Support-Anfrage gesendet:', formData)
    alert('Vielen Dank! Deine Supportanfrage wurde gesendet.')
  }

  return (
    <>
      <Header />
      <main className="max-w-2xl mx-auto p-6 text-gray-800">
        <h1 className="text-2xl font-bold text-center mb-8">Neue Supportanfrage</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <select
            name="requestType"
            value={formData.requestType}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded px-4 py-2"
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
            placeholder="E-Mail"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded px-4 py-2"
          />

          <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-4 sm:space-y-0">
            <input
              type="text"
              name="firstName"
              placeholder="Vorname"
              value={formData.firstName}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded px-4 py-2"
            />
            <input
              type="text"
              name="lastName"
              placeholder="Nachname"
              value={formData.lastName}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded px-4 py-2"
            />
          </div>

          <input
            type="text"
            name="subject"
            placeholder="Betreff"
            value={formData.subject}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded px-4 py-2"
          />

          <textarea
            name="message"
            placeholder="Nachricht"
            value={formData.message}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded px-4 py-2 h-32"
          />

          <div className="space-y-2">
            <label className="flex items-start space-x-2 text-sm">
              <input
                type="checkbox"
                name="consent"
                checked={formData.consent}
                onChange={handleChange}
                className="mt-1"
              />
              <span>
                Ich habe die{' '}
                <a
                  href="/datenschutz"
                  className="underline text-blue-600"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Datenschutzerklärung
                </a>{' '}
                zur Kenntnis genommen und stimme zu, dass meine Angaben zur Beantwortung meiner Anfrage elektronisch
                verarbeitet werden dürfen.
              </span>
            </label>
            {errors.consent && <p className="text-sm text-red-600">{errors.consent}</p>}
          </div>

          <button
            type="submit"
            disabled={!formData.consent}
            className={`w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded transition ${
              !formData.consent ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            Anfrage absenden
          </button>
        </form>
      </main>
      <Footer />
    </>
  )
}
