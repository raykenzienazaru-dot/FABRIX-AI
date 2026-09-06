export type JsonObject = Record<string, unknown>;

export type Analysis = {
  id: string;
  user_id: string;
  fabric_name: string;
  image_path: string;
  image_url: string | null;
  composition: unknown | null;
  structure: unknown | null;
  washing_condition: unknown | null;
  detections: unknown | null;
  jumlah_defect: number | null;
  predicted_quality: string | null;
  prediction_confidence: number | null;
  recommendation: unknown | null;
  raw_result: unknown | null;
  result_source: "ai_service" | "mock" | "unknown" | string;
  parent_analysis_id: string | null;
  created_at: string;
};

export type CompanyProfile = {
  user_id: string;
  company_name: string;
  industry: string | null;
  contact_name: string | null;
  created_at: string;
  updated_at: string;
};

const DISPLAY_LABELS: Record<string, string> = {
  ai_service: "Layanan AI",
  mock: "Data demo",
  unknown: "Tidak diketahui",
  hole: "Lubang",
  stain: "Noda",
  tear: "Sobekan",
  pilling: "Bulu kain (pilling)",
  snag: "Benang tertarik",
  discoloration: "Perubahan warna",
  loose_thread: "Benang lepas",
  defect: "Cacat",
  class: "Kelas cacat",
  class_id: "ID kelas",
  confidence: "Tingkat keyakinan",
  detection_id: "ID deteksi",
  width: "Lebar",
  height: "Tinggi",
  material: "Material",
  care: "Perawatan",
  alternative_composition: "Alternatif komposisi",
  note: "Catatan",
  provider: "Penyedia",
  workflow_id: "ID workflow",
  image_meta: "Metadata gambar",
};

export function hasValue(value: unknown): boolean {
  if (value === null || value === undefined || value === "") return false;
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === "object") return Object.keys(value as JsonObject).length > 0;
  return true;
}

export function formatValue(value: unknown): string {
  if (!hasValue(value)) return "Tidak tersedia";
  if (typeof value === "boolean") return value ? "Ya" : "Tidak";
  if (typeof value === "string" || typeof value === "number") {
    return String(value);
  }
  if (Array.isArray(value)) {
    return value.map((item) => formatValue(item)).join(", ");
  }
  return Object.entries(value as JsonObject)
    .map(([key, item]) => `${(key)}: ${formatValue(item)}`)
    .join("\n");
}

export function humanize(value: string): string {
  const normalized = value.trim().toLowerCase().replace(/[\s-]+/g, "_");
  if (DISPLAY_LABELS[normalized]) return DISPLAY_LABELS[normalized];

  return value
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function fabricDisplayName(value: string): string {
  const cleaned = value.trim();
  return !cleaned || cleaned.toLowerCase() === "untitled fabric" ? "Kain tanpa nama" : cleaned;
}

export function analysisDetectionLabel(analysis: Analysis): string | null {
  const detections = analysis.detections;
  if (!Array.isArray(detections) || detections.length === 0) return null;
  const first = detections[0];
  if (!first || typeof first !== "object") return null;
  const label = (first as JsonObject).class ?? (first as JsonObject).label;
  return typeof label === "string" ? (label) : null;
}

export type DetectionSummary = {
  class: string;
  confidence: number | null;
};

/** Normalizes the Roboflow "predictions" array into a simple {class, confidence}[] list. */
export function analysisDetectionSummaries(analysis: Analysis): DetectionSummary[] {
  const detections = analysis.detections;
  if (!Array.isArray(detections)) return [];
  return detections
    .filter((item): item is JsonObject => Boolean(item) && typeof item === "object")
    .map((item) => ({
      class: typeof item.class === "string" ? item.class : (String(item.class ?? "unknown")),
      confidence: typeof item.confidence === "number" ? item.confidence : null,
    }));
}

/** Reads the original image dimensions Roboflow ran inference against, if present. */
export function analysisImageMeta(analysis: Analysis): { width?: number; height?: number } | null {
  const raw = analysis.raw_result;
  if (!raw || typeof raw !== "object") return null;
  const meta = (raw as JsonObject).image_meta;
  if (!meta || typeof meta !== "object") return null;
  return meta as { width?: number; height?: number };
}

const QUALITY_LABELS: Record<string, string> = {
  good: "Baik",
  excellent: "Sangat Baik",
  poor: "Kurang Baik",
  bad: "Buruk",
  average: "Cukup",
};

export function qualityLabel(value: string | null): string {
  if (!value) return "Tidak tersedia";
  const normalized = value.trim().toLowerCase();
  return QUALITY_LABELS[normalized] || (value);
}

/** Raw defect boxes (Roboflow x/y = center, width/height in px) used by DetectionOverlay & Smart Cutting Guide. */
export type RawDetectionBox = {
  class?: string;
  confidence?: number;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
};

export function analysisRawBoxes(analysis: Analysis): RawDetectionBox[] {
  const detections = analysis.detections;
  if (!Array.isArray(detections)) return [];
  return detections.filter(
    (item): item is RawDetectionBox =>
      Boolean(item) &&
      typeof item === "object" &&
      typeof (item as RawDetectionBox).x === "number" &&
      typeof (item as RawDetectionBox).y === "number" &&
      typeof (item as RawDetectionBox).width === "number" &&
      typeof (item as RawDetectionBox).height === "number"
  );
}