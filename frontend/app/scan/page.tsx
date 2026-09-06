"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import AppShell, { AppLoading } from "@/components/AppShell";
import CameraScanner from "@/components/CameraScanner";
import { apiPostForm } from "@/lib/api";
import { useAppSession } from "@/lib/useAppSession";

const processingSteps = [
  "Menyiapkan gambar",
  "Mendeteksi cacat kain",
  "Menjalankan analisis AI",
  "Menyiapkan hasil",
];

export default function ScanPage() {
  const auth = useAppSession();
  const router = useRouter();
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [cameraKey, setCameraKey] = useState(0);
  const [processing, setProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
  }, []);

  // lock background scroll on mobile while the processing overlay is open
  useEffect(() => {
    if (!processing) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, [processing]);

  async function analyze() {
    if (!imageFile || processing) return;
    setProcessing(true);
    setProcessingStep(0);
    setError(null);
    intervalRef.current = setInterval(() => {
      setProcessingStep((current) => Math.min(current + 1, processingSteps.length - 1));
    }, 950);

    try {
      const form = new FormData();
      form.append("image", imageFile);
      form.append("fabric_name", "Kain tanpa nama");
      const response = await apiPostForm("/api/scan", form);
      router.push(`/analysis/${response.analysis.id}`);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Analisis belum dapat diselesaikan.");
      setProcessing(false);
    } finally {
      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }

  function retakeAfterError() {
    setError(null);
    setImageFile(null);
    setCameraKey((current) => current + 1);
  }

  if (auth.loading) return <AppLoading label="Menyiapkan kamera..." />;

  return (
    <AppShell
      title="Scan Kain"
      description="Foto kain, AI langsung deteksi cacat dan area potong aman."
      profile={auth.profile}
      email={auth.session?.user.email}
    >
      <div className="mx-auto w-full max-w-lg space-y-4 pb-[max(1.5rem,env(safe-area-inset-bottom))]">

        {/* Camera */}
        <div className="border-[3px] border-deep shadow-[5px_5px_0_0_#051f20] sm:border-4 sm:shadow-[6px_6px_0_0_#051f20]">
          <CameraScanner key={cameraKey} onCapture={setImageFile} disabled={processing} />
        </div>

        {/* Ready to analyze */}
        {imageFile && !processing && !error && (
          <div className="border-[3px] border-deep bg-pale shadow-[5px_5px_0_0_#051f20] sm:border-4 sm:shadow-[6px_6px_0_0_#051f20]">
            <div className="flex items-center gap-3 border-b-[3px] border-deep px-4 py-3 sm:border-b-4">
              <span className="h-3 w-3 shrink-0 rounded-full bg-primary" />
              <p className="font-mono text-xs font-black uppercase tracking-widest text-primary">Foto siap dianalisis</p>
            </div>
            <div className="px-4 py-4">
              <p className="text-sm text-muted">Periksa foto di atas. Ambil ulang jika tekstur buram atau pencahayaan kurang.</p>
              <button
                type="button"
                onClick={analyze}
                className="mt-4 min-h-[3.25rem] w-full border-[3px] border-deep bg-primary py-4 font-mono text-base font-black uppercase tracking-widest text-white shadow-[5px_5px_0_0_#051f20] transition active:translate-x-[5px] active:translate-y-[5px] active:shadow-none sm:border-4"
              >
                Analisis Kain →
              </button>
            </div>
          </div>
        )}

        {/* Error */}
        {error && !processing && (
          <div className="border-[3px] border-red-800 bg-red-50 shadow-[5px_5px_0_0_#991b1b] sm:border-4 sm:shadow-[6px_6px_0_0_#991b1b]" role="alert">
            <div className="flex items-center gap-3 border-b-[3px] border-red-800 px-4 py-3 sm:border-b-4">
              <span className="h-3 w-3 shrink-0 rounded-full bg-red-700" />
              <p className="font-mono text-xs font-black uppercase tracking-widest text-red-800">Analisis belum dapat diselesaikan.</p>
            </div>
            <div className="px-4 py-4">
              <p className="text-sm text-red-700">{error}</p>
              <div className="mt-4 grid grid-cols-1 gap-3 xs:grid-cols-2 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={analyze}
                  disabled={!imageFile}
                  className="min-h-11 border-[3px] border-red-800 bg-red-700 py-3 font-mono text-sm font-black uppercase text-white shadow-[4px_4px_0_0_#7f1d1d] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none disabled:opacity-50 sm:border-4"
                >
                  Coba Lagi
                </button>
                <button
                  type="button"
                  onClick={retakeAfterError}
                  className="min-h-11 border-[3px] border-red-800 bg-white py-3 font-mono text-sm font-black uppercase text-red-800 shadow-[4px_4px_0_0_#991b1b] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none sm:border-4"
                >
                  Ambil Ulang
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tip */}
        {!imageFile && !error && (
          <div className="border-[3px] border-deep bg-white px-4 py-4 shadow-[4px_4px_0_0_#051f20] sm:border-4">
            <p className="font-mono text-[10px] font-black uppercase tracking-widest text-muted">Tips scanning</p>
            <ul className="mt-3 space-y-2">
              {[
                "Dekatkan kamera ± 20–30 cm dari kain",
                "Gunakan cahaya alami atau lampu terang",
                "Pastikan permukaan kain tidak terlipat",
                "Bisa pilih foto dari galeri jika tidak pakai kamera",
              ].map((tip) => (
                <li key={tip} className="flex items-start gap-2.5 text-xs text-muted">
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-sage" />
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Processing overlay */}
      {processing && (
        <div
          className="fixed inset-0 z-50 flex h-[100dvh] flex-col items-center justify-center overflow-y-auto bg-deep px-6 text-white"
          style={{
            paddingTop: "max(1.5rem, env(safe-area-inset-top))",
            paddingBottom: "max(1.5rem, env(safe-area-inset-bottom))",
          }}
          role="status"
          aria-live="polite"
        >
          {/* animated box */}
          <div className="mb-8 h-16 w-16 shrink-0 border-4 border-sage bg-transparent sm:h-20 sm:w-20">
            <div className="h-full w-full animate-spin border-4 border-transparent border-t-sage" />
          </div>

          <h2 className="text-center font-display text-2xl font-black tracking-tight sm:text-3xl">Menganalisis...</h2>
          <p className="mt-2 font-mono text-xs text-white/50">Mohon tunggu sebentar</p>

          <div className="mt-8 w-full max-w-xs space-y-2">
            {processingSteps.map((step, index) => (
              <div
                key={step}
                className={`flex items-center gap-3 border-2 px-4 py-3 font-mono text-xs font-black uppercase tracking-wider transition-all ${
                  index === processingStep
                    ? "border-sage bg-sage/20 text-white"
                    : index < processingStep
                      ? "border-sage/30 text-sage/70"
                      : "border-white/10 text-white/25"
                }`}
              >
                <span className={`h-2 w-2 shrink-0 rounded-full ${index <= processingStep ? "bg-sage" : "bg-white/20"}`} />
                {step}
                {index < processingStep && <span className="ml-auto">✓</span>}
              </div>
            ))}
          </div>
        </div>
      )}
    </AppShell>
  );
}