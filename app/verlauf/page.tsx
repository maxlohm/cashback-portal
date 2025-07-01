'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/utils/supabaseClient'
import Header from '../components/header'
import Footer from '../components/footer'

interface GiftCard {
  id: string
  type: string
  value: number
  code: string | null
  issued_at: string
}

export default function VerlaufPage() {
  const [giftCards, setGiftCards] = useState<GiftCard[]>([])
  const [userId, setUserId] = useState<string | null>(null)
  const [visibleCodes, setVisibleCodes] = useState<Record<string, boolean>>({})

  useEffect(() => {
    const fetchData = async () => {
      const { data: userData } = await supabase.auth.getUser()

      if (userData?.user) {
        setUserId(userData.user.id)

        const { data, error } = await supabase
          .from('gift_cards')
          .select('*')
          .eq('user_id', userData.user.id)
          .order('issued_at', { ascending: false })

        if (!error && data) {
          setGiftCards(data)
        }
      }
    }

    fetchData()
  }, [])

  const toggleCodeVisibility = (id: string) => {
    setVisibleCodes((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  return (
    <>   
      <main className="max-w-4xl mx-auto p-6 md:p-10 text-gray-800">
        <h1 className="text-2xl font-bold mb-6">Eingelöste Prämien</h1>

        <div className="overflow-x-auto rounded border border-blue-200">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#d0f0f7]">
              <tr>
                <th className="px-4 py-3 font-semibold text-[#003b5b]">Typ</th>
                <th className="px-4 py-3 font-semibold text-[#003b5b]">Wert</th>
                <th className="px-4 py-3 font-semibold text-[#003b5b]">Datum</th>
                <th className="px-4 py-3 font-semibold text-[#003b5b]">Code</th>
              </tr>
            </thead>
            <tbody>
              {giftCards.map((gc) => (
                <tr key={gc.id} className="border-t border-blue-200 bg-white text-black">
                  <td className="px-4 py-3">{gc.type}</td>
                  <td className="px-4 py-3">{gc.value.toFixed(2)} €</td>
                  <td className="px-4 py-3">{new Date(gc.issued_at).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    {visibleCodes[gc.id] ? (
                      <span className="font-mono text-green-600">{gc.code}</span>
                    ) : (
                      <button
                        onClick={() => toggleCodeVisibility(gc.id)}
                        className="text-blue-600 hover:underline"
                      >
                        Code anzeigen
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {giftCards.length === 0 && (
                <tr>
                  <td colSpan={4} className="text-center px-4 py-6 text-black bg-white">
                    Noch keine Prämien eingelöst.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main> 
    </>
  )
}
