const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Querying product 399...');
    const product = await prisma.produk.findUnique({
      where: { id_produk: 399 },
      include: { kategori: true }
    });
    console.log('Product 399:', JSON.stringify(product, null, 2));
  } catch (error) {
    console.error('Error querying product 399:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
