const MESSAGE_TRANSLATIONS: Array<[RegExp, string]> = [
  [/invalid login credentials/i, "Email atau kata sandi salah."],
  [/email not confirmed/i, "Email belum dikonfirmasi. Periksa kotak masuk email Anda."],
  [/user already registered/i, "Email tersebut sudah terdaftar."],
  [/password should be at least/i, "Kata sandi belum memenuhi panjang minimum."],
  [/unable to validate email/i, "Format email belum valid."],
  [/missing bearer token|invalid or expired session/i, "Sesi Anda sudah berakhir. Silakan masuk kembali."],
  [/analysis not found/i, "Hasil analisis tidak ditemukan."],
  [/field 'image'.*required|image is required/i, "Foto kain wajib disertakan."],
  [/image exceeds.*8mb/i, "Ukuran gambar melebihi batas 8 MB."],
  [/failed to store fabric image/i, "Foto kain belum berhasil disimpan."],
  [/failed to save analysis result/i, "Hasil analisis belum berhasil disimpan."],
  [/scan failed/i, "Proses scan belum berhasil."],
  [/comparison could not|failed.*comparison/i, "Perbandingan belum dapat disiapkan."],
  [/failed to fetch|network request failed/i, "Tidak dapat terhubung ke server. Periksa koneksi lalu coba lagi."],
];

export function messageInIndonesian(message: unknown, fallback = "Permintaan belum dapat diproses.") {
  if (typeof message !== "string" || !message.trim()) return fallback;
  const cleaned = message.trim();
  const translated = MESSAGE_TRANSLATIONS.find(([pattern]) => pattern.test(cleaned));
  if (translated) return translated[1];

  if (/\b(tidak|belum|gagal|wajib|sesi|gambar|kain|analisis|kata sandi|email)\b/i.test(cleaned)) {
    return cleaned;
  }

  return fallback;
}
