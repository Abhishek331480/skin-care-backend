const express = require("express");
const router = express.Router();
const couponController = require("../controllers/coupon.controller");

const AdminAuthMiddleware = require("../middleware/AdminAuthMiddleware");
const authMiddleware = require("../middleware/authMiddleware");

// public/user coupon validation
router.post(
  "/coupons/validate",
  couponController.validateCoupon
);

// admin coupon management
router.get(
  "/coupons",
  AdminAuthMiddleware,
  couponController.getAllCoupons
);

router.post(
  "/coupons",
  AdminAuthMiddleware,
  couponController.createCoupon
);

router.put(
  "/coupons/:id",
  AdminAuthMiddleware,
  couponController.updateCoupon
);

router.delete(
  "/coupons/:id",
  AdminAuthMiddleware,
  couponController.deleteCoupon
);

router.get(
  "/coupons/available",authMiddleware,
  couponController.getAvailableCoupons
);

module.exports = router;
