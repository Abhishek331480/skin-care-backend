const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    description: {
      type: String,
      required: true,
    },

    price: {
      type: Number,
      required: true,
    },

    category: {
      type: String,
      required: true,
    },

    brand: {
      type: String,
      default: "SkinCare",
    },

    stock: {
  type: Number,
  default: 0,
},

isBestSeller: {
  type: Boolean,
  default: false,
},

totalSold: {
  type: Number,
  default: 0,
},

    variants: [
  {
    size: {
      type: String,
      required: true,
    },

    price: {
      type: Number,
      required: true,
    },

    stock: {
      type: Number,
      default: 0,
    },
    sku: {
      type: String,
    },
  },
],

    images: [
      {
        type: String,
      },
    ],

    reviews: [
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },

    username: {
      type: String,
      required: true,
    },

    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },

    comment: {
      type: String,
      required: true,
    },
  },
],

numReviews: {
  type: Number,
  default: 0,
},

    rating: {
      type: Number,
      default: 0,
    },

    skinType: {
      type: String,
    },

    ingredients: [
      {
        type: String,
      },
    ],

    benefits: [
      {
        type: String,
      },
    ],
  },

  {
    timestamps: true,
  }
);

const productModel = mongoose.model(
  "product",
  productSchema
);

module.exports = productModel;