"use client";

import Link from "next/link";
import ReportButton from "./ReportButton";
import type { Analysis } from "@/types/analysis";
import { analysisDetectionLabel, fabricDisplayName, humanize, qualityLabel } from "@/types/analysis";

export default function AnalysisCard({
  analysis,
  selectable = false,
  selected = false,
  onSelect,
  showPdf = false,
}: {
  analysis: Analysis;
  selectable?: boolean;
  selected?: boolean;
  onSelect?: () => void;
  showPdf?: boolean;
}) {
  const detected = analysisDetectionLabel(analysis);

  return (
    <article
      className={`overflow-hidden border-[3px] border-deep bg-white shadow-[5px_5px_0_0_theme(colors.deep)] transition hover:-translate-y-1 hover:shadow-[7px_7px_0_0_theme(colors.deep)] ${
        selected ? "ring-4 ring-sage" : ""
      }`}
    >
      <div className="relative aspect-[16/10] border-b-[3px] border-deep bg-pale">
        {analysis.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={analysis.image_url}
            alt={`Foto ${fabricDisplayName(analysis.fabric_name)}`}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="grid h-full place-items-center text-xs font-bold text-muted">Foto tidak tersedia</div>
        )}
        {analysis.result_source === "mock" && (
          <span className="absolute left-3 top-3 border-2 border-deep bg-pale px-2.5 py-1 font-mono text-[10px] font-black text-primary shadow-[2px_2px_0_0_theme(colors.deep)]">
            HASIL DEMO
          </span>
        )}
        {selectable && (
          <label className="absolute right-3 top-3 flex cursor-pointer items-center gap-2 border-2 border-deep bg-white px-3 py-1.5 text-xs font-black text-deep shadow-[2px_2px_0_0_theme(colors.deep)]">
            <input
              type="checkbox"
              checked={selected}
              onChange={onSelect}
              className="h-4 w-4 accent-primary"
              aria-label={`Pilih ${fabricDisplayName(analysis.fabric_name)}`}
            />
            Pilih
          </label>
        )}
      </div>

      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="truncate font-display text-xl font-black text-deep">
              {fabricDisplayName(analysis.fabric_name)}
            </h2>
            <p className="mt-1 text-xs text-muted">
              {new Date(analysis.created_at).toLocaleString("id-ID", {
                dateStyle: "medium",
                timeStyle: "short",
              })}
            </p>
          </div>
          <span className="shrink-0 border-2 border-deep bg-surface2 px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-wide text-secondary">
            {analysis.result_source}
          </span>
        </div>

        {detected && <p className="mt-3 text-sm text-muted">Terdeteksi: {detected}</p>}

        <div className="mt-4 grid grid-cols-2 gap-3">
          <MiniMetric label="Jumlah defect" value={analysis.jumlah_defect === null ? "Tidak tersedia" : String(analysis.jumlah_defect)} />
          <MiniMetric label="Prediksi kualitas" value={qualityLabel(analysis.predicted_quality)} />
        </div>

        <div className="mt-5 flex flex-wrap gap-2 border-t-2 border-border pt-4">
          <Link
            href={`/analysis/${analysis.id}`}
            className="border-2 border-deep bg-primary px-3 py-2 text-xs font-black text-white shadow-[2px_2px_0_0_theme(colors.deep)] transition active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
          >
            Lihat Hasil
          </Link>
          <Link
            href={`/passport/${analysis.id}`}
            className="border-2 border-deep bg-white px-3 py-2 text-xs font-black text-primary shadow-[2px_2px_0_0_theme(colors.deep)] transition active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
          >
            Paspor
          </Link>
          {showPdf && <ReportButton analysis={analysis} compact label="PDF" />}
        </div>
      </div>
    </article>
  );
}

function MiniMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-2 border-deep bg-surface2 p-3">
      <p className="text-[10px] font-bold uppercase tracking-wide text-muted">{label}</p>
      <p className="mt-1 font-mono text-sm font-black text-primary">{value}</p>
    </div>
  );
}