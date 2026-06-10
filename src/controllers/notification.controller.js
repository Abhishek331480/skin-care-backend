const Notification = require("../models/notification.model");

const getMyNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({
      user: req.user._id,
    }).sort({ createdAt: -1 });

    const unreadCount = await Notification.countDocuments({
      user: req.user._id,
      isRead: false,
    });

    return res.status(200).json({
      message: "Notifications fetched successfully",
      notifications,
      unreadCount,
    });
  } catch (error) {
    console.log("GET NOTIFICATIONS ERROR:", error);

    return res.status(500).json({
      message: "Server error",
    });
  }
};

const markNotificationRead = async (req, res) => {
  try {
    const { id } = req.params;

    const notification = await Notification.findOneAndUpdate(
      {
        _id: id,
        user: req.user._id,
      },
      {
        isRead: true,
      },
      {
        returnDocument: "after",
      }
    );

    if (!notification) {
      return res.status(404).json({
        message: "Notification not found",
      });
    }

    return res.status(200).json({
      message: "Notification marked as read",
      notification,
    });
  } catch (error) {
    console.log("MARK NOTIFICATION ERROR:", error);

    return res.status(500).json({
      message: "Server error",
    });
  }
};

const markAllNotificationsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      {
        user: req.user._id,
        isRead: false,
      },
      {
        isRead: true,
      }
    );

    return res.status(200).json({
      message: "All notifications marked as read",
    });
  } catch (error) {
    console.log("MARK ALL NOTIFICATIONS ERROR:", error);

    return res.status(500).json({
      message: "Server error",
    });
  }
};

const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;

    const notification = await Notification.findOneAndDelete({
      _id: id,
      user: req.user._id,
    });

    if (!notification) {
      return res.status(404).json({
        message: "Notification not found",
      });
    }

    return res.status(200).json({
      message: "Notification deleted successfully",
    });
  } catch (error) {
    console.log("DELETE NOTIFICATION ERROR:", error);

    return res.status(500).json({
      message: "Server error",
    });
  }
};

const deleteAllNotifications = async (req, res) => {
  try {
    await Notification.deleteMany({
      user: req.user._id,
    });

    return res.status(200).json({
      message: "All notifications deleted successfully",
    });
  } catch (error) {
    console.log("DELETE ALL NOTIFICATIONS ERROR:", error);

    return res.status(500).json({
      message: "Server error",
    });
  }
};

module.exports = {
  getMyNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
  deleteAllNotifications
};