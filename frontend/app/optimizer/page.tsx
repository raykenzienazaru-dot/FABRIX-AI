"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import AppShell, { AppLoading } from "@/components/AppShell";
import { apiGet } from "@/lib/api";
import { useAppSession } from "@/lib/useAppSession";
import type { Analysis } from "@/types/analysis";
import {
  analysisDetectionLabel,
  analysisImageMeta,
  analysisRawBoxes,
  fabricDisplayName,
} from "@/types/analysis";

const GRID_COLS = 12;
const GRID_ROWS = 9;

function scanDate(value: string) {
  return new Date(value).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/**
 * Classic "maximal rectangle in binary matrix" algorithm, adapted to find the
 * largest defect-free rectangular block of grid cells. `safe` is a 2D boolean
 * grid where true = cell has no defect overlapping it.
 * Returns the best rectangle in grid coordinates {row, col, rows, cols}.
 */
function largestSafeRectangle(safe: boolean[][]) {
  const rows = safe.length;
  const cols = safe[0]?.length || 0;
  const heights = new Array(cols).fill(0);
  let best = { area: 0, row: 0, col: 0, rows: 0, cols: 0 };

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      heights[c] = safe[r][c] ? heights[c] + 1 : 0;
    }

    // largest rectangle in histogram (heights), using a stack
    const stack: number[] = [];
    for (let c = 0; c <= cols; c++) {
      const h = c === cols ? 0 : heights[c];
      while (stack.length && heights[stack[stack.length - 1]] >= h) {
        const top = stack.pop()!;
        const height = heights[top];
        const width = stack.length ? c - stack[stack.length - 1] - 1 : c;
        const area = height * width;
        if (area > best.area) {
          const startCol = stack.length ? stack[stack.length - 1] + 1 : 0;
          best = { area, row: r - height + 1, col: startCol, rows: height, cols: width };
        }
      }
      stack.push(c);
    }
  }

  return best;
}

function buildSafeGrid(
  boxes: { x?: number; y?: number; width?: number; height?: number }[],
  imgWidth: number,
  imgHeight: number
) {
  const safe: boolean[][] = Array.from({ length: GRID_ROWS }, () => new Array(GRID_COLS).fill(true));
  const cellW = imgWidth / GRID_COLS;
  const cellH = imgHeight / GRID_ROWS;

  // small padding buffer around each defect so cuts don't hug the edge of the flaw
  const paddingRatio = 0.15;

  boxes.forEach((box) => {
    if (!box.x || !box.y || !box.width || !box.height) return;
    const padW = box.width * paddingRatio;
    const padH = box.height * paddingRatio;
    const left = box.x - box.width / 2 - padW;
    const right = box.x + box.width / 2 + padW;
    const top = box.y - box.height / 2 - padH;
    const bottom = box.y + box.height / 2 + padH;

    const colStart = Math.max(0, Math.floor(left / cellW));
    const colEnd = Math.min(GRID_COLS - 1, Math.floor(right / cellW));
    const rowStart = Math.max(0, Math.floor(top / cellH));
    const rowEnd = Math.min(GRID_ROWS - 1, Math.floor(bottom / cellH));

    for (let r = rowStart; r <= rowEnd; r++) {
      for (let c = colStart; c <= colEnd; c++) {
        if (safe[r]?.[c] !== undefined) safe[r][c] = false;
      }
    }
  });

  return safe;
}

export default function OptimizerPage() {
  const auth = useAppSession();
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [loading, setLoading] = useState(true);
  const [natural, setNatural] = useState<{ width: number; height: number } | null>(null);

  useEffect(() => {
    if (!auth.session) return;
    const preset = new URLSearchParams(window.location.search).get("analysis") || "";
    apiGet("/api/scan/history")
      .then((response) => {
        const items: Analysis[] = response.analyses || [];
        setAnalyses(items);
        setSelectedId(items.some((item) => item.id === preset) ? preset : items[0]?.id || "");
      })
      .finally(() => setLoading(false));
  }, [auth.session]);

  const selected = useMemo(() => analyses.find((analysis) => analysis.id === selectedId) || null, [analyses, selectedId]);

  const boxes = useMemo(() => (selected ? analysisRawBoxes(selected) : []), [selected]);
  const meta = useMemo(() => (selected ? analysisImageMeta(selected) : null), [selected]);
  const refWidth = meta?.width || natural?.width;
  const refHeight = meta?.height || natural?.height;

  const { safeGrid, bestRect, safePercent } = useMemo(() => {
    if (!refWidth || !refHeight) return { safeGrid: null, bestRect: null, safePercent: 0 };
    const grid = buildSafeGrid(boxes, refWidth, refHeight);
    const rect = largestSafeRectangle(grid);
    const totalCells = GRID_ROWS * GRID_COLS;
    const safeCells = grid.flat().filter(Boolean).length;
    return {
      safeGrid: grid,
      bestRect: rect,
      safePercent: totalCells ? Math.round((safeCells / totalCells) * 100) : 0,
    };
  }, [boxes, refWidth, refHeight]);

  const bestRectPercent = bestRect ? Math.round((bestRect.rows * bestRect.cols * 100) / (GRID_ROWS * GRID_COLS)) : 0;

  if (auth.loading) return <AppLoading label="Menyiapkan panduan potong..." />;

  return (
    <AppShell
      title="Panduan Area Potong Aman"
      description="Hindari area cacat saat memotong pola -- sistem menghitung area kain terbesar yang masih bebas cacat."
      profile={auth.profile}
      email={auth.session?.user.email}
    >
      {loading ? (
        <div className="h-80 animate-pulse rounded-3xl bg-white" />
      ) : analyses.length ? (
        <div className="grid gap-6 lg:grid-cols-[0.8fr,1.2fr]">
          <section className="rounded-[2rem] border border-border bg-white p-5 shadow-card sm:p-6">
            <span className="inline-flex rounded-full bg-pale px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-primary">
              Kain acuan
            </span>
            <h2 className="mt-4 font-display text-2xl font-semibold text-deep">Pilih hasil scan</h2>

            <div className="mt-5 grid max-h-[26rem] gap-3 overflow-y-auto pr-0.5">
              {analyses.map((analysis) => {
                const active = analysis.id === selectedId;
                const detected = analysisDetectionLabel(analysis);
                return (
                  <button
                    key={analysis.id}
                    type="button"
                    aria-pressed={active}
                    onClick={() => {
                      setSelectedId(analysis.id);
                      setNatural(null);
                    }}
                    className={`group rounded-2xl border p-3 text-left transition duration-200 ${
                      active
                        ? "border-primary bg-pale shadow-sm"
                        : "border-border bg-base hover:-translate-y-0.5 hover:border-sage hover:bg-white hover:shadow-sm"
                    }`}
                  >
                    <div className="flex gap-3">
                      <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-surface2">
                        {analysis.image_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={analysis.image_url}
                            alt={`Foto ${fabricDisplayName(analysis.fabric_name)}`}
                            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                          />
                        ) : (
                          <div className="grid h-full place-items-center font-display text-xl text-sage">F</div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1 py-0.5">
                        <p className="truncate text-sm font-semibold text-deep">{fabricDisplayName(analysis.fabric_name)}</p>
                        <p className="mt-1 truncate text-xs text-secondary">{detected || "Belum ada cacat terdeteksi"}</p>
                        <p className="mt-1.5 font-mono text-[10px] text-muted">{scanDate(analysis.created_at)}</p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          <section className="overflow-hidden rounded-[2rem] border border-border bg-white shadow-card">
            {selected?.image_url ? (
              <div className="relative aspect-[4/3] bg-surface2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={selected.image_url}
                  alt={`Foto ${fabricDisplayName(selected.fabric_name)}`}
                  className="h-full w-full object-contain"
                  onLoad={(event) => {
                    const img = event.currentTarget;
                    setNatural({ width: img.naturalWidth, height: img.naturalHeight });
                  }}
                />
                {safeGrid && refWidth && refHeight && (
                  <svg
                    viewBox={`0 0 ${refWidth} ${refHeight}`}
                    preserveAspectRatio="xMidYMid meet"
                    className="pointer-events-none absolute inset-0 h-full w-full"
                  >
                    {safeGrid.map((rowCells, r) =>
                      rowCells.map((isSafe, c) => (
                        <rect
                          key={`${r}-${c}`}
                          x={(c * refWidth) / GRID_COLS}
                          y={(r * refHeight) / GRID_ROWS}
                          width={refWidth / GRID_COLS}
                          height={refHeight / GRID_ROWS}
                          fill={isSafe ? "rgba(34,197,94,0.12)" : "rgba(239,68,68,0.32)"}
                          stroke="rgba(255,255,255,0.35)"
                          strokeWidth={refWidth * 0.001}
                        />
                      ))
                    )}
                    {bestRect && bestRect.area > 0 && (
                      <rect
                        x={(bestRect.col * refWidth) / GRID_COLS}
                        y={(bestRect.row * refHeight) / GRID_ROWS}
                        width={(bestRect.cols * refWidth) / GRID_COLS}
                        height={(bestRect.rows * refHeight) / GRID_ROWS}
                        fill="none"
                        stroke="#0ea5e9"
                        strokeWidth={refWidth * 0.006}
                        strokeDasharray={`${refWidth * 0.012} ${refWidth * 0.006}`}
                      />
                    )}
                  </svg>
                )}
              </div>
            ) : (
              <div className="grid aspect-[4/3] place-items-center text-sm text-muted">
                {selected ? "Foto kain tidak tersedia" : "Pilih hasil scan di sebelah kiri"}
              </div>
            )}

            <div className="space-y-4 p-6">
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-surface2 p-4">
                  <p className="text-[10px] font-bold uppercase tracking-wide text-muted">Total area bebas cacat</p>
                  <p className="mt-1 font-display text-2xl font-black text-primary">{safePercent}%</p>
                </div>
                <div className="rounded-xl bg-surface2 p-4">
                  <p className="text-[10px] font-bold uppercase tracking-wide text-muted">Blok potong terbesar</p>
                  <p className="mt-1 font-display text-2xl font-black text-primary">{bestRectPercent}%</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-4 text-xs text-muted">
                <span className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-sm" style={{ background: "rgba(34,197,94,0.4)" }} />
                  Aman dipotong
                </span>
                <span className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-sm" style={{ background: "rgba(239,68,68,0.5)" }} />
                  Hindari (area cacat)
                </span>
                <span className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-sm border-2 border-dashed" style={{ borderColor: "#0ea5e9" }} />
                  Blok potong tunggal terbesar
                </span>
              </div>

              <p className="border-2 border-deep bg-surface2 px-4 py-3 text-xs leading-5 text-muted">
                {bestRect && bestRect.area > 0
                  ? `Rekomendasi: area yang ditandai garis putus-putus biru adalah blok kain terbesar dan berbentuk persegi yang sepenuhnya bebas cacat -- cocok untuk pola potong utama. Sisa area hijau lain masih aman tapi lebih terpisah-pisah, cocok untuk pola potong berukuran kecil.`
                  : "Belum ada cacat terdeteksi pada kain ini, atau data belum cukup untuk menghitung rekomendasi potong."}
              </p>

              {selected && (
                <Link
                  href={`/analysis/${selected.id}`}
                  className="inline-flex rounded-full bg-white px-4 py-2 text-xs font-semibold text-primary shadow-sm transition hover:bg-pale"
                >
                  ← Lihat detail analisis
                </Link>
              )}
            </div>
          </section>
        </div>
      ) : (
        <div className="rounded-3xl border border-dashed border-sage bg-white p-12 text-center">
          <h2 className="font-display text-3xl font-semibold text-deep">Belum ada kain untuk dianalisis.</h2>
          <p className="mt-3 text-sm text-muted">Scan dan simpan kain terlebih dahulu, lalu kembali ke halaman ini.</p>
          <Link href="/scan" className="mt-6 inline-flex rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white">
            Scan kain
          </Link>
        </div>
      )}
    </AppShell>
  );
}