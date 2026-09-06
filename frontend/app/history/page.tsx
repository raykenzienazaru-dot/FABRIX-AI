"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import AppShell, { AppLoading } from "@/components/AppShell";
import AnalysisCard from "@/components/AnalysisCard";
import { apiGet } from "@/lib/api";
import { useAppSession } from "@/lib/useAppSession";
import type { Analysis } from "@/types/analysis";

export default function HistoryPage() {
  const auth = useAppSession();
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!auth.session) return;
    apiGet("/api/scan/history")
      .then((response) => setAnalyses(response.analyses || []))
      .catch((requestError) => setError(requestError.message || "Riwayat analisis belum dapat dimuat."))
      .finally(() => setLoading(false));
  }, [auth.session]);

  const filtered = useMemo(
    () => analyses.filter((a) => a.fabric_name.toLowerCase().includes(query.trim().toLowerCase())),
    [analyses, query]
  );

  if (auth.loading) return <AppLoading label="Memuat riwayat..." />;

  return (
    <AppShell
      title="Riwayat Scan"
      description="Semua hasil pemeriksaan kain yang sudah tersimpan."
      profile={auth.profile}
      email={auth.session?.user.email}
    >
      <div className="space-y-4">
        {/* Search */}
        <div className="border-4 border-deep bg-white shadow-[4px_4px_0_0_#051f20]">
          <div className="flex items-center border-b-4 border-deep px-4 py-3">
            <p className="font-mono text-[10px] font-black uppercase tracking-widest text-muted">Cari kain</p>
            <span className="ml-auto font-mono text-[10px] font-black text-primary">{filtered.length} hasil</span>
          </div>
          <div className="p-3">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Nama kain..."
              className="w-full border-4 border-deep bg-base px-4 py-3 font-mono text-sm font-bold text-deep placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-sage"
            />
          </div>
        </div>

        {error && (
          <div className="border-4 border-red-700 bg-red-50 px-4 py-4 font-mono text-sm font-bold text-red-700">
            {error}
          </div>
        )}

        {loading ? (
          <div className="space-y-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-28 animate-pulse border-4 border-deep bg-white shadow-[4px_4px_0_0_#051f20]" />
            ))}
          </div>
        ) : filtered.length > 0 ? (
          <div className="space-y-3 sm:grid sm:grid-cols-2 sm:gap-4 sm:space-y-0 lg:grid-cols-3">
            {filtered.map((analysis) => (
              <AnalysisCard key={analysis.id} analysis={analysis} showPdf />
            ))}
          </div>
        ) : (
          <div className="border-4 border-dashed border-sage bg-white p-10 text-center">
            <p className="font-display text-2xl font-black text-deep">
              {query ? "Tidak ditemukan." : "Belum ada riwayat."}
            </p>
            <p className="mt-2 text-sm text-muted">
              {query ? "Coba nama kain yang lain." : "Scan kain pertama untuk mulai riwayat."}
            </p>
            {!query && (
              <Link
                href="/scan"
                className="mt-5 inline-block border-4 border-deep bg-primary px-5 py-3 font-mono text-sm font-black text-white shadow-[4px_4px_0_0_#051f20] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none"
              >
                Scan Sekarang →
              </Link>
            )}
          </div>
        )}
      </div>
    </AppShell>
  );
}