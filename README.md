# 📦 Manajemen Stok & Kedaluwarsa — Warung Sembako Abah Andi

> **Kelompok 2**
>
> Sistem Informasi Manajemen Stok dan Kedaluwarsa berbasis Web untuk UMKM

---

## 👥 Anggota Kelompok 2

| No | Nama | NIM |
| :---: | :--- | :--- |
| 1 | Akmal Fadhlul Rohman | 535240205 |
| 2 | Jerrico Natanael | 535240024 |
| 3 | Vito Orlando | 535240154 |
| 4 | Rafly Prayoga | 535240004 |

---

## 📋 Deskripsi

Sistem ini dirancang untuk membantu pemilik usaha ritel (UMKM) dalam:

- Mengelola siklus hidup produk dari stok masuk hingga stok keluar
- Mengoptimalkan jumlah pemesanan menggunakan metode **EOQ (Economic Order Quantity)**
- Mencegah kerugian akibat barang kedaluwarsa dengan aturan **FEFO (First Expired First Out)**
- Memantau kondisi stok secara real-time melalui notifikasi otomatis

---

## 🚀 Tech Stack

| Layer | Teknologi | Deskripsi |
| :--- | :--- | :--- |
| **Frontend** | Next.js 15 | App Router, Server & Client Components |
| **Backend** | Express.js 4 | RESTful API, Modular Architecture, Dual-JWT Auth |
| **Database** | PostgreSQL 16 | Prisma ORM 6, Supabase Connection Pooling |
| **Styling** | Tailwind CSS 3 | Dark Mode, Responsive, Animasi Smooth |

---

## 📁 Struktur Folder

```text
kelompok2-manajemen-stok-kedaluwarsa/
├── backend/           # Express API Server
│   ├── prisma/        # Schema, Migration, Seed
│   └── src/
│       ├── config/      # Database, Cloudinary, Environment
│       ├── controllers/ # HTTP Request/Response Controllers
│       ├── services/    # Core Business Logic (FEFO, EOQ)
│       ├── repositories/ # Database CRUD Operations (Prisma)
│       ├── validations/ # Joi/Validator Input Schemas
│       ├── middlewares/ # Authentication JWT & Global Error Handler
│       ├── routes/      # Express API Router Mapping
│       └── utils/       # Helpers, JWT Generator, Excel Parser
└── frontend/          # Next.js Web Application
    └── src/
        ├── app/         # Page Views & Navigation Routes
        ├── components/  # Reusable UI Elements (Buttons, Modals)
        ├── hooks/       # Custom React Hooks (Authentication Session)
        └── services/    # Client API Communication (Axios)
```

---

## ⚙️ Cara Menjalankan

### Prasyarat

- Node.js 18+
- PostgreSQL (atau akun Supabase)

### 1. Clone & Setup Environment

```bash
git clone https://github.com/akmals06/kelompok2-manajemen-stok-kedaluwarsa.git
cd kelompok2-manajemen-stok-kedaluwarsa
```

Buat file `backend/.env` berdasarkan `backend/.env.example` dan isi konfigurasi database.

### 2. Inisialisasi Database

```bash
cd backend
npm install
npx prisma migrate dev
npx prisma db seed
```

### 3. Jalankan Aplikasi

Dari root folder, cukup jalankan satu perintah:

```bash
npm run dev
```

Perintah ini akan menjalankan backend dan frontend secara bersamaan:
- **Backend** → `http://localhost:5000`
- **Frontend** → `http://localhost:3000`

---

## 🔐 Akun Default (Seed)

| Peran | Email | Password |
| :--- | :--- | :--- |
| Pemilik Usaha | `pemilik@abahandi.com` | `123456` |
| Admin Usaha | `admin@abahandi.com` | `123456` |

---

## 📌 Fitur Utama

| Modul | Deskripsi |
| :--- | :--- |
| **Dashboard** | Ringkasan stok, batch kedaluwarsa, grafik kesehatan inventaris |
| **Produk** | CRUD produk, kategori, satuan, stok minimum |
| **Stok Masuk/Keluar** | Pencatatan transaksi dengan validasi FEFO |
| **Batch & Expiry** | Manajemen batch per produk, pelacakan tanggal kedaluwarsa |
| **EOQ** | Analisis Economic Order Quantity (manual & prediksi otomatis) |
| **Notifikasi** | Peringatan otomatis stok menipis & batch kedaluwarsa |
| **Laporan** | Export laporan inventaris (PDF/Excel) |
| **Import** | Import data produk via CSV |
| **Label** | Cetak label produk untuk barcode/display |
| **Riwayat** | Log aktivitas pergerakan stok |
