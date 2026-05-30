-- CreateEnum
CREATE TYPE "Role" AS ENUM ('PEMILIK_USAHA', 'ADMIN_USAHA');

-- CreateEnum
CREATE TYPE "JenisTransaksi" AS ENUM ('MASUK', 'KELUAR');

-- CreateEnum
CREATE TYPE "StatusBatch" AS ENUM ('AKTIF', 'MENDEKATI_KEDALUWARSA', 'KEDALUWARSA', 'DIARSIPKAN', 'DITOLAK');

-- CreateEnum
CREATE TYPE "StatusValidasiTransaksi" AS ENUM ('BELUM_DIVALIDASI', 'VALID', 'TIDAK_VALID');

-- CreateEnum
CREATE TYPE "StatusTransaksi" AS ENUM ('DRAFT', 'MENUNGGU_VALIDASI', 'SIAP_DIPROSES', 'BERHASIL', 'GAGAL_DIPROSES', 'DITOLAK');

-- CreateEnum
CREATE TYPE "JenisPergerakan" AS ENUM ('MASUK', 'KELUAR', 'PENAMBAHAN', 'PENGURANGAN');

-- CreateEnum
CREATE TYPE "JenisNotifikasi" AS ENUM ('MENDEKATI_KEDALUWARSA', 'KEDALUWARSA');

-- CreateEnum
CREATE TYPE "ModeInputEoq" AS ENUM ('MANUAL', 'PREDIKSI');

-- CreateTable
CREATE TABLE "pengguna" (
    "id_pengguna" SERIAL NOT NULL,
    "nama" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "peran" "Role" NOT NULL,
    "status_aktif" BOOLEAN NOT NULL DEFAULT true,
    "foto_profil" TEXT,
    "no_telepon" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pengguna_pkey" PRIMARY KEY ("id_pengguna")
);

-- CreateTable
CREATE TABLE "kategori_produk" (
    "id_kategori" SERIAL NOT NULL,
    "nama_kategori" TEXT NOT NULL,
    "deskripsi" TEXT,
    "status_aktif" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "kategori_produk_pkey" PRIMARY KEY ("id_kategori")
);

-- CreateTable
CREATE TABLE "produk" (
    "id_produk" SERIAL NOT NULL,
    "id_kategori" INTEGER NOT NULL,
    "nama_produk" TEXT NOT NULL,
    "satuan" TEXT NOT NULL,
    "stok_tersedia" INTEGER NOT NULL DEFAULT 0,
    "stok_minimum" INTEGER NOT NULL DEFAULT 0,
    "status_aktif" BOOLEAN NOT NULL DEFAULT true,
    "gambar_produk" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "produk_pkey" PRIMARY KEY ("id_produk")
);

-- CreateTable
CREATE TABLE "batch_produk" (
    "id_batch" SERIAL NOT NULL,
    "id_produk" INTEGER NOT NULL,
    "kode_batch" TEXT NOT NULL,
    "tanggal_masuk" TIMESTAMP(3) NOT NULL,
    "tanggal_kedaluwarsa" TIMESTAMP(3) NOT NULL,
    "jumlah_awal" INTEGER NOT NULL DEFAULT 0,
    "jumlah_sisa" INTEGER NOT NULL DEFAULT 0,
    "status_batch" "StatusBatch" NOT NULL DEFAULT 'AKTIF',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "batch_produk_pkey" PRIMARY KEY ("id_batch")
);

-- CreateTable
CREATE TABLE "transaksi_stok" (
    "id_transaksi" SERIAL NOT NULL,
    "id_pengguna" INTEGER NOT NULL,
    "id_produk" INTEGER NOT NULL,
    "id_batch" INTEGER,
    "jenis_transaksi" "JenisTransaksi" NOT NULL,
    "jumlah" INTEGER NOT NULL,
    "sumber_masuk" TEXT,
    "tujuan_keluar" TEXT,
    "status_validasi" "StatusValidasiTransaksi" NOT NULL DEFAULT 'BELUM_DIVALIDASI',
    "status_transaksi" "StatusTransaksi" NOT NULL DEFAULT 'DRAFT',
    "tanggal_transaksi" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "keterangan" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "transaksi_stok_pkey" PRIMARY KEY ("id_transaksi")
);

-- CreateTable
CREATE TABLE "detail_transaksi_stok" (
    "id_detail" SERIAL NOT NULL,
    "id_transaksi" INTEGER NOT NULL,
    "id_batch" INTEGER NOT NULL,
    "jumlah_batch" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "detail_transaksi_stok_pkey" PRIMARY KEY ("id_detail")
);

-- CreateTable
CREATE TABLE "riwayat_pergerakan_stok" (
    "id_riwayat" SERIAL NOT NULL,
    "id_transaksi" INTEGER NOT NULL,
    "id_produk" INTEGER,
    "jenis_pergerakan" "JenisPergerakan" NOT NULL,
    "jumlah_perubahan" INTEGER NOT NULL,
    "stok_sebelum" INTEGER NOT NULL DEFAULT 0,
    "stok_sesudah" INTEGER NOT NULL DEFAULT 0,
    "waktu_catat" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "catatan" TEXT,

    CONSTRAINT "riwayat_pergerakan_stok_pkey" PRIMARY KEY ("id_riwayat")
);

-- CreateTable
CREATE TABLE "notifikasi_kedaluwarsa" (
    "id_notifikasi" SERIAL NOT NULL,
    "id_batch" INTEGER NOT NULL,
    "jenis_notifikasi" "JenisNotifikasi" NOT NULL,
    "pesan" TEXT NOT NULL,
    "status_baca" BOOLEAN NOT NULL DEFAULT false,
    "tanggal_notifikasi" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifikasi_kedaluwarsa_pkey" PRIMARY KEY ("id_notifikasi")
);

-- CreateTable
CREATE TABLE "laporan_inventaris" (
    "id_laporan" SERIAL NOT NULL,
    "id_pengguna" INTEGER,
    "periode_awal" TIMESTAMP(3) NOT NULL,
    "periode_akhir" TIMESTAMP(3) NOT NULL,
    "tanggal_dibuat" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "laporan_inventaris_pkey" PRIMARY KEY ("id_laporan")
);

-- CreateTable
CREATE TABLE "laporan_inventaris_detail" (
    "id_laporan_detail" SERIAL NOT NULL,
    "id_laporan" INTEGER NOT NULL,
    "id_produk" INTEGER NOT NULL,
    "nama_produk_snapshot" TEXT NOT NULL,
    "stok_tersedia_snapshot" INTEGER NOT NULL,
    "status_batch_snapshot" TEXT,
    "jumlah_masuk" INTEGER NOT NULL DEFAULT 0,
    "jumlah_keluar" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "laporan_inventaris_detail_pkey" PRIMARY KEY ("id_laporan_detail")
);

-- CreateTable
CREATE TABLE "prediksi_permintaan" (
    "id_prediksi" SERIAL NOT NULL,
    "id_produk" INTEGER NOT NULL,
    "periode_awal" TIMESTAMP(3) NOT NULL,
    "periode_akhir" TIMESTAMP(3) NOT NULL,
    "data_histori_permintaan" TEXT NOT NULL,
    "hasil_prediksi" DECIMAL(10,2) NOT NULL,
    "metode" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "prediksi_permintaan_pkey" PRIMARY KEY ("id_prediksi")
);

-- CreateTable
CREATE TABLE "analisis_eoq" (
    "id_analisis" SERIAL NOT NULL,
    "id_produk" INTEGER NOT NULL,
    "id_pengguna" INTEGER,
    "id_prediksi" INTEGER,
    "mode_input" "ModeInputEoq" NOT NULL DEFAULT 'MANUAL',
    "kebutuhan_tahunan" DECIMAL(10,2) NOT NULL,
    "biaya_pesan" DECIMAL(10,2) NOT NULL,
    "biaya_simpan" DECIMAL(10,2) NOT NULL,
    "nilai_eoq" DECIMAL(10,2) NOT NULL,
    "frekuensi_pemesanan" DECIMAL(10,2) NOT NULL,
    "biaya_pesan_tahunan" DECIMAL(10,2) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "analisis_eoq_pkey" PRIMARY KEY ("id_analisis")
);

-- CreateTable
CREATE TABLE "notifikasi" (
    "id_notifikasi" SERIAL NOT NULL,
    "id_pengguna" INTEGER,
    "judul" TEXT NOT NULL,
    "pesan" TEXT NOT NULL,
    "tipe" TEXT NOT NULL DEFAULT 'SISTEM',
    "dibaca" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifikasi_pkey" PRIMARY KEY ("id_notifikasi")
);

-- CreateTable
CREATE TABLE "keuangan" (
    "id_keuangan" SERIAL NOT NULL,
    "jenis_transaksi" TEXT NOT NULL,
    "kategori_keuangan" TEXT NOT NULL,
    "nominal" INTEGER NOT NULL,
    "keterangan" TEXT,
    "tanggal_transaksi" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "keuangan_pkey" PRIMARY KEY ("id_keuangan")
);

-- CreateIndex
CREATE UNIQUE INDEX "pengguna_email_key" ON "pengguna"("email");

-- CreateIndex
CREATE INDEX "pengguna_email_idx" ON "pengguna"("email");

-- CreateIndex
CREATE UNIQUE INDEX "kategori_produk_nama_kategori_key" ON "kategori_produk"("nama_kategori");

-- CreateIndex
CREATE INDEX "kategori_produk_nama_kategori_idx" ON "kategori_produk"("nama_kategori");

-- CreateIndex
CREATE INDEX "produk_id_kategori_idx" ON "produk"("id_kategori");

-- CreateIndex
CREATE INDEX "produk_nama_produk_idx" ON "produk"("nama_produk");

-- CreateIndex
CREATE INDEX "produk_status_aktif_idx" ON "produk"("status_aktif");

-- CreateIndex
CREATE INDEX "batch_produk_id_produk_idx" ON "batch_produk"("id_produk");

-- CreateIndex
CREATE INDEX "batch_produk_tanggal_kedaluwarsa_idx" ON "batch_produk"("tanggal_kedaluwarsa");

-- CreateIndex
CREATE INDEX "batch_produk_status_batch_idx" ON "batch_produk"("status_batch");

-- CreateIndex
CREATE INDEX "transaksi_stok_id_produk_idx" ON "transaksi_stok"("id_produk");

-- CreateIndex
CREATE INDEX "transaksi_stok_id_pengguna_idx" ON "transaksi_stok"("id_pengguna");

-- CreateIndex
CREATE INDEX "transaksi_stok_jenis_transaksi_idx" ON "transaksi_stok"("jenis_transaksi");

-- CreateIndex
CREATE INDEX "transaksi_stok_tanggal_transaksi_idx" ON "transaksi_stok"("tanggal_transaksi");

-- CreateIndex
CREATE INDEX "detail_transaksi_stok_id_transaksi_idx" ON "detail_transaksi_stok"("id_transaksi");

-- CreateIndex
CREATE INDEX "detail_transaksi_stok_id_batch_idx" ON "detail_transaksi_stok"("id_batch");

-- CreateIndex
CREATE INDEX "riwayat_pergerakan_stok_id_transaksi_idx" ON "riwayat_pergerakan_stok"("id_transaksi");

-- CreateIndex
CREATE INDEX "riwayat_pergerakan_stok_id_produk_idx" ON "riwayat_pergerakan_stok"("id_produk");

-- CreateIndex
CREATE INDEX "notifikasi_kedaluwarsa_id_batch_idx" ON "notifikasi_kedaluwarsa"("id_batch");

-- CreateIndex
CREATE INDEX "notifikasi_kedaluwarsa_status_baca_idx" ON "notifikasi_kedaluwarsa"("status_baca");

-- CreateIndex
CREATE INDEX "laporan_inventaris_id_pengguna_idx" ON "laporan_inventaris"("id_pengguna");

-- CreateIndex
CREATE INDEX "laporan_inventaris_detail_id_laporan_idx" ON "laporan_inventaris_detail"("id_laporan");

-- CreateIndex
CREATE INDEX "laporan_inventaris_detail_id_produk_idx" ON "laporan_inventaris_detail"("id_produk");

-- CreateIndex
CREATE INDEX "prediksi_permintaan_id_produk_idx" ON "prediksi_permintaan"("id_produk");

-- CreateIndex
CREATE INDEX "analisis_eoq_id_produk_idx" ON "analisis_eoq"("id_produk");

-- CreateIndex
CREATE INDEX "analisis_eoq_id_pengguna_idx" ON "analisis_eoq"("id_pengguna");

-- CreateIndex
CREATE INDEX "analisis_eoq_id_prediksi_idx" ON "analisis_eoq"("id_prediksi");

-- CreateIndex
CREATE INDEX "notifikasi_id_pengguna_idx" ON "notifikasi"("id_pengguna");

-- CreateIndex
CREATE INDEX "notifikasi_dibaca_idx" ON "notifikasi"("dibaca");

-- CreateIndex
CREATE INDEX "keuangan_jenis_transaksi_idx" ON "keuangan"("jenis_transaksi");

-- CreateIndex
CREATE INDEX "keuangan_tanggal_transaksi_idx" ON "keuangan"("tanggal_transaksi");

-- AddForeignKey
ALTER TABLE "produk" ADD CONSTRAINT "produk_id_kategori_fkey" FOREIGN KEY ("id_kategori") REFERENCES "kategori_produk"("id_kategori") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "batch_produk" ADD CONSTRAINT "batch_produk_id_produk_fkey" FOREIGN KEY ("id_produk") REFERENCES "produk"("id_produk") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transaksi_stok" ADD CONSTRAINT "transaksi_stok_id_pengguna_fkey" FOREIGN KEY ("id_pengguna") REFERENCES "pengguna"("id_pengguna") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transaksi_stok" ADD CONSTRAINT "transaksi_stok_id_produk_fkey" FOREIGN KEY ("id_produk") REFERENCES "produk"("id_produk") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transaksi_stok" ADD CONSTRAINT "transaksi_stok_id_batch_fkey" FOREIGN KEY ("id_batch") REFERENCES "batch_produk"("id_batch") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "detail_transaksi_stok" ADD CONSTRAINT "detail_transaksi_stok_id_transaksi_fkey" FOREIGN KEY ("id_transaksi") REFERENCES "transaksi_stok"("id_transaksi") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "detail_transaksi_stok" ADD CONSTRAINT "detail_transaksi_stok_id_batch_fkey" FOREIGN KEY ("id_batch") REFERENCES "batch_produk"("id_batch") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "riwayat_pergerakan_stok" ADD CONSTRAINT "riwayat_pergerakan_stok_id_transaksi_fkey" FOREIGN KEY ("id_transaksi") REFERENCES "transaksi_stok"("id_transaksi") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "riwayat_pergerakan_stok" ADD CONSTRAINT "riwayat_pergerakan_stok_id_produk_fkey" FOREIGN KEY ("id_produk") REFERENCES "produk"("id_produk") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifikasi_kedaluwarsa" ADD CONSTRAINT "notifikasi_kedaluwarsa_id_batch_fkey" FOREIGN KEY ("id_batch") REFERENCES "batch_produk"("id_batch") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "laporan_inventaris" ADD CONSTRAINT "laporan_inventaris_id_pengguna_fkey" FOREIGN KEY ("id_pengguna") REFERENCES "pengguna"("id_pengguna") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "laporan_inventaris_detail" ADD CONSTRAINT "laporan_inventaris_detail_id_laporan_fkey" FOREIGN KEY ("id_laporan") REFERENCES "laporan_inventaris"("id_laporan") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "laporan_inventaris_detail" ADD CONSTRAINT "laporan_inventaris_detail_id_produk_fkey" FOREIGN KEY ("id_produk") REFERENCES "produk"("id_produk") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prediksi_permintaan" ADD CONSTRAINT "prediksi_permintaan_id_produk_fkey" FOREIGN KEY ("id_produk") REFERENCES "produk"("id_produk") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "analisis_eoq" ADD CONSTRAINT "analisis_eoq_id_produk_fkey" FOREIGN KEY ("id_produk") REFERENCES "produk"("id_produk") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "analisis_eoq" ADD CONSTRAINT "analisis_eoq_id_pengguna_fkey" FOREIGN KEY ("id_pengguna") REFERENCES "pengguna"("id_pengguna") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "analisis_eoq" ADD CONSTRAINT "analisis_eoq_id_prediksi_fkey" FOREIGN KEY ("id_prediksi") REFERENCES "prediksi_permintaan"("id_prediksi") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifikasi" ADD CONSTRAINT "notifikasi_id_pengguna_fkey" FOREIGN KEY ("id_pengguna") REFERENCES "pengguna"("id_pengguna") ON DELETE SET NULL ON UPDATE CASCADE;
