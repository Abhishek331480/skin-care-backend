// const express = require("express");
// const router = express.Router();
// const userModel = require("../models/user.model");

// const authMiddleware = require("../middleware/authMiddleware");

// router.get("/profile", authMiddleware, async (req, res) => {
//   try {
//     const user = await userModel
//       .findById(req.user.id)
//       .select("-password");

//     if (!user) {
//       return res.status(404).json({
//         message: "User not found",
//       });
//     }

//     res.status(200).json({
//       message: "Profile fetched successfully",
//       user,
//     });
//   } catch (error) {
//     res.status(500).json({
//       message: "Server error",
//     });
//   }
// });

// module.exports = router;

const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const {
  getProfile,
  updateProfile,
  changePassword,
} = require("../controllers/user.controller");

router.get("/profile", authMiddleware, getProfile);

router.put("/profile", authMiddleware, updateProfile);

router.put("/change-password", authMiddleware, changePassword);

module.exports = router;