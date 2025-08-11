'use client';

import { useEffect, useMemo, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Loader2, Send, CheckCircle2, XCircle, RefreshCw } from 'lucide-react';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

type RedemptionRow = {
  redemption_id: string;
  user_id: string;
  user_email: string | null;
  amount: number;
  status: 'pending' | 'approved' | 'processing' | 'paid' | 'rejected';
  created_at: string;
  provider?: string | null;
  sku?: string | null;
};

export default function Page() {
  // Supabase nur im Browser initialisieren (verhindert Prerender-Fehler)
  const supabase = useMemo(() => {
    if (typeof window === 'undefined') return null;
    return createClientComponentClient();
  }, []);

  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  // UI state
  const [rows, setRows] = useState<RedemptionRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionId, setActionId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [month, setMonth] = useState<string>(new Date().toISOString().slice(0, 7)); // YYYY-MM
  const [search, setSearch] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);
  const [notice, setNotice] = useState<null | { type: 'success' | 'error' | 'info'; text: string }>(null);

  function showNotice(type: 'success' | 'error' | 'info', text: string) {
    setNotice({ type, text });
    setTimeout(() => setNotice(null), 3500);
  }

  // Admin-Guard (client-side)
  useEffect(() => {
    if (!supabase) return; // guard during SSR/prerender
    (async () => {
      const { data: userData } = await supabase.auth.getUser();
      const uid = userData?.user?.id;
      if (!uid) {
        setIsAdmin(false);
        return;
      }
      const { data, error } = await supabase.from('profiles').select('role').eq('id', uid).single();
      if (error) {
        console.error(error);
        setIsAdmin(false);
        showNotice('error', 'Rollenprüfung fehlgeschlagen.');
        return;
      }
      setIsAdmin(data?.role === 'admin');
    })();
  }, [supabase]);

  // Daten laden
  useEffect(() => {
    if (!supabase) return; // guard during SSR/prerender
    const load = async () => {
      setLoading(true);
      const { data, error } = await supabase.rpc('admin_get_redemptions');
      if (!error && data) {
        setRows(data as RedemptionRow[]);
      } else if (error) {
        console.error(error);
        showNotice('error', 'Fehler beim Laden der Redemptions.');
      }
      setLoading(false);
    };
    load();
  }, [supabase, refreshKey]);

  const filtered = useMemo(() => {
    const start = new Date(`${month}-01T00:00:00Z`);
    const end = new Date(start);
    end.setMonth(end.getMonth() + 1);

    return rows
      .filter((r) => {
        const t = new Date(r.created_at).getTime();
        if (!(t >= start.getTime() && t < end.getTime())) return false;
        if (statusFilter !== 'all' && r.status !== statusFilter) return false;
        if (search && !(r.user_email?.toLowerCase().includes(search.toLowerCase()))) return false;
        return true;
      })
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }, [rows, month, statusFilter, search]);

  const totalSelected = useMemo(() => filtered.reduce((s, r) => s + Number(r.amount || 0), 0), [filtered]);

  async function updateStatus(id: string, newStatus: RedemptionRow['status']) {
    if (!supabase) return; // guard
    setActionId(id);
    const { error } = await supabase.rpc('admin_update_redemption_status', {
      redemption_id: id,
      new_status: newStatus,
    });
    setActionId(null);
    if (!error) {
      showNotice('success', `Status aktualisiert: ${newStatus}`);
      setRefreshKey((k) => k + 1);
    } else {
      console.error(error);
      showNotice('error', `Update fehlgeschlagen: ${error.message}`);
    }
  }

  async function sendToTremendous(id: string) {
    setActionId(id);
    try {
      showNotice('info', 'Sende an Tremendous…');
      const res = await fetch('/api/tremendous-send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ redemption_id: id }),
      });
      const body = await res.json().catch(() => ({}));
      if (res.ok) {
        showNotice('success', 'An Tremendous gesendet.');
      } else {
        console.error(body);
        showNotice('error', `Tremendous-Fehler (${res.status}).`);
      }
      setRefreshKey((k) => k + 1);
    } catch (e: any) {
      console.error(e);
      showNotice('error', e?.message || 'Unerwarteter Fehler beim Senden.');
    } finally {
      setActionId(null);
    }
  }

  // Zustand vor Hydration (wenn supabase null ist)
  if (isAdmin === null && !supabase) {
    return (
      <div className="max-w-5xl mx-auto p-10">
        <div className="flex items-center gap-2 text-gray-500">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Initialisiere…</span>
        </div>
      </div>
    );
  }

  if (isAdmin === null) {
    return (
      <div className="max-w-5xl mx-auto p-10">
        <div className="flex items-center gap-2 text-gray-500">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Lade Admin-Rechte…</span>
        </div>
      </div>
    );
  }

  if (isAdmin === false) {
    return (
      <div className="max-w-2xl mx-auto p-10 text-sm text-gray-500">
        <p>
          Kein Zugriff. Bitte als <b>Admin</b> anmelden.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-4 space-y-6">
      {/* Notice-Banner */}
      {notice && (
        <div
          className={`rounded-lg border p-3 text-sm ${
            notice.type === 'success'
              ? 'bg-green-50 border-green-200 text-green-800'
              : notice.type === 'error'
              ? 'bg-red-50 border-red-200 text-red-800'
              : 'bg-gray-50 border-gray-200 text-gray-800'
          }`}
        >
          {notice.text}
        </div>
      )}

      <div className="shadow-sm border rounded-lg">
        <div className="border-b p-4">
          <h2 className="text-xl font-semibold">Redemptions – Admin</h2>
        </div>
        <div className="p-4 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full border rounded p-2"
              >
                <option value="all">Alle Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="processing">Processing</option>
                <option value="paid">Paid</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
            <div>
              <input type="month" value={month} onChange={(e) => setMonth(e.target.value)} className="w-full border rounded p-2" />
            </div>
            <div className="md:col-span-2 flex items-center gap-2">
              <input
                placeholder="Suche nach E-Mail…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="border rounded p-2 w-full"
              />
              <button
                className="px-3 py-2 border rounded-md"
                onClick={() => setRefreshKey((k) => k + 1)}
                disabled={loading}
                title="Aktualisieren"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          <div className="text-sm text-gray-500 flex justify-between mt-1">
            <span>{loading ? 'Lade…' : `${filtered.length} Einträge`} | Summe: {totalSelected.toFixed(2)} €</span>
          </div>

          <div className="overflow-auto rounded-xl border">
            <table className="w-full text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="text-left p-3">Datum</th>
                  <th className="text-left p-3">E-Mail</th>
                  <th className="text-right p-3">Betrag</th>
                  <th className="text-left p-3">Status</th>
                  <th className="text-left p-3">Aktion</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <tr key={r.redemption_id} className="border-t">
                    <td className="p-3">{new Date(r.created_at).toLocaleString('de-DE')}</td>
                    <td className="p-3">{r.user_email ?? '—'}</td>
                    <td className="p-3 text-right">{Number(r.amount).toFixed(2)} €</td>
                    <td className="p-3">
                      <span className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium bg-gray-200">{r.status}</span>
                    </td>
                    <td className="p-3">
                      <div className="flex flex-wrap gap-2">
                        <button
                          className="px-2 py-1 rounded-md bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
                          disabled={loading || actionId === r.redemption_id || r.status !== 'pending'}
                          onClick={() => updateStatus(r.redemption_id, 'approved')}
                          title="Approve"
                        >
                          {actionId === r.redemption_id ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                          <span className="ml-1 hidden sm:inline">Approve</span>
                        </button>

                        <button
                          className="px-2 py-1 rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
                          disabled={loading || actionId === r.redemption_id || r.status !== 'approved'}
                          onClick={() => sendToTremendous(r.redemption_id)}
                          title="Send to Tremendous"
                        >
                          {actionId === r.redemption_id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                          <span className="ml-1 hidden sm:inline">Send</span>
                        </button>

                        <button
                          className="px-2 py-1 rounded-md bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
                          disabled={loading || actionId === r.redemption_id || r.status === 'paid'}
                          onClick={() => updateStatus(r.redemption_id, 'rejected')}
                          title="Reject"
                        >
                          {actionId === r.redemption_id ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4" />}
                          <span className="ml-1 hidden sm:inline">Reject</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {!loading && filtered.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-6 text-center text-gray-500">
                      Keine Einträge gefunden.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
