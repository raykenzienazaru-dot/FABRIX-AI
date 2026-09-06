"use client";

import Link from "next/link";
import { useState } from "react";
import { apiPatchJson } from "@/lib/api";
import type { Analysis, JsonObject } from "@/types/analysis";
import {
  analysisDetectionSummaries,
  analysisImageMeta,
  fabricDisplayName,
  formatValue,
  hasValue,
  humanize,
  qualityLabel,
} from "@/types/analysis";
import DetectionOverlay from "./DetectionOverlay";
import ReportButton from "./ReportButton";

export default function AnalysisDetail({
  analysis,
  passport = false,
  onUpdated,
}: {
  analysis: Analysis;
  passport?: boolean;
  onUpdated?: (analysis: Analysis) => void;
}) {
  const [name, setName] = useState(fabricDisplayName(analysis.fabric_name));
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const detections = analysisDetectionSummaries(analysis);
  const imageMeta = analysisImageMeta(analysis);

  async function saveName() {
    const nextName = name.trim() || "Kain tanpa nama";
    setSaving(true);
    setMessage(null);
    try {
      const response = await apiPatchJson(`/api/scan/${analysis.id}`, {
        fabric_name: nextName,
      });
      setName(response.analysis.fabric_name);
      onUpdated?.(response.analysis);
      setMessage("Analisis berhasil disimpan.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Analisis belum dapat disimpan.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      {analysis.result_source === "mock" && (
        <div className="flex flex-col gap-2 border-[3px] border-sage bg-pale px-5 py-4 shadow-[4px_4px_0_0_theme(colors.sage)] sm:flex-row sm:items-center sm:justify-between">
          <span className="font-mono text-xs font-black tracking-wide text-primary">HASIL DEMO</span>
          <p className="text-xs text-secondary">
            Hasil ini berasal dari fallback pengembangan, bukan model AI final.
          </p>
        </div>
      )}

      <section className="grid gap-6 lg:grid-cols-[minmax(0,1.05fr),minmax(22rem,0.95fr)]">
        <div className="overflow-hidden border-[3px] border-deep bg-white shadow-[6px_6px_0_0_theme(colors.deep)]">
          <div className="aspect-[4/3] bg-surface2">
            {analysis.image_url ? (
              <DetectionOverlay
                src={analysis.image_url}
                alt={`Foto ${fabricDisplayName(analysis.fabric_name)}`}
                detections={analysis.detections}
                imageMeta={imageMeta}
              />
            ) : (
              <div className="grid h-full place-items-center text-sm text-muted">Foto kain tidak tersedia</div>
            )}
          </div>
          <div className="border-t-[3px] border-deep p-5">
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted">
              {passport ? "Paspor Kain" : "Foto Kain"}
            </p>
            <p className="mt-2 break-all font-mono text-xs text-secondary">ID · {analysis.id}</p>
            <p className="mt-1 text-xs text-muted">
              {new Date(analysis.created_at).toLocaleString("id-ID", {
                dateStyle: "long",
                timeStyle: "short",
              })}
            </p>
          </div>
        </div>

        <div className="border-[3px] border-deep bg-white p-6 shadow-[6px_6px_0_0_theme(colors.deep)] sm:p-8">
          <label className="block">
            <span className="text-xs font-bold uppercase tracking-wide text-muted">Nama Kain</span>
            <input
              value={name}
              maxLength={120}
              onChange={(event) => setName(event.target.value)}
              className="mt-2 w-full border-[3px] border-deep bg-base px-4 py-3 font-display text-xl font-black text-deep transition focus:outline-none focus:ring-2 focus:ring-sage"
            />
          </label>

          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Metric label="Jumlah Defect" value={analysis.jumlah_defect} />
            <QualityMetric
              label="Prediksi Kualitas"
              quality={analysis.predicted_quality}
              confidence={analysis.prediction_confidence}
            />
          </div>

          <p className="mt-5 border-2 border-deep bg-surface2 px-4 py-3 text-xs leading-5 text-muted">
            Hasil berbantuan AI ini tidak menggantikan pemeriksaan operator, pengujian laboratorium, atau sertifikasi.
          </p>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <Link
              href="/scan"
              className="inline-flex min-h-11 items-center justify-center border-[3px] border-deep bg-primary px-5 py-2.5 text-sm font-black text-white shadow-[3px_3px_0_0_theme(colors.deep)] transition active:translate-x-[3px] active:translate-y-[3px] active:shadow-none"
            >
              Scan Lagi
            </Link>
            <button
              type="button"
              onClick={saveName}
              disabled={saving}
              className="min-h-11 border-[3px] border-deep bg-sage px-5 py-2.5 text-sm font-black text-deep shadow-[3px_3px_0_0_theme(colors.deep)] transition active:translate-x-[3px] active:translate-y-[3px] active:shadow-none disabled:opacity-60"
            >
              {saving ? "Menyimpan..." : "Simpan Analisis"}
            </button>
            <ReportButton analysis={analysis} />
            <Link
              href={`/comparison?selected=${analysis.id}`}
              className="inline-flex min-h-11 items-center justify-center border-[3px] border-deep bg-white px-5 py-2.5 text-sm font-black text-primary shadow-[3px_3px_0_0_theme(colors.deep)] transition active:translate-x-[3px] active:translate-y-[3px] active:shadow-none"
            >
              Bandingkan
            </Link>
            <Link
              href={`/optimizer?analysis=${analysis.id}`}
              className="inline-flex min-h-11 items-center justify-center border-[3px] border-deep bg-white px-5 py-2.5 text-sm font-black text-primary shadow-[3px_3px_0_0_theme(colors.deep)] transition active:translate-x-[3px] active:translate-y-[3px] active:shadow-none sm:col-span-2"
            >
              Lihat Panduan Area Potong Aman
            </Link>
          </div>
          {message && <p className="mt-3 text-center text-xs text-secondary" aria-live="polite">{message}</p>}
        </div>
      </section>

      <section className="grid gap-5 md:grid-cols-2">
        <DetectedDefectsSection detections={detections} />
        <DataSection title="Rekomendasi" value={analysis.recommendation} />
        <DataSection title="Komposisi Kain" value={analysis.composition} />
        <DataSection title="Struktur Kain" value={analysis.structure} />
        <DataSection title="Kondisi Pencucian" value={analysis.washing_condition} />
      </section>
    </div>
  );
}

function DetectedDefectsSection({
  detections,
}: {
  detections: { class: string; confidence: number | null }[];
}) {
  return (
    <article className="border-[3px] border-deep bg-white p-6 shadow-[4px_4px_0_0_theme(colors.deep)]">
      <h2 className="font-display text-xl font-black text-deep">Cacat Terdeteksi</h2>
      {detections.length === 0 ? (
        <p className="mt-4 text-sm text-muted">Tidak ada cacat yang terdeteksi pada kain ini.</p>
      ) : (
        <ul className="mt-4 flex flex-wrap gap-2">
          {detections.map((detection, index) => (
            <li
              key={`${detection.class}-${index}`}
              className="flex items-center gap-2 border-2 border-deep bg-surface2 px-3 py-1.5 text-xs font-bold text-deep"
            >
              <span className="h-2 w-2 rounded-full bg-primary" />
              {(detection.class)}
              {detection.confidence !== null && (
                <span className="font-mono text-[10px] text-muted">
                  {Math.round(detection.confidence * 100)}%
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
    </article>
  );
}

export function DataSection({ title, value }: { title: string; value: unknown }) {
  if (!hasValue(value)) return null;

  const rows = Array.isArray(value)
    ? value.map((item, index) => [`Data ${index + 1}`, item] as const)
    : typeof value === "object" && value !== null
      ? Object.entries(value as JsonObject)
      : [[title, value] as const];

  return (
    <article className="border-[3px] border-deep bg-white p-6 shadow-[4px_4px_0_0_theme(colors.deep)]">
      <h2 className="font-display text-xl font-black text-deep">{title}</h2>
      <dl className="mt-4 space-y-3">
        {rows.map(([key, rowValue], index) => (
          <div key={`${key}-${index}`} className="border-t-2 border-border pt-3 first:border-0 first:pt-0">
            <dt className="text-[10px] font-bold uppercase tracking-wide text-muted">
              {(String(key))}
            </dt>
            <dd className="mt-1 whitespace-pre-line text-sm leading-6 text-deep">{formatValue(rowValue)}</dd>
          </div>
        ))}
      </dl>
    </article>
  );
}

function Metric({ label, value }: { label: string; value: number | null }) {
  return (
    <div className="border-2 border-deep bg-base p-5">
      <p className="text-[10px] font-bold uppercase tracking-wide text-muted">{label}</p>
      <p className="mt-2 font-display text-3xl font-black text-primary">
        {value === null || value === undefined ? "Tidak tersedia" : value}
      </p>
    </div>
  );
}

function QualityMetric({
  label,
  quality,
  confidence,
}: {
  label: string;
  quality: string | null;
  confidence: number | null;
}) {
  return (
    <div className="border-2 border-deep bg-base p-5">
      <p className="text-[10px] font-bold uppercase tracking-wide text-muted">{label}</p>
      <p className="mt-2 font-display text-2xl font-black text-primary">{qualityLabel(quality)}</p>
      {typeof confidence === "number" && (
        <p className="mt-1 font-mono text-[10px] text-muted">Keyakinan model: {Math.round(confidence * 100)}%</p>
      )}
    </div>
  );
}