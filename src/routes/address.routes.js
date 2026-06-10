const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
  getMyAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
} = require("../controllers/address.controller");

router.get("/addresses", authMiddleware, getMyAddresses);

router.post("/addresses", authMiddleware, addAddress);

router.put("/addresses/:id", authMiddleware, updateAddress);

router.delete("/addresses/:id", authMiddleware, deleteAddress);

module.exports = router;