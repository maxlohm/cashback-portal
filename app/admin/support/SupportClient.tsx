'use client'

import { useMemo, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import Link from 'next/link'

type FunnelRow = {
  clicked_at: string
  click_id: string
  user_id: string
  user_email: string | null
  offer_id: string
  offer_title: string | null
  offer_reward_amount: number | null
  influencer_id: string | null
  influencer_email: string | null
  subid_token: string | null
  lead_id: string | null
  lead_confirmed: boolean | null
  lead_payout_ready: boolean | null
  lead_amount: number | null
  lead_confirmed_at: string | null
}

export default function SupportClient() {
  const supabase = useMemo(() => createClientComponentClient(), [])
  const [email, setEmail] = useState('')
  const [rows, setRows] = useState<FunnelRow[]>([])
  const [loading, setLoading] = useState(false)
  const [notice, setNotice] = useState<string | null>(null)

  const [amountByClick, setAmountByClick] = useState<Record<string, string>>({})

  async function search() {
    setNotice(null)
    setLoading(true)
    setRows([])

    const clean = email.trim().toLowerCase()
    if (!clean) {
      setLoading(false)
      setNotice('Bitte E-Mail eingeben.')
      return
    }
const { data, error } = await supabase.rpc('admin_support_lookup', {
  p_search: clean, // NICHT pp_search
})


    if (error?.message) {
  console.error('Support lookup error:', error.message)
  setNotice('Fehler: ' + error.message)
  setLoading(false)
  return
}

    setRows((data || []) as FunnelRow[])
    setLoading(false)

    if (!data || data.length === 0) setNotice('Keine Klicks gefunden.')
  }

  async function createLead(clickId: string) {
    setNotice(null)
    const raw = (amountByClick[clickId] ?? '').trim()
    const parsed = raw === '' ? 0 : Number(raw.replace(',', '.'))
    const safe = !Number.isNaN(parsed) && parsed >= 0 ? parsed : 0

    const { data, error } = await supabase.rpc('admin_create_lead_for_click', {
      p_click_id: clickId,
      p_amount: safe,
    })

    if (error) {
      console.error(error)
      setNotice('Fehler: ' + error.message)
      return
    }

    const status = (data as any)?.status
    setNotice(status === 'created' ? 'Lead angelegt.' : 'Lead existiert bereits.')
    await search()
    setTimeout(() => setNotice(null), 2500)
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Admin – Support</h1>

      <div className="flex flex-wrap gap-3 items-end">
        <div className="flex flex-col flex-1 min-w-[260px]">
          <label className="text-xs text-gray-500">User E-Mail</label>
          <input
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="border p-2 rounded w-full"
            placeholder="kunde@domain.tld"
          />
        </div>

        <button
          onClick={search}
          disabled={loading}
          className="px-4 py-2 rounded bg-[#003b5b] text-white disabled:opacity-50"
        >
          Suchen
        </button>
      </div>

      {notice && <div className="text-sm text-green-700">{notice}</div>}

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100 text-left text-sm">
              <th className="p-2">Zeit</th>
              <th className="p-2">Deal</th>
              <th className="p-2">Prämie</th>
              <th className="p-2">Influencer</th>
              <th className="p-2">SubID</th>
              <th className="p-2">Lead</th>
              <th className="p-2">Netzwerkbetrag</th>
              <th className="p-2">Aktion</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td className="p-4" colSpan={8}>Lade…</td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td className="p-4" colSpan={8}>Keine Einträge</td>
              </tr>
            ) : (
              rows.map(r => {
                const hasLead = !!r.lead_id
                return (
                  <tr key={r.click_id} className="border-b text-sm">
                    <td className="p-2">{new Date(r.clicked_at).toLocaleString()}</td>
                    <td className="p-2">
                      <div className="font-medium">{r.offer_title ?? r.offer_id}</div>
                      <div className="text-xs text-gray-500">{r.click_id}</div>
                      <div className="text-xs">
                        <Link className="underline text-blue-600" href={`/angebot/${r.offer_id}`} target="_blank">
                          Offer öffnen
                        </Link>
                      </div>
                    </td>
                    <td className="p-2">{Number(r.offer_reward_amount ?? 0).toFixed(2)} €</td>
                    <td className="p-2">{r.influencer_email || (r.influencer_id ?? '-')}</td>
                    <td className="p-2">{r.subid_token ?? '-'}</td>
                    <td className="p-2">
                      {hasLead ? (
                        <span className="inline-flex px-2 py-1 rounded bg-green-100 text-green-800">
                          bestätigt
                        </span>
                      ) : (
                        <span className="inline-flex px-2 py-1 rounded bg-yellow-100 text-yellow-800">
                          fehlt
                        </span>
                      )}
                    </td>
                    <td className="p-2">{Number(r.lead_amount ?? 0).toFixed(2)} €</td>
                    <td className="p-2">
                      {hasLead ? (
                        <span className="text-gray-500">—</span>
                      ) : (
                        <div className="flex gap-2 items-center">
                          <input
                            value={amountByClick[r.click_id] ?? ''}
                            onChange={e =>
                              setAmountByClick(m => ({ ...m, [r.click_id]: e.target.value }))
                            }
                            className="border p-1 rounded w-[110px]"
                            placeholder="amount"
                          />
                          <button
                            onClick={() => createLead(r.click_id)}
                            className="px-2 py-1 rounded border bg-white hover:shadow"
                          >
                            Lead anlegen
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
