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

-- CreateTable
CREATE TABLE "penjualan" (
    "id_penjualan" SERIAL NOT NULL,
    "id_pengguna" INTEGER NOT NULL,
    "total_harga" INTEGER NOT NULL,
    "jumlah_bayar" INTEGER NOT NULL,
    "kembalian" INTEGER NOT NULL,
    "metode_pembayaran" TEXT NOT NULL DEFAULT 'CASH',
    "tanggal_penjualan" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "penjualan_pkey" PRIMARY KEY ("id_penjualan")
);

-- CreateTable
CREATE TABLE "detail_penjualan" (
    "id_detail" SERIAL NOT NULL,
    "id_penjualan" INTEGER NOT NULL,
    "id_produk" INTEGER NOT NULL,
    "jumlah" INTEGER NOT NULL,
    "harga_satuan" INTEGER NOT NULL,
    "subtotal" INTEGER NOT NULL,

    CONSTRAINT "detail_penjualan_pkey" PRIMARY KEY ("id_detail")
);

-- CreateTable
CREATE TABLE "pembelian" (
    "id_pembelian" SERIAL NOT NULL,
    "id_pengguna" INTEGER NOT NULL,
    "supplier" TEXT,
    "total_biaya" INTEGER NOT NULL,
    "status_pembayaran" TEXT NOT NULL DEFAULT 'LUNAS',
    "tanggal_pembelian" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pembelian_pkey" PRIMARY KEY ("id_pembelian")
);

-- CreateTable
CREATE TABLE "detail_pembelian" (
    "id_detail" SERIAL NOT NULL,
    "id_pembelian" INTEGER NOT NULL,
    "id_produk" INTEGER NOT NULL,
    "jumlah" INTEGER NOT NULL,
    "harga_satuan" INTEGER NOT NULL,
    "subtotal" INTEGER NOT NULL,

    CONSTRAINT "detail_pembelian_pkey" PRIMARY KEY ("id_detail")
);

-- CreateIndex
CREATE INDEX "notifikasi_id_pengguna_idx" ON "notifikasi"("id_pengguna");

-- CreateIndex
CREATE INDEX "notifikasi_dibaca_idx" ON "notifikasi"("dibaca");

-- CreateIndex
CREATE INDEX "keuangan_jenis_transaksi_idx" ON "keuangan"("jenis_transaksi");

-- CreateIndex
CREATE INDEX "keuangan_tanggal_transaksi_idx" ON "keuangan"("tanggal_transaksi");

-- CreateIndex
CREATE INDEX "penjualan_id_pengguna_idx" ON "penjualan"("id_pengguna");

-- CreateIndex
CREATE INDEX "penjualan_tanggal_penjualan_idx" ON "penjualan"("tanggal_penjualan");

-- CreateIndex
CREATE INDEX "detail_penjualan_id_penjualan_idx" ON "detail_penjualan"("id_penjualan");

-- CreateIndex
CREATE INDEX "detail_penjualan_id_produk_idx" ON "detail_penjualan"("id_produk");

-- CreateIndex
CREATE INDEX "pembelian_id_pengguna_idx" ON "pembelian"("id_pengguna");

-- CreateIndex
CREATE INDEX "pembelian_tanggal_pembelian_idx" ON "pembelian"("tanggal_pembelian");

-- CreateIndex
CREATE INDEX "detail_pembelian_id_pembelian_idx" ON "detail_pembelian"("id_pembelian");

-- CreateIndex
CREATE INDEX "detail_pembelian_id_produk_idx" ON "detail_pembelian"("id_produk");

-- AddForeignKey
ALTER TABLE "notifikasi" ADD CONSTRAINT "notifikasi_id_pengguna_fkey" FOREIGN KEY ("id_pengguna") REFERENCES "pengguna"("id_pengguna") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "penjualan" ADD CONSTRAINT "penjualan_id_pengguna_fkey" FOREIGN KEY ("id_pengguna") REFERENCES "pengguna"("id_pengguna") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "detail_penjualan" ADD CONSTRAINT "detail_penjualan_id_penjualan_fkey" FOREIGN KEY ("id_penjualan") REFERENCES "penjualan"("id_penjualan") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "detail_penjualan" ADD CONSTRAINT "detail_penjualan_id_produk_fkey" FOREIGN KEY ("id_produk") REFERENCES "produk"("id_produk") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pembelian" ADD CONSTRAINT "pembelian_id_pengguna_fkey" FOREIGN KEY ("id_pengguna") REFERENCES "pengguna"("id_pengguna") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "detail_pembelian" ADD CONSTRAINT "detail_pembelian_id_pembelian_fkey" FOREIGN KEY ("id_pembelian") REFERENCES "pembelian"("id_pembelian") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "detail_pembelian" ADD CONSTRAINT "detail_pembelian_id_produk_fkey" FOREIGN KEY ("id_produk") REFERENCES "produk"("id_produk") ON DELETE RESTRICT ON UPDATE CASCADE;
