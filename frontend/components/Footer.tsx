import Link from "next/link";

const quickLinks = [
  { href: "/#home", label: "Beranda" },
  { href: "/#cara-kerja", label: "Cara Kerja" },
  { href: "/#dampak", label: "Dampak" },
  { href: "/register", label: "Mulai Gratis" },
];

export default function Footer() {
  return (
    <footer className="relative border-t-[3px] border-deep bg-primary text-white">
      <div
        className="absolute left-0 top-0 h-10 w-28 border-b-[3px] border-r-[3px] border-deep bg-base sm:h-12 sm:w-36"
        style={{ clipPath: "polygon(0 0, 100% 0, 78% 100%, 0 100%)" }}
      />

      <div className="mx-auto max-w-6xl px-5 pb-8 pt-16 sm:px-6 sm:pt-20">
        <div className="grid gap-10 md:grid-cols-[auto,1fr] md:items-start md:gap-14">
          {/* vertical brand word, rotated along the left edge */}
          <div className="hidden md:flex md:h-full md:items-end">
            <span
              className="select-none font-display text-3xl font-black uppercase tracking-widest text-sage"
              style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}
            >
              Fabrix
            </span>
          </div>

          <div className="grid gap-10 sm:grid-cols-[1.2fr,0.9fr,0.9fr]">
            {/* big chunky headline, like "Join Us" */}
            <div>
              <h2 className="font-display text-5xl font-black uppercase leading-[0.92] tracking-tight sm:text-6xl">
                Mulai
                <br />
                <span className="text-sage">Scan</span>
              </h2>
              <p className="mt-5 max-w-xs text-sm leading-6 text-white/60">
                Cek kualitas kain dari HP dalam hitungan detik tanpa alat lab, tanpa input teknis rumit.
              </p>
            </div>

            {/* quick links */}
            <div>
              <h3 className="font-display text-lg font-black uppercase tracking-wide text-sage">Quick Links</h3>
              <ul className="mt-4 space-y-2.5">
                {quickLinks.map((item) => (
                  <li key={item.href}>
                    <Link href={item.href} className="text-sm font-semibold text-white/75 transition hover:text-white">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* contact */}
            <div>
              <h3 className="font-display text-lg font-black uppercase tracking-wide text-sage">Kontak</h3>
              <p className="mt-4 text-sm leading-6 text-white/75">
                Dibuat untuk ITECHNO CUP 2026
                <br />
                Tim SATORU (Smkn sAtu Technologycal Organization for Reasearch and Upgrades)
              </p>
              <p className="mt-4 text-sm">
                <span className="font-bold text-sage">Contact</span>{" "}
                <a href="https://smkn1jakarta.sch.id/" className="text-white/75 transition hover:text-white">
                  https://smkn1jakarta.sch.id/
                </a>
              </p>
            </div>
          </div>
        </div>

        <div className="mt-14 flex flex-col items-start justify-between gap-3 border-t-2 border-white/15 pt-6 text-xs text-white/50 sm:flex-row sm:items-center">
          <span>© 2026 FABRIX AI · Seluruh hak cipta dilindungi.</span>
          <div className="flex flex-wrap gap-x-4 gap-y-1">
            <Link href="/privacy" className="transition hover:text-white">Kebijakan Privasi</Link>
            <Link href="/terms" className="transition hover:text-white">Syarat &amp; Ketentuan</Link>
            <Link href="/cookies" className="transition hover:text-white">Kebijakan Cookie</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}