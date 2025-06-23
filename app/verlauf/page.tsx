'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/utils/supabaseClient'
import { offers } from '@/utils/offers'
import Header from '../components/header'
import Footer from '../components/footer'

interface Click {
  id: string
  offer_id: string
  clicked_at: string
  redeemed: boolean
  confirmed: boolean
}

export default function VerlaufPage() {
  const [clicks, setClicks] = useState<Click[]>([])
  const [userId, setUserId] = useState<string | null>(null)
  const [filter, setFilter] = useState<'alle' | 'vorgemerkt' | 'bestaetigt' | 'eingeloest'>('alle')

  useEffect(() => {
    const fetchData = async () => {
      const { data: userData } = await supabase.auth.getUser()

      if (userData?.user) {
        setUserId(userData.user.id)

        const { data, error } = await supabase
          .from('clicks')
          .select('*')
          .eq('user_id', userData.user.id)
          .order('clicked_at', { ascending: false })

        if (error) {
          console.error('Fehler beim Laden des Prämienverlaufs:', error)
        } else {
          setClicks(data)
        }
      }
    }

    fetchData()
  }, [])

  const filteredClicks = clicks.filter((click) => {
    if (filter === 'vorgemerkt') return !click.confirmed && !click.redeemed
    if (filter === 'bestaetigt') return click.confirmed && !click.redeemed
    if (filter === 'eingeloest') return click.redeemed
    return true
  })

  return (
    <>
      <Header />
      <main className="max-w-4xl mx-auto p-6 md:p-10 text-gray-800">
        <h1 className="text-2xl font-bold mb-6">Meine Transaktionen</h1>

        <div className="flex space-x-3 mb-6 flex-wrap">
          {['alle', 'vorgemerkt', 'bestaetigt', 'eingeloest'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f as any)}
              className={`px-4 py-2 rounded ${
                filter === f ? 'bg-[#003b5b] text-white' : 'bg-gray-200 text-gray-800'
              }`}
            >
              {f === 'alle' && 'Alle'}
              {f === 'vorgemerkt' && 'Vorgemerkt'}
              {f === 'bestaetigt' && 'Bestätigt'}
              {f === 'eingeloest' && 'Eingelöst'}
            </button>
          ))}
        </div>

        <div className="overflow-x-auto rounded border border-blue-200">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#d0f0f7]">
              <tr>
                <th className="px-4 py-3 font-semibold text-[#003b5b]">Aktion</th>
                <th className="px-4 py-3 font-semibold text-[#003b5b]">Datum</th>
                <th className="px-4 py-3 font-semibold text-[#003b5b]">Status</th>
                <th className="px-4 py-3 font-semibold text-[#003b5b]">Wert</th>
              </tr>
            </thead>
            <tbody>
              {filteredClicks.map((click, index) => {
                const offer = offers.find((o) => o.id === click.offer_id)
                const key = click.id || `${click.offer_id}-${click.clicked_at}-${index}`

                let statusLabel = 'Vorgemerkt'
                let statusColor = 'text-yellow-500'

                if (click.confirmed && !click.redeemed) {
                  statusLabel = 'Bestätigt'
                  statusColor = 'text-green-600'
                } else if (click.redeemed) {
                  statusLabel = 'Eingelöst'
                  statusColor = 'text-blue-600'
                }

                return (
                  <tr key={key} className="border-t border-blue-200 bg-white text-black">
                    <td className="px-4 py-3">{offer?.name || 'Unbekannt'}</td>
                    <td className="px-4 py-3">{new Date(click.clicked_at).toLocaleDateString()}</td>
                    <td className={`px-4 py-3 font-semibold ${statusColor}`}>{statusLabel}</td>
                    <td className="px-4 py-3">{offer?.reward?.toFixed(2)} €</td>
                  </tr>
                )
              })}
              {filteredClicks.length === 0 && (
                <tr>
                  <td colSpan={4} className="text-center px-4 py-6 text-black bg-white">
                    Keine Transaktionen in dieser Kategorie.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
      <Footer />
    </>
  )
}
