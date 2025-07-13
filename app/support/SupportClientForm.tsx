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
          {/* ... deine Felder (wie gehabt) ... */}
        </form>
      </main>
    </div>
  )
}
