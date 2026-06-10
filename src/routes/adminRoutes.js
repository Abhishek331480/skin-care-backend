const express = require("express");
const router = express.Router();
const adminController = require("../controllers/admin.controller");
const AdminAuthMiddleware = require("../middleware/adminAuthMiddleware");

router.get(
  "/admin/dashboard",
  AdminAuthMiddleware,
  adminController.getDashboardStats
);


module.exports = router;