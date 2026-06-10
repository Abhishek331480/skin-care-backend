const express = require("express");
const router = express.Router();

const paymentController = require("../controllers/payment.controller");
const authMiddleware = require("../middleware/authMiddleware");

router.post(
  "/payments/create-order",
  authMiddleware,
  paymentController.createRazorpayOrder
);

router.post(
  "/payments/verify",
  authMiddleware,
  paymentController.verifyPayment
);

module.exports = router;