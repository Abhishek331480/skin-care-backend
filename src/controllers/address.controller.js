const addressModel = require("../models/address.model");

const getMyAddresses = async (req, res) => {
  try {
    const addresses = await addressModel
      .find({ user: req.user._id })
      .sort({ isDefault: -1, createdAt: -1 });

    return res.status(200).json({
      message: "Addresses fetched successfully",
      addresses,
    });
  } catch (error) {
    console.log("GET ADDRESSES ERROR:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

const addAddress = async (req, res) => {
  try {
    const { fullName, phone, address, city, state, pincode, isDefault } =
      req.body;

    if (!fullName || !phone || !address || !city || !state || !pincode) {
      return res.status(400).json({
        message: "All address fields are required",
      });
    }

    if (isDefault) {
      await addressModel.updateMany(
        { user: req.user._id },
        { isDefault: false }
      );
    }

    const newAddress = await addressModel.create({
      user: req.user._id,
      fullName,
      phone,
      address,
      city,
      state,
      pincode,
      isDefault: isDefault || false,
    });

    return res.status(201).json({
      message: "Address added successfully",
      address: newAddress,
    });
  } catch (error) {
    console.log("ADD ADDRESS ERROR:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

const updateAddress = async (req, res) => {
  try {
    const { id } = req.params;

    if (req.body.isDefault) {
      await addressModel.updateMany(
        { user: req.user._id },
        { isDefault: false }
      );
    }

    const address = await addressModel.findOneAndUpdate(
      { _id: id, user: req.user._id },
      req.body,
      { returnDocument: "after" }
    );

    if (!address) {
      return res.status(404).json({ message: "Address not found" });
    }

    return res.status(200).json({
      message: "Address updated successfully",
      address,
    });
  } catch (error) {
    console.log("UPDATE ADDRESS ERROR:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

const deleteAddress = async (req, res) => {
  try {
    const { id } = req.params;

    const address = await addressModel.findOneAndDelete({
      _id: id,
      user: req.user._id,
    });

    if (!address) {
      return res.status(404).json({ message: "Address not found" });
    }

    return res.status(200).json({
      message: "Address deleted successfully",
    });
  } catch (error) {
    console.log("DELETE ADDRESS ERROR:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  getMyAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
};