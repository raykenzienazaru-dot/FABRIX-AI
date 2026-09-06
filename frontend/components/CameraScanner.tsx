"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type CameraStatus = "starting" | "live" | "captured" | "error";

type Props = {
  onCapture: (file: File | null) => void;
  disabled?: boolean;
};

export default function CameraScanner({ onCapture, disabled = false }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const requestRef = useRef(0);
  const previewRef = useRef<string | null>(null);
  const [status, setStatus] = useState<CameraStatus>("starting");
  const [preview, setPreview] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const stopCamera = useCallback(() => {
    requestRef.current += 1;
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  }, []);

  const startCamera = useCallback(async () => {
    const requestId = ++requestRef.current;
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setStatus("starting");
    setMessage(null);

    if (!navigator.mediaDevices?.getUserMedia) {
      setStatus("error");
      setMessage("Browser ini tidak mendukung akses kamera. Gunakan opsi 'Pilih dari Galeri' di bawah.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: "environment" },
          width: { ideal: 1440 },
          height: { ideal: 1080 },
        },
        audio: false,
      });

      if (requestId !== requestRef.current) {
        stream.getTracks().forEach((track) => track.stop());
        return;
      }

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setStatus("live");
    } catch (error) {
      const cameraError = error as DOMException;
      setStatus("error");
      setMessage(
        cameraError.name === "NotAllowedError"
          ? "Akses kamera diperlukan untuk scan kain. Izinkan kamera pada browser, atau gunakan opsi 'Pilih dari Galeri'."
          : "Kamera tidak dapat dibuka. Gunakan opsi 'Pilih dari Galeri' di bawah."
      );
    }
  }, []);

  useEffect(() => {
    // Opening the device camera is the page's intentional mount-side effect.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void startCamera();
    return () => {
      stopCamera();
      if (previewRef.current) URL.revokeObjectURL(previewRef.current);
    };
  }, [startCamera, stopCamera]);

  function capture() {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || !video.videoWidth || !video.videoHeight) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext("2d");
    if (!context) return;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(
      (blob) => {
        if (!blob) {
          setStatus("error");
          setMessage("Gambar hasil tangkapan belum dapat diproses. Silakan coba lagi.");
          return;
        }

        if (previewRef.current) URL.revokeObjectURL(previewRef.current);
        const objectUrl = URL.createObjectURL(blob);
        previewRef.current = objectUrl;
        setPreview(objectUrl);
        setStatus("captured");
        video.pause();
        onCapture(
          new File([blob], `fabric-scan-${Date.now()}.jpg`, {
            type: "image/jpeg",
          })
        );
      },
      "image/jpeg",
      0.92
    );
  }

  function handleFileSelected(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = ""; // reset biar bisa pilih file yang sama lagi kalau perlu
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setStatus("error");
      setMessage("File yang dipilih bukan gambar. Pilih file JPG, PNG, atau WebP.");
      return;
    }

    // hentikan kamera kalau masih aktif, karena sekarang pakai gambar dari galeri
    stopCamera();

    if (previewRef.current) URL.revokeObjectURL(previewRef.current);
    const objectUrl = URL.createObjectURL(file);
    previewRef.current = objectUrl;
    setPreview(objectUrl);
    setStatus("captured");
    onCapture(file);
  }

  async function retake() {
    if (previewRef.current) URL.revokeObjectURL(previewRef.current);
    previewRef.current = null;
    setPreview(null);
    onCapture(null);

    if (streamRef.current?.active && videoRef.current) {
      try {
        await videoRef.current.play();
        setStatus("live");
        return;
      } catch {
        // Restart below if the existing stream can no longer play.
      }
    }
    await startCamera();
  }

  return (
    <div className="overflow-hidden rounded-3xl border border-border bg-white shadow-card">
      <div className="relative aspect-[4/3] min-h-[20rem] w-full overflow-hidden bg-deep sm:min-h-0">
        <video
          ref={videoRef}
          className={`h-full w-full object-cover transition-opacity duration-300 ${
            status === "live" ? "opacity-100" : "opacity-0"
          }`}
          playsInline
          muted
          aria-label="Pratinjau langsung kamera kain"
        />

        {preview && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={preview}
            alt="Pratinjau foto kain"
            className="absolute inset-0 h-full w-full object-cover"
          />
        )}

        {status === "live" && !preview && (
          <>
            <div className="pointer-events-none absolute inset-[10%] rounded-2xl border border-white/65 shadow-[0_0_0_999px_rgba(5,31,32,0.22)]">
              <span className="absolute -left-px -top-px h-10 w-10 rounded-tl-2xl border-l-4 border-t-4 border-sage" />
              <span className="absolute -right-px -top-px h-10 w-10 rounded-tr-2xl border-r-4 border-t-4 border-sage" />
              <span className="absolute -bottom-px -left-px h-10 w-10 rounded-bl-2xl border-b-4 border-l-4 border-sage" />
              <span className="absolute -bottom-px -right-px h-10 w-10 rounded-br-2xl border-b-4 border-r-4 border-sage" />
              <div className="scan-line" />
            </div>
            <div className="absolute left-1/2 top-5 -translate-x-1/2 rounded-full bg-deep/75 px-4 py-2 text-center text-xs font-medium text-white backdrop-blur">
              Area Scan Kain
            </div>
          </>
        )}

        {(status === "starting" || status === "error") && !preview && (
          <div className="absolute inset-0 grid place-items-center px-8 text-center">
            <div>
              {status === "starting" && (
                <span className="mx-auto block h-9 w-9 animate-spin rounded-full border-2 border-white/25 border-t-sage" />
              )}
              <p className="mt-4 text-sm font-semibold text-white">
                {status === "starting" ? "Meminta akses kamera..." : "Kamera tidak tersedia"}
              </p>
              {message && <p className="mx-auto mt-2 max-w-md text-xs leading-5 text-white/65">{message}</p>}
              {status === "error" && (
                <button
                  type="button"
                  onClick={() => void startCamera()}
                  className="mt-5 rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-deep"
                >
                  Coba Buka Kamera Lagi
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      <canvas ref={canvasRef} className="hidden" />
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleFileSelected}
      />

      <div className="p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-display text-xl font-semibold text-deep">Pemindai Kain</h2>
            <p className="mt-1 max-w-xl text-xs leading-5 text-muted">
              Dekatkan kain ke kamera dan gunakan pencahayaan yang cukup, atau pilih foto kain dari galeri.
            </p>
          </div>

          <div className="flex shrink-0 gap-2">
            {status === "captured" ? (
              <button
                type="button"
                onClick={() => void retake()}
                disabled={disabled}
                className="min-h-12 rounded-xl border border-primary px-6 text-sm font-semibold text-primary transition hover:bg-pale disabled:opacity-60"
              >
                Ambil Ulang
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={disabled}
                  className="min-h-14 rounded-2xl border border-primary px-5 text-sm font-semibold text-primary transition hover:bg-pale disabled:cursor-not-allowed disabled:opacity-45"
                >
                  Pilih dari Galeri
                </button>
                <button
                  type="button"
                  onClick={capture}
                  disabled={disabled || status !== "live"}
                  className="min-h-14 rounded-2xl bg-primary px-8 text-base font-semibold text-white shadow-lg shadow-primary/15 transition hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-45"
                >
                  Ambil Foto Kain
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}