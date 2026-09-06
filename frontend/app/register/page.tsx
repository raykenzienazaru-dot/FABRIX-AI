"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { apiPostJson } from "@/lib/api";
import { messageInIndonesian } from "@/lib/messages";
import BrandLogo from "@/components/BrandLogo";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ contactName: "", companyName: "", industry: "", email: "", password: "", confirm: "" });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);

  function update(field: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setMessage(null);
    setIsError(false);
    if (form.password !== form.confirm) {
      setIsError(true);
      setMessage("Konfirmasi kata sandi belum sama.");
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: {
          data: {
            company_name: form.companyName,
            contact_name: form.contactName,
            industry: form.industry || null,
          },
        },
      });
      if (error) throw error;

      if (data.session) {
        await apiPostJson("/api/auth/company-profile", {
          company_name: form.companyName,
          contact_name: form.contactName,
          industry: form.industry || null,
        });
        router.push("/dashboard");
        router.refresh();
      } else {
        setMessage("Akun berhasil dibuat. Periksa email untuk melakukan konfirmasi, lalu masuk.");
      }
    } catch (error) {
      setIsError(true);
      setMessage(messageInIndonesian(error instanceof Error ? error.message : null, "Pendaftaran belum dapat diselesaikan."));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="grid min-h-screen bg-base lg:grid-cols-2">
      <section className="hidden bg-deep p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <Link href="/" aria-label="FABRIX AI — Halaman utama"><BrandLogo size="md" /></Link>

        <div className="max-w-lg">
          <p className="font-mono text-xs uppercase tracking-[0.22em] text-sage">Foto. Deteksi. Dokumentasikan.</p>
          <h1 className="mt-5 font-display text-5xl font-black leading-tight">
            Mulai dari satu foto kain yang jelas.
          </h1>
          <p className="mt-5 leading-7 text-white/60">
            Buat ruang kerja untuk menyimpan pemeriksaan, melihat riwayat, membandingkan kain, dan mengunduh laporan.
          </p>
          <div className="mt-9 grid gap-3 text-sm text-white/75">
          {["Langkah - Langkah membuat akun:"]}
            {["Isi biodata sesuai form yang tertera", "Klik buat akun", "Chek GMAIL untuk konfirmasi email (Supabase Auth)"].map((item) => (
              <p key={item} className="flex items-center gap-3">
                <span className="h-2 w-2 rounded-full bg-sage" />
                {item}
              </p>
            ))}
          </div>
        </div>

        <p className="text-xs text-white/35">Temukan cacat sebelum kain dipotong.</p>
      </section>

      <section className="flex items-center justify-center px-5 py-10 sm:px-8 lg:px-12">
        <div className="w-full max-w-2xl">
          <Link href="/" aria-label="FABRIX AI — Halaman utama" className="lg:hidden"><BrandLogo variant="dark" /></Link>
          <p className="mt-10 font-mono text-xs uppercase tracking-[0.18em] text-secondary lg:mt-0">Buat ruang kerja</p>
          <h2 className="mt-3 font-display text-4xl font-black text-deep">Daftarkan usahamu</h2>
          <p className="mt-3 text-sm leading-6 text-muted">Isi data singkat berikut untuk mulai memeriksa kain.</p>

          <form onSubmit={submit} className="mt-8 grid gap-5 sm:grid-cols-2">
            <Field label="Nama lengkap" value={form.contactName} onChange={(value) => update("contactName", value)} />
            <Field label="Nama usaha / organisasi" value={form.companyName} onChange={(value) => update("companyName", value)} />
            <Field label="Bidang usaha (opsional)" value={form.industry} onChange={(value) => update("industry", value)} required={false} />
            <Field label="Email kerja" type="email" value={form.email} onChange={(value) => update("email", value)} />
            <Field label="Kata sandi" type="password" value={form.password} onChange={(value) => update("password", value)} minLength={6} />
            <Field label="Konfirmasi kata sandi" type="password" value={form.confirm} onChange={(value) => update("confirm", value)} minLength={6} />
            {message && (
              <p
                role={isError ? "alert" : "status"}
                className={`border-[3px] px-4 py-3 text-sm sm:col-span-2 ${
                  isError
                    ? "border-red-700 bg-red-50 text-red-700 shadow-[4px_4px_0_0_#b91c1c]"
                    : "border-sage bg-pale text-primary shadow-[4px_4px_0_0_theme(colors.sage)]"
                }`}
              >
                {message}
              </p>
            )}
            <button
              type="submit"
              disabled={loading}
              className="min-h-12 border-[3px] border-deep bg-primary px-6 text-sm font-black text-white shadow-[4px_4px_0_0_theme(colors.deep)] transition active:translate-x-1 active:translate-y-1 active:shadow-none disabled:opacity-60 sm:col-span-2"
            >
              {loading ? "Membuat akun..." : "Buat akun"}
            </button>
          </form>
          <p className="mt-6 text-sm text-muted">
            Sudah punya akun?{" "}
            <Link href="/login" className="font-black text-primary underline decoration-sage decoration-2 underline-offset-4">
              Masuk
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}

function Field({ label, value, onChange, type = "text", required = true, minLength }: { label: string; value: string; onChange: (value: string) => void; type?: string; required?: boolean; minLength?: number }) {
  return (
    <label className="block">
      <span className="text-xs font-bold text-deep">{label}</span>
      <input type={type} required={required} minLength={minLength} value={value} onChange={(event) => onChange(event.target.value)} className="mt-2 w-full border-[3px] border-deep bg-base px-4 py-3 text-sm text-deep transition focus:outline-none focus:ring-2 focus:ring-sage" />
    </label>
  );
}