const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Querying products...');
    const products = await prisma.produk.findMany({
      take: 5,
      include: { kategori: true }
    });
    console.log('First 5 Products:', products);

    if (products.length > 0) {
      const targetProduct = products[0];
      console.log('Attempting to update product id:', targetProduct.id_produk);
      const updated = await prisma.produk.update({
        where: { id_produk: targetProduct.id_produk },
        data: {
          nama_produk: targetProduct.nama_produk + ' (Updated)',
          stok_minimum: 30,
          id_kategori: targetProduct.id_kategori
        }
      });
      console.log('Product update success!', updated);
    }
  } catch (error) {
    console.error('Error during product update:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
