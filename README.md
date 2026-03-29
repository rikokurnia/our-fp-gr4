# 🌿 HijauLokal - E-Katalog Digital UMKM Hijau

Website katalog digital interaktif yang didedikasikan untuk UMKM lokal yang memproduksi barang-barang ramah lingkungan. Proyek ini ditujukan untuk memenuhi **Final Project (SDG 8: Decent Work & Economic Growth)**. 

Banyak pelaku UMKM memproduksi barang ramah lingkungan namun sulit menjangkau pasar luas karena keterbatasan platform pemasaran digital. Aplikasi ini memfasilitasi integrasi tersebut dengan desain yang modern, *eco-friendly*, dan sangat interaktif.

## 🚀 Status Project: Frontend Selesai (MVP Sesuai PRD)
Bagian **Frontend** telah diimplementasikan 100% dan siap dinilai berdasarkan rubrik penilaian:
- ✅ **Penggunaan Tag HTML Tepat & Semantik** (`<nav>`, `<section>`, `<article>`, `<main>`).
- ✅ **Penamaan CSS Sesuai & Rapi** (dibangun secara terstruktur menggunakan utility-based *TailwindCSS*).
- ✅ **Penampilan & UX Responsif** (tampilan otomatis menyesuaikan untuk *Mobile*, *Tablet*, dan *Desktop* dengan desain Glassmorphism yang elegan).
- ✅ **Integrasi Fetch API** (Pengambilan data asinkron dari JSON eksternal `products.json` tanpa reload halaman web).
- ✅ **Fitur Shopping Cart & Simulasi Ongkir** (Sistem Keranjang LocalStorage reaktif + Simulasi API untuk mengkalkulasikan ongkir secara *real-time*).

---

## 💻 Cara Akses & Menjalankan Project (Local Development)
1. Lakukan *Clone* repositori ini dari GitHub.
2. Buka Terminal di folder project ini (folder `hijaulokal`).
3. Install dependency:
  ```bash
  npm install
  ```
4. Jalankan webserver Express:
  ```bash
  npm run dev
  ```
5. Buka Browser pada alamat `http://localhost:3000`.

## 🔐 Setup Firebase Authentication
1. Buat project di Firebase Console.
2. Aktifkan metode login `Email/Password` dan `Google` di menu Authentication.
3. Tambahkan domain lokal (`localhost`) pada Authorized domains.
4. Salin file env:
  ```bash
  cp .env.example .env
  ```
5. Isi nilai Firebase pada `.env`:
  - `FIREBASE_API_KEY`
  - `FIREBASE_AUTH_DOMAIN`
  - `FIREBASE_PROJECT_ID`
  - `FIREBASE_APP_ID`

Server akan mengekspose konfigurasi public Firebase melalui endpoint `/api/public-config`.

## 🚀 Production Checklist
1. Set `NODE_ENV=production`.
2. Set `ALLOWED_ORIGIN` ke domain frontend yang valid.
3. Pastikan `.env` tidak pernah di-commit (sudah di-ignore lewat `.gitignore`).
4. Jalankan aplikasi dengan process manager (PM2/systemd/container).
5. Gunakan reverse proxy (Nginx/Caddy) + HTTPS.
6. Verifikasi endpoint health check: `/api/health`.

Catatan penting: konfigurasi Firebase Web (`apiKey`, `authDomain`, `projectId`, `appId`) bukan secret backend, namun tetap dipindahkan ke env agar tidak hardcoded di source repository dan lebih mudah dikelola per environment.

---

## 🛠️ PANDUAN UNTUK TIM BACKEND (NEXT STEPS!)
Halo Tim Backend! Frontend sudah menyiapkan *Mockup API Contract* yang bisa langsung kalian sambungkan dengan server asli kalian. Berikut adalah rincian tugas yang harus kalian kerjakan berdasarkan PRD:

### 1. Buat REST API Server (Node.js & Express.js)
Bangun server backend modern menggunakan Node.js dan kerangka kerja Express.
*Referensi: [How to create a REST API with Node.js and Express](https://blog.postman.com/how-to-create-a-rest-api-with-node-js-and-express/)*

### 2. Sediakan Endpoint Data JSON
Buat endpoint `GET /api/products` yang harus mengembalikan *response* berstruktur JSON murni persis seperti data di bawah ini (HTTP Verb: GET).
*Referensi: [JavaScript JSON](https://www.w3schools.com/js/js_json.asp)*
```json
{
  "products": [
    {
      "id": 1,
      "name": "Tote Bag Eceng Gondok",
      "price": 45000,
      "category": "fashion",
      "eco": true,
      "weight": 0.3,
      ...
    }
  ]
}
```

### 3. Buat API Simulasi Ongkos Kirim (Opsional / Nilai Plus)
Untuk sementara, fitur cek ongkir di Frontend masih menggunakan "Simulasi Timeout". Tim backend silakan membuat `POST /api/shipping` yang menerima struktur *Request*: `{ "city": "jakarta", "weightKg": 2 }` dan mereturn *Response*: `{ "cost": 30000 }`.

### 4. Testing dan Uji Coba API
Sebelum menyambungkan ke aplikasi Web, pastikan kalian sudah melakukan HTTP Request Validation menggunakan **POSTMAN** untuk memastikan Endpoint tidak *error*. 
*Referensi: [Postman API Testing](https://www.postman.com/api-platform/api-testing/)*

### 5. Deployment / CI CD Backend
Deploy kode Express Server kalian ke web (seperti Render.com / Vercel), agar Frontend kami bisa melakukan `fetch()` melalui jaringan Internet sungguhan!
*Referensi: [Deploying Node.js App with GitHub Actions](https://medium.com/@g.c.dassanayake/deploying-a-nodejs-application-using-github-actions-e5f4bde7b21b)*

### 6. Langkah Integrasi Akhir!
Jika *Endpoint API* kalian sudah di-deploy dan menyala di internet (contoh: `https://api.hijaulokal.com/products`), informasikan ke tim Frontend, agar kami dapat mengganti **satu baris** URL Fetch di `views/js/app.js` dari yang awalnya bersifat tiruan lokal:
`const response = await fetch('/data/products.json');`
menjadi:
`const response = await fetch('https://api.hijaulokal.com/products');`

**Itu Saja! Selamat Bekerja Tim Backend! 👏🔥**
