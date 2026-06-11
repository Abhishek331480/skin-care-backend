// const express = require("express");
// const cookieParser = require("cookie-parser");
// const userRoutes = require("./routes/userRoutes");
// const cors = require("cors");
// const app = express();
// const orderRoutes = require("./routes/orderRoutes");
// const adminRoutes = require("./routes/adminRoutes");
// const couponRoutes = require("./routes/coupon.routes");
// const paymentRoutes = require("./routes/payment.routes");
// const notificationRoutes = require("./routes/notification.routes");
// const addressRoutes = require("./routes/address.routes");
// const wishlistRoutes = require("./routes/wishlist.routes");
// const cartRoutes = require("./routes/cart.routes");


// app.use(express.json());
// app.use(cookieParser());
// app.use(cors({
//   origin: "http://localhost:5173",
//   credentials: true,
// }));

// // Admin Middlewares

// app.use("/api/auth", require("./routes/auth.routes"));
// app.use("/api/user", userRoutes);
// app.use("/api", require("../src/routes/productRoutes"));
// app.use("/api", orderRoutes);
// app.use("/api", adminRoutes);
// app.use("/api", couponRoutes);
// app.use("/api", paymentRoutes);
// app.use("/api", notificationRoutes);
// app.use("/api", addressRoutes);
// app.use("/api", wishlistRoutes);
// app.use("/api", cartRoutes);

// module.exports = app;


const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");


const userRoutes = require("./routes/userRoutes");
const orderRoutes = require("./routes/orderRoutes");
const adminRoutes = require("./routes/adminRoutes");
const couponRoutes = require("./routes/coupon.routes");
const paymentRoutes = require("./routes/payment.routes");
const notificationRoutes = require("./routes/notification.routes");
const addressRoutes = require("./routes/address.routes");
const wishlistRoutes = require("./routes/wishlist.routes");
const cartRoutes = require("./routes/cart.routes");
const aiRoutes = require("./routes/ai.routes");

// ab6ac45665d3f5aeb182dd9e1a392707   demomailtrap.co
const app = express();
app.set("trust proxy", 1);
// Security middlewares
app.use(helmet());

// app.use(
//   cors({
//     origin: "http://localhost:5173",
//     credentials: true,
//   })
// );
const allowedOrigins = [
  "http://localhost:5173",
  process.env.FRONTEND_URL,
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

app.use(cookieParser());

app.use(express.json({ limit: "10kb" }));


const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    message: "Too many requests, please try again later",
  },
});

app.use(globalLimiter);

// Auth rate limiter
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: {
    message: "Too many login attempts. Try again later.",
  },
});

// Routes
app.use("/api/auth", require("./routes/auth.routes"));
app.use("/api/user", userRoutes);
app.use("/api", require("../src/routes/productRoutes"));
app.use("/api", orderRoutes);
app.use("/api", adminRoutes);
app.use("/api", couponRoutes);
app.use("/api", paymentRoutes);
app.use("/api", notificationRoutes);
app.use("/api", addressRoutes);
app.use("/api", wishlistRoutes);
app.use("/api", cartRoutes);
app.use("/api", aiRoutes);


module.exports = app;