'use client';

import { useEffect, useMemo, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

type Role = 'user'|'influencer'|'partner'|'admin';
type RoleFilter = 'all'|Role;

type UserRow = {
  user_id: string;
  email: string | null;
  role: Role | 'user';
  partner_id: string | null;
  partner_subid: string | null;   // ⬅️ NEU
};

export default function UsersAdminClient() {
  const supabase = useMemo(() => createClientComponentClient(), []);

  // filters & paging
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('all');
  const [q, setQ] = useState('');
  const PAGE_SIZE = 50;
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  // data
  const [rows, setRows] = useState<UserRow[]>([]);
  const [influencers, setInfluencers] = useState<UserRow[]>([]);

  // ux
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  // helpers
  useEffect(() => {
    Promise.all([
      supabase.rpc('admin_list_users', { p_role: 'partner', p_search: null, p_limit: 500, p_offset: 0 }),
      supabase.rpc('admin_list_users', { p_role: 'influencer', p_search: null, p_limit: 500, p_offset: 0 }),
    ]).then(([p, i]) => setInfluencers([...(p.data || []), ...(i.data || [])] as UserRow[]));
  }, [supabase]);

  const load = async () => {
    setLoading(true); setError(null); setNotice(null);

    const { data: countData, error: countErr } = await supabase.rpc('admin_count_users', {
      p_role: roleFilter === 'all' ? null : roleFilter,
      p_search: q || null,
    });
    if (countErr) { setError(countErr.message); setLoading(false); return; }
    setTotal(Number(countData || 0));

    const offset = (page - 1) * PAGE_SIZE;
    const { data, error } = await supabase.rpc('admin_list_users', {
      p_role: roleFilter === 'all' ? null : roleFilter,
      p_search: q || null,
      p_limit: PAGE_SIZE,
      p_offset: offset,
    });
    if (error) setError(error.message);
    else setRows((data || []) as UserRow[]);
    setLoading(false);
  };

  useEffect(() => { load(); }, [roleFilter, page]); // eslint-disable-line
  useEffect(() => { const t = setTimeout(() => { setPage(1); load(); }, 300); return () => clearTimeout(t); }, [q]); // eslint-disable-line

  // actions
  const setRole = async (userId: string, role: Role) => {
    setLoading(true); setError(null); setNotice(null);
    const { error } = await supabase.rpc('admin_set_user_role', { p_user: userId, p_role: role });
    if (error) setError(error.message); else { setNotice(`Rolle aktualisiert: ${role}`); await load(); }
    setLoading(false);
  };

  const setPartner = async (userId: string, partnerId: string | null) => {
    setLoading(true); setError(null); setNotice(null);
    const { error } = await supabase.rpc('admin_set_user_partner', { p_user: userId, p_partner: partnerId });
    if (error) setError(error.message); else { setNotice('Partner/Sub‑Owner gespeichert'); await load(); }
    setLoading(false);
  };

  const setSubId = async (userId: string, subid: string) => {
    setLoading(true); setError(null); setNotice(null);
    const { error } = await supabase.rpc('admin_set_user_subid', { p_user: userId, p_subid: subid });
    if (error) setError(error.message); else { setNotice('Sub‑ID gespeichert'); /* kein reload nötig */ }
    setLoading(false);
  };

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Admin – Nutzerverwaltung</h1>

      {/* Filter */}
      <div className="flex flex-wrap items-end gap-3">
        <div className="flex flex-col">
          <label className="text-xs text-gray-500">Rolle</label>
          <select value={roleFilter} onChange={e => { setRoleFilter(e.target.value as RoleFilter); setPage(1); }} className="border p-2 rounded min-w-[180px]">
            <option value="all">Alle</option>
            <option value="user">User</option>
            <option value="influencer">Influencer</option>
            <option value="partner">Partner</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <div className="flex flex-col flex-1 min-w-[220px]">
          <label className="text-xs text-gray-500">E‑Mail</label>
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Suchen…" className="border p-2 rounded w-full" />
        </div>
        <div className="text-sm text-gray-500">{loading ? 'Lade…' : `${total} Nutzer gefunden`}</div>
      </div>

      {notice && <div className="text-green-600 text-sm">{notice}</div>}
      {error && <div className="text-red-600 text-sm">{error}</div>}

      {/* Tabelle */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100 text-left">
              <th className="p-2">E‑Mail</th>
              <th className="p-2">Rolle</th>
              <th className="p-2">Sub‑ID</th>
              <th className="p-2">Partner (Owner)</th>
              <th className="p-2">Link‑Beispiel</th>
              <th className="p-2">Aktion</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr><td className="p-4" colSpan={6}>{loading ? 'Lade…' : 'Keine Ergebnisse'}</td></tr>
            ) : rows.map(r => (
              <tr key={r.user_id} className="border-b align-top">
                <td className="p-2">{r.email || r.user_id}</td>

                <td className="p-2">
                  <select value={r.role} onChange={e => setRole(r.user_id, e.target.value as Role)} className="border p-1 rounded">
                    <option value="user">user</option>
                    <option value="influencer">influencer</option>
                    <option value="partner">partner</option>
                    <option value="admin">admin</option>
                  </select>
                </td>

                {/* Sub-ID Eingabe */}
                <td className="p-2">
                  <SubIdEditor initial={r.partner_subid || ''} onSave={(v) => setSubId(r.user_id, v)} />
                  <div className="text-[11px] text-gray-500 mt-1">Wird an alle ausgehenden Deal‑Links angehängt.</div>
                </td>

                {/* Sub-ID Owner / Partner-Zuordnung */}
                <td className="p-2">
                  <select
                    value={r.partner_id || ''}
                    onChange={e => setPartner(r.user_id, e.target.value || null)}
                    className="border p-1 rounded min-w-[220px]"
                  >
                    <option value="">— kein Partner —</option>
                    {influencers.map(inf => (
                      <option key={inf.user_id} value={inf.user_id}>{inf.email || inf.user_id}</option>
                    ))}
                  </select>
                </td>

                {/* Link-Preview statt Link-Liste */}
                <td className="p-2 text-sm">
                  <LinkPreview userId={r.user_id} subid={r.partner_subid || ''} />
                </td>

                <td className="p-2">
                  <button onClick={() => navigator.clipboard.writeText(r.email || r.user_id)} className="px-2 py-1 border rounded">
                    E‑Mail kopieren
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between gap-3">
        <div className="text-sm text-gray-500">Seite {page} / {Math.max(1, Math.ceil(total / PAGE_SIZE))}</div>
        <div className="flex gap-2">
          <button className="px-2 py-1 border rounded" disabled={page<=1} onClick={() => setPage(p => p-1)}>Zurück</button>
          <button className="px-2 py-1 border rounded" disabled={page>=Math.ceil(total / PAGE_SIZE)} onClick={() => setPage(p => p+1)}>Weiter</button>
        </div>
      </div>
    </div>
  );
}

/** Sub-ID Editor mit Save-Button */
function SubIdEditor({ initial, onSave }: { initial: string; onSave: (v: string) => void }) {
  const [val, setVal] = useState(initial);
  useEffect(() => setVal(initial), [initial]); // sync, falls Zeile neu lädt
  return (
    <div className="flex gap-2">
      <input value={val} onChange={e => setVal(e.target.value)} placeholder="z.B. tiktok_123" className="border p-1 rounded min-w-[160px]" />
      <button onClick={() => onSave(val)} className="px-2 py-1 border rounded bg-white hover:shadow">Speichern</button>
    </div>
  );
}

/** Zeigt nur 1 Beispiel-Link (Landing + Deep-Link-Gerüst) */
function LinkPreview({ userId, subid }: { userId: string; subid: string }) {
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const refParam = `?ref=${userId}`;
  const subParam = subid ? `&subid=${encodeURIComponent(subid)}` : '';
  const landing = `${origin}/${refParam}${subParam}`.replace('//?', '/?');

  // Beispiel-Offer-ID nur als Gerüst (kein Listing aller Offers)
  const demoOfferId = '<OFFER_ID>';
  const deep = `${origin}/r/${demoOfferId}${refParam}${subParam}`;

  const copy = async (txt: string) => { try { await navigator.clipboard.writeText(txt) } catch {} };

  return (
    <div className="space-y-1">
      <div className="text-gray-500 text-xs">Landing‑Link</div>
      <div className="flex items-center gap-2 flex-wrap">
        <code className="px-2 py-1 bg-gray-50 border rounded break-all">{landing}</code>
        <button onClick={() => copy(landing)} className="px-2 py-1 border rounded">kopieren</button>
      </div>
      <div className="text-gray-500 text-xs mt-2">Deep‑Link (Beispiel)</div>
      <div className="flex items-center gap-2 flex-wrap">
        <code className="px-2 py-1 bg-gray-50 border rounded break-all">{deep}</code>
        <button onClick={() => copy(deep)} className="px-2 py-1 border rounded">kopieren</button>
      </div>
      <div className="text-[11px] text-gray-500 mt-1">Ersetze <code>{demoOfferId}</code> mit echter Offer‑ID.</div>
    </div>
  );
}
