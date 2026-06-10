const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
  getMyNotifications,
  markNotificationRead,
  markAllNotificationsRead, deleteNotification,deleteAllNotifications
} = require("../controllers/notification.controller");

router.get("/notifications", authMiddleware, getMyNotifications);

router.put(
  "/notifications/:id/read",
  authMiddleware,
  markNotificationRead
);

router.put(
  "/notifications/read-all",
  authMiddleware,
  markAllNotificationsRead
);

router.delete(
  "/notifications/:id",
  authMiddleware,
  deleteNotification
);

router.delete(
  "/notifications",
  authMiddleware,
  deleteAllNotifications
);

module.exports = router;