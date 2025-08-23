'use client';

import { useEffect, useMemo, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

type Status = 'pending' | 'approved' | 'processing' | 'paid' | 'rejected';

type Row = {
  redemption_id: string;
  user_id: string;
  user_email: string | null;
  amount: number;
  status: Status;
  created_at: string;
  total_count: number; // kommt aus admin_list_redemptions (count(*) over ())
};

type KPI = { totalPaid: number; totalPending: number; totalProcessing: number };

const fmtMoney = new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' });
const fmtDate = new Intl.DateTimeFormat('de-DE', { dateStyle: 'short', timeStyle: 'short' });

export default function AdminRedemptionsClient() {
  const supabase = useMemo(() => createClientComponentClient(), []);

  // Daten & UI-State
  const [rows, setRows] = useState<Row[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  // Filter/Sort/Paging (serverseitig)
  const [status, setStatus] = useState<'all' | Status>('all');
  const [month, setMonth] = useState<string>('all'); // YYYY-MM
  const [search, setSearch] = useState<string>(''); // email contains
  const [sortKey, setSortKey] = useState<'created_at' | 'user_email' | 'amount' | 'status'>('created_at');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 50;

  // KPIs (aus DB)
  const [kpi, setKpi] = useState<KPI>({ totalPaid: 0, totalPending: 0, totalProcessing: 0 });

  // Daten laden
  const load = async () => {
    setLoading(true);

    const p_status = status === 'all' ? null : status;
    const p_month = month === 'all' ? null : month;
    const offset = (page - 1) * PAGE_SIZE;

    const [{ data, error }, { data: kpiData, error: kpiErr }] = await Promise.all([
      supabase.rpc('admin_list_redemptions', {
        p_status,
        p_month,
        p_search: search || null,
        p_sort: sortKey,
        p_dir: sortDir,
        p_limit: PAGE_SIZE,
        p_offset: offset,
      }),
      supabase.rpc('admin_redemptions_kpis', { p_month, p_search: search || null }),
    ]);

    if (error) {
      console.error('admin_list_redemptions:', error.message);
      setRows([]);
      setTotal(0);
    } else {
      const list = (data || []) as Row[];
      setRows(list);
      setTotal(list.length ? Number(list[0].total_count) : 0);
    }

    if (!kpiErr && Array.isArray(kpiData) && kpiData[0]) {
      const k = kpiData[0] as any;
      setKpi({
        totalPaid: Number(k.total_paid ?? 0),
        totalPending: Number(k.total_pending ?? 0),
        totalProcessing: Number(k.total_processing ?? 0),
      });
    }

    setLoading(false);
  };

  // Initial + bei Filter/Sort/Paging
  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, month, sortKey, sortDir, page]);

  // Debounce auf die Suche
  useEffect(() => {
    const t = setTimeout(() => {
      setPage(1);
      load();
    }, 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const toggleSort = (k: typeof sortKey) => {
    if (sortKey === k) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else {
      setSortKey(k);
      setSortDir('asc');
    }
  };

  // Optimistisches Status-Update
  const updateStatus = async (id: string, newStatus: Status) => {
    setBusyId(id);
    const prev = rows;
    const next = rows.map((r) => (r.redemption_id === id ? { ...r, status: newStatus } : r));
    setRows(next);

    const { error } = await supabase.rpc('admin_update_redemption_status', {
      redemption_id: id,
      new_status: newStatus,
    });

    setBusyId(null);

    if (error) {
      setRows(prev);
      alert('Fehler: ' + error.message);
      return;
    }

    setNotice(`Status aktualisiert: ${newStatus}`);
    load();
    setTimeout(() => setNotice(null), 2000);
  };

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const exportCsv = () => {
    const header = ['created_at', 'user_email', 'user_id', 'amount', 'status'];
    const escape = (s: string) => `"${s.replace(/"/g, '""')}"`;
    const lines = [header.join(',')];
    rows.forEach((r) => {
      lines.push(
        [r.created_at, r.user_email || '', r.user_id, r.amount.toFixed(2), r.status]
          .map((v) => escape(String(v)))
          .join(',')
      );
    });
    const blob = new Blob([lines.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `redemptions-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Admin – Auszahlungen</h1>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <KpiCard label="Bereits ausgezahlt" value={kpi.totalPaid} />
        <KpiCard label="Offen (pending)" value={kpi.totalPending} />
        <KpiCard label="In Bearbeitung" value={kpi.totalProcessing} />
      </div>

      {/* Filter */}
      <div className="flex flex-wrap gap-3 items-end">
        <div className="flex flex-col">
          <label className="text-xs text-gray-500">Status</label>
          <select
            value={status}
            onChange={(e) => {
              setPage(1);
              setStatus(e.target.value as any);
            }}
            className="border p-2 rounded min-w-[160px]"
          >
            <option value="all">Alle</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="processing">Processing</option>
            <option value="paid">Paid</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
        <div className="flex flex-col">
          <label className="text-xs text-gray-500">Monat</label>
          <input
            type="month"
            value={month === 'all' ? '' : month}
            onChange={(e) => {
              setPage(1);
              setMonth(e.target.value || 'all');
            }}
            className="border p-2 rounded"
          />
        </div>
        <div className="flex flex-col flex-1 min-w-[200px]">
          <label className="text-xs text-gray-500">E-Mail</label>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Suchen…"
            className="border p-2 rounded w-full"
          />
        </div>
        <button onClick={exportCsv} className="px-3 py-2 border rounded bg-white hover:shadow" disabled={loading}>
          CSV exportieren
        </button>
      </div>

      {notice && <div className="text-green-600 text-sm">{notice}</div>}

      {/* Tabelle */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100 text-left">
              <Th onClick={() => toggleSort('created_at')} active={sortKey === 'created_at'} dir={sortDir}>
                Datum
              </Th>
              <Th onClick={() => toggleSort('user_email')} active={sortKey === 'user_email'} dir={sortDir}>
                User
              </Th>
              <Th onClick={() => toggleSort('amount')} active={sortKey === 'amount'} dir={sortDir}>
                Betrag
              </Th>
              <Th onClick={() => toggleSort('status')} active={sortKey === 'status'} dir={sortDir}>
                Status
              </Th>
              <th className="p-2">Aktionen</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td className="p-4" colSpan={5}>
                  Lade…
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td className="p-4" colSpan={5}>
                  Keine Daten
                </td>
              </tr>
            ) : (
              rows.map((r) => (
                <tr key={r.redemption_id} className="border-b">
                  <td className="p-2">{fmtDate.format(new Date(r.created_at))}</td>
                  <td className="p-2">{r.user_email || r.user_id}</td>
                  <td className="p-2">{fmtMoney.format(r.amount)}</td>
                  <td className="p-2">
                    <StatusBadge status={r.status} />
                  </td>
                  <td className="p-2 flex flex-wrap gap-2">
                    {r.status === 'pending' && (
                      <>
                        <Btn disabled={busyId === r.redemption_id} onClick={() => updateStatus(r.redemption_id, 'approved')} label="Approve" kind="green" />
                        <Btn disabled={busyId === r.redemption_id} onClick={() => updateStatus(r.redemption_id, 'rejected')} label="Reject" kind="red" />
                      </>
                    )}
                    {r.status === 'approved' && (
                      <Btn disabled={busyId === r.redemption_id} onClick={() => updateStatus(r.redemption_id, 'processing')} label="Processing" kind="blue" />
                    )}
                    {r.status === 'processing' && (
                      <Btn disabled={busyId === r.redemption_id} onClick={() => updateStatus(r.redemption_id, 'paid')} label="Mark Paid" kind="dark" />
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between gap-3">
        <div className="text-sm text-gray-500">
          {total} Einträge • Seite {page} / {Math.max(1, Math.ceil(total / PAGE_SIZE))}
        </div>
        <div className="flex gap-2">
          <button className="px-2 py-1 border rounded" disabled={page <= 1 || loading} onClick={() => setPage((p) => Math.max(1, p - 1))}>
            Zurück
          </button>
          <button
            className="px-2 py-1 border rounded"
            disabled={page >= Math.ceil(total / PAGE_SIZE) || loading}
            onClick={() => setPage((p) => p + 1)}
          >
            Weiter
          </button>
        </div>
      </div>
    </div>
  );
}

/* =================== kleine Hilfs-Components =================== */

function Th({
  children,
  onClick,
  active,
  dir,
}: {
  children: any;
  onClick: () => void;
  active: boolean;
  dir: 'asc' | 'desc';
}) {
  return (
    <th className={`p-2 cursor-pointer select-none ${active ? 'underline' : ''}`} onClick={onClick}>
      <div className="flex items-center gap-1">
        <span>{children}</span>
        {active && <span>{dir === 'asc' ? '▲' : '▼'}</span>}
      </div>
    </th>
  );
}

function Btn({ onClick, label, kind, disabled }: { onClick: () => void; label: string; kind: 'green' | 'red' | 'blue' | 'dark'; disabled?: boolean }) {
  const map: Record<string, string> = { green: 'bg-green-500', red: 'bg-red-500', blue: 'bg-blue-500', dark: 'bg-gray-800' };
  return (
    <button disabled={disabled} onClick={onClick} className={`px-2 py-1 text-white rounded ${map[kind]} hover:opacity-90 disabled:opacity-50`}>
      {label}
    </button>
  );
}

function StatusBadge({ status }: { status: Status }) {
  const map: Record<string, string> = {
    pending: 'bg-gray-200 text-gray-800',
    approved: 'bg-blue-200 text-blue-900',
    processing: 'bg-yellow-200 text-yellow-900',
    paid: 'bg-green-200 text-green-900',
    rejected: 'bg-red-200 text-red-900',
  };
  return <span className={`px-2 py-1 text-xs rounded ${map[status] || 'bg-gray-200'}`}>{status}</span>;
}

function KpiCard({ label, value }: { label: string; value: number }) {
  const safe = Number.isFinite(value) ? value : 0;
  return (
    <div className="p-4 rounded-xl border bg-white shadow">
      <div className="text-sm text-gray-500">{label}</div>
      <div className="text-2xl font-bold">{safe.toFixed(2)} €</div>
    </div>
  );
}
