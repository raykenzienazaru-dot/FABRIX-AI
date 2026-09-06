"use client";

import { useEffect, useState } from "react";
import AppShell, { AppLoading } from "@/components/AppShell";
import AnalysisCard from "@/components/AnalysisCard";
import { apiGet, apiPostJson } from "@/lib/api";
import { useAppSession } from "@/lib/useAppSession";
import type { Analysis } from "@/types/analysis";
import { analysisDetectionLabel, fabricDisplayName } from "@/types/analysis";

export default function ComparisonPage() {
  const auth = useAppSession();
  const [history, setHistory] = useState<Analysis[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [comparison, setComparison] = useState<Analysis[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [comparing, setComparing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!auth.session) return;
    const preset = new URLSearchParams(window.location.search).get("selected");
    apiGet("/api/scan/history")
      .then((response) => {
        const analyses: Analysis[] = response.analyses || [];
        setHistory(analyses);
        if (preset && analyses.some((item) => item.id === preset)) setSelected([preset]);
      })
      .catch((requestError) => setError(requestError.message || "Analisis tersimpan belum dapat dimuat."))
      .finally(() => setLoading(false));
  }, [auth.session]);

  function toggle(id: string) {
    setComparison(null);
    setSelected((current) => {
      if (current.includes(id)) return current.filter((item) => item !== id);
      if (current.length >= 3) return current;
      return [...current, id];
    });
  }

  async function compare() {
    if (selected.length < 2) return;
    setComparing(true);
    setError(null);
    try {
      const response = await apiPostJson("/api/scan/compare", { ids: selected });
      const returned: Analysis[] = response.comparison || [];
      setComparison(selected.map((id) => returned.find((item) => item.id === id)).filter(Boolean) as Analysis[]);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Perbandingan belum dapat disiapkan.");
    } finally {
      setComparing(false);
    }
  }

  if (auth.loading) return <AppLoading label="Menyiapkan perbandingan..." />;

  return (
    <AppShell
      title="Bandingkan kain dengan lebih mudah."
      description="Pilih dua atau tiga analisis tersimpan, lalu tinjau nilainya secara berdampingan. FABRIX tidak menentukan pemenang secara otomatis."
      profile={auth.profile}
      email={auth.session?.user.email}
    >
      {error && <p role="alert" className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">{error}</p>}

      <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-border bg-white p-5 shadow-card sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-semibold text-deep">{selected.length} dari 3 dipilih</p>
          <p className="mt-1 text-xs text-muted">Pilih minimal dua analisis.</p>
        </div>
        <button type="button" onClick={compare} disabled={selected.length < 2 || comparing} className="min-h-11 rounded-xl bg-primary px-6 text-sm font-semibold text-white transition hover:bg-secondary disabled:opacity-45">
          {comparing ? "Menyiapkan Perbandingan..." : "Bandingkan Pilihan"}
        </button>
      </div>

      {loading ? (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">{[0, 1, 2].map((item) => <div key={item} className="h-80 animate-pulse rounded-2xl bg-white" />)}</div>
      ) : history.length ? (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {history.map((analysis) => <AnalysisCard key={analysis.id} analysis={analysis} selectable selected={selected.includes(analysis.id)} onSelect={() => toggle(analysis.id)} />)}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-sage bg-white p-10 text-center text-sm text-muted">Simpan minimal dua hasil analisis untuk mulai membandingkan.</div>
      )}

      {comparison && comparison.length >= 2 && (
        <section className="mt-10">
          <h2 className="font-display text-3xl font-semibold text-deep">Hasil Perbandingan</h2>
          <p className="mt-2 text-sm text-muted">Nilai ditampilkan sesuai data yang tersimpan pada setiap analisis.</p>
          <div className="mt-5 overflow-x-auto pb-3">
            <div className="grid min-w-[44rem] gap-4" style={{ gridTemplateColumns: `repeat(${comparison.length}, minmax(13rem, 1fr))` }}>
              {comparison.map((analysis) => (
                <article key={analysis.id} className="overflow-hidden rounded-2xl border border-border bg-white shadow-card">
                  <div className="aspect-[16/10] bg-surface2">
                    {analysis.image_url && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={analysis.image_url} alt={fabricDisplayName(analysis.fabric_name)} className="h-full w-full object-cover" />
                    )}
                  </div>
                  <div className="p-5">
                    <h3 className="font-display text-xl font-semibold text-deep">{fabricDisplayName(analysis.fabric_name)}</h3>
                    
                    <ComparisonRow label="Karakteristik Terdeteksi" value={analysisDetectionLabel(analysis) || "Tidak tersedia"} />
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}
    </AppShell>
  );
}

function ComparisonRow({ label, value }: { label: string; value: string }) {
  return <div className="mt-4 border-t border-border pt-4"><p className="text-[10px] font-semibold uppercase tracking-wide text-muted">{label}</p><p className="mt-1 text-sm font-semibold text-primary">{value}</p></div>;
}
