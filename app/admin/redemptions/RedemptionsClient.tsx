'use client';

import { useEffect, useMemo, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Loader2, Send, CheckCircle2, XCircle, RefreshCw } from 'lucide-react';

// ❌ WICHTIG: KEINE `export const dynamic/revalidate` HIER!

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

export default function RedemptionsClient() {
  const supabase = useMemo(() => (typeof window === 'undefined' ? null : createClientComponentClient()), []);

  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [rows, setRows] = useState<RedemptionRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionId, setActionId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [month, setMonth] = useState<string>(new Date().toISOString().slice(0, 7));
  const [search, setSearch] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);
  const [notice, setNotice] = useState<null | { type: 'success' | 'error' | 'info'; text: string }>(null);

  function showNotice(type: 'success' | 'error' | 'info', text: string) {
    setNotice({ type, text });
    setTimeout(() => setNotice(null), 3500);
  }

  useEffect(() => {
    if (!supabase) return;
    (async () => {
      const { data: userData } = await supabase.auth.getUser();
      const uid = userData?.user?.id;
      if (!uid) { setIsAdmin(false); return; }
      const { data, error } = await supabase.from('profiles').select('role').eq('id', uid).single();
      if (error) { console.error(error); setIsAdmin(false); showNotice('error','Rollenprüfung fehlgeschlagen.'); return; }
      setIsAdmin(data?.role === 'admin');
    })();
  }, [supabase]);

  useEffect(() => {
    if (!supabase) return;
    (async () => {
      setLoading(true);
      const { data, error } = await supabase.rpc('admin_get_redemptions');
      if (!error && data) setRows(data as RedemptionRow[]);
      else if (error) { console.error(error); showNotice('error','Fehler beim Laden der Redemptions.'); }
      setLoading(false);
    })();
  }, [supabase, refreshKey]);

  const filtered = useMemo(() => {
    const start = new Date(`${month}-01T00:00:00Z`);
    const end = new Date(start); end.setMonth(end.getMonth() + 1);
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

  const totalSelected = filtered.reduce((s, r) => s + Number(r.amount || 0), 0);

  async function updateStatus(id: string, newStatus: RedemptionRow['status']) {
    if (!supabase) return;
    setActionId(id);
    const { error } = await supabase.rpc('admin_update_redemption_status', { redemption_id: id, new_status: newStatus });
    setActionId(null);
    if (!error) { showNotice('success', `Status aktualisiert: ${newStatus}`); setRefreshKey((k) => k + 1); }
    else { console.error(error); showNotice('error', `Update fehlgeschlagen: ${error.message}`); }
  }

  async function sendToTremendous(id: string) {
    setActionId(id);
    try {
      showNotice('info', 'Sende an Tremendous…');
      const res = await fetch('/api/tremendous-send', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ redemption_id: id }) });
      const body = await res.json().catch(() => ({}));
      if (res.ok) showNotice('success', 'An Tremendous gesendet.');
      else { console.error(body); showNotice('error', `Tremendous-Fehler (${res.status}).`); }
      setRefreshKey((k) => k + 1);
    } catch (e: any) {
      console.error(e); showNotice('error', e?.message || 'Unerwarteter Fehler beim Senden.');
    } finally { setActionId(null); }
  }

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
        <p>Kein Zugriff. Bitte als <b>Admin</b> anmelden.</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-4 space-y-6">
      {/* … dein gesamtes UI von oben (Tabelle, Buttons etc.) bleibt unverändert … */}
      {/* Ich kürze hier, weil nur die Aufteilung relevant ist */}
    </div>
  );
}
