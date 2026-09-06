<div align="center">

# FABRIX AI
### Pahami Kain Sebelum Diproduksi

[![Live Demo](https://img.shields.io/badge/Live_Demo-Visit_Site-success?style=for-the-badge)](https://fabrixai.vercel.app/)
[![GitHub](https://img.shields.io/badge/GitHub-Repository-181717?style=for-the-badge&logo=github)](https://github.com/raykenzienazaru-dot/FABRIX-AI)
[![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-16.3.4-051F20?style=for-the-badge&logo=next.js&logoColor=white)](frontend/package.json)
[![Status](https://img.shields.io/badge/Status-Prototipe_Integrasi-8EB69B?style=for-the-badge)](#status-implementasi--batasan)

**Submission for Web Development ITECHNO CUP 2026**
**By Tim SATORU**
**(Smkn sAtu Technologycal Organization for Reasearch and Upgrades)**

[Live Demo](https://fabrixai.vercel.app/) · [Google Drive](https://drive.google.com/drive/folders/13XIek5RmP-ADojPY14Cdhyjwmx3TGCpd) · [Contoh Laporan PDF](UI%20Gambar/FABRIX_AI_Kain_tanpa_nama_f3c299d4.pdf)

</div>

---

## Daftar Isi

- [Tentang Proyek](#tentang-proyek)
- [Fitur Unggulan](#fitur-unggulan)
- [Demo & Screenshot](#demo--screenshot)
- [Teknologi](#teknologi)
- [Arsitektur Sistem](#arsitektur-sistem)
- [Instalasi & Setup](#instalasi--setup)
- [Penggunaan](#penggunaan)
- [API Documentation](#api-documentation)
- [Testing & Verifikasi](#testing--verifikasi)
- [Status Implementasi & Batasan](#status-implementasi--batasan)
- [Tim Developer](#tim-developer)
- [Lisensi](#lisensi)

---

## Tentang Proyek

Pemeriksaan kain secara manual membuat UMKM tekstil dan konveksi kehilangan waktu, rawan human error, dan sulit mendokumentasikan hasil pemeriksaan secara konsisten. Keputusan potong sering hanya bergantung pada penglihatan dan ingatan operator, tanpa catatan yang bisa dibuka kembali atau dibandingkan di kemudian hari.

**FABRIX AI** hadir sebagai platform inspeksi kain berbasis web yang menyatukan tiga hal dalam satu alur kerja: deteksi cacat visual dengan model deep learning (YOLO via Roboflow), prediksi kategori kualitas dengan machine learning (XGBoost), dan panduan area potong aman berbasis hasil deteksi. Seluruh hasil tersimpan otomatis, dapat dibandingkan, dan diekspor menjadi laporan PDF yang siap dibagikan.

| Aspek | Penjelasan |
|---|---|
| Target Pengguna | UMKM tekstil, konveksi, penjahit, dan tim quality control material |
| Value Proposition | Satu platform terintegrasi, dari foto kain hingga laporan siap bagi, menggantikan proses manual yang selama ini terpisah-pisah |
| Arah Dampak | Selaras dengan SDG 8 (mendukung produktivitas UMKM) dan SDG 9 (mendorong adopsi teknologi digital di sektor tekstil) |
| Posisi Produk | Alat bantu pengambilan keputusan bagi operator, bukan pengganti pengujian laboratorium atau sertifikasi kain resmi |

---

## Fitur Unggulan

| Fitur | Deskripsi | Nilai Tambah |
|---|---|---|
| Scan Kamera & Galeri | Ambil foto langsung atau unggah dari galeri (JPEG/PNG/WebP, maksimal 8 MB) | Fleksibel digunakan langsung di lokasi produksi |
| Deteksi Cacat Otomatis | Model YOLO melalui Roboflow mendeteksi lubang, noda, dan cacat jahitan lengkap dengan koordinat dan tingkat keyakinan | Mempercepat inspeksi tanpa mengandalkan mata telanjang |
| Prediksi Kualitas | Kategori kualitas kain diprediksi menggunakan model XGBoost berdasarkan jumlah defect | Insight cepat sebagai bahan pertimbangan awal |
| Panduan Area Potong Aman | Sistem grid 12x9 memetakan area bebas cacat lengkap dengan zona penyangga otomatis | Meminimalkan kain terbuang saat proses pemotongan |
| Dashboard & Tren Kualitas | Visualisasi jumlah defect, rata-rata, dan status tren dari waktu ke waktu | Mendukung evaluasi kualitas produksi secara berkelanjutan |
| Riwayat, Perbandingan, dan Paspor Kain | Setiap hasil tersimpan otomatis, dapat dibandingkan 2-3 sekaligus, dan diberi identitas tersendiri | Dokumentasi terpusat, mudah ditelusuri kapan saja |
| Ekspor Laporan PDF | Laporan lengkap berisi foto, hasil deteksi, prediksi kualitas, dan rekomendasi tindak lanjut | Siap dibagikan ke klien, tim produksi, atau arsip usaha |

Fitur pendukung lain yang turut melengkapi pengalaman pengguna:

- Manajemen profil usaha (nama usaha, bidang usaha, penanggung jawab) dengan autentikasi Supabase
- Rekomendasi tindak lanjut otomatis berbasis hasil deteksi
- Pencarian riwayat berdasarkan nama kain
- Mode simulasi (mock) untuk kebutuhan pengujian tanpa memanggil layanan eksternal

---

## Demo & Screenshot

Live demo dapat diakses melalui [fabrixai.vercel.app](https://fabrixai.vercel.app/).
Demo Dekstop dan Mobile dapat diakses melalui [Google Drive](https://drive.google.com/drive/folders/13XIek5RmP-ADojPY14Cdhyjwmx3TGCpd).

Alur pengguna utama: mengenal produk, registrasi atau login, mengambil foto atau memilih dari galeri, menjalankan analisis, meninjau hasil dan rekomendasi, menggunakan panduan potong atau perbandingan atau paspor, mengekspor PDF, lalu memantau riwayat.

Dokumentasi visual lengkap tersedia di folder [UI Gambar](UI%20Gambar/) dan [gambar](gambar/), mencakup seluruh tahapan berikut:

| Tahap | Dokumentasi | Isi |
|---|---|---|
| 1. Pengenalan produk | [Beranda.png](UI%20Gambar/Beranda.png) | Pesan utama, navigasi, tombol mulai |
| 2. Alur kerja | [Cara Kerja FABRIX AI.png](UI%20Gambar/Cara%20Kerja%20FABRIX%20AI.png) | Empat langkah: foto, deteksi, panduan potong, simpan |
| 3. Kemampuan produk | [Fitur Utama.png](UI%20Gambar/Fitur%20Utama.png) | Ringkasan kemampuan YOLO, XGBoost, panduan potong, dan paspor |
| 4. Dampak sosial | [Dampak Sosial.png](UI%20Gambar/Dampak%20Sosial.png) | Arah dampak SDG 8 dan SDG 9 |
| 5. Navigasi | [Footer Interaktif.png](UI%20Gambar/Footer%20Interaktif.png) | Tautan cepat dan identitas tim |
| 6. Registrasi | [Regis.png](UI%20Gambar/Regis.png) | Formulir profil usaha dan konfirmasi email |
| 7. Login | [Login.png](UI%20Gambar/Login.png) | Formulir masuk pengguna terdaftar |
| 8. Dashboard | [Ringkasan Grafik Analisis.png](UI%20Gambar/Ringkasan%20Grafik%20Analisis.png) | Grafik defect, tren, dan distribusi jenis cacat |
| 9. Hasil analisis | [Fitur AI.png](UI%20Gambar/Fitur%20AI.png) | Overlay deteksi, kategori kualitas, dan confidence |
| 10. Rekomendasi | [Rekomendasi.png](UI%20Gambar/Rekomendasi.png) | Saran perawatan dan pemeriksaan lanjutan |
| 11. Panduan potong | [Analisis Lainnya.png](UI%20Gambar/Analisis%20Lainnya.png) | Grid area aman dan blok potong terbesar |
| 12. Riwayat analisis | [History Analisis sebelumnya.png](UI%20Gambar/History%20Analisis%20sebelumnya.png) | Kartu analisis terbaru pada dashboard |

Contoh keluaran laporan PDF hasil analisis lengkap dapat dibuka melalui [tautan berikut](UI%20Gambar/FABRIX_AI_Kain_tanpa_nama_f3c299d4.pdf), berisi identitas kain, jumlah defect, prediksi kualitas beserta tingkat keyakinannya, serta rekomendasi tindak lanjut.

Arsip logo dan diagram rancangan sistem tersedia di folder [gambar](gambar/), termasuk sketsa awal arsitektur dan alur pengguna sebagai referensi proses pengembangan.

---

## Teknologi

| Lapisan | Teknologi | Sumber Konfigurasi |
|---|---|---|
| Antarmuka | Next.js, React, TypeScript, Tailwind CSS | [package.json frontend](frontend/package.json) |
| Grafik & Interaksi | Recharts, Framer Motion, Lucide React | Komponen frontend |
| Ekspor PDF | jsPDF | [reportPdf.ts](frontend/lib/reportPdf.ts) |
| Backend API | Node.js, Express, Multer, Helmet, CORS | [package.json backend](https://github.com/raykenzienazaru-dot/FABRIX-AI/blob/backend/backend/package.json) |
| Autentikasi & Database | Supabase Auth, PostgreSQL, Supabase Storage | [Schema SQL](https://github.com/raykenzienazaru-dot/FABRIX-AI/blob/backend/schema.sql) |
| Deteksi Visual | YOLO melalui Roboflow Workflow | [yoloService.js](backend/services/yoloService.js) |
| Prediksi Kualitas | Python, FastAPI, XGBoost, joblib | [requirements.txt](requirements.txt) |
| Deployment | Vercel | [fabrixai.vercel.app](https://fabrixai.vercel.app/) |

Alasan pemilihan teknologi utama:

- Next.js dipilih karena mendukung struktur halaman dinamis sekaligus performa yang baik untuk landing page dan dashboard interaktif.
- Supabase memberikan autentikasi, database, dan penyimpanan file dalam satu layanan terintegrasi, mempercepat proses pengembangan tanpa mengorbankan keamanan data.
- Roboflow (YOLO) memungkinkan deteksi objek yang akurat tanpa perlu melatih model dari nol, sehingga proses pengembangan lebih efisien.
- XGBoost dipilih karena ringan dan cepat untuk klasifikasi berbasis fitur numerik seperti jumlah defect.
- jsPDF memungkinkan pembuatan laporan langsung di sisi klien tanpa membutuhkan layanan server tambahan.

---

## Arsitektur Sistem

Alur data FABRIX AI dirancang linear dan mudah ditelusuri, dari input hingga penyajian hasil:

```
Kamera / Galeri
      |
POST /api/scan  ->  Supabase Storage (penyimpanan foto)
      |
YOLO via Roboflow  ->  hasil deteksi (kelas, confidence, koordinat)
      |
XGBoost Service /predict-quality (opsional)  ->  kategori kualitas
      |
Tabel fabric_analyses (penyimpanan hasil)
      |
Overlay UI, Riwayat, Perbandingan, Paspor, Panduan Potong, Ekspor PDF, Tren
```

Rincian tahapan:

| Tahap | Komponen dan Proses |
|---|---|
| Autentikasi | Frontend memperoleh sesi Supabase Auth; setiap request API membawa Bearer token yang diverifikasi backend |
| Input gambar | Kamera atau galeri mengirim file melalui multipart/form-data ke POST /api/scan |
| Penyimpanan foto | Backend mengunggah foto asli ke bucket fabric-images di bawah path pengguna |
| Deteksi visual | [yoloService.js](backend/services/yoloService.js) mengirim gambar ke Roboflow dan menormalkan hasil deteksi |
| Prediksi kualitas | [routes/scan.js](backend/routes/scan.js) mengirim jumlah defect ke [ai_service.py](ai_service.py) bila dikonfigurasi |
| Penyimpanan hasil | Backend menyimpan deteksi, kualitas, confidence, dan rekomendasi ke tabel fabric_analyses |
| Penyajian ulang | Overlay, riwayat, paspor, perbandingan, panduan potong, PDF, dan tren memanfaatkan data yang sudah tersimpan |

Struktur folder workspace:

```text
FABRIX-AI/                 (branch main — root repository)
├── README.MD
├── LICENSE
├── .env.example
├── UI Gambar/             Dokumentasi screenshot dan contoh PDF
├── gambar/                Logo dan diagram rancangan
├── ai_service.py          Layanan Python (FastAPI)
├── severity_score.py      Modul perhitungan severity (belum terhubung ke alur utama)
├── requirements.txt       Dependency layanan AI
├── fabric_quality_model.json
├── feature_cols.pkl
├── target_encoder.pkl
├── label_encoders.pkl
├── insights.json
├── frontend/frontend/     Aplikasi Next.js (branch frontend — app, components, lib, public, types)
└── backend/backend/       Server Express (branch backend — middleware, routes, services)
```

Catatan: layanan AI berada langsung di root branch `main`, bukan pada folder `ai/` terpisah. Hanya frontend dan backend yang perlu di-checkout dari branch masing-masing.

---

## Instalasi & Setup

### Prasyarat

- Git dan Node.js dengan npm
- Python yang kompatibel dengan [requirements AI](requirements.txt)
- Proyek Supabase aktif
- Workflow Roboflow yang sudah dikonfigurasi

### Langkah Instalasi

**1. Clone repository**

Layanan AI berada di root branch `main`, sehingga cukup di-clone seperti biasa:

```bash
git clone https://github.com/raykenzienazaru-dot/FABRIX-AI.git
cd FABRIX-AI
```

Frontend dan backend berada pada branch terpisah, checkout masing-masing ke folder tersendiri:

```bash
git clone --branch frontend --single-branch https://github.com/raykenzienazaru-dot/FABRIX-AI.git frontend
git clone --branch backend --single-branch https://github.com/raykenzienazaru-dot/FABRIX-AI.git backend
```

**2. Siapkan database Supabase**

Jalankan [schema dasar](https://github.com/raykenzienazaru-dot/FABRIX-AI/blob/backend/schema.sql) melalui SQL Editor, kemudian tambahkan kolom yang dibutuhkan oleh backend terbaru:

```sql
alter table public.fabric_analyses
  add column if not exists jumlah_defect integer,
  add column if not exists predicted_quality text,
  add column if not exists prediction_confidence numeric;
```

**3. Konfigurasi environment**

`frontend/frontend/.env.local`
```env
NEXT_PUBLIC_SUPABASE_URL=https://project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=isi_anon_key
NEXT_PUBLIC_API_URL=http://localhost:4000
```

`backend/backend/.env`
```env
PORT=4000
FRONTEND_ORIGIN=http://localhost:3000
SUPABASE_URL=https://project-id.supabase.co
SUPABASE_SERVICE_ROLE_KEY=isi_service_role_key
ROBOFLOW_WORKFLOW_URL=https://serverless.roboflow.com/workspace/workflows/workflow-id
ROBOFLOW_API_KEY=isi_api_key
ALLOW_MOCK_INFERENCE=false
AI_SERVICE_URL=http://127.0.0.1:8000
```

Simpan SUPABASE_SERVICE_ROLE_KEY dan ROBOFLOW_API_KEY hanya di sisi backend. Fitur kamera membutuhkan koneksi HTTPS atau localhost.

**4. Jalankan ketiga layanan**

Layanan AI (dijalankan dari root repository `FABRIX-AI/`, bukan folder terpisah):
```powershell
cd FABRIX-AI
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
.\.venv\Scripts\python.exe -m uvicorn ai_service:app --host 127.0.0.1 --port 8000
```

Backend:
```powershell
cd backend/backend
npm ci
npm run dev
```

Frontend:
```powershell
cd frontend/frontend
npm ci
npm run dev
```

Setelah ketiga layanan berjalan, akses:

| Layanan | Alamat |
|---|---|
| Aplikasi frontend | http://localhost:3000 |
| Status backend | http://localhost:4000/health |
| Status layanan AI | http://127.0.0.1:8000/ |

---

## Penggunaan

| Peran | Alur Penggunaan |
|---|---|
| Pengguna baru | Registrasi dan konfirmasi email, lalu login untuk masuk ke dashboard |
| Inspeksi kain | Buka halaman scan, ambil foto atau pilih dari galeri, jalankan analisis, dan tinjau hasil deteksi beserta prediksi kualitas |
| Evaluasi berkala | Buka dashboard untuk memantau grafik defect dan status tren kualitas dari waktu ke waktu |
| Perbandingan kain | Pilih 2 hingga 3 hasil tersimpan pada halaman perbandingan untuk melihat karakteristik deteksi berdampingan |
| Panduan potong | Pilih hasil scan pada halaman panduan potong untuk melihat zona aman dan zona yang perlu dihindari |
| Dokumentasi dan pelaporan | Buka detail paspor kain dan ekspor hasil menjadi laporan PDF untuk dibagikan atau diarsipkan |

---

## API Documentation

Base URL layanan backend: `http://localhost:4000`. Seluruh endpoint di bawah /api/* membutuhkan header Authorization: Bearer <supabase_access_token>.

| Method | Endpoint | Fungsi |
|---|---|---|
| GET | /health | Status backend, tanpa autentikasi |
| GET | /api/auth/me | Data pengguna aktif dan profil usaha |
| POST | /api/auth/company-profile | Membuat atau memperbarui profil usaha |
| POST | /api/scan | Mengunggah foto, menjalankan deteksi, prediksi kualitas, dan menyimpan hasil |
| GET | /api/scan/history | Mengambil seluruh riwayat hasil milik pengguna |
| GET | /api/scan/insights/trend | Ringkasan tren dan distribusi defect, minimal tiga riwayat |
| GET | /api/scan/:id | Detail satu hasil analisis |
| PATCH | /api/scan/:id | Memperbarui nama kain pada hasil tersimpan |
| POST | /api/scan/compare | Membandingkan 2 hingga 3 hasil berdasarkan ID |
| POST | /api/scan/:id/whatif | Menjalankan skenario simulasi ulang pada gambar tersimpan |

Contoh request:

```javascript
const formData = new FormData();
formData.append('image', file);
formData.append('fabric_name', 'Katun Premium');

const response = await fetch('/api/scan', {
  method: 'POST',
  headers: { Authorization: `Bearer ${accessToken}` },
  body: formData
});
```

Layanan Python terpisah menyediakan endpoint berikut:

| Endpoint | Fungsi |
|---|---|
| GET / | Status layanan |
| POST /predict-quality | Menerima { "jumlah_defect": 2 }, mengembalikan kategori kualitas |
| GET /insights | Membaca metadata hasil pelatihan model |

Catatan: endpoint layanan Python ini belum menerapkan lapisan autentikasi pada kode lokal.

---

## Testing & Verifikasi

Perintah pemeriksaan lokal sebelum deployment:

Frontend:
```powershell
cd frontend/frontend
npx tsc --noEmit
npm run build
```

Backend:
```powershell
cd backend/backend
node --check server.js
node --check routes/scan.js
node --check routes/auth.js
node --check services/yoloService.js
```

Alur pemeriksaan manual yang direkomendasikan:

Registrasi dan konfirmasi email, login, ambil foto atau pilih dari galeri, tinjau hasil deteksi dan kualitas, ubah nama kain, buka riwayat, bandingkan dua hingga tiga hasil, gunakan panduan potong, buka paspor kain, unduh laporan PDF, periksa tren setelah minimal tiga kali scan, lalu logout.

Catatan: script pengujian otomatis (typecheck dan test suite) belum didefinisikan pada package frontend. Perintah di atas merupakan panduan pemeriksaan manual, bukan hasil pengujian otomatis yang telah dijalankan.

---

## Status Implementasi & Batasan

Transparansi terhadap batasan teknis adalah bagian dari komitmen tim terhadap kualitas produk. Berikut ringkasan status setiap komponen:

| Komponen | Status |
|---|---|
| Akun dan profil, kamera dan galeri, deteksi Roboflow, prediksi kualitas, riwayat, dashboard, panduan potong, perbandingan, paspor, ekspor PDF | Terimplementasi dan berfungsi, dengan ketersediaan bergantung pada konfigurasi backend, Supabase, dan layanan AI |
| Severity score | Modul perhitungan sudah tersedia namun belum terhubung ke alur deteksi utama |
| Simulasi what-if material | Endpoint tersedia, namun simulasi pengaruh komposisi dan perawatan belum tervalidasi |
| Indeks mikroplastik dan daya tahan | Masih berupa perhitungan heuristik internal, bukan hasil pengukuran laboratorium |
| Insight hasil pelatihan model | Data masih bersifat sementara dan belum mencerminkan metrik akurasi final |
| Halaman kebijakan privasi dan syarat layanan | Tautan sudah tersedia di footer, halaman tujuan belum dibangun |
| Keamanan penyimpanan foto | Bucket foto bersifat public pada schema dasar; diperlukan kebijakan akses tambahan untuk data yang lebih sensitif |

Mode simulasi (mock inference) tersedia untuk kebutuhan pengujian tanpa memanggil Roboflow secara langsung. Pastikan variabel ALLOW_MOCK_INFERENCE diatur ke false pada lingkungan produksi agar sistem tidak beralih otomatis ke data simulasi saat terjadi kegagalan layanan.

---

## Tim Developer

| Nama | Peran | GitHub |
|---|---|---|
| Evelly Khanzania Putri | Pengembang AI | [Vkzapple](https://github.com/Vkzapple) |
| Dhiyaa Fazila Nugraha | Pengembang Full-Stack | [fzlngh](https://github.com/fzlngh) |
| Raykenzie Nazaru Fathurrahmansyah | Asisten Riset dan Pengembangan | [raykenzienazaru-dot](https://github.com/raykenzienazaru-dot) |

---

## Lisensi

Proyek ini dilisensikan di bawah [MIT License](LICENSE) — hak cipta 2026, Tim SATORU.

<div align="center">

**FABRIX AI by SATORU | Foto. Deteksi. Panduan. Dokumentasikan.**

</div>
