const produkRepository = require('../repositories/produk.repository');

const getAllProducts = async () => {
  return await produkRepository.findAllProducts();
};

const getProductById = async (id_produk) => {
  const product = await produkRepository.findProductById(id_produk);
  if (!product) {
    const error = new Error('Product not found');
    error.statusCode = 404;
    throw error;
  }
  return product;
};

const addProduct = async (productData) => {
  // Validate minimum requirements based on schema
  if (!productData.nama_produk || !productData.id_kategori || !productData.satuan) {
    const error = new Error('nama_produk, id_kategori, and satuan are required');
    error.statusCode = 400;
    throw error;
  }

  // Ensure integers
  const dataToCreate = {
    ...productData,
    id_kategori: parseInt(productData.id_kategori),
    stok_minimum: productData.stok_minimum ? parseInt(productData.stok_minimum) : 0,
    status_aktif: productData.status_aktif !== undefined ? productData.status_aktif : true
  };

  return await produkRepository.createProduct(dataToCreate);
};

const updateProduct = async (id_produk, productData) => {
  await getProductById(id_produk); // Ensure exists

  const dataToUpdate = { ...productData };
  if (dataToUpdate.id_kategori) dataToUpdate.id_kategori = parseInt(dataToUpdate.id_kategori);
  if (dataToUpdate.stok_minimum) dataToUpdate.stok_minimum = parseInt(dataToUpdate.stok_minimum);

  return await produkRepository.updateProduct(id_produk, dataToUpdate);
};

const disableProduct = async (id_produk) => {
  await getProductById(id_produk); // Ensure exists
  return await produkRepository.updateStatusProduct(id_produk, false);
};

module.exports = {
  getAllProducts,
  getProductById,
  addProduct,
  updateProduct,
  disableProduct,
};
