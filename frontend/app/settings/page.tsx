"use client";

import { useEffect, useState } from "react";
import AppShell, { AppLoading } from "@/components/AppShell";
import { apiPostJson } from "@/lib/api";
import { useAppSession } from "@/lib/useAppSession";

export default function SettingsPage() {
  const auth = useAppSession();
  const [companyName, setCompanyName] = useState("");
  const [contactName, setContactName] = useState("");
  const [industry, setIndustry] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!auth.profile) return;
    setCompanyName(auth.profile.company_name || "");
    setContactName(auth.profile.contact_name || "");
    setIndustry(auth.profile.industry || "");
  }, [auth.profile]);

  async function save(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const response = await apiPostJson("/api/auth/company-profile", {
        company_name: companyName,
        contact_name: contactName || null,
        industry: industry || null,
      });
      auth.setProfile(response.profile);
      setMessage("Profil berhasil disimpan.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Profil belum dapat disimpan.");
    } finally {
      setSaving(false);
    }
  }

  if (auth.loading) return <AppLoading label="Memuat pengaturan..." />;

  return (
    <AppShell title="Pengaturan" description="Perbarui profil usaha yang terhubung dengan ruang kerja Anda." profile={auth.profile} email={auth.session?.user.email}>
      <form onSubmit={save} className="max-w-2xl border-[3px] border-deep bg-white p-6 shadow-[6px_6px_0_0_theme(colors.deep)] sm:p-8">
        <h2 className="font-display text-2xl font-black text-deep">Profil Usaha</h2>
        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <Field label="Nama usaha / organisasi" value={companyName} onChange={setCompanyName} required />
          <Field label="Nama penanggung jawab" value={contactName} onChange={setContactName} />
          <Field label="Bidang usaha" value={industry} onChange={setIndustry} />
          <label className="block">
            <span className="text-xs font-bold text-deep">Email akun</span>
            <input
              value={auth.session?.user.email || ""}
              readOnly
              className="mt-2 w-full cursor-not-allowed border-[3px] border-border bg-surface2 px-4 py-3 text-sm text-muted"
            />
          </label>
        </div>
        <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
          <button
            type="submit"
            disabled={saving || !companyName.trim()}
            className="min-h-11 border-[3px] border-deep bg-primary px-6 text-sm font-black text-white shadow-[3px_3px_0_0_theme(colors.deep)] transition active:translate-x-[3px] active:translate-y-[3px] active:shadow-none disabled:opacity-50"
          >
            {saving ? "Menyimpan..." : "Simpan Profil"}
          </button>
          {message && <p className="text-sm text-secondary" aria-live="polite">{message}</p>}
        </div>
      </form>
    </AppShell>
  );
}

function Field({ label, value, onChange, required = false }: { label: string; value: string; onChange: (value: string) => void; required?: boolean }) {
  return (
    <label className="block">
      <span className="text-xs font-bold text-deep">{label}</span>
      <input
        value={value}
        required={required}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 w-full border-[3px] border-deep bg-base px-4 py-3 text-sm text-deep focus:outline-none focus:ring-2 focus:ring-sage"
      />
    </label>
  );
}