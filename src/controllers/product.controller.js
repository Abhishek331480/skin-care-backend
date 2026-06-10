const productModel = require("../models/product.model");
const imagekit = require("../service/storage.service");
const upload = require("../middleware/upload");
const orderModel = require("../models/order.model");

//create product
const createProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      category,
      brand,
      stock,
      images,
      rating,
      reviews,
      skinType,
      ingredients,
      benefits,
      variants,
      isBestSeller,
    } = req.body;

    //     console.log("REQ BODY:", req.body);
    // console.log("VARIANTS:", variants);

    if (!name || !description || !price || !category) {
      return res.status(400).json({
        message: "Fill all required fields",
      });
    }

    let imageUrls = [];

    let parsedVariants = [];

    if (variants) {
      parsedVariants =
        typeof variants === "string" ? JSON.parse(variants) : variants;
    }

    if (req.files && req.files.length > 0) {
      const uploadedImages = await Promise.all(
        req.files.map((file) =>
          imagekit.upload({
            file: file.buffer,
            fileName: file.originalname,
            folder: "/skincare-products",
          }),
        ),
      );

      imageUrls = uploadedImages.map((img) => img.url);
    }

    const validVariants = parsedVariants.filter((v) => v.size && v.price);

    const finalPrice =
      validVariants.length > 0
        ? Math.min(...validVariants.map((v) => Number(v.price)))
        : Number(price);

    const finalStock =
      validVariants.length > 0
        ? validVariants.reduce((total, v) => total + Number(v.stock || 0), 0)
        : Number(stock);

    const newProduct = await productModel.create({
      name,
      description,
      price: finalPrice,
      stock: finalStock,
      category,
      brand,
      images: imageUrls,
      rating,
      reviews,
      skinType,
      ingredients: ingredients
        ? ingredients.split(",").map((item) => item.trim())
        : [],

      benefits: benefits ? benefits.split(",").map((item) => item.trim()) : [],
      variants: validVariants,
      isBestSeller: isBestSeller === "true" || isBestSeller === true,
    });

    return res.status(201).json({
      message: "Product created successfully",
      product: newProduct,
    });
  } catch (error) {
    console.log(error);
    console.log("CREATE PRODUCT ERROR:", error);
    return res.status(500).json({
      message: "Server error",
    });
  }
};

//get all product
const getProducts = async (req, res) => {
  try {
    const { search, category, skinType, page = 1, limit = 8 } = req.query;
    const query = {};
    const pageNumber = Number(page);
    const limitNumber = Number(limit);
    const skip = (pageNumber - 1) * limitNumber;
  
    if (category) {
      query.category = category;
    }

   if (skinType) {
  query.skinType = {
    $regex: new RegExp(`^${skinType}$`, "i"),
  };
}
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { category: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    const allProducts = await productModel
      .find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNumber);

    const totalProducts = await productModel.countDocuments(query);

    return res.status(200).json({
      message: "Products fetched successfully",
      products: allProducts,
      currentPage: pageNumber,
      totalPages: Math.ceil(totalProducts / limitNumber),
      totalProducts,
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      message: "Server error",
    });
  }
};

//get single product
const getSingleProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await productModel.findById(id);

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    return res.status(200).json({
      message: "Product fetched successfully",
      product,
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      message: "Server error",
    });
  }
};

// delete Product
const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedProduct = await productModel.findByIdAndDelete(id);

    if (!deletedProduct) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    return res.status(200).json({
      message: "Deleted successfully",
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      message: "Server error",
    });
  }
};

const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      name,
      description,
      price,
      category,
      stock,
      skinType,
      ingredients,
      benefits,
      variants,
      isBestSeller,
    } = req.body;

    console.log("IS BEST SELLER:", isBestSeller);
    console.log("BODY:", req.body);

    let imageUrls;

    if (req.files && req.files.length > 0) {
      const uploadedImages = await Promise.all(
        req.files.map((file) =>
          imagekit.upload({
            file: file.buffer,
            fileName: file.originalname,
            folder: "/skincare-products",
          }),
        ),
      );

      imageUrls = uploadedImages.map((img) => img.url);
    }

    let parsedVariants = [];

    if (variants) {
      parsedVariants =
        typeof variants === "string" ? JSON.parse(variants) : variants;
    }

    const validVariants = parsedVariants.filter((v) => v.size && v.price);

    const finalPrice =
      validVariants.length > 0
        ? Math.min(...validVariants.map((v) => Number(v.price)))
        : Number(price);

    const finalStock =
      validVariants.length > 0
        ? validVariants.reduce((total, v) => total + Number(v.stock || 0), 0)
        : Number(stock);

    const updateData = {
      name,
      description,
      price: finalPrice,
      stock: finalStock,
      category,
      skinType,
      variants: validVariants,
      isBestSeller: isBestSeller === "true" || isBestSeller === true,
      ingredients: ingredients
        ? ingredients.split(",").map((item) => item.trim())
        : [],

      benefits: benefits ? benefits.split(",").map((item) => item.trim()) : [],
    };

    if (imageUrls) {
      updateData.images = imageUrls;
    }

    const updatedProduct = await productModel.findByIdAndUpdate(
      id,
      updateData,
      { new: true },
    );

    if (!updatedProduct) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    return res.status(200).json({
      message: "Product updated successfully",
      product: updatedProduct,
    });
  } catch (error) {
    console.log("UPDATE PRODUCT ERROR:", error);

    return res.status(500).json({
      message: "Server error",
    });
  }
};

// rating
const addProductReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const { id } = req.params;

    if (!rating || !comment) {
      return res.status(400).json({
        message: "Rating and comment are required",
      });
    }

    // only purchased user can review and rating
    const product = await productModel.findById(id);
    const hasPurchased = await orderModel.findOne({
      user: req.user._id,

      orderStatus: "DELIVERED",

      "items.product": id,
    });

    if (!hasPurchased) {
      return res.status(400).json({
        message: "You can review only purchased products",
      });
    }

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    if (!Array.isArray(product.reviews)) {
      product.reviews = [];
    }

    const alreadyReviewed = product.reviews.find(
      (review) => review.user.toString() === req.user._id.toString(),
    );

    if (alreadyReviewed) {
      return res.status(400).json({
        message: "You already reviewed this product",
      });
    }

    const review = {
      user: req.user._id,
      username: req.user.username,
      rating: Number(rating),
      comment,
    };

    product.reviews.push(review);

    product.numReviews = product.reviews.length;

    product.rating =
      product.reviews.reduce((total, item) => total + item.rating, 0) /
      product.reviews.length;

    await product.save();

    return res.status(201).json({
      message: "Review added successfully",
      product,
    });
  } catch (error) {
    console.log("ADD REVIEW ERROR:", error);

    return res.status(500).json({
      message: error.message || "Server error",
    });
  }
};

// best seller product
const getBestSellerProducts = async (req, res) => {
  try {
    const products = await productModel
      .find({
        $or: [{ isBestSeller: true }, { totalSold: { $gt: 5 } }],
      })
      .sort({
        isBestSeller: -1,
        totalSold: -1,
      })
      .limit(6);

    return res.status(200).json({
      message: "Best seller products fetched successfully",
      products,
    });
  } catch (error) {
    console.log("BEST SELLER ERROR:", error);

    return res.status(500).json({
      message: "Server error",
    });
  }
};

const getTopSellingProducts = async (req, res) => {
  try {
    const products = await productModel
      .find({ totalSold: { $gt: 5 } })
      .sort({ totalSold: -1 })
      .limit(8);

    return res.status(200).json({
      message: "Top selling products fetched successfully",
      products,
    });
  } catch (error) {
    console.log("TOP SELLING PRODUCTS ERROR:", error);

    return res.status(500).json({
      message: "Server error",
    });
  }
};

module.exports = {
  createProduct,
  getProducts,
  getSingleProduct,
  updateProduct,
  deleteProduct,
  addProductReview,
  getBestSellerProducts,getTopSellingProducts
};
