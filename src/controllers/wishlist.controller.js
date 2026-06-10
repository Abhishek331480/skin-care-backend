const userModel = require("../models/user.model");

const getWishlist = async (req, res) => {
  try {
    const user = await userModel
      .findById(req.user._id)
      .populate("wishlist");

    return res.status(200).json({
      message: "Wishlist fetched successfully",
      wishlist: user.wishlist,
    });
  } catch (error) {
    console.log("GET WISHLIST ERROR:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

const toggleWishlist = async (req, res) => {
  try {
    const { productId } = req.params;

    const user = await userModel.findById(req.user._id);

    const alreadyExists = user.wishlist.some(
      (item) => item.toString() === productId
    );

    if (alreadyExists) {
      user.wishlist = user.wishlist.filter(
        (item) => item.toString() !== productId
      );

      await user.save();

      const updatedUser = await userModel
        .findById(req.user._id)
        .populate("wishlist");

      return res.status(200).json({
        message: "Removed from wishlist",
        wishlist: updatedUser.wishlist,
      });
    }

    user.wishlist.push(productId);

    await user.save();

    const updatedUser = await userModel
      .findById(req.user._id)
      .populate("wishlist");

    return res.status(200).json({
      message: "Added to wishlist",
      wishlist: updatedUser.wishlist,
    });
  } catch (error) {
    console.log("TOGGLE WISHLIST ERROR:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  getWishlist,
  toggleWishlist,
};