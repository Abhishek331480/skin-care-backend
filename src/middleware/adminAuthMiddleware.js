const jwt = require("jsonwebtoken");
const userModel = require("../models/user.model");

const adminAuthMiddleware = async (req, res, next) => {
  try {
    const token = req.cookies.adminToken;

    if (!token) {
      return res.status(401).json({
        message: "Admin token missing",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await userModel.findById(decoded.id).select("-password");

    if (!user || user.role !== "admin") {
      return res.status(403).json({
        message: "Admin access denied",
      });
    }

    req.user = user;

    next();
  } catch (error) {
    return res.status(401).json({
      message: "Invalid admin token",
    });
  }
};

module.exports = adminAuthMiddleware;