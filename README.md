# CeritaPeta — SPA + PWA (Advanced)

Aplikasi Single Page Application (SPA) bertema berbagi cerita dengan peta (Leaflet), form tambah data (kamera/upload), aksesibilitas (skip to content, label, semantik), serta fitur **Assignment 2 (Advanced)**:
- **Push Notification** (toggle enable/disable, payload dinamis, aksi klik → halaman detail)
- **PWA Installable** (manifest lengkap: icons, screenshots, shortcuts, theme)
- **Offline** (App Shell + cache dinamis data API via Service Worker)
- **IndexedDB** (CRUD simpan story + Outbox untuk offline create) & **Background Sync**
- **MVP Pattern** pada halaman beranda (Model–View–Presenter)

## 🚀 Menjalankan (Development)
```bash
npm install
npm run start-dev
# buka http://localhost:9000/
```
> Mode dev cocok untuk cek UI, routing, MVP, form, kamera, navbar dinamis, redirect, dan skip-link.

## 📦 Build & Preview (Production — untuk PWA/Push/Offline)
```bash
npm run build
npm run serve
# buka http://localhost:8080 (default)
```

## ✅ Cek Kriteria Assignment 2
### K1 — Pertahankan Submission 1
- SPA + Transisi Halaman (View Transitions)
- Peta + marker + interaksi (filter, sinkron list↔peta)
- Tambah data (upload/kamera + klik peta) + validasi + pesan error
- Aksesibilitas (alt text, semantik, label, skip-to-content) & responsif
- Navbar: Login/Register tersembunyi setelah login, ada Logout
- Redirect ke beranda setelah sukses tambah story

### K2 — Push Notification
1. Isi `VAPID_PUBLIC_KEY` di `src/scripts/config.js`.
2. `#/about` → **Aktifkan Push** (izinkan notifikasi).
3. Uji via DevTools → Application → Service Workers → **Push** (payload JSON contoh):
   ```json
   {"title":"Cerita baru","body":"Buka untuk lihat detail","id":"<ID CERITA>","icon":"/favicon.png"}
   ```
4. Klik notifikasi → navigasi ke `#/detail/<id>`.

### K3 — PWA Installable + Offline
- Manifest lengkap: icons, screenshots, shortcuts, theme.
- Tombol **Install** di `#/about` (muncul setelah event beforeinstallprompt).
- Mode Offline → App Shell tetap tampil, **data terakhir** tetap tersedia (cache dinamis SWR).

### K4 — IndexedDB + Sync
- Beranda: tombol **Simpan** menyimpan story ke IndexedDB (CRUD).
- Tambah cerita saat offline → masuk **Outbox**;
- Kembali online → **Background Sync** mengirim otomatis.

### K5 — Deploy (Public)
- Deploy folder `dist/` ke Netlify/Vercel/GitHub Pages/Firebase.
- Isi `STUDENT.txt` → `APP_URL=` (wajib).

## 🧩 Struktur PWA
- `src/sw.js` — Service Worker (shell cache, cache dinamis, background sync, push).
- `src/public/manifest.webmanifest` + `src/public/icons/*` + `src/public/screenshots/*` + `src/public/favicon.png`.
- `src/scripts/pwa/*` — `sw-register.js`, `install.js`, `push.js`.
- `src/scripts/idb.js`, `src/scripts/data/db.js` — IndexedDB helper & Outbox.
- `src/scripts/pages/about/about-page.js` — tombol **Install** & **Push toggle**.
- `src/scripts/pages/stories/add-page.js` — redirect ke beranda & offline queue.
- `src/scripts/mvp/*` — Model, View, Presenter untuk beranda.

## 🛠 Catatan Teknis
- Leaflet via CDN (tanpa dependensi tambahan).
- Kamera memerlukan `https` atau `http://localhost`.
- Service Worker berjalan dari **root** build (`/sw.js` disalin ke `dist/sw.js` lewat CopyWebpackPlugin).
- Pada DevTools → Application → Manifest, pastikan tidak ada warning.
- Payload push disediakan server. Untuk demo lokal, gunakan tombol **Push** di DevTools Service Workers.

## ✏️ Variabel yang perlu disesuaikan
Edit `src/scripts/config.js`:
```js
const CONFIG = {
  BASE_URL: 'https://story-api.dicoding.dev/v1',
  MAP_TILE_URL: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  MAP_ATTRIBUTION: '&copy; OpenStreetMap contributors',
  VAPID_PUBLIC_KEY: '<ISI_VAPID_PUBLIC_KEY_ANDA>'
};
```
Simpan juga URL hasil deploy ke `STUDENT.txt`.

Semangat dan selamat menyelesaikan Assignment 2! 🎉
