const orderModel = require("../models/order.model");
const productModel = require("../models/product.model");
const PDFDocument = require("pdfkit");
const createNotification = require("../utils/createNotification");
const sendEmail = require("../service/email.service");
const userModel = require("../models/user.model");

const createOrder = async (req, res) => {
  try {
    const {
      items,
      shippingAddress,
      totalAmount,
      discountAmount = 0,
      couponCode,
      paymentStatus,
    } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({
        message: "Order items are required",
      });
    }

    if (!shippingAddress) {
      return res.status(400).json({
        message: "Shipping address is required",
      });
    }

    // 1. Stock check
    for (const item of items) {
      const product = await productModel.findById(item.product);

      if (!product) {
        return res.status(404).json({
          message: `${item.name} product not found`,
        });
      }

      if (item.variant?.size) {
        const variant = product.variants.find(
          (v) => v.size === item.variant.size,
        );

        if (!variant) {
          return res.status(400).json({
            message: `Variant not found for ${product.name}`,
          });
        }

        if (variant.stock < item.quantity) {
          return res.status(400).json({
            message: `${product.name} (${variant.size}) has only ${variant.stock} items left`,
          });
        }
      } else {
        if (product.stock < item.quantity) {
          return res.status(400).json({
            message: `${product.name} has only ${product.stock} items left`,
          });
        }
      }
    }
   
    //  total calculation and discount validation can be added here as well
    let backendSubtotal = 0;

for (const item of items) {
  const product = await productModel.findById(item.product);

  let itemPrice = product.price;

  if (item.variant?.size) {
    const variant = product.variants.find(
      (v) => v.size === item.variant.size
    );

    itemPrice = variant.price;
  }

  backendSubtotal += itemPrice * item.quantity;

  item.price = itemPrice;
}

const user = await userModel.findById(req.user._id);

let welcomeDiscount = 0;

const isWelcomeOfferActive =
  user?.welcomeOffer &&
  user.welcomeOffer.isUsed === false &&
  user.welcomeOffer.expiresAt &&
  new Date(user.welcomeOffer.expiresAt) > new Date();

if (isWelcomeOfferActive) {
  welcomeDiscount = Math.round(
    (backendSubtotal *
      user.welcomeOffer.discountPercent) /
      100
  );
}

const finalTotal =
  backendSubtotal -
  welcomeDiscount -
  Number(discountAmount || 0);

    // 2. Stock reduce
    for (const item of items) {
      const product = await productModel.findById(item.product);

      if (item.variant?.size) {
        const variant = product.variants.find(
          (v) => v.size === item.variant.size,
        );

        variant.stock -= item.quantity;
        await product.save();
      } else {
        product.stock -= item.quantity;
      }
      product.totalSold += item.quantity;
      await product.save();
    }

    // 3. Create order
    const order = await orderModel.create({
      user: req.user._id,
      items,
      shippingAddress,
      totalAmount: finalTotal,
discountAmount:
  Number(discountAmount || 0) + welcomeDiscount,
      couponCode,
      paymentStatus: paymentStatus || "PENDING",
    });

    if (isWelcomeOfferActive) {
  user.welcomeOffer.isUsed = true;
  await user.save();
}

    const createNotification = require("../utils/createNotification");

    await createNotification({
      userId: req.user._id,
      title: "Order Placed",
      message: `Your order #${order._id} has been placed successfully.`,
      type: "ORDER",
    });

    await sendEmail({
      to: req.user.email,
      subject: "Order Placed Successfully - SkinCare Store",
      html: `
    <h2>Order Confirmed 🎉</h2>

    <p>Hello ${req.user.username},</p>

    <p>Your order <b>#${order._id}</b> has been placed successfully.</p>

    <p>Total Amount: <b>₹${order.totalAmount}</b></p>

    <p>Thank you for shopping with SkinCare Store.</p>
  `,
    });

    return res.status(201).json({
      message: "Order placed successfully",
      order,
    });
  } catch (error) {
    console.log("CREATE ORDER ERROR:", error);

    return res.status(500).json({
      message: "Server error",
    });
  }
};

const getMyOrders = async (req, res) => {
  try {
    const orders = await orderModel
      .find({ user: req.user.id })
      .sort({ createdAt: -1 });

    console.log("USER ID:", req.user.id);
    console.log("ORDERS:", orders);

    return res.status(200).json({
      message: "Orders fetched successfully",
      orders,
    });
  } catch (error) {
    console.log("GET MY ORDERS ERROR:", error);

    return res.status(500).json({
      message: "Server error",
    });
  }
};

const getAllOrders = async (req, res) => {
  try {
    const orders = await orderModel
      .find()
      .populate("user", "username email")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      message: "All orders fetched successfully",
      orders,
    });
  } catch (error) {
    console.log("GET ALL ORDERS ERROR:", error);

    return res.status(500).json({
      message: "Server error",
    });
  }
};

// const updateOrderStatus = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { orderStatus } = req.body;

//     const order = await orderModel
//       .findById(id)
//       .populate("user", "username email");

//     order.orderStatus = orderStatus;

//     await order.save();

//     if (!order) {
//       return res.status(404).json({
//         message: "Order not found",
//       });
//     }
//     const user = await userModel.findById(order.user);

//     await createNotification({
//       userId: order.user,
//       title: `Order Status ${orderStatus}`,
//       message: `Your order #${order._id} is now ${order.orderStatus}.`,
//       type: "ORDER",
//     });

//       res.status(200).json({
//       message: "Order status updated successfully",
//       order,
//     });
//      sendEmail({
//       to: user.email,
//       subject: `Order ${order.orderStatus} - SkinCare Store`,
//       html: `
//     <h2>Order Status Updated</h2>

//     <p>Hello ${user.username},</p>

//     <p>Your order <b>#${order._id}</b> is now:</p>

//     <h3>${order.orderStatus}</h3>
//   `,
//     });

//   } catch (error) {
//     console.log("UPDATE ORDER STATUS ERROR:", error);

//     return res.status(500).json({
//       message: "Server error",
//     });
//   }
// };

const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { orderStatus } = req.body;

    const order = await orderModel
      .findById(id)
      .populate("user", "username email");

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    order.orderStatus = orderStatus;

    await order.save();

    await createNotification({
      userId: order.user._id,
      title: `Order Status ${orderStatus}`,
      message: `Your order #${order._id} is now ${order.orderStatus}.`,
      type: "ORDER",
    });

    res.status(200).json({
      message: "Order status updated successfully",
      order,
    });

    sendEmail({
      to: order.user.email,
      subject: `Order ${order.orderStatus} - SkinCare Store`,
      html: `
        <h2>Order Status Updated</h2>
        <p>Hello ${order.user.username},</p>
        <p>Your order <b>#${order._id}</b> is now:</p>
        <h3>${order.orderStatus}</h3>
      `,
    }).catch((error) => {
      console.log("ORDER STATUS EMAIL ERROR:", error);
    });
  } catch (error) {
    console.log("UPDATE ORDER STATUS ERROR:", error);

    return res.status(500).json({
      message: "Server error",
    });
  }
};

const getOrderInvoicePDF = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await orderModel
      .findById(id)
      .populate("user", "username email");

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    const doc = new PDFDocument({ margin: 50 });

    res.setHeader("Content-Type", "application/pdf");

    res.setHeader(
      "Content-Disposition",
      `inline; filename=invoice-${order._id}.pdf`,
    );

    doc.pipe(res);

    // heading
    doc.fontSize(24).text("SkinCare Store", {
      align: "center",
    });

    doc.moveDown();

    doc.fontSize(18).text("Order Invoice", {
      align: "center",
    });

    doc.moveDown(2);

    // customer
    doc.fontSize(14).text(`Order ID: ${order._id}`);
    doc.text(`Customer: ${order.user.username}`);
    doc.text(`Email: ${order.user.email}`);

    doc.moveDown();

    // shipping
    doc.fontSize(16).text("Shipping Address");

    doc.fontSize(13).text(order.shippingAddress.fullName);

    doc.text(order.shippingAddress.phone);

    doc.text(order.shippingAddress.address);

    doc.text(`${order.shippingAddress.city}, ${order.shippingAddress.state}`);

    doc.text(order.shippingAddress.pincode);

    doc.moveDown(2);

    // items
    doc.fontSize(16).text("Order Items");

    order.items.forEach((item, index) => {
      doc.moveDown();

      doc.fontSize(13).text(`${index + 1}. ${item.name}`);

      doc.text(`Price: ₹${item.price}`);

      doc.text(`Quantity: ${item.quantity}`);

      doc.text(`Total: ₹${item.price * item.quantity}`);
    });

    doc.moveDown(2);

    // payment
    doc.fontSize(16).text("Payment Details");

    doc.fontSize(13).text(`Payment Status: ${order.paymentStatus}`);

    doc.text(`Order Status: ${order.orderStatus}`);

    if (order.discountAmount > 0) {
      doc.text(`Discount: ₹${order.discountAmount}`);
    }

    doc.moveDown();

    doc.fontSize(18).text(`Grand Total: ₹${order.totalAmount}`, {
      align: "right",
    });

    doc.end();
  } catch (error) {
    console.log("INVOICE PDF ERROR:", error);

    return res.status(500).json({
      message: "Failed to generate invoice",
    });
  }
};

const getSingleOrder = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await orderModel
      .findById(id)
      .populate("user", "username email");

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    if (
      order.user._id.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        message: "Not authorized to view this order",
      });
    }

    return res.status(200).json({
      message: "Order fetched successfully",
      order,
    });
  } catch (error) {
    console.log("GET SINGLE ORDER ERROR:", error);

    return res.status(500).json({
      message: "Server error",
    });
  }
};

// const cancelOrder = async (req, res) => {
//   try {
//     const { id } = req.params;

//     const order = await orderModel.findById(id);

//     if (!order) {
//       return res.status(404).json({
//         message: "Order not found",
//       });
//     }

//     if (order.user.toString() !== req.user._id.toString()) {
//       return res.status(403).json({
//         message: "Not authorized",
//       });
//     }

//     if (
//       order.orderStatus !== "PLACED" &&
//       order.orderStatus !== "PROCESSING"
//     ) {
//       return res.status(400).json({
//         message: "Order cannot be cancelled now",
//       });
//     }

//     order.orderStatus = "CANCELLED";

//     await order.save();

//     return res.status(200).json({
//       message: "Order cancelled successfully",
//       order,
//     });
//   } catch (error) {
//     console.log("CANCEL ORDER ERROR:", error);

//     return res.status(500).json({
//       message: "Server error",
//     });
//   }
// };

const cancelOrder = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await orderModel.findById(id);

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "Not authorized to cancel this order",
      });
    }

    if (!["PLACED", "PROCESSING"].includes(order.orderStatus)) {
      return res.status(400).json({
        message: "Order cannot be cancelled now",
      });
    }

    for (const item of order.items) {
      const product = await productModel.findById(item.product);

      if (item.variant?.size) {
        const variant = product.variants.find(
          (v) => v.size === item.variant.size,
        );

        if (variant) {
          variant.stock += item.quantity;
        }
      } else {
        product.stock += item.quantity;
      }

      product.totalSold = Math.max(0, product.totalSold - item.quantity);
      await product.save();
    }

    order.orderStatus = "CANCELLED";

    await order.save();

    await createNotification({
      userId: order.user,
      title: "Order Cancelled",
      message: `Your order #${order._id} has been cancelled successfully.`,
      type: "ORDER",
    });
    await sendEmail({
      to: req.user.email,
      subject: "Order Cancelled",
      html: `
    <h2>Order Cancelled</h2>

    <p>Your order <b>#${order._id}</b> has been cancelled successfully.</p>

    <p>If you have any questions, please contact support.</p>
  `,
    });

    return res.status(200).json({
      message: "Order cancelled successfully",
      order,
    });
  } catch (error) {
    console.log("CANCEL ORDER ERROR:", error);

    return res.status(500).json({
      message: "Server error",
    });
  }
};

module.exports = {
  createOrder,
  getMyOrders,
  getAllOrders,
  updateOrderStatus,
  getOrderInvoicePDF,
  getSingleOrder,
  cancelOrder,
};
