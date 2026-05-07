const productService = require('../services/product.service');
const { successResponse, errorResponse } = require('../utils/response');

const getProducts = async (req, res, next) => {
  try {
    const products = await productService.getAllProducts();
    return successResponse(res, 'Products fetched successfully', products);
  } catch (error) {
    next(error);
  }
};

const getProductById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const product = await productService.getProductById(id);
    return successResponse(res, 'Product fetched successfully', product);
  } catch (error) {
    next(error);
  }
};

const createProduct = async (req, res, next) => {
  try {
    const { id_kategori, nama_produk, satuan, stok_minimum, status_aktif } = req.body;
    const gambar_url = req.file ? req.file.path : null; // Path will be Cloudinary URL via Multer storage

    const productData = {
      id_kategori,
      nama_produk,
      satuan,
      stok_minimum,
      status_aktif: status_aktif === 'true' || status_aktif === true,
    };
    if (gambar_url) {
      productData.gambar_url = gambar_url;
    }

    const newProduct = await productService.addProduct(productData);
    return successResponse(res, 'Product created successfully', newProduct, 201);
  } catch (error) {
    next(error);
  }
};

const updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { id_kategori, nama_produk, satuan, stok_minimum, status_aktif } = req.body;
    const gambar_url = req.file ? req.file.path : null;

    const productData = {
      id_kategori,
      nama_produk,
      satuan,
      stok_minimum,
    };
    if (status_aktif !== undefined) {
      productData.status_aktif = status_aktif === 'true' || status_aktif === true;
    }
    if (gambar_url) {
      productData.gambar_url = gambar_url;
    }

    // Clean undefined values
    Object.keys(productData).forEach(key => productData[key] === undefined && delete productData[key]);

    const updatedProduct = await productService.updateProduct(id, productData);
    return successResponse(res, 'Product updated successfully', updatedProduct);
  } catch (error) {
    next(error);
  }
};

const disableProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const disabledProduct = await productService.disableProduct(id);
    return successResponse(res, 'Product disabled successfully', disabledProduct);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  disableProduct,
};
