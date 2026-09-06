import type { Analysis, JsonObject } from "@/types/analysis";
import { fabricDisplayName, formatValue, hasValue, humanize } from "@/types/analysis";

const BRAND = {
  deep: [5, 31, 32] as const,
  primary: [22, 56, 50] as const,
  secondary: [35, 83, 71] as const,
  sage: [142, 182, 155] as const,
  pale: [218, 241, 222] as const,
  muted: [83, 105, 98] as const,
};

async function imageAsDataUrl(url: string): Promise<string> {
  const response = await fetch(url);
  if (!response.ok) throw new Error("Foto kain belum dapat dimuat.");
  const blob = await response.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

function safeFilename(value: string) {
  const sanitized = value.trim().replace(/[^a-zA-Z0-9_-]+/g, "_").replace(/^_+|_+$/g, "");
  return sanitized || "Kain_Tanpa_Nama";
}

function objectLines(value: unknown): string[] {
  if (!hasValue(value)) return ["Tidak tersedia"];
  if (Array.isArray(value)) {
    return value.flatMap((item, index) => {
      if (item && typeof item === "object") {
        const details = Object.entries(item as JsonObject).map(
          ([key, entry]) => `${humanize(key)}: ${formatValue(entry)}`
        );
        return [`Deteksi ${index + 1}`, ...details];
      }
      return [formatValue(item)];
    });
  }
  if (typeof value === "object") {
    return Object.entries(value as JsonObject).map(
      ([key, entry]) => `${humanize(key)}: ${formatValue(entry)}`
    );
  }
  return [formatValue(value)];
}

export async function downloadAnalysisPdf(analysis: Analysis) {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "pt", format: "a4", compress: true });
  const width = doc.internal.pageSize.getWidth();
  const height = doc.internal.pageSize.getHeight();
  const margin = 48;
  const contentWidth = width - margin * 2;
  let y = 0;

  function footer() {
    doc.setDrawColor(...BRAND.sage);
    doc.line(margin, height - 42, width - margin, height - 42);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...BRAND.muted);
    doc.text("FABRIX AI · Laporan dibuat dari analisis kain yang telah disimpan.", margin, height - 26);
    doc.text(`ID Analisis: ${analysis.id}`, width - margin, height - 26, { align: "right" });
  }

  function header(first = false) {
    if (!first) doc.addPage();
    doc.setFillColor(...BRAND.deep);
    doc.rect(0, 0, width, 82, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.text("FABRIX AI", margin, 36);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text("Deteksi. Bandingkan. Dokumentasikan.", margin, 55);
    doc.setFontSize(13);
    doc.text("Laporan Analisis Kain", width - margin, 43, { align: "right" });
    y = 112;
  }

  function ensureSpace(required: number) {
    if (y + required > height - 64) {
      footer();
      header();
    }
  }

  function heading(text: string) {
    ensureSpace(38);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(...BRAND.primary);
    doc.text(text.toUpperCase(), margin, y);
    y += 8;
    doc.setDrawColor(...BRAND.sage);
    doc.line(margin, y, width - margin, y);
    y += 18;
  }

  function row(label: string, value: string) {
    const wrapped = doc.splitTextToSize(value, contentWidth - 145) as string[];
    ensureSpace(Math.max(20, wrapped.length * 13 + 6));
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...BRAND.muted);
    doc.text(label, margin, y);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...BRAND.deep);
    doc.text(wrapped, margin + 145, y);
    y += Math.max(20, wrapped.length * 13 + 6);
  }

  function section(title: string, value: unknown) {
    if (!hasValue(value)) return;
    const lines = objectLines(value);
    heading(title);
    lines.forEach((line) => {
      const wrapped = doc.splitTextToSize(line, contentWidth) as string[];
      ensureSpace(wrapped.length * 13 + 8);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(...BRAND.deep);
      doc.text(wrapped, margin, y);
      y += wrapped.length * 13 + 8;
    });
    y += 6;
  }

  header(true);

  if (analysis.result_source === "mock") {
    doc.setFillColor(...BRAND.pale);
    doc.roundedRect(margin, y - 4, 92, 24, 5, 5, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(...BRAND.secondary);
    doc.text("HASIL DEMO", margin + 10, y + 12);
    y += 38;
  }

  heading("Informasi Analisis");
  row("Nama Kain", fabricDisplayName(analysis.fabric_name));
  row("ID Analisis", analysis.id);
  row("Tanggal Analisis", new Date(analysis.created_at).toLocaleString("id-ID"));
  row("Sumber Hasil", humanize(analysis.result_source || "unknown"));
  y += 8;

  if (analysis.image_url) {
    heading("Foto Kain");
    try {
      const dataUrl = await imageAsDataUrl(analysis.image_url);
      const properties = doc.getImageProperties(dataUrl);
      const maxHeight = 235;
      const ratio = Math.min(contentWidth / properties.width, maxHeight / properties.height);
      const imageWidth = properties.width * ratio;
      const imageHeight = properties.height * ratio;
      ensureSpace(imageHeight + 12);
      doc.addImage(dataUrl, properties.fileType, margin, y, imageWidth, imageHeight);
      y += imageHeight + 22;
    } catch {
      row("Gambar", "Foto kain belum dapat disertakan dalam laporan ini.");
    }
  }

  if (analysis.jumlah_defect !== null || analysis.predicted_quality !== null) {
    heading("Analisis Kain");
    if (analysis.jumlah_defect !== null) {
      row("Jumlah Defect Terdeteksi", String(analysis.jumlah_defect));
    }
    if (analysis.predicted_quality !== null) {
      row("Prediksi Kualitas", humanize(analysis.predicted_quality));
    }
    if (analysis.prediction_confidence !== null) {
      row("Keyakinan Model", `${Math.round((analysis.prediction_confidence || 0) * 100)}%`);
    }
    y += 8;
  }

  section("Karakteristik Terdeteksi", analysis.detections);
  section("Komposisi Kain", analysis.composition);
  section("Struktur Kain", analysis.structure);
  section("Kondisi Pencucian", analysis.washing_condition);
  section("Rekomendasi", analysis.recommendation);

  ensureSpace(48);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...BRAND.muted);
  doc.text(`Dibuat: ${new Date().toLocaleString("id-ID")}`, margin, y);
  footer();

  const shortId = analysis.id.split("-")[0] || analysis.id;
  doc.save(`FABRIX_AI_${safeFilename(fabricDisplayName(analysis.fabric_name))}_${safeFilename(shortId)}.pdf`);
}