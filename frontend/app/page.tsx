"use client";

import Link from "next/link";
import { motion, type Variants } from "framer-motion";
import { ScanSearch, Gauge, Scissors, TrendingUp, IdCard, LineChart } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 18 },
  show: (delay: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] },
  }),
};

const steps = [
  ["01", "Foto Kain", "Buka kamera atau pilih dari galeri. Arahkan ke area kain yang ingin diperiksa."],
  ["02", "Deteksi Cacat", "AI mendeteksi dan menandai area cacat (lubang, noda, sobekan, dll) secara otomatis."],
  ["03", "Panduan Potong", "Sistem menghitung blok area terbesar yang bebas cacat untuk memandu pola potong."],
  ["04", "Simpan & Pantau", "Simpan hasil sebagai Paspor Kain dan pantau tren kualitas dari waktu ke waktu."],
];

const capabilities = [
  [ScanSearch, "Deteksi Cacat Kain (YOLO)", "Lubang, noda, sobekan, pilling, benang tertarik, perubahan warna"],
  [Gauge, "Severity Score Otomatis", "Layak Produksi / Perlu Dicek Ulang / Reject tanpa input manual"],
  [Scissors, "Panduan Area Potong Aman", "Visualisasi blok bebas cacat terbesar dari hasil deteksi"],
  [TrendingUp, "Prediksi Kualitas (XGBoost)", "Estimasi kategori kualitas berbasis data industri tekstil"],
  [IdCard, "Paspor Kain Digital", "Riwayat analisis tersimpan & bisa diexport PDF"],
  [LineChart, "Tren Kualitas Otomatis", "Pantau apakah kain yang kamu scan cenderung membaik atau menurun"],
] as const;

const sdgs = [
  ["SDG 8", "Pemberdayaan Ekonomi UMKM", "Membantu konveksi kecil cek kualitas kain tanpa perlu alat lab mahal."],
  ["SDG 9", "Inovasi & Infrastruktur", "Platform berbasis web dengan AI (YOLO + XGBoost) yang bisa diakses dari HP."],
];

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-base">
      <Navbar />

      {/* Hero */}
      <section id="home" className="relative overflow-hidden bg-deep text-white">
        <div className="absolute inset-0 bg-weave opacity-50" />
        <div className="relative mx-auto grid max-w-6xl gap-14 px-5 py-20 sm:px-6 md:grid-cols-[1.05fr,0.95fr] md:items-center md:py-28">
          <div>
            <motion.p
              initial="hidden"
              animate="show"
              custom={0}
              variants={fadeUp}
              className="inline-block border-2 border-sage px-3 py-1 font-mono text-xs font-bold uppercase tracking-[0.2em] text-sage"
            >
              Deteksi cacat kain berbasis AI
            </motion.p>
            <motion.h1
              initial="hidden"
              animate="show"
              custom={0.08}
              variants={fadeUp}
              className="mt-6 max-w-3xl font-display text-5xl font-semibold leading-[1.02] tracking-tight sm:text-6xl lg:text-7xl"
            >
              Deteksi cacat kain sebelum dipotong.
            </motion.h1>
            <motion.p
              initial="hidden"
              animate="show"
              custom={0.16}
              variants={fadeUp}
              className="mt-6 max-w-xl text-base leading-7 text-white/68 sm:text-lg"
            >
              Foto kain dari HP, AI langsung deteksi area cacat dan tunjukkan bagian mana yang aman dipotong tanpa alat lab, tanpa input manual.
            </motion.p>
            <motion.div
              initial="hidden"
              animate="show"
              custom={0.24}
              variants={fadeUp}
              className="mt-8 flex flex-col gap-3 sm:flex-row"
            >
              <Link
                href="/#dampak"
                className="inline-flex min-h-12 items-center justify-center border-[3px] border-white bg-white px-6 text-sm font-black text-deep shadow-[4px_4px_0_0_theme(colors.sage)] transition active:translate-x-[4px] active:translate-y-[4px] active:shadow-none"
              >
                Mulai Sekarang
              </Link>
              <Link
                href="/#cara-kerja"
                className="inline-flex min-h-12 items-center justify-center border-[3px] border-white/40 px-6 text-sm font-black text-white transition hover:border-sage hover:bg-white/5"
              >
                Jelajahi
              </Link>
            </motion.div>
            <motion.p
              initial="hidden"
              animate="show"
              custom={0.32}
              variants={fadeUp}
              className="mt-5 text-xs leading-5 text-white/45"
            >
              Dirancang untuk UMKM &amp; konveksi. Hasil AI sebagai pendukung keputusan, bukan pengganti pengujian laboratorium.
            </motion.p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 24, rotate: -1 }}
            animate={{ opacity: 1, y: 0, rotate: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="mx-auto w-full max-w-lg border-[3px] border-white/70 bg-white/5 p-4 shadow-[8px_8px_0_0_theme(colors.sage)] backdrop-blur"
          >
            <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-secondary to-deep">
              <div className="absolute inset-0 bg-weave opacity-80" />
              <div className="absolute inset-[11%] border-2 border-white/60">
                <span className="absolute -left-px -top-px h-12 w-12 border-l-4 border-t-4 border-sage" />
                <span className="absolute -right-px -top-px h-12 w-12 border-r-4 border-t-4 border-sage" />
                <span className="absolute -bottom-px -left-px h-12 w-12 border-b-4 border-l-4 border-sage" />
                <span className="absolute -bottom-px -right-px h-12 w-12 border-b-4 border-r-4 border-sage" />
                <div className="scan-line" />
                {/* mock bounding box: waits for the scan line to pass, then snaps in */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.35, delay: 1.6, repeat: Infinity, repeatType: "loop", repeatDelay: 2.05 }}
                  className="absolute left-[30%] top-[25%] h-[28%] w-[22%] border-2 border-red-400"
                >
                  <motion.span
                    animate={{ opacity: [1, 0.55, 1] }}
                    transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute inset-0 border-2 border-red-400"
                  />
                  <span className="absolute -top-5 left-0 bg-red-500/80 px-1.5 py-0.5 font-mono text-[9px] font-bold text-white">
                    hole 89%
                  </span>
                </motion.div>
              </div>
              <div className="absolute inset-x-0 bottom-8 text-center">
                <motion.span
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: 1.7, repeat: Infinity, repeatType: "loop", repeatDelay: 2.05 }}
                  className="inline-block border-2 border-white/40 bg-deep/70 px-4 py-2 text-xs font-bold text-white backdrop-blur"
                >
                  1 cacat terdeteksi
                </motion.span>
              </div>
            </div>
            <div className="flex items-center justify-between px-2 pb-1 pt-4">
              <div>
                <p className="text-sm font-black text-white">Deteksi. Panduan. Simpan.</p>
                <p className="mt-1 text-xs text-white/50">Dari foto kain ke hasil analisis dalam hitungan detik.</p>
              </div>
              <span className="h-11 w-11 border-[3px] border-white bg-sage shadow-[3px_3px_0_0_theme(colors.deep)]" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Target user */}
      <section className="overflow-hidden border-b-[3px] border-deep bg-white py-5">
        <div className="marquee-track flex w-max items-center gap-x-8">
          {[0, 1].map((loop) => (
            <div key={loop} className="flex items-center gap-x-8 pr-8 text-xs font-black uppercase tracking-wide text-muted" aria-hidden={loop === 1}>
              <span className="border-2 border-deep bg-pale px-2 py-1 text-primary">Untuk</span>
              <span>Konveksi &amp; UMKM Tekstil</span>
              <span>QC Produksi</span>
              <span>Tim Pembelian Bahan</span>
              <span>Riset Material</span>
              <span className="text-sage">◆</span>
              <span>Konveksi &amp; UMKM Tekstil</span>
              <span>QC Produksi</span>
              <span>Tim Pembelian Bahan</span>
              <span>Riset Material</span>
              <span className="text-sage">◆</span>
            </div>
          ))}
        </div>
      </section>

      {/* Cara kerja */}
      <section id="cara-kerja" className="mx-auto max-w-6xl px-5 py-20 sm:px-6">
        <div className="max-w-2xl">
          <p className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-secondary">Alur kerja yang ringkas</p>
          <h2 className="mt-4 font-display text-4xl font-semibold text-deep">Foto. Deteksi. Panduan. Simpan.</h2>
          <p className="mt-4 leading-7 text-muted">
            FABRIX AI membantu konveksi dan UMKM cek kualitas kain sebelum dipotong tanpa alat lab, tanpa input teknis rumit. Cukup foto kainnya.
          </p>
        </div>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map(([number, title, description]) => (
            <article
              key={number}
              className="border-[3px] border-deep bg-white p-6 shadow-[5px_5px_0_0_theme(colors.deep)] transition hover:-translate-y-1 hover:shadow-[7px_7px_0_0_theme(colors.deep)]"
            >
              <span className="inline-block border-2 border-deep bg-sage px-2 py-0.5 font-mono text-xs font-black text-deep">
                {number}
              </span>
              <h3 className="mt-5 font-display text-2xl font-semibold text-deep">{title}</h3>
              <p className="mt-3 text-sm leading-6 text-muted">{description}</p>
            </article>
          ))}
        </div>
      </section>

      {/* Fitur */}
      <section id="fitur" className="border-y-[3px] border-deep bg-pale/45">
        <div className="mx-auto max-w-6xl gap-12 px-5 py-20 sm:px-6">
          <div className="max-w-2xl">
            <p className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-secondary">Fitur yang sudah berjalan</p>
            <h2 className="mt-4 font-display text-4xl font-semibold text-deep">Lebih dari sekadar deteksi cacat.</h2>
            <p className="mt-4 leading-7 text-muted">
              FABRIX AI menggabungkan computer vision (YOLO) dan machine learning (XGBoost) dalam satu platform yang bisa diakses langsung dari browser HP.
            </p>
          </div>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {capabilities.map(([Icon, title, description]) => (
              <div
                key={title}
                className="border-[3px] border-deep bg-white p-6 shadow-[5px_5px_0_0_theme(colors.deep)] transition hover:-translate-y-1 hover:shadow-[7px_7px_0_0_theme(colors.deep)]"
              >
                <span className="grid h-11 w-11 place-items-center border-2 border-deep bg-pale">
                  <Icon className="h-5 w-5 text-primary" strokeWidth={2.25} aria-hidden="true" />
                </span>
                <h3 className="mt-4 font-display text-lg font-semibold text-deep">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SDG */}
      <section id="dampak" className="mx-auto max-w-6xl px-5 py-20 sm:px-6">
        <div className="max-w-2xl">
          <p className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-secondary">Dampak sosial</p>
          <h2 className="mt-4 font-display text-4xl font-semibold text-deep">Inovasi digital untuk UMKM yang lebih berdaya.</h2>
        </div>
        <div className="mt-8 grid gap-5 sm:grid-cols-2">
          {sdgs.map(([badge, title, description]) => (
            <div key={badge} className="border-[3px] border-deep bg-white p-6 shadow-[5px_5px_0_0_theme(colors.deep)]">
              <span className="inline-flex border-2 border-deep bg-primary px-3 py-1 font-mono text-xs font-black text-white">
                {badge}
              </span>
              <h3 className="mt-4 font-display text-xl font-semibold text-deep">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-muted">{description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-5 pb-20 sm:px-6">
        <div className="border-[3px] border-deep bg-primary px-6 py-12 text-white shadow-[8px_8px_0_0_theme(colors.sage)] sm:px-12">
          <p className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-sage">Mulai sekarang, gratis</p>
          <div className="mt-4 flex flex-col justify-between gap-8 md:flex-row md:items-end">
            <div>
              <h2 className="max-w-2xl font-display text-4xl font-semibold">
                Cek kualitas kain sebelum potong. Hemat waktu, hindari kerugian.
              </h2>
              <p className="mt-4 max-w-xl text-sm leading-6 text-white/65">
                Konveksi dan UMKM tekstil bisa langsung pakai dari HP tanpa instalasi, tanpa alat khusus.
              </p>
            </div>
            <Link
              href="/register"
              className="inline-flex min-h-12 shrink-0 items-center justify-center border-[3px] border-white bg-white px-6 text-sm font-black text-deep shadow-[4px_4px_0_0_theme(colors.sage)] transition active:translate-x-[4px] active:translate-y-[4px] active:shadow-none"
            >
              Daftar Gratis
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}