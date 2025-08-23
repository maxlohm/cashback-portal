'use client'
import { useState } from 'react'

export default function Page() {
  const [out, setOut] = useState<any>(null)
  async function run() {
    try {
      const key = 'pk_dev_max_1' // fester API-Key
      const last = await fetch('/api/debug-last-click').then(r => r.json())
      if (!last.ok) return setOut(last)
      const res = await fetch('/api/partner-lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ api_key: key, click_id: last.click_id, amount: 12.34 }),
      }).then(r => r.json())
      setOut(res)
    } catch (e) { setOut({ error: String(e) }) }
  }
  return (
    <div className="p-6 space-y-4">
      <button onClick={run} className="px-3 py-2 rounded bg-blue-600 text-white">
        Lead anlegen (Test)
      </button>
      <pre className="bg-gray-100 p-3 rounded overflow-auto">{JSON.stringify(out, null, 2)}</pre>
    </div>
  )
}
