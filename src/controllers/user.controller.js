const bcrypt = require("bcrypt");

const getProfile = async (req, res) => {
  try {
    const userData = {
      _id: req.user._id,
      username: req.user.username,
      email: req.user.email,
      role: req.user.role,
      isEmailVerified: req.user.isEmailVerified,
      createdAt: req.user.createdAt,
      referralCode: req.user.referralCode,
      totalReferrals: req.user.totalReferrals,
      welcomeOffer: req.user.welcomeOffer,
    };

    return res.status(200).json({
      message: "Profile fetched successfully",
      user: userData,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error",
    });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { username } = req.body;

    if (!username) {
      return res.status(400).json({
        message: "Username is required",
      });
    }

    req.user.username = username;

    await req.user.save();

    const userData = {
      _id: req.user._id,
      username: req.user.username,
      email: req.user.email,
      role: req.user.role,
      isEmailVerified: req.user.isEmailVerified,
      createdAt: req.user.createdAt,
    };

    return res.status(200).json({
      message: "Profile updated successfully",
      user: userData,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error",
    });
  }
};

const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({
        message: "Old password and new password are required",
      });
    }

    const isMatch = await bcrypt.compare(oldPassword, req.user.password);

    if (!isMatch) {
      return res.status(400).json({
        message: "Old password is incorrect",
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    req.user.password = hashedPassword;

    await req.user.save();

    return res.status(200).json({
      message: "Password changed successfully",
    });
  } catch (error) {
    console.log("CHANGE PASSWORD ERROR:", error);

    return res.status(500).json({
      message: "Server error",
    });
  }
};

module.exports = {
  getProfile,
  updateProfile,changePassword
};
