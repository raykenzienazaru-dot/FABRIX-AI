"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import AppShell, { AppLoading } from "@/components/AppShell";
import AnalysisDetail from "@/components/AnalysisDetail";
import { apiGet } from "@/lib/api";
import { useAppSession } from "@/lib/useAppSession";
import type { Analysis } from "@/types/analysis";

export default function AnalysisResultPage() {
  const auth = useAppSession();
  const params = useParams<{ id: string }>();
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!auth.session || !params.id) return;
    apiGet(`/api/scan/${params.id}`)
      .then((response) => setAnalysis(response.analysis))
      .catch((requestError) => setError(requestError.message || "Hasil analisis belum dapat dimuat."))
      .finally(() => setLoading(false));
  }, [auth.session, params.id]);

  if (auth.loading || loading) return <AppLoading label="Memuat hasil analisis..." />;

  return (
    <AppShell
      title="Hasil Analisis Kain"
      description="Tinjau hasil deteksi, beri nama kain, dan unduh analisis yang sudah tersimpan."
      profile={auth.profile}
      email={auth.session?.user.email}
    >
      {error || !analysis ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
          <h2 className="font-display text-2xl font-semibold text-red-900">Analisis tidak tersedia</h2>
          <p className="mt-2 text-sm text-red-700">{error || "Hasil analisis yang diminta tidak ditemukan."}</p>
          <Link href="/history" className="mt-5 inline-flex rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white">Kembali ke Riwayat</Link>
        </div>
      ) : (
        <AnalysisDetail analysis={analysis} onUpdated={setAnalysis} />
      )}
    </AppShell>
  );
}
