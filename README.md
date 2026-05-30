# 📦 Manajemen Stok & Kedaluwarsa UMKM

> **Sistem Informasi Manajemen Stok dan Kedaluwarsa berbasis Web untuk UMKM (Warung Sembako Abah Andi).**

Sistem ini dirancang khusus untuk membantu pemilik usaha ritel (UMKM) dalam mengelola siklus hidup produk, mengoptimalkan persediaan menggunakan metode **EOQ (Economic Order Quantity)**, serta mencegah kerugian akibat barang kedaluwarsa dengan aturan **FEFO (First Expired First Out)** yang ketat.

---

## 🚀 Tech Stack

| Layer | Teknologi | Deskripsi |
| :--- | :--- | :--- |
| **Frontend** | ![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js) | App Router, Modern UI, Dynamic Data Fetching |
| **Backend** | ![Express.js](https://img.shields.io/badge/Express.js-4-blue?style=flat-square&logo=express) | RESTful API, Modular Architecture, Dual-JWT Security |
| **Database** | ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue?style=flat-square&logo=postgresql) | Prisma ORM 6, Relational Schema, Supabase Pooling |
| **Styling** | ![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-38B2AC?style=flat-square&logo=tailwind-css) | Premium Dark Mode, Responsive Design & Smooth Animations |

---

## 📁 Struktur Folder

```text
├── backend/          # Express API Server (Modular Architecture)
└── frontend/         # Next.js Web Application (App Router)
```

---

## ⚙️ Cara Menjalankan (Development)

Ikuti langkah-langkah di bawah ini untuk menjalankan aplikasi di lingkungan pengembangan lokal:

### 1. Inisialisasi Database (Prisma)
Pastikan Anda sudah mengonfigurasi berkas `.env` di dalam folder `backend/`, kemudian jalankan migrasi database:
```bash
cd backend
npx prisma migrate dev
```

### 2. Jalankan Backend Server
Buka terminal baru, kemudian pasang dependensi dan jalankan server Express:
```bash
cd backend
npm install
npm run dev
```
*Server akan berjalan di `http://localhost:5000`*

### 3. Jalankan Frontend Web
Buka terminal baru, pasang dependensi dan jalankan aplikasi Next.js:
```bash
cd frontend
npm install
npm run dev
```
*Aplikasi web dapat diakses melalui `http://localhost:3000`*
