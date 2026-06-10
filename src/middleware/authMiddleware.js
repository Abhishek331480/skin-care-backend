const jwt = require("jsonwebtoken");
const userModel = require("../models/user.model");


const authMiddleware = async (req, res, next) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      console.log("TOKEN:", req.cookies?.token);
      return res.status(401).json({
        message: "No token provided",
        
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

const user = await userModel.findById(decoded.id);

req.user = user;

    next();
  } catch (error) {
    return res.status(401).json({
      message: "Invalid or expired token",
    });
  }
};

module.exports = authMiddleware;