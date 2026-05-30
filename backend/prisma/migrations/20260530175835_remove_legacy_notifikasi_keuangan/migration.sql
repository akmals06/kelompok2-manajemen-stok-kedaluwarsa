/*
  Warnings:

  - You are about to drop the `keuangan` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `notifikasi` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "notifikasi" DROP CONSTRAINT "notifikasi_id_pengguna_fkey";

-- DropTable
DROP TABLE "keuangan";

-- DropTable
DROP TABLE "notifikasi";
