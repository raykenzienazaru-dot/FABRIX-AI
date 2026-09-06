"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import AppShell, { AppLoading } from "@/components/AppShell";
import AnalysisDetail from "@/components/AnalysisDetail";
import { apiGet } from "@/lib/api";
import { useAppSession } from "@/lib/useAppSession";
import type { Analysis } from "@/types/analysis";

export default function PassportDetailPage() {
  const auth = useAppSession();
  const params = useParams<{ id: string }>();
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!auth.session || !params.id) return;
    apiGet(`/api/scan/${params.id}`)
      .then((response) => setAnalysis(response.analysis))
      .catch((requestError) => setError(requestError.message || "Paspor kain belum dapat dimuat."))
      .finally(() => setLoading(false));
  }, [auth.session, params.id]);

  if (auth.loading || loading) return <AppLoading label="Membuka paspor kain..." />;

  return (
    <AppShell title="Paspor Kain" description="Tampilan ringkas dari analisis kain yang sudah tersimpan." profile={auth.profile} email={auth.session?.user.email}>
      {analysis ? <AnalysisDetail analysis={analysis} passport onUpdated={setAnalysis} /> : <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center"><p className="text-sm text-red-700">{error || "Paspor kain tidak ditemukan."}</p><Link href="/passport" className="mt-5 inline-flex rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white">Kembali ke Pustaka</Link></div>}
    </AppShell>
  );
}
