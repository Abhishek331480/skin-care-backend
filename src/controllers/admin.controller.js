const productModel = require("../models/product.model");
const orderModel = require("../models/order.model");
const userModel = require("../models/user.model");

const getDashboardStats = async (req, res) => {
  try {
    const totalProducts = await productModel.countDocuments();

    const totalOrders = await orderModel.countDocuments();

    const totalUsers = await userModel.countDocuments();

    const pendingOrders = await orderModel.countDocuments({
      orderStatus: "PLACED",
    });

    const revenueData = await orderModel.aggregate([
      {
        $group: {
          _id: null,
          totalRevenue: {
            $sum: "$totalAmount",
          },
        },
      },
    ]);

    const monthlyRevenue = await orderModel.aggregate([
      {
        $group: {
          _id: {
            month: { $month: "$createdAt" },
            year: { $year: "$createdAt" },
          },
          revenue: { $sum: "$totalAmount" },
          orders: { $sum: 1 },
        },
      },
      {
        $sort: {
          "_id.year": 1,
          "_id.month": 1,
        },
      },
    ]);

    const topSellingProducts = await orderModel.aggregate([
  { $unwind: "$items" },

  {
    $group: {
      _id: "$items.product",
      name: { $first: "$items.name" },
      totalSold: { $sum: "$items.quantity" },
      revenue: {
        $sum: {
          $multiply: ["$items.price", "$items.quantity"],
        },
      },
    },
  },

  { $sort: { totalSold: -1 } },

  { $limit: 5 },
]);


    const recentOrders = await orderModel
      .find()
      .populate("user", "username email")
      .sort({ createdAt: -1 })
      .limit(5);

    const lowStockProducts = await productModel
  .find({ stock: { $lte: 5 } })
  .select("name stock images category")
  .sort({ stock: 1 })
  .limit(5);

    const totalRevenue = revenueData[0]?.totalRevenue || 0;

    return res.status(200).json({
      message: "Dashboard stats fetched successfully",
      totalProducts,
      totalOrders,
      totalUsers,
      pendingOrders,
      totalRevenue,
      recentOrders,
      monthlyRevenue,
      topSellingProducts,
      lowStockProducts,
    });
  } catch (error) {
    console.log("DASHBOARD ERROR:", error);

    return res.status(500).json({
      message: "Server error",
    });
  }
};


module.exports = {
  getDashboardStats,
};