const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
  getWishlist,
  toggleWishlist,
} = require("../controllers/wishlist.controller");

router.get("/wishlist", authMiddleware, getWishlist);

router.post("/wishlist/:productId", authMiddleware, toggleWishlist);

module.exports = router;