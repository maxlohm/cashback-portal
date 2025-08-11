'use client';

import { useEffect, useMemo, useState } from 'react';
import Papa from 'papaparse';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';

type CsvRow = {
  user_id: string;
  offer_id: string;
  amount: string | number;
  click_id?: string; // optional, falls vorhanden
};

export default function AdminImportPage() {
  const supabase = useMemo(() => (typeof window === 'undefined' ? null : createClientComponentClient()), []);
  const router = useRouter();

  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<string>('');
  const [allowed, setAllowed] = useState<boolean | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!supabase) return;
    (async () => {
      const { data: userData } = await supabase.auth.getUser();
      const uid = userData?.user?.id;
      if (!uid) return setAllowed(false);
      const { data, error } = await supabase.from('profiles').select('role').eq('id', uid).single();
      if (error) return setAllowed(false);
      setAllowed(data?.role === 'admin');
    })();
  }, [supabase]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) setFile(e.target.files[0]);
  };

  const handleImport = () => {
    if (!file || busy) return;

    setBusy(true);
    setResult('Lese CSV…');

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true,
      complete: async ({ data, errors }) => {
        if (errors?.length) {
          setBusy(false);
          setResult(`❌ CSV-Fehler: ${errors[0].message}`);
          return;
        }

        // Basic Validation & Trim
        const rows: CsvRow[] = (data as any[])
          .map((r) => ({
            user_id: String(r.user_id || '').trim(),
            offer_id: String(r.offer_id || '').trim(),
            amount: r.amount,
            click_id: r.click_id ? String(r.click_id).trim() : undefined,
          }))
          .filter((r) => r.user_id && r.offer_id && (r.amount ?? '') !== '');

        if (!rows.length) {
          setBusy(false);
          setResult('❌ Keine validen Zeilen gefunden.');
          return;
        }

        try {
          const res = await fetch('/api/admin/import-confirmed-leads', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ rows }),
          });
          const body = await res.json().catch(() => ({}));
          if (res.ok) {
            setResult(`✅ Import fertig: ${body.inserted} neu, ${body.deduped} Duplikate, ${body.failed} Fehler.`);
          } else {
            setResult(`❌ Import fehlgeschlagen (${res.status}): ${body?.error || 'Unbekannter Fehler'}`);
          }
        } catch (e: any) {
          setResult(`❌ Netzwerkfehler: ${e?.message || e}`);
        } finally {
          setBusy(false);
        }
      },
      error: (error) => {
        setBusy(false);
        setResult(`❌ Fehler beim Parsen: ${error.message}`);
      },
    });
  };

  if (allowed === null) return <p className="p-6">Authentifiziere…</p>;
  if (allowed === false) {
    router.push('/');
    return null;
  }

  return (
    <div className="max-w-xl mx-auto py-10 px-4 sm:px-6">
      <h1 className="text-2xl font-bold mb-6">CSV-Import – bestätigte Leads</h1>

      <div className="space-y-3">
        <input type="file" accept=".csv" onChange={handleFileChange} className="mb-2" />
        <button
          onClick={handleImport}
          disabled={!file || busy}
          className="bg-[#003b5b] text-white px-6 py-2 rounded disabled:opacity-60 hover:bg-[#005b91]"
        >
          {busy ? 'Import läuft…' : 'Import starten'}
        </button>
      </div>

      {result && <p className="mt-6 text-sm text-gray-700 whitespace-pre-wrap">{result}</p>}

      <p className="mt-4 text-xs text-gray-500">
        Erwartete Spalten: <code>user_id</code>, <code>offer_id</code>, <code>amount</code> (optional{' '}
        <code>click_id</code>).
      </p>
    </div>
  );
}
