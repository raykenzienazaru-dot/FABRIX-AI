<div align="center">

# FABRIX AI

### Pahami kain sebelum diproduksi.

[![GitHub](https://img.shields.io/badge/GitHub-Repository-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/raykenzienazaru-dot/FABRIX-AI)
[![Lisensi](https://img.shields.io/badge/Lisensi-MIT-235347?style=for-the-badge)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-16.3.4-051F20?style=for-the-badge&logo=next.js&logoColor=white)](frontend/package.json)
[![Status](https://img.shields.io/badge/Status-Prototipe_Integrasi-8EB69B?style=for-the-badge)](#status-implementasi-dan-batasan)

**Submission for ITECHNO CUP 2026 — Web Development**

**Tim SATORU**

[Website / Live ](https://fabrixai.vercel.app/) · [Google Drive](https://drive.google.com/drive/folders/13XIek5RmP-ADojPY14Cdhyjwmx3TGCpd)

</div>

---

FABRIX AI membantu UMKM, konveksi, dan pelaku tekstil memeriksa foto kain sebelum pemotongan. Pengguna dapat mengambil foto atau memilih gambar dari galeri, melihat lokasi cacat, membaca prediksi kualitas, mencari area potong yang menghindari deteksi cacat, serta menyimpan dan mengunduh hasil pemeriksaan.

Dokumentasi ini disesuaikan dengan kode lokal branch `frontend`, `backend`, dan `ai`, serta berkas dokumentasi yang tersedia pada **7 September 2026**. Seluruh screenshot, diagram, dan PDF ditautkan sebagai file, tanpa ditampilkan langsung di README.

## Daftar Isi

- [Tim Pengembang](#tim-pengembang)
- [Tentang Proyek](#tentang-proyek)
- [Fitur dan Cara Penggunaannya](#fitur-dan-cara-penggunaannya)
- [Alur Penggunaan dan Dokumentasi UI](#alur-penggunaan-dan-dokumentasi-ui)
- [Dokumentasi PDF Hasil Analisis AI](#dokumentasi-pdf-hasil-analisis-ai)
- [Logo dan Diagram Flow](#logo-dan-diagram-flow)
- [Arsitektur dan Alur Data](#arsitektur-dan-alur-data)
- [Teknologi dan Struktur Folder](#teknologi-dan-struktur-folder)
- [Instalasi dan Konfigurasi](#instalasi-dan-konfigurasi)
- [Dokumentasi API](#dokumentasi-api)
- [Status Implementasi dan Batasan](#status-implementasi-dan-batasan)
- [Verifikasi](#verifikasi)
- [Lisensi](#lisensi)

## Tim Pengembang

| Nama | Peran | GitHub |
| --- | --- | --- |
| Evelly Khanzania Putri | Pengembang AI | [Vkzapple](https://github.com/Vkzapple) |
| Dhiyaa Fazila Nugraha | Pengembang Full-Stack | [fzlngh](https://github.com/fzlngh) |
| Raykenzie Nazaru Fathurrahmansyah | Asisten Riset dan Pengembangan | [raykenzienazaru-dot](https://github.com/raykenzienazaru-dot) |

## Tentang Proyek

Pemeriksaan visual membantu menemukan lubang, noda, dan kerusakan lain sebelum kain dipotong. Bagi usaha kecil, hasil pemeriksaan juga perlu mudah dicatat, dibuka kembali, dan dibandingkan agar keputusan tidak hanya bergantung pada ingatan operator.

FABRIX AI menggabungkan deteksi visual YOLO melalui Roboflow, prediksi kategori kualitas dengan XGBoost, dan dokumentasi pemeriksaan dalam satu aplikasi web. Panduan area potong memanfaatkan posisi cacat yang terdeteksi untuk membantu pengguna memilih bagian kain yang masih dapat digunakan.

Target utamanya adalah UMKM tekstil, konveksi, penjahit, dan tim pemeriksaan material. Arah dampak yang ditampilkan pada website adalah **SDG 8**, melalui dukungan bagi kegiatan usaha UMKM, dan **SDG 9**, melalui pemanfaatan teknologi pemeriksaan berbasis web. Dampak tersebut merupakan tujuan proyek; belum disertai pengukuran penghematan kain atau peningkatan produktivitas.

Hasil aplikasi merupakan pendukung pemeriksaan operator, bukan pengganti pengujian laboratorium, sertifikasi, atau jaminan bahwa kain bebas cacat.

## Fitur dan Cara Penggunaannya

### 1. Beranda, navigasi, dan pengenalan produk

Halaman `/` memperkenalkan manfaat FABRIX AI, tahapan penggunaan, fitur AI, serta dampak bagi UMKM. Navbar menyediakan akses ke bagian Beranda, Cara Kerja, Fitur, dan Dampak. Tombol mulai mengarahkan pengguna sesuai alur akun/sesi yang diterapkan pada antarmuka.

Footer menyediakan tautan cepat ke bagian website, registrasi, dan situs kontak sekolah. Tautan kebijakan privasi, syarat, dan cookie sudah terlihat di footer, tetapi halaman tujuannya belum ada dalam kode lokal.

### 2. Registrasi, login, dan profil usaha

Melalui `/register`, pengguna mengisi nama lengkap, nama usaha/organisasi, bidang usaha opsional, email, kata sandi, dan konfirmasi kata sandi. Autentikasi ditangani Supabase Auth. Jika konfirmasi email diaktifkan, pengguna perlu membuka email konfirmasi sebelum login.

Halaman `/login` menerima email dan kata sandi. Sesi pengguna dipantau agar ruang kerja dapat digunakan setelah masuk; pengguna tanpa sesi diarahkan ke login. Menu keluar mengakhiri sesi.

Pada `/settings`, pengguna dapat memperbarui nama usaha, penanggung jawab, dan bidang usaha. Email akun ditampilkan sebagai informasi yang tidak dapat diubah dari formulir ini.

### 3. Scan kain melalui kamera atau galeri

Di `/scan`, pengguna dapat menyalakan kamera atau memilih foto dari galeri. Kamera memprioritaskan kamera belakang jika tersedia. Pengguna meninjau foto, mengambil ulang bila perlu, lalu menjalankan analisis tanpa mengisi parameter teknis kain.

Backend menerima JPEG, PNG, atau WebP dengan batas 8 MB. Antarmuka menyediakan status pemrosesan dan pesan kesalahan. Indikator langkah pada layar merupakan petunjuk proses, bukan persentase progres langsung dari model.

### 4. Deteksi cacat dan detail hasil AI

Backend meneruskan gambar ke workflow Roboflow. Hasil deteksi memuat kelas, confidence, serta koordinat dan ukuran bounding box. Kelas mengikuti keluaran workflow; contoh dokumentasi memuat `hole` dan `seam`.

Halaman `/analysis/[id]` menampilkan foto dengan kotak dan label deteksi, jumlah defect, prediksi kualitas jika tersedia, daftar cacat, tanggal, dan rekomendasi. Kotak pada foto digambar oleh komponen frontend berdasarkan koordinat hasil Roboflow; model deteksinya tetap berjalan di layanan eksternal.

Hasil scan berhasil langsung disimpan oleh backend. Tombol **Simpan Analisis** di halaman detail memperbarui nama kain pada hasil yang sudah tersimpan, bukan menjalankan model lagi. Nama awalnya adalah **Kain tanpa nama**.

### 5. Prediksi kualitas XGBoost

Setelah deteksi, backend menghitung jumlah defect dan mengirimnya ke layanan Python melalui `POST /predict-quality`. Layanan mengembalikan kategori kualitas dan confidence. Keduanya ditampilkan bila tersedia; jika layanan kualitas belum dikonfigurasi atau gagal, scan dapat tetap selesai dengan hasil YOLO saja.

Model memakai daftar fitur training, tetapi hanya jumlah defect yang berasal dari scan pada endpoint saat ini. Fitur lain diisi nilai default. Karena itu, prediksi kualitas adalah insight pendukung, bukan pengukuran lengkap sifat fisik kain. Confidence sebuah prediksi juga berbeda dari akurasi model pada dataset pengujian.

### 6. Rekomendasi tindak lanjut

Hasil menyertakan saran pemeriksaan area yang terdeteksi, perawatan, dan pemindaian ulang setelah perbaikan. Teks rekomendasi dibentuk oleh aturan di backend berdasarkan deteksi.

Field bernama `alternative_composition` pada contoh hasil berisi anjuran memperbaiki dan memindai ulang kain. Field tersebut belum merupakan simulasi atau rekomendasi persentase komposisi serat.

### 7. Panduan Area Potong Aman

Halaman `/optimizer` sekarang digunakan untuk panduan potong. Pengguna memilih hasil scan tersimpan, lalu aplikasi memetakan area foto menjadi grid **12 × 9**, menandai sel yang bertumpang tindih dengan bounding box cacat, dan menambahkan jarak penyangga sebesar 15% dari ukuran box pada tiap sisi.

Sistem mencari blok persegi panjang terbesar dari sel yang tidak tertandai cacat. Tampilan menyediakan:

- Area hijau: sel yang tidak bertumpang tindih dengan deteksi dan penyangganya.
- Area merah: bagian yang perlu dihindari.
- Garis biru putus-putus: blok potong tunggal terbesar.
- Persentase total sel bebas deteksi dan persentase blok terbesar terhadap grid foto.

Perhitungan dilakukan dari hasil tersimpan tanpa inference baru. Persentase ini adalah perkiraan berbasis grid foto, bukan ukuran kain dalam sentimeter, tata letak pola pakaian lengkap, atau jaminan tidak ada cacat yang terlewat model.

### 8. Dashboard, grafik, dan tren kualitas

Halaman `/dashboard` menampilkan total analisis, jumlah analisis tujuh hari terakhir, jumlah nama kain unik, serta tiga analisis terbaru. Metrik **Kain tersimpan** dihitung dari nama kain unik, sehingga beberapa hasil dengan nama yang sama dihitung sebagai satu nama.

Grafik menampilkan jumlah defect dari maksimal **10 scan terakhir**, dengan garis rata-rata. Grafik membutuhkan setidaknya dua hasil. Ringkasan tren membutuhkan minimal tiga scan dan dihitung oleh backend dari seluruh riwayat pengguna: rata-rata defect pada paruh awal dibandingkan dengan paruh akhir.

Tren diberi label membaik, menurun, atau stabil; defect yang bertambah berarti kualitas dinilai cenderung menurun. Dashboard juga menampilkan jenis defect yang paling sering muncul dan proporsinya. Ini adalah ringkasan berbasis aturan dan data historis, bukan model prediksi masa depan.

### 9. Riwayat, perbandingan, dan paspor kain

| Fitur | Cara kerja |
| --- | --- |
| Riwayat Scan — `/history` | Memuat hasil milik pengguna dari yang terbaru, menyediakan pencarian nama kain, serta akses ke detail, paspor, dan PDF. |
| Perbandingan — `/comparison` | Memilih 2–3 analisis tersimpan. Hasil perbandingan saat ini menampilkan foto, nama kain, dan label karakteristik deteksi pertama; tidak menetapkan kain terbaik secara otomatis. |
| Pustaka Paspor — `/passport` | Menyediakan akses ke koleksi hasil tersimpan dan ekspor PDF. |
| Detail Paspor — `/passport/[id]` | Membuka identitas dan hasil analisis dari record yang sama, tanpa menduplikasi data atau melakukan scan ulang. |

### 10. Ekspor laporan PDF

Tombol **Unduh PDF** menghasilkan laporan menggunakan jsPDF dari analisis yang sudah tersimpan. Laporan mencakup identitas, tanggal, sumber hasil, foto, jumlah defect, prediksi kualitas/confidence jika tersedia, detail tiap deteksi, dan rekomendasi.

Komposisi, struktur, dan kondisi pencucian hanya dimasukkan jika datanya tersedia. Ekspor memakai foto dari `image_url` dan mencatat koordinat deteksi sebagai teks; overlay kotak pada UI tidak otomatis dirender ke PDF.

Nama berkas mengikuti pola `FABRIX_AI_[NamaKain]_[IDPendek].pdf`. Ekspor tidak memanggil model kembali.

## Alur Penggunaan dan Dokumentasi UI

Alur utama: **kenali produk → daftar/masuk → dashboard → foto atau galeri → analisis → tinjau hasil dan rekomendasi → panduan potong/perbandingan/paspor/PDF → pantau riwayat**.

Tabel berikut mencakup seluruh 12 gambar di folder [UI Gambar](UI%20Gambar/), diurutkan menurut perjalanan pengguna. Klik nama file untuk membukanya.

| Tahap | File dokumentasi | Penjelasan dalam alur |
| --- | --- | --- |
| 1. Mengenal produk | [Beranda.png](UI%20Gambar/Beranda.png) | Halaman pembuka dengan pesan deteksi cacat sebelum pemotongan, navigasi, dan tombol mulai. Ilustrasi deteksi pada hero adalah pengenalan produk. |
| 2. Memahami langkah | [Cara Kerja FABRIX AI.png](UI%20Gambar/Cara%20Kerja%20FABRIX%20AI.png) | Menjelaskan empat langkah: foto kain, deteksi cacat, panduan potong, serta simpan dan pantau. |
| 3. Mengenal kemampuan | [Fitur Utama.png](UI%20Gambar/Fitur%20Utama.png) | Kartu pengenalan YOLO, severity score, panduan potong, XGBoost, paspor, dan tren. Integrasi severity score memiliki batasan yang dijelaskan pada bagian status implementasi. |
| 4. Memahami manfaat | [Dampak Sosial.png](UI%20Gambar/Dampak%20Sosial.png) | Menampilkan arah pemberdayaan UMKM dan inovasi digital melalui SDG 8 dan SDG 9, sebelum ajakan membuat akun. |
| 5. Navigasi lanjutan | [Footer Interaktif.png](UI%20Gambar/Footer%20Interaktif.png) | Tautan cepat, identitas tim, kontak, dan ajakan mulai. Ini dokumentasi footer, bukan bukti bahwa semua halaman kebijakan sudah tersedia. |
| 6. Membuat akun | [Regis.png](UI%20Gambar/Regis.png) | Formulir profil usaha, email, kata sandi dan konfirmasi, disertai petunjuk memeriksa email konfirmasi. |
| 7. Masuk ruang kerja | [Login.png](UI%20Gambar/Login.png) | Formulir masuk bagi pengguna yang sudah terdaftar, dengan tautan ke registrasi. |
| 8. Memantau pemeriksaan | [Ringkasan Grafik Analisis.png](UI%20Gambar/Ringkasan%20Grafik%20Analisis.png) | Ringkasan dashboard, grafik defect per scan, garis rata-rata, status tren, dan distribusi jenis defect. Angka pada screenshot adalah data saat dokumentasi diambil. |
| 9. Meninjau hasil scan | [Fitur AI.png](UI%20Gambar/Fitur%20AI.png) | Foto ber-overlay, nama kain, dua deteksi, kategori kualitas `High`, serta confidence model 95% pada contoh. Pengguna dapat mengganti nama dan melanjutkan tindakan. |
| 10. Membaca saran | [Rekomendasi.png](UI%20Gambar/Rekomendasi.png) | Bagian lanjutan detail hasil: kelas/confidence deteksi, saran perawatan, pemeriksaan material, dan scan ulang setelah perbaikan. |
| 11. Menentukan area potong | [Analisis Lainnya.png](UI%20Gambar/Analisis%20Lainnya.png) | Dokumentasi **Panduan Area Potong Aman**: pemilihan hasil acuan, grid area cacat, dan blok terbesar yang disarankan. |
| 12. Membuka hasil sebelumnya | [History Analisis sebelumnya.png](UI%20Gambar/History%20Analisis%20sebelumnya.png) | Screenshot bagian **Analisis Terbaru** pada dashboard, dengan kartu foto, hasil ringkas, tombol Lihat Hasil/Paspor, dan Lihat semua menuju riwayat. |

Folder ini belum memuat screenshot terpisah untuk layar pengambilan foto, halaman perbandingan, detail paspor, dan pengaturan. Fitur-fitur tersebut dijelaskan berdasarkan kode yang tersedia, bukan diasumsikan ada di gambar.

## Dokumentasi PDF Hasil Analisis AI

[Buka PDF dokumentasi hasil analisis AI — FABRIX_AI_Kain_tanpa_nama_f3c299d4.pdf](UI%20Gambar/FABRIX_AI_Kain_tanpa_nama_f3c299d4.pdf)

PDF dua halaman ini merupakan **contoh keluaran laporan detail AI**, melanjutkan tahap hasil scan dan rekomendasi pada dokumentasi UI. Pengguna membuka hasil tersimpan, memilih **Unduh PDF**, lalu memperoleh laporan yang dapat dibaca atau dibagikan.

| Informasi pada contoh PDF | Isi |
| --- | --- |
| Nama kain | Kain tanpa nama |
| ID analisis | `f3c299d4-7f98-422e-8911-dd2ef6e6ce8a` |
| Waktu analisis | 7 September 2026, 00.18.30 sebagaimana tercatat pada laporan |
| Sumber hasil | Layanan AI |
| Jumlah defect | 2 |
| Prediksi kualitas | `High` |
| Keyakinan prediksi kualitas | 95% |
| Deteksi pertama | `hole`, confidence 0,76 / 76%, pusat box (546,5; 208,5), ukuran 67 × 49 |
| Deteksi kedua | `seam`, confidence 0,40 / 40%, pusat box (141; 189), ukuran 276 × 372 |

Halaman pertama memuat informasi analisis, foto, ringkasan kualitas, dan awal detail deteksi. Halaman kedua melanjutkan informasi confidence/ID deteksi, deteksi kedua, rekomendasi perawatan dan pemeriksaan, serta waktu pembuatan laporan.

Koordinat dan ukuran box mengikuti satuan piksel gambar acuan model. **95% adalah confidence prediksi kualitas pada contoh tersebut, bukan akurasi keseluruhan FABRIX AI.** Confidence 76% dan 40% merujuk pada dua deteksi visual yang berbeda. PDF ini tidak memuat hasil pengukuran komposisi serat, indeks mikroplastik, atau kekuatan tarik.

## Logo dan Diagram Flow

Aset di folder [gambar](gambar/) juga disediakan sebagai link file saja.

| File | Isi dan fungsi dokumentasi |
| --- | --- |
| [LOGO.png](gambar/LOGO.png) | Identitas visual FABRIX AI untuk dokumentasi proyek. Salinan logo yang digunakan aplikasi tersedia di folder public frontend. |
| [USER.drawio.png](gambar/USER.drawio.png) | Arsip rancangan perjalanan pengguna: login, dashboard, input kain, hasil analisis, pilihan tindakan, dan riwayat. Memuat beberapa fitur konsep lama. |
| [FLOWW.drawio.png](gambar/FLOWW.drawio.png) | Arsip arsitektur konsep lengkap: EfficientNet-B0, input komposisi/perawatan, late fusion, XGBoost Regressor, analisis mikroplastik/daya tahan, dan pilihan tindakan. |
| [FLOWWPRESENTASI.drawio.png](gambar/FLOWWPRESENTASI.drawio.png) | Versi ringkas konsep lama untuk presentasi, dari input visual/tabular sampai rekomendasi sebelum produksi. |

Diagram tersebut menggambarkan rancangan awal, sehingga perlu dibaca bersama implementasi saat ini. Alur aktif memakai **foto/galeri → YOLO Roboflow → jumlah defect → XGBoost classifier opsional → hasil tersimpan**, dilanjutkan panduan potong, perbandingan, paspor, PDF, dan tren.

EfficientNet-B0, late fusion, dan prediksi mikroplastik berbasis model pada diagram belum ditemukan dalam alur aktif kode ini. Route `/optimizer` sekarang berisi panduan area potong, bukan formulir What-If komposisi/perawatan. Untuk melihat alur antarmuka terkini, gunakan urutan dokumentasi pada bagian [Alur Penggunaan dan Dokumentasi UI](#alur-penggunaan-dan-dokumentasi-ui).

## Arsitektur dan Alur Data

| Tahap | Komponen dan proses |
| --- | --- |
| 1. Autentikasi | Frontend memperoleh sesi Supabase Auth. Request API membawa Bearer token yang diverifikasi backend. |
| 2. Input gambar | Kamera/galeri menyediakan file; frontend mengirim `multipart/form-data` ke `POST /api/scan`. |
| 3. Penyimpanan foto | Backend mengunggah foto asli ke bucket `fabric-images` di bawah path pengguna. |
| 4. Deteksi visual | [Adapter YOLO](backend/services/yoloService.js) mengirim base64 gambar ke Roboflow dan menormalkan deteksi serta metadata gambar. |
| 5. Kualitas | [Route scan](backend/routes/scan.js) mengirim jumlah defect ke [layanan XGBoost](ai_service.py) jika dikonfigurasi. Kegagalan layanan kualitas menghasilkan field kualitas kosong, tanpa harus menggagalkan deteksi YOLO. |
| 6. Penyimpanan hasil | Backend menyimpan deteksi, jumlah defect, kualitas, confidence, rekomendasi, dan hasil adapter ke tabel `fabric_analyses`. |
| 7. Penyajian dan penggunaan ulang | Frontend menggambar overlay dari koordinat deteksi. Detail, riwayat, paspor, perbandingan, panduan potong, dan PDF memakai data tersimpan; tren dihitung backend dari histori pengguna. |

Data utama terdiri dari profil pada `company_profiles`, hasil pada `fabric_analyses`, dan foto di Supabase Storage. Paspor merujuk record analisis yang sama. Relasi `parent_analysis_id` disediakan untuk hasil skenario What-If pada API.

Schema dasar tersedia di [backend/schema.sql](https://github.com/raykenzienazaru-dot/FABRIX-AI/blob/backend/schema.sql). Schema lokal masih memuat kolom indeks lama dan belum mendefinisikan `jumlah_defect`, `predicted_quality`, dan `prediction_confidence` yang dipakai route terbaru; langkah penyesuaian database dijelaskan di bawah.

## Teknologi dan Struktur Folder

| Lapisan | Teknologi | Sumber konfigurasi |
| --- | --- | --- |
| Antarmuka | Next.js, React, TypeScript, Tailwind CSS | [package.json frontend](frontend/package.json) |
| Grafik dan interaksi | Recharts, Framer Motion, Lucide React | [Komponen dan halaman](frontend/) |
| Ekspor PDF | jsPDF | [reportPdf.ts](frontend/lib/reportPdf.ts) |
| API | Node.js, Express, Multer, Helmet, CORS, node-fetch | [package.json backend](https://github.com/raykenzienazaru-dot/FABRIX-AI/blob/backend/backend/package.json) |
| Auth, database, foto | Supabase Auth, PostgreSQL, Storage | [Schema SQL](https://github.com/raykenzienazaru-dot/FABRIX-AI/blob/backend/schema.sql) |
| Deteksi visual | YOLO melalui workflow Roboflow | [yoloService.js](backend/services/yoloService.js) |
| Prediksi kualitas | Python, FastAPI, XGBoost, joblib | [requirements.txt AI](requirements.txt) |
| Deployment frontend | Vercel | [FABRIX AI](https://fabrixai.vercel.app/) |

Pada branch `main`, source frontend berada di `frontend/`, file layanan AI berada di root repository, dan sebagian file backend berada di `backend/`. README, lisensi, dan kedua folder dokumentasi juga berada di root. File backend lengkap, termasuk server, middleware, package, dan schema, masih tersedia pada branch `backend`; tautan ke file tersebut mengarah ke branch asalnya.

Struktur berikut adalah **workspace pengembangan dengan checkout branch terpisah**, yang digunakan oleh langkah instalasi di bawah:

```text
PNJ3/
├── README.MD
├── LICENSE
├── UI Gambar/                 # 12 screenshot dan 1 PDF hasil analisis
├── gambar/                    # Logo dan 3 diagram rancangan
├── frontend/                  # Checkout branch frontend
│   └── frontend/              # Root aplikasi Next.js
│       ├── app/               # Route halaman
│       ├── components/        # Kamera, overlay, navigasi, detail
│       ├── lib/               # API, sesi, ekspor PDF
│       ├── public/            # Logo aplikasi
│       └── types/             # Bentuk data analisis dan profil
├── backend/                   # Checkout branch backend
│   ├── schema.sql
│   └── backend/               # Root server Express
│       ├── middleware/
│       ├── routes/
│       └── services/
└── ai/                        # Checkout branch ai
    ├── ai_service.py          # Endpoint kualitas dan insights
    ├── fabric_quality_model.json
    ├── feature_cols.pkl       # Urutan fitur model
    ├── target_encoder.pkl     # Label kategori keluaran
    ├── label_encoders.pkl     # Artefak encoder tambahan
    ├── severity_score.py      # Modul severity terpisah
    ├── insights.json          # Metadata/insight training sementara
    └── requirements.txt
```

Langkah instalasi memakai branch `frontend`, `backend`, dan `ai` agar memperoleh source lengkap masing-masing layanan. Path perintah terminal mengikuti susunan workspace di atas, sedangkan tautan file dalam README mengikuti lokasi file di GitHub. Checkout `main` saat ini belum memuat seluruh file yang dibutuhkan untuk menjalankan server backend.

## Instalasi dan Konfigurasi

### Menyiapkan source dan layanan

Diperlukan Git, Node.js/npm, Python yang kompatibel dengan [requirements AI](requirements.txt), proyek Supabase, dan workflow Roboflow. Untuk menyiapkan folder source pada workspace kosong, clone masing-masing branch:

```bash
git clone --branch frontend --single-branch https://github.com/raykenzienazaru-dot/FABRIX-AI.git frontend
git clone --branch backend --single-branch https://github.com/raykenzienazaru-dot/FABRIX-AI.git backend
git clone --branch ai --single-branch https://github.com/raykenzienazaru-dot/FABRIX-AI.git ai
```

Perintah ini untuk checkout baru; jika foldernya sudah tersedia, gunakan source yang ada.

### Database Supabase

Jalankan [schema dasar](https://github.com/raykenzienazaru-dot/FABRIX-AI/blob/backend/schema.sql) di SQL Editor untuk membuat tabel, RLS, bucket foto, dan trigger profil. Database yang hanya memakai schema dasar tersebut juga memerlukan kolom yang ditulis oleh backend terbaru:

```sql
alter table public.fabric_analyses
  add column if not exists jumlah_defect integer,
  add column if not exists predicted_quality text,
  add column if not exists prediction_confidence numeric;
```

Ini merupakan instruksi setup; README tidak menyatakan bahwa migrasi tersebut sudah diterapkan pada setiap database deployment.

### Environment

Buat konfigurasi di root masing-masing aplikasi. Contoh frontend tersedia di [.env.example frontend](frontend/.env.example); contoh backend di [.env.example backend](backend/.env.example).

`frontend/frontend/.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=isi_anon_key
NEXT_PUBLIC_API_URL=http://localhost:4000
```

`backend/backend/.env`:

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

Adapter saat ini membaca `ROBOFLOW_WORKFLOW_URL` langsung. Contoh environment backend masih memiliki beberapa nama variabel lama; variabel tersebut tidak menggantikan URL workflow ini. Gunakan nilai boolean `false` atau `true` untuk mock, bukan teks `false/true`.

Simpan service-role key dan Roboflow API key hanya di backend. Pada deployment, sesuaikan origin, URL API, dan URL layanan AI dengan lokasi layanan masing-masing. Kamera membutuhkan HTTPS atau localhost. Atur juga URL situs/redirect Supabase Auth untuk konfirmasi email.

### Menjalankan aplikasi

Buka terminal terpisah, dengan direktori awal di root workspace.

Layanan AI:

```powershell
cd ai
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

Buka [frontend lokal](http://localhost:3000), periksa [health backend](http://localhost:4000/health), dan [status layanan AI](http://127.0.0.1:8000/). File environment lama yang berada di `frontend/.env` perlu ditempatkan pada root aplikasi yang benar agar terbaca saat menjalankan Next.js.

## Dokumentasi API

Base URL backend lokal adalah `http://localhost:4000`. Seluruh endpoint `/api/*` di bawah membutuhkan `Authorization: Bearer <supabase_access_token>`.

| Method | Endpoint | Fungsi |
| --- | --- | --- |
| GET | `/health` | Status backend; tanpa autentikasi. |
| GET | `/api/auth/me` | User aktif dan profil usaha. |
| POST | `/api/auth/company-profile` | Membuat atau memperbarui nama usaha, bidang usaha, dan penanggung jawab. |
| POST | `/api/scan` | Upload foto, deteksi, prediksi kualitas opsional, dan simpan hasil. |
| GET | `/api/scan/history` | Seluruh hasil milik pengguna, terbaru lebih dahulu. |
| GET | `/api/scan/insights/trend` | Ringkasan tren dan distribusi defect dari riwayat; minimal tiga scan untuk tren. |
| GET | `/api/scan/:id` | Detail hasil milik pengguna. |
| PATCH | `/api/scan/:id` | Memperbarui `fabric_name`, 1–120 karakter setelah dirapikan. |
| POST | `/api/scan/compare` | Membaca hasil berdasarkan 2–3 ID unik melalui body `{ "ids": ["id-1", "id-2"] }`. |
| POST | `/api/scan/:id/whatif` | Menjalankan inference ulang pada gambar tersimpan dan membuat record skenario; belum dipakai halaman panduan potong. |

Input scan berupa `multipart/form-data`: field `image` wajib; `fabric_name`, `composition`, `structure`, dan `washing_condition` opsional. UI scan saat ini mengirim foto dan nama awal saja. Respons sukses berisi `{ "analysis": ... }` dengan status 201.

Layanan Python terpisah menyediakan `GET /` untuk status, `POST /predict-quality` dengan body `{ "jumlah_defect": 2 }`, dan `GET /insights` untuk membaca file insights. Route Python tersebut belum menerapkan autentikasi pada kode lokal.

## Status Implementasi dan Batasan

Fitur yang telah memiliki implementasi meliputi akun/profil, kamera dan galeri, deteksi Roboflow, prediksi kualitas opsional, hasil dan rekomendasi, penamaan, riwayat/pencarian, dashboard/tren, panduan potong, perbandingan, paspor, serta PDF. Ketersediaan saat dijalankan tetap bergantung pada konfigurasi backend, Supabase, dan layanan AI.

Hal-hal berikut membedakan fitur aktif dari materi konsep atau komponen yang belum terintegrasi:

| Komponen | Status pada kode yang diperiksa |
| --- | --- |
| Severity score | [severity_score.py](severity_score.py) menghitung jumlah deteksi lolos confidence, rasio luas box, breakdown, dan kategori awal Layak Produksi/Perlu Dicek Ulang/Reject. Belum dipanggil oleh route scan atau layanan FastAPI; kartu di landing page bukan bukti integrasi alur ini. |
| What-If material | Endpoint tersedia, tetapi adapter hanya meneruskan gambar ke Roboflow; parameter material disimpan dalam data hasil. Belum ada simulasi pengaruh komposisi/perawatan yang tervalidasi, dan `/optimizer` berfungsi sebagai panduan potong. |
| Mikroplastik dan daya tahan | Adapter masih menghitung indeks heuristik dari deteksi dalam data hasil internal. Nilai tersebut bukan pengukuran laboratorium atau keluaran model prediksi mikroplastik yang tervalidasi, dan bukan metrik utama UI/PDF terbaru. |
| Insight training | [insights.json](insights.json) masih memiliki nilai 0 dan teks placeholder. Tidak digunakan sebagai bukti akurasi atau feature importance model. |
| Halaman kebijakan | Tautan `/privacy`, `/terms`, dan `/cookies` terdapat di footer, tetapi route halamannya belum tersedia. |
| Pengujian dan deployment | URL frontend tersedia. Tidak ada bukti pengujian ulang menyeluruh atau pengukuran performa produksi yang dibuat dalam pembaruan dokumentasi ini. |

Mode mock tersedia pada adapter dan default kode saat variabel tidak diisi adalah aktif. Set `ALLOW_MOCK_INFERENCE=false` agar kegagalan Roboflow tidak beralih ke data demo. Hasil mock diberi sumber `mock` dan label demo pada detail/PDF.

Backend memverifikasi sesi dan membatasi query analisis berdasarkan `user_id`; schema menyediakan RLS. Namun bucket foto pada schema bersifat public, sehingga akses foto melalui URL tidak setara dengan pembatasan record database. Penyimpanan foto sensitif memerlukan kebijakan akses yang sesuai.

## Verifikasi

README ini dicocokkan melalui pemeriksaan kode, pembacaan seluruh gambar dokumentasi, dan isi PDF. Screenshot serta PDF adalah contoh hasil yang didokumentasikan, bukan laporan akurasi model atau jaminan bahwa semua layanan deployment selalu tersedia.

Untuk pemeriksaan lokal, setelah dependency dipasang:

```powershell
cd frontend/frontend
npx tsc --noEmit
npm run build
```

```powershell
cd backend/backend
node --check server.js
node --check routes/scan.js
node --check routes/auth.js
node --check services/yoloService.js
```

Script `typecheck` dan test suite otomatis belum didefinisikan pada package frontend. Script `lint` masih menunjuk `next lint`; konfigurasi lint perlu diselaraskan dengan versi Next.js yang dipakai sebelum dijadikan pemeriksaan CI. Perintah di atas adalah panduan, bukan klaim hasil pengujian yang sudah lulus.

Alur pemeriksaan manual yang relevan: daftar dan konfirmasi email → login → foto/galeri → hasil deteksi dan kualitas → ganti nama → buka riwayat → bandingkan 2–3 hasil → panduan potong → paspor → unduh PDF → periksa tren setelah minimal tiga scan → logout.

## Lisensi

Proyek menggunakan [MIT License](LICENSE), © 2026 SATORU.

**FABRIX AI — Foto. Deteksi. Panduan. Dokumentasikan.**
