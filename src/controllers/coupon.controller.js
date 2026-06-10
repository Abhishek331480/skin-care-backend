const couponModel = require("../models/coupon.model");
const userModel = require("../models/user.model");
const createNotification = require("../utils/createNotification");

const validateCoupon = async (req, res) => {
  try {
    const { code, totalAmount } = req.body;

    if (!code) {
      return res.status(400).json({
        message: "Coupon code is required",
      });
    }

    const coupon = await couponModel.findOne({
      code: code.toUpperCase(),
      isActive: true,
    });

    if (!coupon) {
      return res.status(404).json({
        message: "Invalid coupon code",
      });
    }

    if (coupon.expiresAt && coupon.expiresAt < new Date()) {
      return res.status(400).json({
        message: "Coupon has expired",
      });
    }

    if (totalAmount < coupon.minOrderAmount) {
      return res.status(400).json({
        message: `Minimum order amount should be ₹${coupon.minOrderAmount}`,
      });
    }

    let discountAmount = 0;

    if (coupon.discountType === "PERCENTAGE") {
      discountAmount = (totalAmount * coupon.discountValue) / 100;
    }

    if (coupon.discountType === "FIXED") {
      discountAmount = coupon.discountValue;
    }

    const finalAmount = totalAmount - discountAmount;

    return res.status(200).json({
      message: "Coupon applied successfully",
      couponCode: coupon.code,
      discountAmount,
      finalAmount,
    });
  } catch (error) {
    console.log("VALIDATE COUPON ERROR:", error);

    return res.status(500).json({
      message: "Server error",
    });
  }
};

const getAllCoupons = async (req, res) => {
  try {
    const coupons = await couponModel
  .find({ user: null })
  .sort({ createdAt: -1 });

    return res.status(200).json({
      message: "Coupons fetched successfully",
      coupons,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error",
    });
  }
};

const createCoupon = async (req, res) => {
  try {
    const {
      code,
      discountType,
      discountValue,
      minOrderAmount,
      expiresAt,
    } = req.body;

    const coupon = await couponModel.create({
      code: code.toUpperCase(),
      discountType,
      discountValue,
      minOrderAmount,
      expiresAt,
    });

    const users = await userModel.find({ role: "user" }).select("_id");

await Promise.all(
  users.map((user) =>
    createNotification({
      userId: user._id,
      title: "New Coupon Available",
      message: `Use coupon ${coupon.code} and get ${
        coupon.discountType === "PERCENTAGE"
          ? `${coupon.discountValue}% OFF`
          : `₹${coupon.discountValue} OFF`
      } on your next order.`,
      type: "COUPON",
    })
  )
);

    return res.status(201).json({
      message: "Coupon created successfully",
      coupon,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Server error",
    });
  }
};

const updateCoupon = async (req, res) => {
  try {
    const { id } = req.params;

    const coupon = await couponModel.findByIdAndUpdate(
      id,
      req.body,
      { returnDocument: "after" }
    );

    return res.status(200).json({
      message: "Coupon updated successfully",
      coupon,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error",
    });
  }
};

const deleteCoupon = async (req, res) => {
  try {
    const { id } = req.params;

    await couponModel.findByIdAndDelete(id);

    return res.status(200).json({
      message: "Coupon deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error",
    });
  }
};

const getAvailableCoupons = async (req, res) => {
  try {
    const coupons = await couponModel.find({
  isActive: true,

  $and: [
    {
      $or: [
        { expiresAt: { $gte: new Date() } },
        { expiresAt: null },
      ],
    },

    {
      $or: [
        { user: null },
        { user: req.user._id },
      ],
    },
  ],
})
.sort({ createdAt: -1 });

    return res.status(200).json({
      message: "Available coupons fetched successfully",
      coupons,
    });
  } catch (error) {
    console.log("GET AVAILABLE COUPONS ERROR:", error);

    return res.status(500).json({
      message: "Server error",
    });
  }
};


module.exports = {
  validateCoupon,
  getAllCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  getAvailableCoupons
};