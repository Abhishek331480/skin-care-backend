const razorpay = require("../config/razorpay");
const crypto = require("crypto");

const createRazorpayOrder = async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount) {
      return res.status(400).json({
        message: "Amount is required",
      });
    }

    const options = {
      amount: Number(amount) * 100, // Razorpay paise me amount leta hai
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);

    return res.status(200).json({
      message: "Razorpay order created successfully",
      order,
      key: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.log("RAZORPAY ORDER ERROR:", error);

    return res.status(500).json({
      message: "Failed to create Razorpay order",
    });
  }
};

const verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    const sign = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSign = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(sign)
      .digest("hex");

    if (expectedSign !== razorpay_signature) {
      return res.status(400).json({
        message: "Invalid payment signature",
      });
    }

    return res.status(200).json({
      message: "Payment verified successfully",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Payment verification failed",
    });
  }
};

module.exports = {
  createRazorpayOrder,verifyPayment
};