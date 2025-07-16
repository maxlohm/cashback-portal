'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/utils/supabaseClient'
import Link from 'next/link'

export default function EinloesenPage() {
  const [amount, setAmount] = useState('')
  const [maxAmount, setMaxAmount] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [brands, setBrands] = useState<any[]>([])
  const [selectedSku, setSelectedSku] = useState('')

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
        const rewards = clicks.map((c) => (c.amount || 0))
        const total = rewards.reduce((sum, r) => sum + r, 0)
        setMaxAmount(total)
      }
    }

    const fetchCatalogs = async () => {
      try {
        const res = await fetch('/api/catalogs')
        const json = await res.json()

        const filtered = json.choiceProducts?.filter((p: any) =>
          p.countries?.includes('DE') && p.status === 'active'
        ).map((p: any) => ({
          brandName: p.rewardName,
          sku: p.utid,
          image: p.imageUrl || '/logo.png',
          minValue: p.minValue || 500,
        })) || []

        setBrands(filtered)
      } catch (e) {
        console.error('Fehler beim Laden der Gutscheine:', e)
        setBrands([])
        setError('Fehler beim Laden der Gutscheine.')
      }
    }

    fetchGuthaben()
    fetchCatalogs()
  }, [])

  const handleRedeem = async () => {
    const numericAmount = parseFloat(amount)
    if (!selectedSku) {
      setError('Bitte wähle einen Gutschein.')
      return
    }
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

    const res = await fetch('/api/redeem-gift-card', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sku: selectedSku,
        value: numericAmount,
        user_id: userData.user.id,
        email: userData.user.email,
      }),
    })
    const result = await res.json()

    if (!res.ok || !result.success) {
      setError(result?.error?.message || 'Einlösungsfehler.')
      return
    }

    setSuccess(true)
    setAmount('')
    setMaxAmount(maxAmount - numericAmount)
  }

  return (
    <div className="min-h-screen bg-[#f7f3e6] text-[#003b5b] px-4 py-10">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold">🎁 Prämie einlösen</h1>
          <p className="text-lg mt-2">
            Dein bestätigtes Guthaben:{' '}
            <span className="font-bold text-green-700">
              {maxAmount.toFixed(2)} €
            </span>
          </p>
        </div>

        <div className="bg-[#f1e8cc] border border-[#d6c4a1] rounded-xl shadow p-6 space-y-6">
          <h2 className="text-xl font-semibold">🔢 Gutschein auswählen</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {brands.map((brand) => (
              <button
                key={brand.sku}
                onClick={() => setSelectedSku(brand.sku)}
                className={`p-2 rounded border transition text-center bg-white hover:border-green-600 ${
                  selectedSku === brand.sku ? 'border-green-700' : 'border-[#d6c4a1]'
                }`}
              >
                <img
                  src={brand.image}
                  alt={brand.brandName}
                  className="mx-auto h-16 object-contain"
                />
                <p className="text-sm mt-2 font-semibold">{brand.brandName}</p>
                {brand.minValue && (
                  <p className="text-xs text-gray-500">
                    ab {(brand.minValue / 100).toFixed(2)} €
                  </p>
                )}
              </button>
            ))}
          </div>

          <h2 className="text-xl font-semibold">🔣 Betrag angeben</h2>
          <input
            type="number"
            placeholder="z. B. 5"
            min={5}
            max={maxAmount}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full p-3 rounded border border-[#d6c4a1] bg-white text-black"
          />

          {error && <p className="text-red-600 text-sm">{error}</p>}
          {success && (
            <p className="text-green-600 font-semibold text-sm mt-2">
              ✅ Anfrage erfolgreich! Deine Prämie wird bald ausgezahlt.
            </p>
          )}

          <button
            onClick={handleRedeem}
            disabled={maxAmount < 5}
            className="mt-4 bg-green-700 hover:bg-green-800 text-white px-6 py-2 rounded w-full sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Jetzt einlösen
          </button>
        </div>

        <div className="text-center">
          <Link
            href="/dashboard"
            className="inline-block bg-[#003b5b] hover:bg-[#002b45] text-white text-sm px-6 py-2 rounded-xl transition"
          >
            🔙 Zurück zum Dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}
