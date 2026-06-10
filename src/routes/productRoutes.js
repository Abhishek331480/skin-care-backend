const express = require("express");
const router = express.Router();

const productController = require("../controllers/product.controller");
const upload = require("../middleware/upload")

const authMiddleware = require("../middleware/authMiddleware");
// const adminMiddleware = require("../middleware/adminMiddleware");
const AdminAuthMiddleware = require("../middleware/adminAuthMiddleware");

// create product
router.post("/products",AdminAuthMiddleware,upload.array("images", 4),productController.createProduct);

// best seller products
router.get("/products/best-sellers", productController.getBestSellerProducts);

// top selling products
router.get(
  "/products/top-selling",
  productController.getTopSellingProducts
);

// get all products
router.get("/products", productController.getProducts);

// get single product
router.get("/products/:id", productController.getSingleProduct);

// update product
// router.put("/products/:id",productController.updateProduct);
router.put(
  "/products/:id",
  AdminAuthMiddleware,
  upload.array("images", 4),
  productController.updateProduct
);

// delete product
router.delete("/products/:id",AdminAuthMiddleware, productController.deleteProduct);

// product review
router.post("/products/:id/reviews",authMiddleware,productController.addProductReview);

module.exports = router;