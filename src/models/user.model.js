const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: [true, "Email already registered"],
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Please fill a valid email address",
      ],
      index: true,
    },
    password: {
      type: String,
      required: true,
    },
    resetPasswordToken: {
      type: String,
    },

    resetPasswordExpire: {
      type: Date,
    },
     isEmailVerified: {
  type: Boolean,
  default: false,
},

emailVerificationToken: {
  type: String,
},
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    wishlist: [
  {
    type: mongoose.Schema.Types.ObjectId,
    ref: "product",
  },
],
cart: [
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "product",
      required: true,
    },

    quantity: {
      type: Number,
      default: 1,
    },

    variant: {
      size: String,
      price: Number,
      stock: Number,
      sku: String,
    },

    cartKey: {
      type: String,
      required: true,
    },
  },
],
referralCode: {
  type: String,
  unique: true,
},

referredBy: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "user",
},

totalReferrals: {
  type: Number,
  default: 0,
},
maxReferralRewards: {
  type: Number,
  default: 10,
},
welcomeOffer: {
  discountPercent: {
    type: Number,
    default: 20,
  },

  expiresAt: {
    type: Date,
  },

  isUsed: {
    type: Boolean,
    default: false,
  },
},
  },
  { timestamps: true },
);

const userModel = mongoose.model("user", userSchema);

module.exports = userModel;
