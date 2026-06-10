const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
  getCart,
  addToCart,
  removeFromCart,
  increaseCartQty,
  decreaseCartQty,
  clearCart,
} = require("../controllers/cart.controller");

router.get(
  "/cart",
  authMiddleware,
  getCart
);

router.post(
  "/cart",
  authMiddleware,
  addToCart
);

router.delete(
  "/cart/:cartKey",
  authMiddleware,
  removeFromCart
);

router.put(
  "/cart/:cartKey/increase",
  authMiddleware,
  increaseCartQty
);

router.put(
  "/cart/:cartKey/decrease",
  authMiddleware,
  decreaseCartQty
);

router.delete(
  "/cart",
  authMiddleware,
  clearCart
);

module.exports = router;