const Notification = require("../models/notification.model");

const createNotification = async ({
  userId,
  title,
  message,
  type = "SYSTEM",
}) => {
  try {
    await Notification.create({
      user: userId,
      title,
      message,
      type,
    });
  } catch (error) {
    console.log("NOTIFICATION ERROR:", error);
  }
};

module.exports = createNotification;