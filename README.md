# HijauLokal

Platform e-katalog UMKM hijau berbasis web yang menampilkan produk ramah lingkungan, autentikasi pengguna Firebase, keranjang belanja berbasis localStorage, serta halaman informatif (kategori, promo, dan tentang kami).

## Ringkasan Teknologi
- Node.js + Express untuk web server.
- HTML + TailwindCSS CDN untuk antarmuka.
- Vanilla JavaScript untuk interaksi frontend.
- Firebase Authentication (Email/Password + Google Sign-In).

## Fitur Utama
- Landing page modern dan responsif.
- Katalog produk dengan data dari JSON lokal.
- Keranjang belanja interaktif dengan localStorage.
- Simulasi ongkir berdasarkan kota dan total berat belanja.
- Halaman kategori dengan filter kategori dan pencarian produk.
- Halaman promo dengan harga diskon dinamis, statistik promo, dan countdown.
- Halaman tentang kami berisi profil, misi, visi, nilai, dan dampak.
- Login dan registrasi dengan Firebase Auth.
- Proteksi halaman dashboard berdasarkan status login.
- Navbar mobile bawah dengan indikator aktif animasi saat pindah halaman.

## Daftar Halaman
- `views/index.html`: Beranda.
- `views/dashboard.html`: Katalog utama + keranjang.
- `views/category.html`: Kategori dan filter produk.
- `views/promo.html`: Daftar promo.
- `views/about.html`: Profil platform.
- `views/login.html`: Login/register Firebase.

## Fitur Per Halaman
1. Beranda (`index.html`)
- Hero section brand.
- Value proposition utama.
- Ringkasan koleksi dan deep-link ke kategori.
- Navbar desktop dan navbar mobile.

2. Dashboard (`dashboard.html`)
- Grid produk dinamis dari `products.json`.
- Tombol tambah ke keranjang.
- Drawer keranjang dengan update qty, hapus item, subtotal, ongkir, total.
- Simulasi ongkir berdasarkan kota (`jakarta`, `bandung`, `surabaya`, `medan`, `makassar`).
- Auth guard: redirect ke login bila belum login.

3. Kategori (`category.html`)
- Filter tab kategori (`all`, `fashion`, `home`, `beauty`).
- Pencarian berdasarkan nama/description.
- Support query param (`?category=fashion`).
- Ringkasan jumlah produk per kategori.

4. Promo (`promo.html`)
- Perhitungan harga promo dinamis berdasarkan kategori produk.
- Statistik promo (jumlah item, diskon tertinggi, total hemat, kategori aktif).
- Countdown promo mingguan.

5. Tentang (`about.html`)
- Misi, visi, nilai utama.
- Metrik dampak.
- CTA kolaborasi.

6. Login (`login.html`)
- Login email/password.
- Registrasi akun baru.
- Login dengan Google popup.
- Mapping error auth agar user-friendly.

## Arsitektur Singkat
- Server melayani semua file statis dari folder `views`.
- Data produk saat ini bersumber dari `views/data/products.json`.
- Konfigurasi Firebase web diambil frontend melalui endpoint server `GET /api/public-config`.
- Status keranjang disimpan di browser (`localStorage`).

## Endpoint Server
- `GET /`: halaman beranda.
- `GET /api/health`: health check server.
- `GET /api/public-config`: expose Firebase web config dari environment variable.

## Keamanan dan Hardening yang Sudah Aktif
- `helmet` untuk header keamanan HTTP.
- `compression` untuk kompresi response.
- `cors` dengan origin dari environment.
- `express-rate-limit` pada prefix `/api`.
- `morgan` untuk request logging.
- `dotenv` untuk manajemen environment.

## Persyaratan
- Node.js `>= 18`.
- npm.

## Menjalankan Proyek (Local)
1. Install dependency.

```bash
npm install
```

2. Buat file environment dari template.

```bash
cp .env.example .env
```

3. Isi nilai Firebase di `.env`.
- `FIREBASE_API_KEY`
- `FIREBASE_AUTH_DOMAIN`
- `FIREBASE_PROJECT_ID`
- `FIREBASE_APP_ID`

4. Jalankan mode development.

```bash
npm run dev
```

5. Buka aplikasi.

```text
http://localhost:3000
```

## Scripts
- `npm run dev`: menjalankan server watch mode + auto-clean port 3000.
- `npm start`: menjalankan server production mode.

## Konfigurasi Environment
Lihat file `.env.example`:

```env
NODE_ENV=development
HOST=0.0.0.0
PORT=3000
ALLOWED_ORIGIN=*

FIREBASE_API_KEY=your_firebase_api_key
FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_APP_ID=1:1234567890:web:your_app_id
```

Catatan: Firebase Web config bukan secret backend murni, namun tetap disimpan di env agar tidak hardcoded di source code.

## Struktur Folder
```text
our-fp-gr4/
  server.js
  package.json
  .env.example
  views/
    index.html
    dashboard.html
    category.html
    promo.html
    about.html
    login.html
    data/
      products.json
    js/
      app.js
      firebase-auth.js
      firebase-config.js
      mobile-nav.js
```

## Checklist Deploy Production
1. Set `NODE_ENV=production`.
2. Isi `ALLOWED_ORIGIN` dengan domain frontend valid.
3. Pastikan `.env` tidak di-commit.
4. Jalankan dengan process manager (PM2/systemd/container runtime).
5. Gunakan reverse proxy + HTTPS (Nginx/Caddy/Cloud load balancer).
6. Pantau endpoint `GET /api/health`.

## Catatan Pengembangan Lanjutan
- Migrasi data produk dari JSON ke database/API backend.
- Integrasi checkout dan pembayaran nyata.
- Integrasi ongkir real API (RajaOngkir atau provider lain).
- Penambahan test otomatis frontend dan backend.
