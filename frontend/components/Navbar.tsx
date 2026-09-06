"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import BrandLogo from "./BrandLogo";

const navigationLinks = [
  { href: "/#produk", label: "Produk" },
  { href: "/#cara-kerja", label: "Cara Kerja" },
  { href: "/#fitur", label: "Fitur" },
  { href: "/#dampak", label: "Dampak" },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null); // null = belum tau (masih cek)

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (mounted) setIsLoggedIn(Boolean(data.session));
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (mounted) setIsLoggedIn(Boolean(session));
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  return (
    <header className="sticky top-0 z-40 border-b-[3px] border-deep bg-primary text-white">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-5 sm:px-6">
        <Link href="/" aria-label="FABRIX AI — Halaman utama" className="shrink-0">
          <BrandLogo />
        </Link>

        <nav className="hidden items-center gap-8 text-sm font-bold text-white/70 md:flex" aria-label="Navigasi utama">
          {navigationLinks.map((item) => (
            <Link key={item.href} href={item.href} className="transition-colors hover:text-white">
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {isLoggedIn ? (
            <Link
              href="/dashboard"
              className="border-[3px] border-deep bg-white px-4 py-2 text-sm font-black text-deep shadow-[3px_3px_0_0_theme(colors.deep)] transition hover:-translate-y-0.5 active:translate-x-[3px] active:translate-y-[3px] active:shadow-none"
            >
              Buka Dashboard
            </Link>
          ) : (
            <>
              <Link
                href="/#dampak"
                className="border-[3px] border-deep bg-white px-4 py-2 text-sm font-black text-deep shadow-[3px_3px_0_0_theme(colors.deep)] transition hover:-translate-y-0.5 active:translate-x-[3px] active:translate-y-[3px] active:shadow-none"
              >
                Mulai Sekarang
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          aria-label={menuOpen ? "Tutup menu" : "Buka menu"}
          aria-expanded={menuOpen}
          aria-controls="menu-mobile"
          onClick={() => setMenuOpen((current) => !current)}
          className="grid h-10 w-10 place-items-center border-[3px] border-white/40 text-white transition hover:border-white hover:bg-white/10 md:hidden"
        >
          <AnimatePresence initial={false} mode="wait">
            {menuOpen ? (
              <motion.span
                key="close"
                initial={{ opacity: 0, rotate: -90 }}
                animate={{ opacity: 1, rotate: 0 }}
                exit={{ opacity: 0, rotate: 90 }}
                transition={{ duration: 0.16 }}
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </motion.span>
            ) : (
              <motion.span
                key="menu"
                initial={{ opacity: 0, rotate: 90 }}
                animate={{ opacity: 1, rotate: 0 }}
                exit={{ opacity: 0, rotate: -90 }}
                transition={{ duration: 0.16 }}
              >
                <Menu className="h-5 w-5" aria-hidden="true" />
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>

      <AnimatePresence initial={false}>
        {menuOpen && (
          <motion.div
            id="menu-mobile"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: "easeInOut" }}
            className="overflow-hidden border-t-[3px] border-deep md:hidden"
          >
            <div className="mx-auto max-w-6xl space-y-1 px-5 py-4 sm:px-6">
              <nav className="space-y-1" aria-label="Navigasi mobile">
                {navigationLinks.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMenuOpen(false)}
                    className="block px-3 py-2.5 text-sm font-bold text-white/80 transition hover:bg-white/10 hover:text-white"
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
              <div className="border-t-[3px] border-white/20 pt-4">
                {isLoggedIn ? (
                  <Link
                    href="/dashboard"
                    onClick={() => setMenuOpen(false)}
                    className="inline-flex min-h-10 w-full items-center justify-center border-[3px] border-deep bg-white px-4 text-sm font-black text-deep shadow-[3px_3px_0_0_theme(colors.deep)]"
                  >
                    Buka Dashboard
                  </Link>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    <Link
                      href="/login"
                      onClick={() => setMenuOpen(false)}
                      className="inline-flex min-h-10 items-center justify-center border-[3px] border-white/40 px-4 text-sm font-black text-white transition hover:border-white hover:bg-white/10"
                    >
                      Masuk
                    </Link>
                    <Link
                      href="/register"
                      onClick={() => setMenuOpen(false)}
                      className="inline-flex min-h-10 items-center justify-center border-[3px] border-deep bg-white px-4 text-sm font-black text-deep shadow-[3px_3px_0_0_theme(colors.deep)]"
                    >
                      Mulai Sekarang
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}