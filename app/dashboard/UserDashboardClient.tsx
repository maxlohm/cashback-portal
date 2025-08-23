'use client';

import { useEffect, useMemo, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

type Balance = {
  pending_balance: number;
  available_balance: number;
  total_paid: number;
};

type LeadRow = {
  id: string;
  offer_title: string;
  offer_image?: string;
  amount: number | null;
  confirmed: boolean;
  payout_ready: boolean;
  confirmed_at: string | null;
  created_at: string;
};

type RedemptionRow = {
  id: string;
  amount: number;
  status: 'pending' | 'approved' | 'processing' | 'paid' | 'rejected';
  created_at: string;
};

const fmtMoney = new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' });

export default function UserDashboardClient() {
  const supabase = useMemo(() => createClientComponentClient(), []);
  const [balance, setBalance] = useState<Balance | null>(null);
  const [leads, setLeads] = useState<LeadRow[]>([]);
  const [redemptions, setRedemptions] = useState<RedemptionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const MIN_PAYOUT = 5;

  const load = async () => {
    setLoading(true);
    setError(null);

    // Balance
    const { data: bal, error: balErr } = await supabase.rpc('get_user_balance');
    if (balErr) setError(balErr.message);
    setBalance(bal as Balance);

    // Leads (mit Offer)
    const { data: leadRows } = await supabase
      .from('leads')
      .select('id, amount, confirmed, payout_ready, confirmed_at, created_at, clicks(offers(title,image_url))')
      .order('created_at', { ascending: false })
      .limit(20);

    const leadsMapped: LeadRow[] = (leadRows || []).map((row: any) => ({
      id: row.id,
      offer_title: row.clicks?.offers?.title ?? 'Deal',
      offer_image: row.clicks?.offers?.image_url ?? undefined,
      amount: row.amount,
      confirmed: row.confirmed,
      payout_ready: row.payout_ready,
      confirmed_at: row.confirmed_at,
      created_at: row.created_at,
    }));
    setLeads(leadsMapped);

    // Redemptions (eigene)
    const { data: redRows } = await supabase
      .from('redemptions')
      .select('id, amount, status, created_at')
      .order('created_at', { ascending: false })
      .limit(10);
    setRedemptions((redRows || []) as RedemptionRow[]);

    setLoading(false);
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, []);

  const hasOpenRequest = redemptions.some(r => ['pending','approved','processing'].includes(r.status));
  const canRequest = (balance?.available_balance ?? 0) >= MIN_PAYOUT && !hasOpenRequest;

  const requestPayout = async () => {
    if (!canRequest) return;
    setBusy(true); setError(null); setNotice(null);
    const { data, error } = await supabase.rpc('create_redemption_request', { min_amount: MIN_PAYOUT });
    setBusy(false);
    if (error) { setError(humanizeError(error.message)); return; }
    setNotice('Auszahlungsanfrage erstellt. Wir prüfen diese zeitnah.');
    await load();
    setTimeout(() => setNotice(null), 3000);
  };

  if (loading) return <div className="p-4">Lade Daten…</div>;

  return (
    <div className="space-y-8">
      {/* Karten */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <BalanceCard label="Vorgemerkt" value={balance?.pending_balance ?? 0} color="orange" />
        <BalanceCard label="Bisher ausgezahlt" value={balance?.total_paid ?? 0} color="green" />
        <BalanceCard label="Auszahlbar" value={balance?.available_balance ?? 0} color="blue" />
      </div>

      {/* Aktionen */}
      <div className="flex items-center gap-3">
        <button
          onClick={requestPayout}
          disabled={!canRequest || busy}
          className="px-4 py-2 rounded bg-black text-white disabled:opacity-50"
        >
          {busy ? 'Sende…' : `Auszahlung anfordern (ab ${fmtMoney.format(MIN_PAYOUT)})`}
        </button>
        {!canRequest && (
          <div className="text-sm text-gray-500">
            {hasOpenRequest
              ? 'Es gibt bereits eine offene Auszahlungsanfrage.'
              : `Mindestsumme ${fmtMoney.format(MIN_PAYOUT)} nicht erreicht.`}
          </div>
        )}
      </div>

      {notice && <div className="text-green-600 text-sm">{notice}</div>}
      {error && <div className="text-red-600 text-sm">Fehler: {error}</div>}

      {/* Leads */}
      <section>
        <h2 className="text-xl font-semibold mb-2">Abschlussverlauf</h2>
        {leads.length === 0 ? (
          <Empty label="Noch keine Abschlüsse" />
        ) : (
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100 text-left">
                <th className="p-2">Datum</th>
                <th className="p-2">Deal</th>
                <th className="p-2">Betrag</th>
                <th className="p-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((l) => (
                <tr key={l.id} className="border-b">
                  <td className="p-2">{new Date(l.created_at).toLocaleDateString('de-DE')}</td>
                  <td className="p-2 flex items-center gap-2">
                    {l.offer_image && <img src={l.offer_image} alt="" className="w-8 h-8 object-contain" />}
                    {l.offer_title}
                  </td>
                  <td className="p-2">{l.amount ? fmtMoney.format(l.amount) : '-'}</td>
                  <td className="p-2"><LeadStatusBadge confirmed={l.confirmed} payoutReady={l.payout_ready} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      {/* Redemptions */}
      <section>
        <h2 className="text-xl font-semibold mb-2">Auszahlungen</h2>
        {redemptions.length === 0 ? (
          <Empty label="Noch keine Auszahlungen" />
        ) : (
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100 text-left">
                <th className="p-2">Datum</th>
                <th className="p-2">Betrag</th>
                <th className="p-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {redemptions.map((r) => (
                <tr key={r.id} className="border-b">
                  <td className="p-2">{new Date(r.created_at).toLocaleString('de-DE')}</td>
                  <td className="p-2">{fmtMoney.format(r.amount)}</td>
                  <td className="p-2"><RedemptionBadge status={r.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}

function BalanceCard({ label, value, color }: { label: string; value: number; color: 'orange'|'green'|'blue' }) {
  const colors = { orange: 'text-orange-600', green: 'text-green-600', blue: 'text-blue-600' };
  const safe = Number.isFinite(value) ? value : 0;
  return (
    <div className="p-4 rounded-xl border bg-white shadow">
      <div className="text-sm text-gray-500">{label}</div>
      <div className={`text-2xl font-bold ${colors[color]}`}>{safe.toFixed(2)} €</div>
    </div>
  );
}

function Empty({ label }: { label: string }) {
  return <div className="p-4 text-sm text-gray-500 border rounded bg-white">{label}</div>;
}

function LeadStatusBadge({ confirmed, payoutReady }: { confirmed: boolean; payoutReady: boolean }) {
  if (!confirmed) return <span className="px-2 py-1 text-xs rounded bg-gray-200">Offen</span>;
  if (payoutReady) return <span className="px-2 py-1 text-xs rounded bg-blue-200">Auszahlbar</span>;
  return <span className="px-2 py-1 text-xs rounded bg-green-200">Bestätigt</span>;
}

function RedemptionBadge({ status }: { status: 'pending'|'approved'|'processing'|'paid'|'rejected' }) {
  const map: Record<string,string> = {
    pending:'bg-gray-200 text-gray-800',
    approved:'bg-blue-200 text-blue-900',
    processing:'bg-yellow-200 text-yellow-900',
    paid:'bg-green-200 text-green-900',
    rejected:'bg-red-200 text-red-900',
  };
  return <span className={`px-2 py-1 text-xs rounded ${map[status] || 'bg-gray-200'}`}>{status}</span>;
}

function humanizeError(msg: string) {
  if (msg.includes('request_exists')) return 'Es gibt bereits eine offene Auszahlungsanfrage.';
  if (msg.includes('insufficient_balance')) return 'Nicht genügend auszahlbares Guthaben.';
  return msg;
}
