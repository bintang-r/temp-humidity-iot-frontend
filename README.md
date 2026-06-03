# DHT11 Realtime Dashboard - Frontend PWA

Aplikasi antarmuka web modern yang berfungsi sebagai dashboard pemantauan (monitoring) sensor DHT11. Dibangun dengan Vue 3 (Composition API), Vite, TailwindCSS v4, dan dikonfigurasi sebagai Progressive Web App (PWA) agar dapat diinstal pada perangkat mobile/desktop layaknya aplikasi native.

## Tampilan Antarmuka (Preview)

*Gambar Dashboard Utama di Desktop:*
![Tampilan Desktop](gambar1.png)

*Gambar Tampilan Mobile (Responsif):*
![Tampilan Mobile](gambar2.png)

*Gambar Tabel Data Histori Sensor:*
![Tabel Data](gambar3.png)

## Fitur Utama
- **UI Premium & Responsif:** Desain modern (Sidebar navigasi, Widget/Cards, Glassmorphism elements) yang terkalibrasi khusus untuk Layar Komputer, Tablet, maupun Layar Sentuh HP.
- **Koneksi Real-time:** Menerapkan integrasi `socket.io-client` sehingga grafik suhu dan tabel trafik data bergerak *live* setiap kali hardware mengirim data.
- **Grafik Interaktif:** Implementasi `vue-chartjs` untuk memetakan Suhu dan Kelembaban per waktu.
- **Dukungan Offline & Instalasi:** Menggunakan *Service Worker* dan fitur manifest (PWA) sehingga aplikasi dapat di-"Add to Home Screen" dari browser.

## Cara Instalasi

1. **Pastikan Anda berada di direktori frontend:**
   ```bash
   cd dht-frontend
   ```

2. **Instal dependensi library:**
   ```bash
   npm install
   ```

3. **Jalankan Aplikasi:**
   ```bash
   npm run dev
   ```
   *Buka URL (umumnya http://localhost:5173) di browser.*

## Build untuk Produksi
Bila aplikasi akan dipublikasikan ke hosting atau server sesungguhnya:
```bash
npm run build
```
Folder hasil *build* akan berada di dalam direktori `dist/`.
