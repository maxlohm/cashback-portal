'use client'

import { useEffect, useMemo, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

type Row = {
  user_id: string
  email: string | null
  role: 'user' | 'influencer' | 'partner' | 'admin'
  partner_exists: boolean
  partner_subid: string | null
  created_at: string
  total_count: number
}

export default function AdminUsersClient() {
  const supabase = useMemo(() => createClientComponentClient(), [])
  const [rows, setRows] = useState<Row[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [notice, setNotice] = useState<string | null>(null)

  // Filter/Paging
  const [role, setRole] = useState<'all'|'user'|'influencer'|'partner'|'admin'>('all')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const PAGE_SIZE = 50

  async function load() {
    setLoading(true)
    const { data, error } = await supabase.rpc('admin_list_users', {
      p_role: role === 'all' ? null : role,
      p_search: search || null,
      p_limit: PAGE_SIZE,
      p_offset: (page - 1) * PAGE_SIZE
    })
    if (error) {
      console.error(error.message)
      setRows([])
      setTotal(0)
    } else {
      const list = (data || []) as Row[]
      setRows(list)
      setTotal(list.length ? Number(list[0].total_count) : 0)
    }
    setLoading(false)
  }

  useEffect(() => { load() }, [role, page]) // eslint-disable-line
  useEffect(() => {
    const t = setTimeout(() => { setPage(1); load() }, 300)
    return () => clearTimeout(t)
  }, [search]) // eslint-disable-line

  async function setUserRole(user_id: string, newRole: Row['role']) {
    setNotice(null)
    // Optimistisch:
    const prev = rows
    setRows(r => r.map(x => x.user_id === user_id ? { ...x, role: newRole } : x))

    const { error } = await supabase.rpc('admin_set_user_role', { p_user: user_id, p_role: newRole })
    if (error) {
      setRows(prev)
      setNotice('Fehler: ' + error.message)
      return
    }

    // Wenn Partner/Influencer → ensure_partner_exists triggert bereits in RPC
    setNotice('Rolle aktualisiert.')
    // Reload, damit partner_exists stimmt
    load()
    setTimeout(() => setNotice(null), 2000)
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Admin – Benutzer</h1>

      {/* Filter */}
      <div className="flex flex-wrap gap-3 items-end">
        <div className="flex flex-col">
          <label className="text-xs text-gray-500">Rolle</label>
          <select value={role} onChange={e => { setPage(1); setRole(e.target.value as any) }} className="border p-2 rounded min-w-[160px]">
            <option value="all">Alle</option>
            <option value="user">User</option>
            <option value="influencer">Influencer</option>
            <option value="partner">Partner</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <div className="flex flex-col flex-1 min-w-[220px]">
          <label className="text-xs text-gray-500">Suche (E-Mail)</label>
          <input value={search} onChange={e => setSearch(e.target.value)} className="border p-2 rounded w-full" placeholder="name@domain.tld" />
        </div>
        <div className="ml-auto text-sm text-gray-600">
          {total} Nutzer • Seite {page} / {Math.max(1, Math.ceil(total / PAGE_SIZE))}
        </div>
      </div>

      {notice && <div className="text-sm text-green-700">{notice}</div>}

      {/* Tabelle */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100 text-left text-sm">
              <th className="p-2">E-Mail</th>
              <th className="p-2">Rolle</th>
              <th className="p-2">Partner</th>
              <th className="p-2">SubID</th>
              <th className="p-2">Angelegt</th>
              <th className="p-2">Aktion</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td className="p-4" colSpan={6}>Lade…</td></tr>
            ) : rows.length === 0 ? (
              <tr><td className="p-4" colSpan={6}>Keine Einträge</td></tr>
            ) : rows.map(r => (
              <tr key={r.user_id} className="border-b text-sm">
                <td className="p-2">{r.email || r.user_id}</td>
                <td className="p-2">{r.role}</td>
                <td className="p-2">{r.partner_exists ? 'Ja' : 'Nein'}</td>
                <td className="p-2">{r.partner_subid || '-'}</td>
                <td className="p-2">{new Date(r.created_at).toLocaleString()}</td>
                <td className="p-2">
                  <div className="flex gap-2">
                    {(['user','influencer','partner','admin'] as const).map(opt => (
                      <button
                        key={opt}
                        onClick={() => setUserRole(r.user_id, opt)}
                        className={`px-2 py-1 rounded border ${opt===r.role ? 'bg-gray-200' : 'bg-white hover:shadow'}`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex gap-2 justify-end">
        <button className="px-2 py-1 border rounded" disabled={page<=1||loading} onClick={()=>setPage(p=>Math.max(1,p-1))}>Zurück</button>
        <button className="px-2 py-1 border rounded" disabled={page>=Math.ceil(total/PAGE_SIZE)||loading} onClick={()=>setPage(p=>p+1)}>Weiter</button>
      </div>
    </div>
  )
}
