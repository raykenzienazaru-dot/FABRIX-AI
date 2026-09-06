"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { apiGet, apiPostJson } from "@/lib/api";
import { messageInIndonesian } from "@/lib/messages";
import BrandLogo from "@/components/BrandLogo";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    if (signInError) {
      setError(messageInIndonesian(signInError.message, "Email atau kata sandi salah."));
      setLoading(false);
      return;
    }

    try {
      const current = await apiGet("/api/auth/me");
      const metadata = data.user?.user_metadata || {};
      if (!current.profile && metadata.company_name) {
        await apiPostJson("/api/auth/company-profile", {
          company_name: metadata.company_name,
          contact_name: metadata.contact_name || null,
          industry: metadata.industry || null,
        });
      }
    } catch {
    }
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <main className="grid min-h-screen bg-base lg:grid-cols-2">
      <section className="hidden bg-deep p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <Link href="/" aria-label="FABRIX AI — Halaman utama"><BrandLogo size="md" /></Link>
        <div className="max-w-lg">
          <p className="font-mono text-xs uppercase tracking-[0.22em] text-sage">Foto. Deteksi. Dokumentasikan.</p>
          <h1 className="mt-5 font-display text-5xl font-black leading-tight">Ruang kerja untuk pemeriksaan kainmu.</h1>
          <p className="mt-5 leading-7 text-white/60">Buka kembali hasil analisis, perbandingan, paspor kain, dan laporan yang sudah tersimpan.</p>
        </div>
        <p className="text-xs text-white/35">Temukan cacat sebelum kain dipotong.</p>
      </section>

      <section className="flex items-center justify-center px-5 py-12 sm:px-8">
        <div className="w-full max-w-md">
          <Link href="/" aria-label="FABRIX AI — Halaman utama" className="lg:hidden"><BrandLogo variant="dark" /></Link>
          <p className="mt-10 font-mono text-xs uppercase tracking-[0.18em] text-secondary lg:mt-0">Selamat datang kembali</p>
          <h2 className="mt-3 font-display text-4xl font-black text-deep">Masuk ke FABRIX AI</h2>
          <p className="mt-3 text-sm leading-6 text-muted">Lanjutkan pemeriksaan kain dari ruang kerjamu.</p>

          <form onSubmit={submit} className="mt-8 space-y-5">
            <Field label="Email kerja" type="email" value={email} onChange={setEmail} autoComplete="email" />
            <Field label="Kata sandi" type="password" value={password} onChange={setPassword} autoComplete="current-password" />
            {error && (
              <p role="alert" className="border-[3px] border-red-700 bg-red-50 px-4 py-3 text-sm text-red-700 shadow-[4px_4px_0_0_#b91c1c]">
                {error}
              </p>
            )}
            <button
              type="submit"
              disabled={loading}
              className="min-h-12 w-full border-[3px] border-deep bg-primary px-6 text-sm font-black text-white shadow-[4px_4px_0_0_theme(colors.deep)] transition active:translate-x-1 active:translate-y-1 active:shadow-none disabled:opacity-60"
            >
              {loading ? "Sedang masuk..." : "Masuk"}
            </button>
          </form>

          <p className="mt-6 text-sm text-muted">
            Belum punya akun?{" "}
            <Link href="/register" className="font-black text-primary underline decoration-sage decoration-2 underline-offset-4">
              Daftar sekarang
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}

function Field({ label, type, value, onChange, autoComplete }: { label: string; type: string; value: string; onChange: (value: string) => void; autoComplete: string }) {
  return (
    <label className="block">
      <span className="text-xs font-bold text-deep">{label}</span>
      <input type={type} required value={value} onChange={(event) => onChange(event.target.value)} autoComplete={autoComplete} className="mt-2 w-full border-[3px] border-deep bg-white px-4 py-3 text-sm text-deep transition placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-sage" />
    </label>
  );
}