'use client';

import { useMemo, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

type Partner = { id: string; name: string | null };

export default function InfluencerPayoutClient({ partners }: { partners: Partner[] }) {
  const supabase = useMemo(() => createClientComponentClient(), []);
  const [partnerId, setPartnerId] = useState<string>('all');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleRun = async () => {
    setBusy(true);
    setResult(null);
    setError(null);
    try {
      const { data, error } = await supabase.rpc(
        'admin_mark_influencer_paid',
        {
          p_partner: partnerId === 'all' ? null : partnerId,
          p_from: from || null,
          p_to: to || null,
        },
      );
      if (error) throw error;

      const row = Array.isArray(data) ? data[0] : data;
      const updated = row?.updated_count ?? 0;
      const total = Number(row?.total_commission ?? 0);

      setResult(
        `Es wurden ${updated} Leads auf „abgerechnet“ gesetzt (Summe Provision: ${total.toFixed(
          2,
        )} €).`,
      );
    } catch (e: any) {
      console.error(e);
      setError(e?.message ?? 'Fehler bei der Abrechnung.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="max-w-xl space-y-4">
      <h1 className="text-xl font-semibold">
        Influencer-Abrechnung (Bulk)
      </h1>
      <p className="text-sm text-gray-600">
        Wähle optional einen Influencer und einen Zeitraum. Alle bestätigten,
        auszahlbaren Leads ohne <code className="mx-1 rounded bg-gray-100 px-1">influencer_paid</code>{' '}
        werden auf „abgerechnet“ gesetzt.
      </p>

      <div className="space-y-3 bg-white border rounded p-4">
        <div className="flex flex-col gap-2">
          <label className="text-xs font-medium text-gray-700">
            Influencer
          </label>
          <select
            className="border rounded px-2 py-1 text-sm bg-white"
            value={partnerId}
            onChange={e => setPartnerId(e.target.value)}
          >
            <option value="all">Alle Influencer</option>
            {partners.map(p => (
              <option key={p.id} value={p.id}>
                {p.name || p.id}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-wrap gap-3">
          <div className="flex flex-col">
            <label className="text-xs font-medium text-gray-700">
              Von (inkl.)
            </label>
            <input
              type="date"
              className="border rounded px-2 py-1 text-sm"
              value={from}
              onChange={e => setFrom(e.target.value)}
            />
          </div>
          <div className="flex flex-col">
            <label className="text-xs font-medium text-gray-700">
              Bis (inkl.)
            </label>
            <input
              type="date"
              className="border rounded px-2 py-1 text-sm"
              value={to}
              onChange={e => setTo(e.target.value)}
            />
          </div>
        </div>

        <button
          onClick={handleRun}
          disabled={busy}
          className="mt-2 inline-flex items-center rounded bg-[#003b5b] px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
        >
          {busy ? 'Rechne ab …' : 'Leads als bezahlt markieren'}
        </button>
      </div>

      {result && (
        <div className="rounded border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-800">
          {result}
        </div>
      )}
      {error && (
        <div className="rounded border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
          Fehler: {error}
        </div>
      )}
    </div>
  );
}
