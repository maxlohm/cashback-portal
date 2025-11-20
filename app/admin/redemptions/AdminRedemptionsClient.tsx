'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

type RedemptionStatus = 'pending' | 'approved' | 'processing' | 'paid' | 'rejected';

type RedemptionRow = {
  redemption_id: string;
  user_id: string;
  user_email: string;
  amount: number;
  status: RedemptionStatus;
  provider: string | null;
  sku: string | null;
  created_at: string;
  payout_method?: 'voucher' | 'bank_transfer' | null;
  voucher_type?: string | null;
  voucher_code?: string | null;
};

const fmtMoney = new Intl.NumberFormat('de-DE', {
  style: 'currency',
  currency: 'EUR',
});

const STATUS_LABEL: Record<RedemptionStatus, string> = {
  pending: 'Offen',
  approved: 'Freigegeben',
  processing: 'In Bearbeitung',
  paid: 'Ausgezahlt',
  rejected: 'Abgelehnt',
};

const STATUS_COLORS: Record<RedemptionStatus, string> = {
  pending: 'bg-slate-100 text-slate-800',
  approved: 'bg-sky-100 text-sky-800',
  processing: 'bg-amber-100 text-amber-800',
  paid: 'bg-emerald-100 text-emerald-800',
  rejected: 'bg-rose-100 text-rose-800',
};

export default function RedemptionsClient() {
  const supabase = useMemo(() => createClientComponentClient(), []);

  const [rows, setRows] = useState<RedemptionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const [statusFilter, setStatusFilter] = useState<
    'all' | RedemptionStatus
  >('all');
  const [monthFilter, setMonthFilter] = useState<string>('all'); // 'all' | 'YYYY-MM'
  const [search, setSearch] = useState<string>('');

  // ========= Laden =========
  const load = async () => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: rpcError } = await supabase.rpc('admin_get_redemptions');
      if (rpcError) throw rpcError;

      const mapped: RedemptionRow[] = (data || []).map((r: any) => ({
        redemption_id: r.redemption_id,
        user_id: r.user_id,
        user_email: r.user_email,
        amount: Number(r.amount ?? 0),
        status: r.status as RedemptionStatus,
        provider: r.provider ?? null,
        sku: r.sku ?? null,
        created_at: r.created_at,
        payout_method: r.payout_method ?? null,
        voucher_type: r.voucher_type ?? null,
        voucher_code: r.voucher_code ?? null,
      }));

      setRows(mapped);
    } catch (e: any) {
      console.error(e);
      setError(e?.message ?? 'Fehler beim Laden der Auszahlungen.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ========= Filter-Logik =========
  const filteredRows = useMemo(() => {
    return rows.filter((r) => {
      if (statusFilter !== 'all' && r.status !== statusFilter) return false;

      if (monthFilter !== 'all') {
        const d = new Date(r.created_at);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        if (key !== monthFilter) return false;
      }

      if (search.trim()) {
        const s = search.trim().toLowerCase();
        const hay = [
          r.user_email,
          r.provider ?? '',
          r.sku ?? '',
          r.voucher_type ?? '',
          r.voucher_code ?? '',
        ]
          .join(' ')
          .toLowerCase();
        if (!hay.includes(s)) return false;
      }

      return true;
    });
  }, [rows, statusFilter, monthFilter, search]);

  // ========= KPIs =========
  const kpis = useMemo(() => {
    const total = rows.reduce((a, r) => a + r.amount, 0);
    const pending = rows
      .filter((r) =>
        ['pending', 'approved', 'processing'].includes(r.status),
      )
      .reduce((a, r) => a + r.amount, 0);
    const paid = rows
      .filter((r) => r.status === 'paid')
      .reduce((a, r) => a + r.amount, 0);

    return { total, pending, paid };
  }, [rows]);

  // Monate für Filter
  const monthOptions = useMemo(() => {
    const set = new Set<string>();
    rows.forEach((r) => {
      const d = new Date(r.created_at);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      set.add(key);
    });
    return Array.from(set).sort().reverse();
  }, [rows]);

  // ========= Status ändern =========
  const updateStatus = async (row: RedemptionRow, newStatus: RedemptionStatus) => {
    setBusyId(row.redemption_id);
    setError(null);
    setNotice(null);

    try {
      const { error: rpcError } = await supabase.rpc(
        'admin_update_redemption_status',
        {
          redemption_id: row.redemption_id,
          new_status: newStatus,
        },
      );

      if (rpcError) throw rpcError;

      setRows((prev) =>
        prev.map((r) =>
          r.redemption_id === row.redemption_id ? { ...r, status: newStatus } : r,
        ),
      );
      setNotice(`Status für ${row.user_email} → ${STATUS_LABEL[newStatus]}`);
    } catch (e: any) {
      console.error(e);
      setError(e?.message ?? 'Fehler beim Aktualisieren des Status.');
    } finally {
      setBusyId(null);
      setTimeout(() => setNotice(null), 2500);
    }
  };

  // ========= Gutscheincode speichern =========
  const updateVoucherCode = async (row: RedemptionRow, voucherCode: string) => {
    const trimmed = voucherCode.trim();
    if (!trimmed && !row.voucher_code) return;

    setBusyId(row.redemption_id);
    setError(null);
    setNotice(null);

    try {
      const { error: updErr } = await supabase
        .from('redemptions')
        .update({
          voucher_code: trimmed || null,
          payout_method: trimmed ? 'voucher' : row.payout_method ?? null,
        })
        .eq('id', row.redemption_id);

      if (updErr) throw updErr;

      setRows((prev) =>
        prev.map((r) =>
          r.redemption_id === row.redemption_id
            ? {
                ...r,
                voucher_code: trimmed || null,
                payout_method: trimmed ? 'voucher' : r.payout_method,
              }
            : r,
        ),
      );
      setNotice(`Gutscheincode für ${row.user_email} gespeichert.`);
    } catch (e: any) {
      console.error(e);
      setError(e?.message ?? 'Fehler beim Speichern des Gutscheincodes.');
    } finally {
      setBusyId(null);
      setTimeout(() => setNotice(null), 2500);
    }
  };

  // ========= CSV-Export =========
  const exportCsv = () => {
    const header = [
      'Datum',
      'User',
      'Betrag',
      'Status',
      'Art',
      'Gutschein',
      'Code',
      'Provider',
      'SKU',
    ];

    const rowsCsv = filteredRows.map((r) => {
      const d = new Date(r.created_at).toLocaleString('de-DE');
      const method =
        r.payout_method === 'voucher'
          ? 'Gutschein'
          : r.payout_method === 'bank_transfer'
          ? 'Überweisung'
          : '';
      return [
        d,
        r.user_email,
        r.amount.toFixed(2).replace('.', ','),
        STATUS_LABEL[r.status],
        method,
        r.voucher_type ?? '',
        r.voucher_code ?? '',
        r.provider ?? '',
        r.sku ?? '',
      ];
    });

    const csv =
      [header, ...rowsCsv]
        .map((line) =>
          line.map((field) => `"${String(field).replace(/"/g, '""')}"`).join(';'),
        )
        .join('\n') + '\n';

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `redemptions_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ========= Render =========
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold text-slate-900">
          Admin – Auszahlungen & Guthaben
        </h1>
        <p className="text-sm text-slate-600">
          Hier siehst du alle Auszahlungsanfragen, kannst Status ändern und
          Gutscheincodes pflegen.
        </p>
      </header>

      {/* KPIs */}
      <section className="grid gap-4 md:grid-cols-3">
        <Kpi
          label="Gesamtvolumen"
          value={fmtMoney.format(kpis.total)}
          hint="Summe aller Auszahlungen (brutto)"
        />
        <Kpi
          label="Offen / in Bearbeitung"
          value={fmtMoney.format(kpis.pending)}
          hint="pending / approved / processing"
        />
        <Kpi
          label="Bereits ausgezahlt"
          value={fmtMoney.format(kpis.paid)}
          hint="Status = paid"
        />
      </section>

      {/* Filter & Aktionen */}
      <section className="flex flex-wrap items-center gap-3">
        <div className="flex flex-wrap gap-2">
          {(['all', 'pending', 'approved', 'processing', 'paid', 'rejected'] as const).map(
            (s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={[
                  'rounded border px-3 py-1.5 text-xs',
                  statusFilter === s
                    ? 'border-slate-900 bg-slate-900 text-white'
                    : 'border-slate-200 bg-white text-slate-800',
                ].join(' ')}
              >
                {s === 'all'
                  ? 'Alle'
                  : s === 'pending'
                  ? 'Offen'
                  : s === 'approved'
                  ? 'Freigegeben'
                  : s === 'processing'
                  ? 'In Bearbeitung'
                  : s === 'paid'
                  ? 'Ausgezahlt'
                  : 'Abgelehnt'}
              </button>
            ),
          )}
        </div>

        <select
          className="rounded border border-slate-200 bg-white px-2 py-1.5 text-xs"
          value={monthFilter}
          onChange={(e) => setMonthFilter(e.target.value)}
        >
          <option value="all">Alle Monate</option>
          {monthOptions.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>

        <input
          type="text"
          placeholder="Suche: E-Mail / Gutschein / Provider…"
          className="min-w-[180px] flex-1 rounded border border-slate-200 px-2 py-1.5 text-xs"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <button
          onClick={exportCsv}
          className="ml-auto rounded border border-slate-200 bg-white px-3 py-1.5 text-xs"
        >
          CSV exportieren
        </button>
      </section>

      {/* Tabelle */}
      <section className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full text-xs">
          <thead className="border-b border-slate-200 bg-slate-50">
            <tr>
              <Th>Datum</Th>
              <Th>User</Th>
              <Th>Betrag</Th>
              <Th>Status</Th>
              <Th>Art</Th>
              <Th>Gutschein</Th>
              <Th>Code</Th>
              <Th>Provider</Th>
              <Th>SKU</Th>
              <Th>Aktionen</Th>
            </tr>
          </thead>
          <tbody>
            {filteredRows.length === 0 && (
              <tr>
                <td
                  colSpan={10}
                  className="py-6 text-center text-slate-500"
                >
                  Keine Auszahlungen gefunden.
                </td>
              </tr>
            )}

            {filteredRows.map((r) => (
              <tr
                key={r.redemption_id}
                className="border-b border-slate-100 last:border-0"
              >
                <Td>{new Date(r.created_at).toLocaleString('de-DE')}</Td>

                <Td className="max-w-[220px]">
                  <div className="flex flex-col">
                    <span className="font-medium text-slate-900">
                      {r.user_email}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {r.user_id}
                    </span>
                  </div>
                </Td>

                <Td>{fmtMoney.format(r.amount)}</Td>

                <Td>
                  <span
                    className={[
                      'inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium',
                      STATUS_COLORS[r.status],
                    ].join(' ')}
                  >
                    {STATUS_LABEL[r.status]}
                  </span>
                </Td>

                <Td>
                  {r.payout_method === 'voucher'
                    ? 'Gutschein'
                    : r.payout_method === 'bank_transfer'
                    ? 'Überweisung'
                    : '–'}
                </Td>

                <Td>{r.voucher_type ?? '–'}</Td>

                <Td>
                  <VoucherEditor
                    row={r}
                    disabled={busyId === r.redemption_id}
                    onSave={updateVoucherCode}
                  />
                </Td>

                <Td>{r.provider ?? '–'}</Td>
                <Td>{r.sku ?? '–'}</Td>

                <Td>
                  <div className="flex flex-wrap gap-1">
                    <StatusButton
                      label="Offen"
                      target="pending"
                      current={r.status}
                      onClick={() => updateStatus(r, 'pending')}
                      busy={busyId === r.redemption_id}
                    />
                    <StatusButton
                      label="Freigeben"
                      target="approved"
                      current={r.status}
                      onClick={() => updateStatus(r, 'approved')}
                      busy={busyId === r.redemption_id}
                    />
                    <StatusButton
                      label="In Bearbeitung"
                      target="processing"
                      current={r.status}
                      onClick={() => updateStatus(r, 'processing')}
                      busy={busyId === r.redemption_id}
                    />
                    <StatusButton
                      label="Paid"
                      target="paid"
                      current={r.status}
                      onClick={() => updateStatus(r, 'paid')}
                      busy={busyId === r.redemption_id}
                    />
                    <StatusButton
                      label="Ablehnen"
                      target="rejected"
                      current={r.status}
                      onClick={() => updateStatus(r, 'rejected')}
                      busy={busyId === r.redemption_id}
                    />
                  </div>
                </Td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {loading && (
        <div className="text-xs text-slate-500">Lade Daten …</div>
      )}
      {notice && (
        <div className="rounded border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-700">
          {notice}
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

/* ==== UI-Helpers ==== */

function Kpi(props: {
  label: string;
  value: string;
  hint?: string;
}) {
  const { label, value, hint } = props;
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="text-xs font-medium uppercase tracking-wide text-slate-500">
        {label}
      </div>
      <div className="mt-1 text-xl font-semibold text-slate-900">
        {value}
      </div>
      {hint && (
        <div className="mt-1 text-[11px] text-slate-500">{hint}</div>
      )}
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th className="px-3 py-2 text-left text-[11px] font-semibold text-slate-600">
      {children}
    </th>
  );
}

function Td({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <td
      className={`px-3 py-2 align-top text-[11px] text-slate-800 ${className}`}
    >
      {children}
    </td>
  );
}

function StatusButton(props: {
  label: string;
  target: RedemptionStatus;
  current: RedemptionStatus;
  onClick: () => void;
  busy: boolean;
}) {
  const { label, target, current, onClick, busy } = props;
  const active = current === target;

  return (
    <button
      disabled={busy || active}
      onClick={onClick}
      className={[
        'rounded border px-2 py-0.5 text-[10px]',
        active
          ? 'border-slate-900 bg-slate-900 text-white'
          : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50',
        busy ? 'cursor-wait opacity-60' : '',
      ].join(' ')}
    >
      {label}
    </button>
  );
}

function VoucherEditor(props: {
  row: RedemptionRow;
  disabled: boolean;
  onSave: (row: RedemptionRow, code: string) => void;
}) {
  const { row, disabled, onSave } = props;
  const [value, setValue] = useState(row.voucher_code ?? '');
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    setValue(row.voucher_code ?? '');
    setDirty(false);
  }, [row.voucher_code, row.redemption_id]);

  const handleSave = () => {
    if (!dirty) return;
    onSave(row, value);
    setDirty(false);
  };

  return (
    <div className="flex items-center gap-1">
      <input
        type="text"
        className="w-32 rounded border border-slate-200 px-1.5 py-0.5 text-[11px]"
        placeholder="Code…"
        value={value}
        disabled={disabled}
        onChange={(e) => {
          setValue(e.target.value);
          setDirty(true);
        }}
      />
      <button
        disabled={disabled || !dirty}
        onClick={handleSave}
        className="rounded border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] disabled:opacity-40"
      >
        Save
      </button>
    </div>
  );
}
