/*
  Warnings:

  - You are about to drop the column `id_laporan` on the `transaksi_stok` table. All the data in the column will be lost.
  - Added the required column `id_pengguna` to the `analisis_eoq` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `batch_produk` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `kategori_produk` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `pengguna` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `produk` table without a default value. This is not possible if the table is not empty.
  - Added the required column `id_produk` to the `riwayat_pergerakan_stok` table without a default value. This is not possible if the table is not empty.
  - Added the required column `stok_sebelum` to the `riwayat_pergerakan_stok` table without a default value. This is not possible if the table is not empty.
  - Added the required column `stok_sesudah` to the `riwayat_pergerakan_stok` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "transaksi_stok" DROP CONSTRAINT "transaksi_stok_id_laporan_fkey";

-- AlterTable
ALTER TABLE "analisis_eoq" ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "id_pengguna" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "batch_produk" ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "kategori_produk" ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "pengguna" ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "produk" ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "gambar_public_id" TEXT,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "riwayat_pergerakan_stok" ADD COLUMN     "id_produk" INTEGER NOT NULL,
ADD COLUMN     "stok_sebelum" INTEGER NOT NULL,
ADD COLUMN     "stok_sesudah" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "transaksi_stok" DROP COLUMN "id_laporan",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "sumber_masuk" TEXT,
ADD COLUMN     "tujuan_keluar" TEXT;

-- AddForeignKey
ALTER TABLE "riwayat_pergerakan_stok" ADD CONSTRAINT "riwayat_pergerakan_stok_id_produk_fkey" FOREIGN KEY ("id_produk") REFERENCES "produk"("id_produk") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "analisis_eoq" ADD CONSTRAINT "analisis_eoq_id_pengguna_fkey" FOREIGN KEY ("id_pengguna") REFERENCES "pengguna"("id_pengguna") ON DELETE RESTRICT ON UPDATE CASCADE;
