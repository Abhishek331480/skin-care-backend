const express = require('express');
const router = express.Router();


const authController = require('../controllers/auth.controller');
const AdminAuthMiddleware = require('../middleware/adminAuthMiddleware');

// Register route
router.post('/register', authController.register);

// Login route
router.post('/login', authController.login);

// Logout route
router.post("/logout", authController.logout);

// forgot password
router.post(
  "/forgot-password",
  authController.forgotPassword
);

// reset password
router.post(
  "/reset-password/:token",
  authController.resetPassword
);

// verify email
router.get("/verify-email/:token", authController.verifyEmail);

// resend verify link
router.post(
  "/resend-verification",
  authController.resendVerificationEmail
);

// admin login
router.post("/admin/login", authController.adminLogin);

// admin logout
router.post("/admin/logout", authController.adminLogout);


router.get(
  "/admin/profile",
  AdminAuthMiddleware,
  authController.getAdminProfile
);

module.exports = router;