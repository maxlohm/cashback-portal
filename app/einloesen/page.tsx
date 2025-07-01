'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/utils/supabaseClient'
import Header from '../components/header'
import Footer from '../components/footer'

export default function EinloesenPage() {
  const [selectedOption, setSelectedOption] = useState<'amazon' | 'paypal' | null>(null)
  const [amount, setAmount] = useState<string>('')
  const [maxAmount, setMaxAmount] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    const fetchGuthaben = async () => {
      const { data: userData } = await supabase.auth.getUser()
      if (!userData?.user) {
        window.location.href = '/login'
        return
      }
      const userId = userData.user.id

      const { data: clicks } = await supabase
        .from('clicks')
        .select('*')
        .eq('user_id', userId)
        .eq('redeemed', false)
        .eq('confirmed', true)

      if (clicks) {
        const rewards = clicks.map((c) => {
          const offer = offers.find((o) => o.id === c.offer_id)
          return offer?.reward || 0
        })
        const total = rewards.reduce((sum, r) => sum + r, 0)
        setMaxAmount(total)
      }
    }

    fetchGuthaben()
  }, [])

  const handleRedeem = async () => {
    const numericAmount = parseFloat(amount)
    if (isNaN(numericAmount) || numericAmount <= 0) {
      setError('Bitte gib einen gültigen Betrag ein.')
      return
    }

    if (numericAmount > maxAmount) {
      setError('Nicht genügend Guthaben.')
      return
    }

    setError(null)

    const { data: userData } = await supabase.auth.getUser()
    if (!userData?.user) {
      setError('Du musst eingeloggt sein.')
      return
    }

    if (selectedOption === 'amazon') {
      const res = await fetch('/api/redeem-gift-card', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          utid: 'U591998',
          value: numericAmount,
          user_id: userData.user.id,
          email: userData.user.email,
        }),
      })

      const data = await res.json()
      if (!res.ok || !data.success) {
        setError(data.error?.message || 'Einlösungsfehler.')
        return
      }

      setSuccess(true)
      setAmount('')
      setMaxAmount(maxAmount - numericAmount)
    } else if (selectedOption === 'paypal') {
      const userId = userData.user.id

      const { data: clicks } = await supabase
        .from('clicks')
        .select('*')
        .eq('user_id', userId)
        .eq('redeemed', false)
        .eq('confirmed', true)

      let sum = 0
      const toRedeem = []

      for (const click of clicks || []) {
        const offer = offers.find((o) => o.id === click.offer_id)
        if (offer && sum + offer.reward <= numericAmount) {
          sum += offer.reward
          toRedeem.push(click.id)
        }
      }

      const { error: updateError } = await supabase
        .from('clicks')
        .update({ redeemed: true })
        .in('id', toRedeem)

      if (updateError) {
        setError('Fehler bei der PayPal-Auszahlung.')
      } else {
        setSuccess(true)
        setAmount('')
        setMaxAmount(maxAmount - sum)
      }
    }
  }

  return (
    <>   
      <div className="max-w-3xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6 text-[#003b5b]">
        <h1 className="text-2xl sm:text-3xl font-bold text-center sm:text-left">🎁 Prämie einlösen</h1>
        <p className="text-sm sm:text-base text-center sm:text-left">
          Du hast aktuell <strong>{maxAmount.toFixed(2)} €</strong> bestätigtes Guthaben.
        </p>

        <div className="bg-[#d0f0f7] rounded-xl p-6 shadow space-y-6">
          <h2 className="text-lg sm:text-xl font-semibold">1️⃣ Partner auswählen</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div
              onClick={() => setSelectedOption('amazon')}
              className={`p-4 rounded-lg cursor-pointer border transition ${
                selectedOption === 'amazon' ? 'border-green-600 bg-white' : 'border-blue-200 bg-white'
              }`}
            >
              <h3 className="font-bold">🎯 Amazon-Gutschein</h3>
              <p className="text-sm text-gray-600">Einlösbar ab 5 €</p>
            </div>
            <div
              onClick={() => setSelectedOption('paypal')}
              className={`p-4 rounded-lg cursor-pointer border transition ${
                selectedOption === 'paypal' ? 'border-green-600 bg-white' : 'border-blue-200 bg-white'
              }`}
            >
              <h3 className="font-bold">🏦 PayPal-Auszahlung</h3>
              <p className="text-sm text-gray-600">Einlösbar ab 10 €</p>
            </div>
          </div>

          {selectedOption && (
            <>
              <h2 className="text-lg sm:text-xl font-semibold mt-4">2️⃣ Betrag wählen</h2>
              <input
                type="number"
                placeholder="z. B. 5"
                min={selectedOption === 'paypal' ? 10 : 5}
                max={maxAmount}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full p-2 rounded border border-blue-300 bg-white text-black"
              />

              {error && <p className="text-red-600 text-sm">{error}</p>}
              {success && (
                <p className="text-green-600 font-semibold text-sm mt-2">
                  ✅ Deine Anfrage wurde gespeichert. Die Prämienausgabe erfolgt bald.
                </p>
              )}

              <button
                onClick={handleRedeem}
                className="mt-4 bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded w-full sm:w-auto"
              >
                Prämie einlösen
              </button>
            </>
          )}
        </div>
      </div>  
    </>
  )
}

const offers = [
  { id: 'trade-republic', reward: 15 },
  { id: 'o2', reward: 10 },
]
