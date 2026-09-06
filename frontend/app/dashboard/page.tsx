"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import AppShell, { AppLoading } from "@/components/AppShell";
import AnalysisCard from "@/components/AnalysisCard";
import { apiGet } from "@/lib/api";
import { useAppSession } from "@/lib/useAppSession";
import type { Analysis } from "@/types/analysis";
import { humanize } from "@/types/analysis";

const RECENT_CUTOFF = Date.now() - 7 * 24 * 60 * 60 * 1000;

type TrendData = {
  jumlah_scan: number;
  trend: "menurun" | "membaik" | "stabil" | null;
  insight_text: string;
  jenis_defect_paling_sering: string | null;
  breakdown_semua_jenis: Record<string, number> | null;
};

const TREND_COLOR: Record<string, string> = {
  menurun: "#b91c1c",
  membaik: "#15803d",
  stabil: "#b45309",
};

const TREND_LABEL: Record<string, string> = {
  menurun: "Menurun ↓ (defect bertambah)",
  membaik: "Membaik ↑ (defect berkurang)",
  stabil: "Stabil → (relatif tetap)",
};

// custom dot: bigger target and a value label above each point, so the chart
// can be read at a glance without hovering for a tooltip
function ScanDot(props: any) {
  const { cx, cy, value } = props;
  if (cx === undefined || cy === undefined) return null;
  return (
    <g>
      <circle cx={cx} cy={cy} r={5} fill="#8eb69b" stroke="#163832" strokeWidth={2} />
      <text x={cx} y={cy - 12} textAnchor="middle" fontSize={11} fontFamily="var(--font-mono)" fontWeight={700} fill="#163832">
        {value}
      </text>
    </g>
  );
}

export default function DashboardPage() {
  const auth = useAppSession();
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [trend, setTrend] = useState<TrendData | null>(null);
  const [trendLoading, setTrendLoading] = useState(true);

  useEffect(() => {
    if (!auth.session) return;
    apiGet("/api/scan/history")
      .then((response) => setAnalyses(response.analyses || []))
      .catch((requestError) => setError(requestError.message || "Data ringkasan belum dapat dimuat."))
      .finally(() => setLoading(false));

    apiGet("/api/scan/insights/trend")
      .then((data) => setTrend(data))
      .catch(() => setTrend(null))
      .finally(() => setTrendLoading(false));
  }, [auth.session]);

  const stats = useMemo(() => {
    const recent = analyses.filter((item) => new Date(item.created_at).getTime() >= RECENT_CUTOFF).length;
    const saved = new Set(analyses.map((item) => item.fabric_name.trim().toLowerCase())).size;
    return [
      ["Total analisis", analyses.length],
      ["Analisis 7 hari terakhir", recent],
      ["Kain tersimpan", saved],
    ] as const;
  }, [analyses]);

  // Chart data: jumlah defect per scan (dari yang paling lama ke paling baru)
  const chartData = useMemo(() => {
    return [...analyses]
      .reverse()
      .slice(-10)
      .map((item, index) => ({
        scan: `#${index + 1}`,
        defect: item.jumlah_defect ?? 0,
        name: item.fabric_name,
        date: new Date(item.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "short" }),
      }));
  }, [analyses]);

  const averageDefect = useMemo(() => {
    if (chartData.length === 0) return 0;
    return chartData.reduce((sum, item) => sum + item.defect, 0) / chartData.length;
  }, [chartData]);

  const breakdownEntries = useMemo(() => {
    if (!trend?.breakdown_semua_jenis) return [];
    const entries = Object.entries(trend.breakdown_semua_jenis).sort((a, b) => b[1] - a[1]);
    const total = entries.reduce((sum, [, count]) => sum + count, 0);
    return entries.map(([kelas, jumlah]) => ({
      kelas,
      jumlah,
      percent: total > 0 ? Math.round((jumlah / total) * 100) : 0,
    }));
  }, [trend]);

  if (auth.loading) return <AppLoading />;

  return (
    <AppShell
      title="Ambil keputusan kain dengan lebih yakin."
      description="Foto kain, periksa hasil deteksi, dan simpan setiap analisis untuk keputusan berikutnya."
      profile={auth.profile}
      email={auth.session?.user.email}
      action={
        <Link
          href="/scan"
          className="inline-flex min-h-11 items-center justify-center border-[3px] border-deep bg-primary px-5 text-sm font-black text-white shadow-[3px_3px_0_0_theme(colors.deep)] transition active:translate-x-[3px] active:translate-y-[3px] active:shadow-none"
        >
          Scan Kain
        </Link>
      }
    >
      {error && (
        <p role="alert" className="mb-6 border-[3px] border-red-700 bg-red-50 px-5 py-4 text-sm text-red-700 shadow-[4px_4px_0_0_#b91c1c]">
          {error}
        </p>
      )}

      {/* Stats */}
      <section className="grid gap-4 sm:grid-cols-3">
        {stats.map(([label, value]) => (
          <article key={label} className="border-[3px] border-deep bg-white p-5 shadow-[4px_4px_0_0_theme(colors.deep)]">
            <p className="text-xs font-bold uppercase tracking-wide text-muted">{label}</p>
            <p className="mt-3 font-display text-4xl font-black text-primary">{loading ? "" : value}</p>
          </article>
        ))}
      </section>

      {/* Quality Trend Dashboard */}
      <section className="mt-8">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-2xl font-black text-deep">Tren Kualitas Kain</h2>
            <p className="mt-1 text-sm text-muted">Jumlah defect dari 10 scan terakhir, dianalisis otomatis dari histori kamu.</p>
          </div>
          {trend?.trend && (
            <span
              className="border-[3px] border-deep bg-white px-4 py-2 font-mono text-xs font-black shadow-[3px_3px_0_0_theme(colors.deep)]"
              style={{ color: TREND_COLOR[trend.trend] }}
            >
              {TREND_LABEL[trend.trend]}
            </span>
          )}
        </div>

        <div className="grid gap-4 lg:grid-cols-[1fr,auto]">
          {/* Chart */}
          <div className="border-[3px] border-deep bg-white p-6 shadow-[4px_4px_0_0_theme(colors.deep)]">
            {trendLoading ? (
              <div className="flex h-56 items-center justify-center">
                <span className="h-7 w-7 animate-spin rounded-full border-2 border-sage border-t-primary" />
              </div>
            ) : chartData.length >= 2 ? (
              <>
                <div className="mb-3 flex flex-wrap items-center gap-x-5 gap-y-1 text-xs font-semibold text-muted">
                  <span className="flex items-center gap-1.5">
                    <span className="inline-block h-2 w-4 rounded-sm bg-primary" /> Jumlah defect per scan
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="inline-block h-0 w-4 border-t-2 border-dashed border-secondary" /> Rata-rata ({averageDefect.toFixed(1)})
                  </span>
                </div>
                <ResponsiveContainer width="100%" height={240}>
                  <AreaChart data={chartData} margin={{ top: 24, right: 12, left: -18, bottom: 5 }}>
                    <defs>
                      <linearGradient id="defectFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#163832" stopOpacity={0.22} />
                        <stop offset="100%" stopColor="#163832" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                    <XAxis
                      dataKey="scan"
                      tick={{ fontSize: 11, fontFamily: "monospace", fill: "#6b7280" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      allowDecimals={false}
                      width={28}
                      tick={{ fontSize: 11, fontFamily: "monospace", fill: "#6b7280" }}
                      axisLine={false}
                      tickLine={false}
                      label={{ value: "Jml defect", angle: -90, position: "insideLeft", fontSize: 10, fill: "#6b7280" }}
                    />
                    <Tooltip
                      contentStyle={{
                        border: "3px solid #051f20",
                        borderRadius: 0,
                        fontFamily: "monospace",
                        fontSize: 11,
                      }}
                      formatter={(value) => [`${value} defect`, "Jumlah Defect"]}
                      labelFormatter={(label, payload) => {
                        const point = payload?.[0]?.payload;
                        if (!point) return label;
                        return `${point.name} · ${point.date}`;
                      }}
                    />
                    <ReferenceLine
                      y={averageDefect}
                      stroke="#235347"
                      strokeDasharray="4 4"
                      strokeWidth={1.5}
                    />
                    <Area
                      type="monotone"
                      dataKey="defect"
                      stroke="#163832"
                      strokeWidth={3}
                      fill="url(#defectFill)"
                      dot={<ScanDot />}
                      activeDot={{ r: 7, fill: "#163832", stroke: "#8eb69b", strokeWidth: 2 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </>
            ) : (
              <div className="flex h-48 flex-col items-center justify-center gap-2 text-center">
                <p className="text-sm font-bold text-deep">Belum cukup data untuk chart</p>
                <p className="text-xs text-muted">
                  {trend?.insight_text || "Minimal 2 scan diperlukan untuk menampilkan grafik."}
                </p>
              </div>
            )}

            {trend?.insight_text && chartData.length >= 2 && (
              <p className="mt-4 border-t-2 border-border pt-4 text-xs leading-5 text-muted">
                {trend.insight_text}
              </p>
            )}
          </div>

          {/* Breakdown defect types */}
          {breakdownEntries.length > 0 && (
            <div className="border-[3px] border-deep bg-white p-5 shadow-[4px_4px_0_0_theme(colors.deep)] lg:w-64">
              <p className="text-[10px] font-bold uppercase tracking-wide text-muted">Defect terbanyak</p>
              <ul className="mt-4 space-y-3.5">
                {breakdownEntries.slice(0, 6).map(({ kelas, jumlah, percent }) => (
                  <li key={kelas}>
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="text-xs font-bold text-deep">{humanize(kelas)}</span>
                      <span className="whitespace-nowrap font-mono text-[11px] text-muted">
                        {jumlah}x <span className="text-muted/60">· {percent}%</span>
                      </span>
                    </div>
                    <div className="mt-1.5 h-2 w-full border border-deep/20 bg-surface2">
                      <div
                        className="h-full bg-primary transition-all"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </section>

      {/* CTA Banner */}
      <section className="mt-8 border-[3px] border-deep bg-deep p-6 text-white shadow-[6px_6px_0_0_theme(colors.sage)] sm:p-8">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-sage">Alur utama</p>
            <h2 className="mt-3 font-display text-3xl font-black">Buka kamera, foto kain, lalu periksa hasilnya.</h2>
            <p className="mt-3 max-w-xl text-sm leading-6 text-white/60">
              Tanpa formulir panjang atau unggah manual. FABRIX langsung memandu proses pengambilan foto kain.
            </p>
          </div>
          <Link
            href="/scan"
            className="inline-flex min-h-12 shrink-0 items-center justify-center border-[3px] border-white bg-white px-6 text-sm font-black text-deep shadow-[3px_3px_0_0_theme(colors.sage)] transition active:translate-x-[3px] active:translate-y-[3px] active:shadow-none"
          >
            Mulai Scan Baru
          </Link>
        </div>
      </section>

      {/* Recent analyses */}
      <section className="mt-10">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="font-display text-2xl font-black text-deep">Analisis Terbaru</h2>
            <p className="mt-1 text-sm text-muted">Hasil pemeriksaan kain yang terakhir disimpan.</p>
          </div>
          <Link href="/history" className="text-sm font-black text-primary">Lihat semua</Link>
        </div>

        {loading ? (
          <div className="mt-5 grid gap-5 md:grid-cols-3">
            {[0, 1, 2].map((item) => (
              <div key={item} className="h-72 animate-pulse border-[3px] border-deep bg-white" />
            ))}
          </div>
        ) : analyses.length > 0 ? (
          <div className="mt-5 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {analyses.slice(0, 3).map((analysis) => <AnalysisCard key={analysis.id} analysis={analysis} />)}
          </div>
        ) : (
          <div className="mt-5 border-[3px] border-dashed border-sage bg-white p-10 text-center">
            <h3 className="font-display text-2xl font-black text-deep">Belum ada hasil analisis.</h3>
            <p className="mt-2 text-sm text-muted">Hasil pertama yang disimpan akan muncul di sini.</p>
            <Link
              href="/scan"
              className="mt-5 inline-flex border-[3px] border-deep bg-primary px-5 py-3 text-sm font-black text-white shadow-[3px_3px_0_0_theme(colors.deep)] transition active:translate-x-[3px] active:translate-y-[3px] active:shadow-none"
            >
              Scan Kain Pertama
            </Link>
          </div>
        )}
      </section>
    </AppShell>
  );
}