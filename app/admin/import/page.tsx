'use client'

import { useEffect, useState } from 'react'
import Papa from 'papaparse'
import { supabase } from '@/utils/supabaseClient'
import { useRouter } from 'next/navigation'

export default function AdminImportPage() {
  const [file, setFile] = useState<File | null>(null)
  const [result, setResult] = useState<string>('')
  const [allowed, setAllowed] = useState<boolean | null>(null)
  const router = useRouter()

  useEffect(() => {
    const checkAdmin = async () => {
      const { data } = await supabase.auth.getUser()
      const user = data?.user

      if (user?.user_metadata?.role === 'admin') {
        setAllowed(true)
      } else {
        setAllowed(false)
      }
    }

    checkAdmin()
  }, [])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) {
      setFile(e.target.files[0])
    }
  }

  const handleImport = async () => {
    if (!file) return

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        const rows = results.data as any[]

        let updated = 0
        for (const row of rows) {
          const { user_id, offer_id, amount } = row

          if (!user_id || !offer_id || !amount) continue

          const { error } = await supabase
            .from('clicks')
            .update({
              redeemed: true,
              confirmed_at: new Date().toISOString(),
            })
            .eq('user_id', user_id)
            .eq('offer_id', offer_id)
            .eq('amount', Number(amount))

          if (!error) updated++
        }

        setResult(`✅ ${updated} Einträge als bestätigt markiert.`)
      },
      error: (error) => {
        setResult(`❌ Fehler beim Parsen: ${error.message}`)
      },
    })
  }

  if (allowed === null) return <p className="p-6">Authentifiziere...</p>

  if (allowed === false) {
    router.push('/')
    return null
  }

  return (
    <div className="max-w-xl mx-auto py-10 px-4 sm:px-6">
      <h1 className="text-2xl font-bold mb-6">CSV-Import für bestätigte Leads</h1>

      <input
        type="file"
        accept=".csv"
        onChange={handleFileChange}
        className="mb-4"
      />

      <button
        onClick={handleImport}
        className="bg-[#003b5b] text-white px-6 py-2 rounded hover:bg-[#005b91]"
      >
        Import starten
      </button>

      {result && <p className="mt-6 text-sm text-gray-700">{result}</p>}
    </div>
  )
}
