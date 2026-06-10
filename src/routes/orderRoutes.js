const express = require("express");
const router = express.Router();

const orderController = require("../controllers/order.controller");
const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

const AdminAuthMiddleware = require("../middleware/adminAuthMiddleware");

router.post(
  "/orders",
  authMiddleware,
  orderController.createOrder
);

router.get(
  "/orders/my-orders",
  authMiddleware,
  orderController.getMyOrders
);

router.get(
  "/orders",
  AdminAuthMiddleware,
  orderController.getAllOrders
);

router.put(
  "/orders/:id/status",
  AdminAuthMiddleware,
  orderController.updateOrderStatus
);

router.get(
  "/orders/:id/invoice",
  authMiddleware,
  orderController.getOrderInvoicePDF
);

router.get(
  "/orders/:id",
  authMiddleware,
  orderController.getSingleOrder
);

router.put(
  "/orders/:id/cancel",
  authMiddleware,
  orderController.cancelOrder
);

module.exports = router;