-- CreateEnum
CREATE TYPE "Role" AS ENUM ('PEMILIK_USAHA', 'ADMIN_USAHA');

-- CreateEnum
CREATE TYPE "JenisTransaksi" AS ENUM ('MASUK', 'KELUAR');

-- CreateEnum
CREATE TYPE "StatusBatch" AS ENUM ('AKTIF', 'MENDEKATI_KEDALUWARSA', 'KEDALUWARSA', 'DIARSIPKAN');

-- CreateEnum
CREATE TYPE "JenisPergerakan" AS ENUM ('PENAMBAHAN', 'PENGURANGAN');

-- CreateTable
CREATE TABLE "pengguna" (
    "id_pengguna" SERIAL NOT NULL,
    "nama" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "peran" "Role" NOT NULL,
    "status_aktif" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pengguna_pkey" PRIMARY KEY ("id_pengguna")
);

-- CreateTable
CREATE TABLE "kategori_produk" (
    "id_kategori" SERIAL NOT NULL,
    "nama_kategori" TEXT NOT NULL,
    "deskripsi" TEXT,
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
    "jumlah_batch" INTEGER NOT NULL DEFAULT 0,
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
    "tanggal_transaksi" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "jumlah" INTEGER NOT NULL,
    "sumber_masuk" TEXT,
    "tujuan_keluar" TEXT,
    "keterangan" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "transaksi_stok_pkey" PRIMARY KEY ("id_transaksi")
);

-- CreateTable
CREATE TABLE "riwayat_pergerakan_stok" (
    "id_riwayat" SERIAL NOT NULL,
    "id_transaksi" INTEGER NOT NULL,
    "jenis_pergerakan" "JenisPergerakan" NOT NULL,
    "jumlah_perubahan" INTEGER NOT NULL,
    "waktu_catat" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "catatan" TEXT,

    CONSTRAINT "riwayat_pergerakan_stok_pkey" PRIMARY KEY ("id_riwayat")
);

-- CreateTable
CREATE TABLE "laporan_inventaris" (
    "id_laporan" SERIAL NOT NULL,
    "periode_awal" TIMESTAMP(3) NOT NULL,
    "periode_akhir" TIMESTAMP(3) NOT NULL,
    "tanggal_generate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "laporan_inventaris_pkey" PRIMARY KEY ("id_laporan")
);

-- CreateTable
CREATE TABLE "analisis_eoq" (
    "id_analisis" SERIAL NOT NULL,
    "id_produk" INTEGER NOT NULL,
    "kebutuhan_tahunan" DOUBLE PRECISION NOT NULL,
    "biaya_pesan" DOUBLE PRECISION NOT NULL,
    "biaya_simpan" DOUBLE PRECISION NOT NULL,
    "nilai_eoq" DOUBLE PRECISION NOT NULL,
    "frekuensi_pemesanan" DOUBLE PRECISION NOT NULL,
    "biaya_pesan_tahunan" DOUBLE PRECISION NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "analisis_eoq_pkey" PRIMARY KEY ("id_analisis")
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
CREATE UNIQUE INDEX "riwayat_pergerakan_stok_id_transaksi_key" ON "riwayat_pergerakan_stok"("id_transaksi");

-- CreateIndex
CREATE INDEX "riwayat_pergerakan_stok_id_transaksi_idx" ON "riwayat_pergerakan_stok"("id_transaksi");

-- CreateIndex
CREATE INDEX "analisis_eoq_id_produk_idx" ON "analisis_eoq"("id_produk");

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
ALTER TABLE "riwayat_pergerakan_stok" ADD CONSTRAINT "riwayat_pergerakan_stok_id_transaksi_fkey" FOREIGN KEY ("id_transaksi") REFERENCES "transaksi_stok"("id_transaksi") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "analisis_eoq" ADD CONSTRAINT "analisis_eoq_id_produk_fkey" FOREIGN KEY ("id_produk") REFERENCES "produk"("id_produk") ON DELETE RESTRICT ON UPDATE CASCADE;
