"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  FileScan,
  Files,
  Gauge,
  GitCompareArrows,
  History,
  LogOut,
  ScanLine,
  Settings,
  SlidersHorizontal,
  X,
  type LucideIcon,
} from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import type { CompanyProfile } from "@/types/analysis";
import BrandLogo from "./BrandLogo";

type NavItem = { href: string; label: string; icon: LucideIcon };

// Bottom nav (mobile) — max 5 items
const bottomNav: NavItem[] = [
  { href: "/dashboard", label: "Beranda", icon: Gauge },
  { href: "/history", label: "Riwayat", icon: History },
  { href: "/scan", label: "Scan", icon: ScanLine },
  { href: "/passport", label: "Paspor", icon: Files },
  { href: "/optimizer", label: "Optimizer", icon: SlidersHorizontal },
];

// Full sidebar nav (desktop)
const sidebarGroups = [
  {
    label: "Utama",
    items: [{ href: "/dashboard", label: "Ringkasan", icon: Gauge }],
  },
  {
    label: "Analisis",
    items: [
      { href: "/scan", label: "Scan Kain", icon: ScanLine },
      { href: "/history", label: "Riwayat Analisis", icon: History },
    ],
  },
  {
    label: "Eksplorasi",
    items: [
      { href: "/optimizer", label: "What-If Optimizer", icon: SlidersHorizontal },
      { href: "/comparison", label: "Perbandingan Kain", icon: GitCompareArrows },
    ],
  },
  {
    label: "Pustaka",
    items: [{ href: "/passport", label: "Paspor Kain", icon: Files }],
  },
];

type Props = {
  children: React.ReactNode;
  title: string;
  description?: string;
  profile?: CompanyProfile | null;
  email?: string | null;
  action?: React.ReactNode;
};

export default function AppShell({ children, title, description, profile, email, action }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [desktopOpen, setDesktopOpen] = useState(false);

  async function signOut() {
    await supabase.auth.signOut();
    router.replace("/login");
  }

  const workspaceName = profile?.company_name || "FABRIX AI";
  const initial = workspaceName.trim().charAt(0).toUpperCase() || "F";

  return (
    <div className="min-h-screen bg-base">

      {/* ── DESKTOP SIDEBAR (lg+) ── */}
      <motion.aside
        initial={false}
        animate={{ width: desktopOpen ? 256 : 72 }}
        transition={{ duration: 0.22, ease: "easeInOut" }}
        onMouseEnter={() => setDesktopOpen(true)}
        onMouseLeave={() => setDesktopOpen(false)}
        className="fixed inset-y-0 left-0 z-40 hidden overflow-hidden border-r-4 border-deep bg-deep lg:flex lg:flex-col"
      >
        {/* logo */}
        <div className="flex h-16 shrink-0 items-center border-b-4 border-white/10 px-4">
          <Link href="/dashboard" className="flex items-center gap-3 overflow-hidden">
            <span className="grid h-9 w-9 shrink-0 place-items-center bg-sage font-display text-lg font-black text-deep">F</span>
            <AnimatePresence initial={false}>
              {desktopOpen && (
                <motion.span
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -8 }}
                  className="whitespace-nowrap font-display text-lg font-black text-white"
                >
                  FABRIX <span className="text-sage">AI</span>
                </motion.span>
              )}
            </AnimatePresence>
          </Link>
        </div>

        {/* nav groups */}
        <nav className="flex-1 overflow-y-auto overflow-x-hidden py-4 px-2 space-y-5">
          {sidebarGroups.map((group) => (
            <div key={group.label}>
              <AnimatePresence initial={false}>
                {desktopOpen && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="mb-1 px-3 font-mono text-[9px] uppercase tracking-[0.2em] text-white/40"
                  >
                    {group.label}
                  </motion.p>
                )}
              </AnimatePresence>
              <div className="space-y-1">
                {group.items.map((item) => {
                  const active = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(`${item.href}/`));
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      title={item.label}
                      className={`flex h-11 items-center gap-3 border-2 px-3 text-sm font-bold transition-colors ${
                        desktopOpen ? "" : "justify-center px-0"
                      } ${active ? "border-white bg-white text-deep" : "border-transparent text-white/60 hover:bg-white/10 hover:text-white"}`}
                    >
                      <Icon className={`h-5 w-5 shrink-0 ${active ? "text-secondary" : "text-sage"}`} strokeWidth={2} />
                      <AnimatePresence initial={false}>
                        {desktopOpen && (
                          <motion.span
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="whitespace-nowrap"
                          >
                            {item.label}
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* user + signout */}
        <div className="shrink-0 border-t-4 border-white/10 p-2 space-y-1">
          <Link
            href="/settings"
            title="Pengaturan"
            className={`flex h-10 items-center gap-3 border-2 text-sm font-bold transition-colors ${
              desktopOpen ? "px-3" : "justify-center px-0"
            } ${pathname === "/settings" ? "border-white bg-white text-deep" : "border-transparent text-white/60 hover:bg-white/10 hover:text-white"}`}
          >
            <Settings className="h-5 w-5 shrink-0 text-sage" strokeWidth={2} />
            <AnimatePresence initial={false}>
              {desktopOpen && <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="whitespace-nowrap">Pengaturan</motion.span>}
            </AnimatePresence>
          </Link>
          <button
            type="button"
            onClick={signOut}
            title="Keluar"
            className={`flex h-10 w-full items-center gap-3 border-2 border-transparent text-sm font-bold text-white/60 transition-colors hover:bg-white/10 hover:text-white ${
              desktopOpen ? "px-3" : "justify-center px-0"
            }`}
          >
            <LogOut className="h-5 w-5 shrink-0 text-sage" strokeWidth={2} />
            <AnimatePresence initial={false}>
              {desktopOpen && <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="whitespace-nowrap">Keluar</motion.span>}
            </AnimatePresence>
          </button>
        </div>
      </motion.aside>

      {/* ── MOBILE DRAWER ── */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 lg:hidden"
          >
            <button type="button" aria-label="Tutup" className="absolute inset-0 bg-deep/75" onClick={() => setMenuOpen(false)} />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.24, ease: "easeInOut" }}
              className="relative flex h-full w-72 flex-col bg-deep"
            >
              <div className="flex h-16 items-center justify-between border-b-4 border-white/10 px-4">
                <span className="font-display text-lg font-black text-white">FABRIX <span className="text-sage">AI</span></span>
                <button type="button" onClick={() => setMenuOpen(false)} className="grid h-9 w-9 place-items-center border-2 border-white/25 text-white/70 hover:text-white">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <nav className="flex-1 overflow-y-auto px-2 py-4 space-y-5">
                {sidebarGroups.map((group) => (
                  <div key={group.label}>
                    <p className="mb-1 px-3 font-mono text-[9px] uppercase tracking-[0.2em] text-white/40">{group.label}</p>
                    <div className="space-y-1">
                      {group.items.map((item) => {
                        const active = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(`${item.href}/`));
                        const Icon = item.icon;
                        return (
                          <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setMenuOpen(false)}
                            className={`flex h-12 items-center gap-3 border-2 px-3 text-sm font-bold transition-colors ${
                              active ? "border-white bg-white text-deep" : "border-transparent text-white/60 hover:bg-white/10 hover:text-white"
                            }`}
                          >
                            <Icon className={`h-5 w-5 shrink-0 ${active ? "text-secondary" : "text-sage"}`} strokeWidth={2} />
                            {item.label}
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </nav>

              <div className="shrink-0 border-t-4 border-white/10 p-4">
                <div className="flex items-center gap-3 mb-3">
                  <span className="grid h-9 w-9 shrink-0 place-items-center bg-sage font-display text-sm font-black text-deep">{initial}</span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-white">{workspaceName}</p>
                    <p className="truncate text-[10px] text-white/45">{email || "Analisis material"}</p>
                  </div>
                </div>
                <button type="button" onClick={signOut} className="flex w-full items-center gap-3 border-2 border-transparent px-3 py-2.5 text-sm font-bold text-white/60 hover:bg-white/10 hover:text-white">
                  <LogOut className="h-5 w-5 text-sage" strokeWidth={2} />
                  Keluar
                </button>
              </div>
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── MAIN CONTENT ── */}
      <div className="lg:pl-[72px]">
        {/* Top header mobile */}
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b-4 border-deep bg-white px-4 lg:hidden">
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            className="flex items-center gap-2.5"
            aria-label="Menu"
          >
            <span className="grid h-8 w-8 place-items-center bg-deep font-display text-sm font-black text-white">{initial}</span>
            <span className="font-display text-base font-black text-deep">FABRIX <span className="text-primary">AI</span></span>
          </button>
          <Link
            href="/scan"
            className="flex items-center gap-1.5 border-4 border-deep bg-primary px-3 py-1.5 font-mono text-xs font-black text-white shadow-[3px_3px_0_0_#051f20] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none"
          >
            <FileScan className="h-3.5 w-3.5" />
            Scan
          </Link>
        </header>

        {/* Desktop top header */}
        <header className="sticky top-0 z-30 hidden h-16 items-center justify-between border-b-4 border-deep bg-white px-8 lg:flex">
          <div>
            <p className="text-sm font-black text-deep">{workspaceName}</p>
            <p className="text-xs text-muted">{email}</p>
          </div>
          {action && <div>{action}</div>}
          {!action && (
            <Link
              href="/scan"
              className="flex items-center gap-2 border-4 border-deep bg-primary px-4 py-2 font-mono text-sm font-black text-white shadow-[4px_4px_0_0_#051f20] transition active:translate-x-[4px] active:translate-y-[4px] active:shadow-none"
            >
              <FileScan className="h-4 w-4" />
              Scan Kain
            </Link>
          )}
        </header>

        <main className="px-4 py-6 pb-24 sm:px-6 lg:px-8 lg:pb-10 lg:py-10">
          <div className="mx-auto max-w-5xl">
            <div className="mb-6">
              <h1 className="font-display text-2xl font-black tracking-tight text-deep sm:text-3xl lg:text-4xl">
                {title}
              </h1>
              {description && <p className="mt-1.5 text-sm leading-6 text-muted">{description}</p>}
              {action && <div className="mt-4 lg:hidden">{action}</div>}
            </div>
            {children}
          </div>
        </main>
      </div>

      {/* ── BOTTOM NAV (mobile only) ── */}
      <nav className="fixed bottom-0 inset-x-0 z-40 border-t-4 border-deep bg-white lg:hidden" aria-label="Navigasi bawah">
        <div className="flex h-16 items-stretch">
          {bottomNav.map((item) => {
            const active = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(`${item.href}/`));
            const Icon = item.icon;
            const isScan = item.href === "/scan";
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-1 flex-col items-center justify-center gap-0.5 text-[10px] font-black transition-colors ${
                  isScan
                    ? "bg-primary text-white border-x-4 border-deep"
                    : active
                      ? "bg-pale text-primary border-x-2 border-transparent"
                      : "text-muted hover:bg-surface2"
                }`}
              >
                <Icon className={`h-5 w-5 ${isScan ? "text-white" : active ? "text-primary" : "text-muted"}`} strokeWidth={isScan ? 2.5 : 2} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

export function AppLoading({ label = "Menyiapkan..." }: { label?: string }) {
  return (
    <main className="grid min-h-screen place-items-center bg-base">
      <div className="text-center">
        <div className="relative mx-auto grid h-16 w-16 place-items-center border-[3px] border-deep bg-white shadow-[4px_4px_0_0_theme(colors.sage)]">
          <Image
            src="/logo.png"
            alt=""
            width={32}
            height={32}
            className="animate-pulse object-contain"
            aria-hidden="true"
            priority
          />
          <span className="absolute inset-0 animate-spin border-2 border-transparent border-t-primary" />
        </div>
        <p className="mt-4 font-mono text-xs font-bold uppercase tracking-widest text-muted">{label}</p>
      </div>
    </main>
  );
}