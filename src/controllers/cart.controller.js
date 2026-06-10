const userModel = require("../models/user.model");

const getCart = async (req, res) => {
  try {
    const user = await userModel
      .findById(req.user._id)
      .populate("cart.product");

    return res.status(200).json({
      cart: user.cart,
    });
  } catch (error) {
    console.log("GET CART ERROR:", error);

    return res.status(500).json({
      message: "Server error",
    });
  }
};

const addToCart = async (req, res) => {
  try {
    const { productId, quantity, variant, cartKey } = req.body;

    const user = await userModel.findById(req.user._id);

    const existingItem = user.cart.find(
      (item) => item.cartKey === cartKey
    );

    if (existingItem) {
      existingItem.quantity += quantity || 1;
    } else {
      user.cart.push({
        product: productId,
        quantity: quantity || 1,
        variant,
        cartKey,
      });
    }

    await user.save();

    const updatedUser = await userModel
      .findById(req.user._id)
      .populate("cart.product");

    return res.status(200).json({
      message: "Added to cart",
      cart: updatedUser.cart,
    });
  } catch (error) {
    console.log("ADD CART ERROR:", error);

    return res.status(500).json({
      message: "Server error",
    });
  }
};

const removeFromCart = async (req, res) => {
  try {
    const { cartKey } = req.params;

    const user = await userModel.findById(req.user._id);

    user.cart = user.cart.filter(
      (item) => item.cartKey !== cartKey
    );

    await user.save();

    const updatedUser = await userModel
      .findById(req.user._id)
      .populate("cart.product");

    return res.status(200).json({
      message: "Removed from cart",
      cart: updatedUser.cart,
    });
  } catch (error) {
    console.log("REMOVE CART ERROR:", error);

    return res.status(500).json({
      message: "Server error",
    });
  }
};

const increaseCartQty = async (req, res) => {
  try {
    const { cartKey } = req.params;

    const user = await userModel.findById(req.user._id);

    const item = user.cart.find(
      (item) => item.cartKey === cartKey
    );

    if (!item) {
      return res.status(404).json({
        message: "Cart item not found",
      });
    }

    item.quantity += 1;

    await user.save();

    const updatedUser = await userModel
      .findById(req.user._id)
      .populate("cart.product");

    return res.status(200).json({
      message: "Quantity increased",
      cart: updatedUser.cart,
    });
  } catch (error) {
    console.log("INCREASE CART ERROR:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

const decreaseCartQty = async (req, res) => {
  try {
    const { cartKey } = req.params;

    const user = await userModel.findById(req.user._id);

    const item = user.cart.find(
      (item) => item.cartKey === cartKey
    );

    if (!item) {
      return res.status(404).json({
        message: "Cart item not found",
      });
    }

    if (item.quantity > 1) {
      item.quantity -= 1;
    }

    await user.save();

    const updatedUser = await userModel
      .findById(req.user._id)
      .populate("cart.product");

    return res.status(200).json({
      message: "Quantity decreased",
      cart: updatedUser.cart,
    });
  } catch (error) {
    console.log("DECREASE CART ERROR:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

const clearCart = async (req, res) => {
  try {
    const user = await userModel.findById(req.user._id);

    user.cart = [];

    await user.save();

    return res.status(200).json({
      message: "Cart cleared",
      cart: [],
    });
  } catch (error) {
    console.log("CLEAR CART ERROR:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  getCart,
  addToCart,
  removeFromCart,
  increaseCartQty,
  decreaseCartQty,
  clearCart,
};