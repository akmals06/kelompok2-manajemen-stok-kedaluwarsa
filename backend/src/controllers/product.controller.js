const prisma = require('../config/db');
const { successResponse, errorResponse } = require('../utils/response');

const getProducts = async (req, res) => {
  try {
    const products = await prisma.product.findMany();
    return successResponse(res, 'Products fetched successfully', products);
  } catch (error) {
    return errorResponse(res, 'Failed to fetch products', 500, error);
  }
};

const createProduct = async (req, res) => {
  try {
    const { name, description, price, stock } = req.body;
    const image = req.file ? req.file.path : null;

    const product = await prisma.product.create({
      data: {
        name,
        description,
        price: parseFloat(price),
        stock: parseInt(stock),
        image,
      },
    });

    return successResponse(res, 'Product created successfully', product, 201);
  } catch (error) {
    return errorResponse(res, 'Failed to create product', 500, error);
  }
};

module.exports = {
  getProducts,
  createProduct,
};
