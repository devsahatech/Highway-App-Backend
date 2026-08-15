const productService = require("../services/productService");

const getProducts = async (req, res) => {
  try {
    const products = await productService.getAllProducts();

    res.status(200).json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    console.error("Get products error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await productService.getProductById(id);

    res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    console.error("Get product error:", error);

    res.status(404).json({
      success: false,
      message: "Product not found",
    });
  }
};

module.exports = {
  getProducts,
  getProduct,
};
