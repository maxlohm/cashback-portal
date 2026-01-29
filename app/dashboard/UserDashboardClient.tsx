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
  amount: number | null; // Cashback-Betrag (offers.reward_amount)
  confirmed: boolean;
  payout_ready: boolean;
  confirmed_at: string | null;
  created_at: string; // Anzeige-Datum (confirmed_at oder clicked_at)
};

type RedemptionRow = {
  id: string;
  amount: number;
  status: 'pending' | 'approved' | 'processing' | 'paid' | 'rejected';
  created_at: string;
  payout_method: 'voucher' | 'bank_transfer' | null;
  voucher_type: string | null;
  voucher_code: string | null;
};

type VoucherOption = {
  id: string;
  label: string;
  amounts: number[]; // fixe Gutscheinwerte, kein Freitext
};

const VOUCHERS: VoucherOption[] = [
  { id: 'Amazon', label: 'Amazon', amounts: [5, 10, 25, 50] },
  { id: 'Zalando', label: 'Zalando', amounts: [10, 25, 50] },
  { id: 'Otto', label: 'Otto', amounts: [10, 25, 50] },
  { id: 'toom', label: 'toom Baumarkt', amounts: [5, 10, 25] },
  { id: 'IKEA', label: 'IKEA', amounts: [10, 25, 50] },
  { id: 'MediaMarkt', label: 'MediaMarkt', amounts: [10, 25, 50] },
  { id: 'Aral', label: 'Aral Gutschein', amounts: [10, 25, 50] },
  { id: 'Rossmann', label: 'Rossmann', amounts: [5, 10, 25] },
  { id: 'H&M', label: 'H&M', amounts: [5, 10, 25] },
  { id: 'Kaufland', label: 'Kaufland', amounts: [5, 10, 25] },
  { id: 'quirion', label: 'quirion', amounts: [15, 25, 50] },
  { id: 'Rewe', label: 'Rewe', amounts: [5, 10, 25] },
  { id: 'airbnb', label: 'airbnb', amounts: [50, 100] },
  { id: 'drive&ride', label: 'drive&ride', amounts: [10, 25, 50] },
  { id: 'Apple', label: 'Apple Gift Card', amounts: [10, 25, 50] },
  { id: 'GooglePlay', label: 'Google Play Gift Card', amounts: [5, 10, 25] },
  { id: 'Netflix', label: 'Netflix', amounts: [25, 50] },
  { id: 'Spotify', label: 'Spotify', amounts: [5, 10, 25] },
  { id: 'Steam', label: 'Steam', amounts: [5, 10, 25, 50] },
  { id: 'Lidl', label: 'Lidl', amounts: [5, 10, 25] },
  { id: 'eBay', label: 'eBay', amounts: [5, 10, 25, 50] },
];

const fmtMoney = new Intl.NumberFormat('de-DE', {
  style: 'currency',
  currency: 'EUR',
});

export default function UserDashboardClient() {
  const supabase = useMemo(() => createClientComponentClient(), []);

  const [balance, setBalance] = useState<Balance | null>(null);
  const [leads, setLeads] = useState<LeadRow[]>([]);
  const [redemptions, setRedemptions] = useState<RedemptionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [selectedVoucherId, setSelectedVoucherId] = useState<string>(
    VOUCHERS[0]?.id ?? 'Amazon',
  );
  const [voucherOpen, setVoucherOpen] = useState(true);

  // fixer Betrag aus Auswahl-Chips
  const [selectedAmount, setSelectedAmount] = useState<number>(
    VOUCHERS[0]?.amounts?.[0] ?? 10,
  );

  const selectedVoucher =
    VOUCHERS.find((v) => v.id === selectedVoucherId) ?? VOUCHERS[0];

  useEffect(() => {
    // Wenn Voucher wechselt, setze auf kleinsten Wert des neuen Vouchers
    const first = selectedVoucher?.amounts?.[0] ?? 10;
    setSelectedAmount(first);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedVoucherId]);

  const load = async () => {
    setLoading(true);
    setError(null);

    try {
      // Balance (RPC basiert auf offers.reward_amount)
      const { data: balRaw, error: balErr } = await supabase.rpc(
        'get_user_balance',
      );
      if (balErr) throw balErr;

      let bal: Balance | null = null;
      if (Array.isArray(balRaw)) {
        bal = (balRaw[0] as Balance) ?? null;
      } else if (balRaw) {
        bal = balRaw as Balance;
      }
      setBalance(bal);

      // Leads
      const { data: leadRows, error: leadErr } = await supabase
        .from('leads')
        .select(
          'id, confirmed, payout_ready, confirmed_at, clicks(clicked_at, offers(title,image_url,reward_amount))',
        )
        .order('confirmed_at', { ascending: false })
        .limit(20);

      if (leadErr) throw leadErr;

      const leadsMapped: LeadRow[] = (leadRows || []).map((row: any) => {
        const clickedAt = row.clicks?.clicked_at as string | null | undefined;
        const confirmedAt = row.confirmed_at as string | null | undefined;
        const effectiveDate =
          confirmedAt ?? clickedAt ?? new Date().toISOString();

        return {
          id: row.id,
          offer_title: row.clicks?.offers?.title ?? 'Deal',
          offer_image: row.clicks?.offers?.image_url ?? undefined,
          amount: row.clicks?.offers?.reward_amount ?? null,
          confirmed: row.confirmed,
          payout_ready: row.payout_ready,
          confirmed_at: confirmedAt ?? null,
          created_at: effectiveDate,
        };
      });
      setLeads(leadsMapped);

      // Redemptions (eigene) über RPC
      const { data: redRows, error: redErr } = await supabase.rpc(
        'get_user_redemptions',
      );
      if (redErr) throw redErr;

      const mapped: RedemptionRow[] = (redRows || []).map((r: any) => ({
        id: r.redemption_id ?? r.id,
        amount: Number(r.amount),
        status: r.status,
        created_at: r.created_at,
        payout_method: r.payout_method,
        voucher_type: r.voucher_type,
        voucher_code: r.voucher_code,
      }));
      setRedemptions(mapped);
    } catch (e: any) {
      console.error(e);
      setError(e?.message ?? 'Fehler beim Laden der Daten.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const available = balance?.available_balance ?? 0;

  const openCount = redemptions.filter((r) =>
    ['pending', 'approved', 'processing'].includes(r.status),
  ).length;

  const reachedLimit = openCount >= 3;

  const canRequest = available >= selectedAmount && !reachedLimit;

  const requestPayout = async () => {
    if (!canRequest) return;

    setBusy(true);
    setError(null);
    setNotice(null);

    try {
      const { error: rpcError } = await supabase.rpc(
        'create_redemption_request',
        {
          p_amount: selectedAmount,
          p_voucher_type: selectedVoucher.id,
        },
      );

      if (rpcError) {
        setError(humanizeError(rpcError.message));
        return;
      }

      setNotice('Auszahlungsanfrage erstellt. Wir prüfen diese zeitnah.');
      await load();
      setTimeout(() => setNotice(null), 3000);
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 shadow-sm">
          Lade Daten …
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Header */}
      <header className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold text-slate-900">
          Dein Bonus-Nest Dashboard
        </h1>
        <p className="text-sm text-slate-600">
          Behalte dein Guthaben, deine Transaktionen und deine Auszahlungen im Blick.
        </p>
      </header>

      {/* Top-Karten */}
      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <BalanceCard
          label="Auszahlbar"
          hint="Guthaben, das du aktuell anfordern kannst."
          value={balance?.available_balance ?? 0}
          color="emerald"
          emphasize
        />
        <BalanceCard
          label="In Bearbeitung"
          hint="Auszahlungsanfragen, die wir gerade prüfen oder auszahlen."
          value={balance?.pending_balance ?? 0}
          color="amber"
        />
        <BalanceCard
          label="Bereits ausgezahlt"
          hint="Summe deiner bisher ausgezahlten Gutscheine."
          value={balance?.total_paid ?? 0}
          color="sky"
        />
      </section>

      {/* Auszahlungskarte */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <h2 className="text-lg font-semibold text-slate-900">
                Gutschein anfordern
              </h2>
              <p className="text-sm text-slate-600">
                Wähle deinen Wunschgutschein und den Betrag. Wir prüfen deine Anfrage und senden dir den Code, sobald die Auszahlung bestätigt wurde.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setVoucherOpen((v) => !v)}
              className="mt-1 inline-flex items-center justify-center rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm hover:bg-slate-100"
            >
              {voucherOpen ? 'Gutscheine ausblenden' : 'Gutscheine anzeigen'}
            </button>
          </div>

          {/* Aktuell ausgewählter Gutschein */}
          <div className="text-xs text-slate-600">
            Ausgewählter Gutschein:{' '}
            <span className="font-medium text-slate-900">
              {selectedVoucher.label}
            </span>
          </div>

          {/* Gutschein-Auswahl */}
          {voucherOpen && (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {VOUCHERS.map((v) => {
                const isActive = v.id === selectedVoucherId;
                const minAmt = Math.min(...v.amounts);
                return (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => setSelectedVoucherId(v.id)}
                    className={[
                      'flex flex-col items-start rounded-xl border px-3 py-3 text-left text-sm transition',
                      'bg-slate-50 hover:bg-slate-100',
                      isActive ? 'border-slate-900 shadow-sm' : 'border-slate-200',
                    ].join(' ')}
                  >
                    <div className="flex w-full items-center justify-between gap-2">
                      <span className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
                        ab {fmtMoney.format(minAmt)}
                      </span>
                      <span
                        className={[
                          'h-4 w-4 rounded-full border',
                          isActive
                            ? 'border-slate-900 bg-slate-900'
                            : 'border-slate-300 bg-white',
                        ].join(' ')}
                      />
                    </div>
                    <div className="mt-2 text-base font-semibold text-slate-900">
                      {v.label}
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* Betrag */}
          <div className="mt-1">
            <div className="text-xs font-medium text-slate-700">Betrag</div>
            <div className="mt-2 flex flex-wrap gap-2">
              {(selectedVoucher?.amounts ?? []).map((amt) => {
                const active = amt === selectedAmount;
                const disabled = amt > available;
                return (
                  <button
                    key={amt}
                    type="button"
                    disabled={disabled}
                    onClick={() => setSelectedAmount(amt)}
                    className={[
                      'rounded-lg border px-3 py-1.5 text-xs font-medium shadow-sm transition',
                      active
                        ? 'border-slate-900 bg-slate-900 text-white'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50',
                      disabled ? 'opacity-50 cursor-not-allowed hover:bg-white' : '',
                    ].join(' ')}
                    title={disabled ? 'Nicht genügend Guthaben' : undefined}
                  >
                    {fmtMoney.format(amt)}
                  </button>
                );
              })}
            </div>
            <div className="mt-2 text-[11px] text-slate-500">
              Verfügbar:{' '}
              <span className="font-medium text-slate-700">
                {fmtMoney.format(available)}
              </span>
            </div>
          </div>

          {/* Button + Hinweise */}
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <button
              onClick={requestPayout}
              disabled={!canRequest || busy}
              className="inline-flex items-center justify-center rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              {busy
                ? 'Sende …'
                : `Gutschein anfordern (${fmtMoney.format(selectedAmount)})`}
            </button>

            <div className="text-xs text-slate-500">
              Maximal drei offene Auszahlungsanfragen gleichzeitig.
            </div>
          </div>

          {/* Status-Badges */}
          <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-slate-500">
            {openCount > 0 && (
              <span className="rounded-full bg-amber-50 px-2 py-0.5 text-amber-700">
                Offene Anfragen: {openCount}/3
              </span>
            )}

            {reachedLimit && (
              <span className="rounded-full bg-rose-50 px-2 py-0.5 text-rose-700">
                Limit erreicht. Bitte warte, bis eine Anfrage abgeschlossen ist.
              </span>
            )}

            {!reachedLimit && available < selectedAmount && (
              <span className="rounded-full bg-slate-50 px-2 py-0.5">
                Nicht genügend auszahlbares Guthaben für den ausgewählten Betrag.
              </span>
            )}
          </div>

          {notice && (
            <div className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-800">
              {notice}
            </div>
          )}
          {error && (
            <div className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
              Fehler: {error}
            </div>
          )}
        </div>
      </section>

      {/* Zwei Spalten: Abschlüsse & Auszahlungen */}
      <section className="grid gap-6 md:grid-cols-2">
        {/* Leads */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-900">
              Transaktionsverlauf
            </h2>
            <span className="text-xs text-slate-500">
              Letzte {leads.length} Transaktionen
            </span>
          </div>
          {leads.length === 0 ? (
            <Empty label="Noch keine Transaktionen." />
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-left">
                    <th className="px-2 py-1.5 font-medium text-slate-600">
                      Datum
                    </th>
                    <th className="px-2 py-1.5 font-medium text-slate-600">
                      Deal
                    </th>
                    <th className="px-2 py-1.5 font-medium text-slate-600">
                      Betrag
                    </th>
                    <th className="px-2 py-1.5 font-medium text-slate-600">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {leads.map((l) => (
                    <tr
                      key={l.id}
                      className="border-b border-slate-100 last:border-0"
                    >
                      <td className="px-2 py-1.5 text-slate-700">
                        {new Date(l.created_at).toLocaleDateString('de-DE')}
                      </td>
                      <td className="px-2 py-1.5">
                        <div className="flex items-center gap-2">
                          {l.offer_image && (
                            <img
                              src={l.offer_image}
                              alt=""
                              className="h-7 w-7 rounded border border-slate-200 bg-white object-contain"
                            />
                          )}
                          <span className="truncate text-slate-800">
                            {l.offer_title}
                          </span>
                        </div>
                      </td>
                      <td className="px-2 py-1.5 text-slate-700">
                        {l.amount != null ? fmtMoney.format(l.amount) : '–'}
                      </td>
                      <td className="px-2 py-1.5">
                        <LeadStatusBadge
                          confirmed={l.confirmed}
                          payoutReady={l.payout_ready}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Redemptions */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-900">
              Verlauf deiner Auszahlungen
            </h2>
            <span className="text-xs text-slate-500">
              Letzte {redemptions.length} Auszahlungen
            </span>
          </div>
          {redemptions.length === 0 ? (
            <Empty label="Noch keine Auszahlungen." />
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-left">
                    <th className="px-2 py-1.5 font-medium text-slate-600">
                      Datum
                    </th>
                    <th className="px-2 py-1.5 font-medium text-slate-600">
                      Betrag
                    </th>
                    <th className="px-2 py-1.5 font-medium text-slate-600">
                      Status
                    </th>
                    <th className="px-2 py-1.5 font-medium text-slate-600">
                      Art
                    </th>
                    <th className="px-2 py-1.5 font-medium text-slate-600">
                      Gutschein
                    </th>
                    <th className="px-2 py-1.5 font-medium text-slate-600">
                      Code
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {redemptions.map((r) => (
                    <tr
                      key={r.id}
                      className="border-b border-slate-100 last:border-0"
                    >
                      <td className="px-2 py-1.5 text-slate-700">
                        {new Date(r.created_at).toLocaleString('de-DE')}
                      </td>
                      <td className="px-2 py-1.5 text-slate-700">
                        {fmtMoney.format(r.amount)}
                      </td>
                      <td className="px-2 py-1.5">
                        <RedemptionBadge status={r.status} />
                      </td>
                      <td className="px-2 py-1.5 text-slate-700">
                        {r.payout_method === 'voucher'
                          ? 'Gutschein'
                          : r.payout_method === 'bank_transfer'
                          ? 'Überweisung'
                          : '–'}
                      </td>
                      <td className="px-2 py-1.5 text-slate-700">
                        {r.voucher_type ?? '–'}
                      </td>
                      <td className="px-2 py-1.5">
                        {r.payout_method === 'voucher' &&
                        r.status === 'paid' &&
                        r.voucher_code ? (
                          <CopyableCode code={r.voucher_code} />
                        ) : (
                          <span className="text-[11px] text-slate-400">
                            Noch nicht verfügbar
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

/* =================== Hilfs-Components =================== */

function BalanceCard({
  label,
  hint,
  value,
  color,
  emphasize,
}: {
  label: string;
  hint?: string;
  value: number;
  color: 'amber' | 'emerald' | 'sky';
  emphasize?: boolean;
}) {
  const colorMap: Record<string, string> = {
    amber: 'text-amber-600',
    emerald: 'text-emerald-600',
    sky: 'text-sky-600',
  };
  const borderMap: Record<string, string> = {
    amber: 'border-amber-100',
    emerald: 'border-emerald-100',
    sky: 'border-sky-100',
  };
  const safe = Number.isFinite(value) ? value : 0;

  return (
    <div
      className={`flex flex-col justify-between rounded-2xl border bg-white p-4 shadow-sm ${
        borderMap[color]
      } ${emphasize ? 'ring-1 ring-slate-900/5' : ''}`}
    >
      <div>
        <div className="text-xs font-medium uppercase tracking-wide text-slate-500">
          {label}
        </div>
        {hint && (
          <div className="mt-1 text-[11px] text-slate-500">{hint}</div>
        )}
      </div>
      <div className={`mt-3 text-2xl font-semibold ${colorMap[color]}`}>
        {safe.toFixed(2)} €
      </div>
    </div>
  );
}

function Empty({ label }: { label: string }) {
  return (
    <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-3 py-4 text-center text-xs text-slate-500">
      {label}
    </div>
  );
}

function LeadStatusBadge({
  confirmed,
  payoutReady,
}: {
  confirmed: boolean;
  payoutReady: boolean;
}) {
  if (!confirmed)
    return (
      <span className="inline-flex rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-700">
        Offen
      </span>
    );
  if (payoutReady)
    return (
      <span className="inline-flex rounded-full bg-sky-100 px-2 py-0.5 text-[11px] font-medium text-sky-800">
        Auszahlbar
      </span>
    );
  return (
    <span className="inline-flex rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-medium text-emerald-800">
        Bestätigt
      </span>
    );
}

function RedemptionBadge({
  status,
}: {
  status: 'pending' | 'approved' | 'processing' | 'paid' | 'rejected';
}) {
  const map: Record<string, string> = {
    pending: 'bg-slate-100 text-slate-800',
    approved: 'bg-sky-100 text-sky-800',
    processing: 'bg-amber-100 text-amber-800',
    paid: 'bg-emerald-100 text-emerald-800',
    rejected: 'bg-rose-100 text-rose-800',
  };
  const labelMap: Record<string, string> = {
    pending: 'Offen',
    approved: 'Freigegeben',
    processing: 'In Bearbeitung',
    paid: 'Ausgezahlt',
    rejected: 'Abgelehnt',
  };
  return (
    <span
      className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium ${
        map[status] || 'bg-slate-100 text-slate-800'
      }`}
    >
      {labelMap[status] ?? status}
    </span>
  );
}

function CopyableCode({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // ignore
    }
  }

  return (
    <button
      onClick={handleCopy}
      className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] font-mono text-slate-800 hover:bg-slate-100"
    >
      <span className="truncate max-w-[120px]">{code}</span>
      <span className="text-[10px] text-slate-500">
        {copied ? 'Kopiert' : 'Kopieren'}
      </span>
    </button>
  );
}

function humanizeError(msg: string) {
  if (msg.includes('too_many_open_requests'))
    return 'Du kannst maximal drei offene Auszahlungsanfragen gleichzeitig haben.';
  if (msg.includes('request_exists') || msg.includes('open voucher redemption'))
    return 'Es gibt bereits eine offene Auszahlungsanfrage.';
  if (msg.includes('insufficient') || msg.includes('balance'))
    return 'Nicht genügend auszahlbares Guthaben.';
  if (msg.includes('minimum payout'))
    return 'Mindestbetrag für diesen Gutschein ist nicht erreicht.';
  return msg;
}
