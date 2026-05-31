const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Querying categories...');
    const categories = await prisma.kategori_produk.findMany();
    console.log('Categories:', categories);

    if (categories.length > 0) {
      const firstCategory = categories[0];
      console.log('Attempting to update category id:', firstCategory.id_kategori);
      const updated = await prisma.kategori_produk.update({
        where: { id_kategori: firstCategory.id_kategori },
        data: {
          deskripsi: firstCategory.deskripsi + ' (Updated)'
        }
      });
      console.log('Update success!', updated);
    }
  } catch (error) {
    console.error('Error during category update:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
