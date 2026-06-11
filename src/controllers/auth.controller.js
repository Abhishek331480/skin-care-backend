const userModel = require("../models/user.model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const sendEmail = require("../service/email.service");
const couponModel = require("../models/coupon.model");
const createNotification = require("../utils/createNotification");

const register = async (req,res)=>{
     const { username, email, password, referralCode } = req.body;
     
 const blockedDomains = [
  "mailinator.com",
  "tempmail.com",
  "10minutemail.com",
  "guerrillamail.com",
  "yopmail.com",
];

const emailDomain = email.split("@")[1]?.toLowerCase();

if (blockedDomains.includes(emailDomain)) {
  return res.status(400).json({
    message: "Temporary email addresses are not allowed",
  });
}

     if(!username || !email || !password){
        return res.status(400).json({ message: "All fields are required" });
     }

       const existingUser = await userModel.findOne({
        $or: [{ email }, { username }]
        });

       if(existingUser){
        return res.status(400).json({ message: "Already registered.." });
       }


      const hashedPassword =  await bcrypt.hashSync(password, 10);

   const generatedReferralCode =
  username.substring(0, 4).toUpperCase() +
  Date.now().toString().slice(-4);
     
      const newUser = await userModel.create({
        username,
        email,
        password: hashedPassword, referralCode: generatedReferralCode,

        welcomeOffer: {
  discountPercent: 20,
  expiresAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
  isUsed: false,
},
      });

    if (referralCode) {
  const referrer = await userModel.findOne({
    referralCode: referralCode.toUpperCase(),
  });

  if (!referrer) {
    return res.status(400).json({
      message: "Invalid referral code",
    });
  }

  newUser.referredBy = referrer._id;

  referrer.totalReferrals += 1;

  await referrer.save();
  await newUser.save();

  // Referrer Reward
 if (referrer.totalReferrals <= referrer.maxReferralRewards) {
  await couponModel.create({
    code: `REF${Math.floor(1000 + Math.random() * 9000)}`,
    user: referrer._id,
    discountType: "FIXED",
    discountValue: 100,
    minOrderAmount: 500,
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  });


  // New User Reward
  await couponModel.create({
    code: `WEL${Math.floor(
  1000 + Math.random() * 9000
)}`,
    user: newUser._id,
    discountType: "FIXED",
    discountValue: 50,
    minOrderAmount: 300,
    expiresAt: new Date(
      Date.now() + 30 * 24 * 60 * 60 * 1000
    ),
  });

 await createNotification({
    userId: referrer._id,
    title: "Referral Reward",
    message:
      "You earned a ₹100 coupon for referring a friend.",
    type: "COUPON",
  });

  await createNotification({
    userId: newUser._id,
    title: "Welcome Reward",
    message:
      "You received a ₹50 welcome coupon.",
    type: "COUPON",
  });

}
}

     const emailVerificationToken = crypto.randomBytes(32).toString("hex");

newUser.emailVerificationToken = emailVerificationToken;

await newUser.save();

const verifyUrl = `${process.env.FRONTEND_URL}/verify-email/${emailVerificationToken}`;

 sendEmail({
  to: newUser.email,
  subject: "Verify your SkinCare account",
  html: `
    <div style="font-family: Arial; padding: 20px;">
      <h2>Verify Your Email</h2>
      <p>Hello ${newUser.username},</p>
      <p>Click below to verify your account.</p>

      <a href="${verifyUrl}"
        style="display:inline-block; padding:12px 20px; background:#ec4899; color:white; text-decoration:none; border-radius:30px;">
        Verify Email
      </a>
    </div>
  `,
}).then((sent) => {
  if (!sent) {
    console.log("Verification email failed for:", email);
  }
});
 
       const token = jwt.sign({ id: newUser._id , role:newUser.role }, process.env.JWT_SECRET, { expiresIn: "1d" });
      //  res.cookie("token", token); // Set token in cookie
     res.cookie("token", token, {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite:
    process.env.NODE_ENV === "production"
      ? "none"
      : "lax",
  maxAge: 24 * 60 * 60 * 1000,
});
      newUser.password = undefined; // Hide password in response   
      return res.status(201).json({
  message: "Registered successfully. Please verify your email.",token
});
}

const login = async(req,res)=>{
     const { email, password } = req.body;

     if(!email || !password){
        return res.status(400).json({ message: "Email and password are required" });
     }
   
        const user = await userModel.findOne({ email });

        if(!user){
            return res.status(400).json({ message: "Invalid email or password" });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if(!isMatch){
            return res.status(400).json({ message: "Invalid email or password" });
        }
        
        if (!user.isEmailVerified) {
  return res.status(400).json({
    message: "Please verify your email first",
  });
}

         const token = jwt.sign({ id: user._id, role:user.role }, process.env.JWT_SECRET, { expiresIn: "1d" });
        //  res.cookie("token", token); // Set token in cookie
res.cookie("token", token, {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",maxAge: 24 * 60 * 60 * 1000,
});

        user.password = undefined; // Hide password in response
        const userData = {
  _id: user._id,
  username: user.username,
  email: user.email,
  role: user.role,
  isEmailVerified: user.isEmailVerified,
  createdAt: user.createdAt,
};
        res.status(200).json({ message: "Login successful", user:userData ,token});
}


// admin login
const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    const user = await userModel.findOne({ email });

    if (!user) {
      return res.status(400).json({
        message: "Invalid email or password",
      });
    }

    if (user.role !== "admin") {
      return res.status(403).json({
        message: "Only admin can login here",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({
        message: "Invalid email or password",
      });
    }

    const adminToken = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    // res.cookie("adminToken", adminToken, {
    //   httpOnly: true,
    //   sameSite: "lax",
    // });
    res.cookie("adminToken", adminToken, {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",maxAge: 24 * 60 * 60 * 1000,
});

    user.password = undefined;

    return res.status(200).json({
      message: "Admin login successful",
      user,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error",
    });
  }
};

// admin logout
const adminLogout = (req, res) => {
  res.clearCookie("adminToken", {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite:
    process.env.NODE_ENV === "production"
      ? "none"
      : "lax",
});

  return res.status(200).json({
    message: "Admin logged out successfully",
  });
};

// admin profile
const getAdminProfile = async (req, res) => {
  return res.status(200).json({
    message: "Admin profile fetched successfully",
    user: req.user,
  });
};

//logout

const logout = (req,res)=>{
     res.clearCookie("token", {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
});
     res.status(200).json({ message: "Logout successful" });
}  

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        message: "Email is required",
      });
    }

    const user = await userModel.findOne({ email });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpire = Date.now() + 15 * 60 * 1000;

    await user.save();

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

await sendEmail({
  to: user.email,
  subject: "Reset your SkinCare password",
  html: `
    <div style="font-family: Arial; padding: 20px;">
      <h2>Password Reset Request</h2>
      <p>Hello ${user.username},</p>
      <p>Click the button below to reset your password.</p>

      <a href="${resetUrl}"
        style="display:inline-block; padding:12px 20px; background:#ec4899; color:white; text-decoration:none; border-radius:30px;">
        Reset Password
      </a>

      <p style="margin-top:20px;">This link will expire in 15 minutes.</p>
    </div>
  `,
});

   return res.status(200).json({
  message: "Reset password link sent to your email",
});
  } catch (error) {
    console.log("FORGOT PASSWORD ERROR:", error);

    return res.status(500).json({
      message: "Server error",
    });
  }
};


// reset password
const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({
        message: "Password is required",
      });
    }

    const user = await userModel.findOne({
      resetPasswordToken: token,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        message: "Invalid or expired token",
      });
    }

    const bcrypt = require("bcrypt");

    const hashedPassword = await bcrypt.hash(password, 10);

    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    return res.status(200).json({
      message: "Password reset successful",
    });
  } catch (error) {
    console.log("RESET PASSWORD ERROR:", error);

    return res.status(500).json({
      message: "Server error",
    });
  }
};


// verify email
const verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;

    const user = await userModel.findOne({
      emailVerificationToken: token,
    });

    if (!user) {
      return res.status(400).json({
        message: "Invalid verification token",
      });
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;

    await user.save();

    return res.status(200).json({
      message: "Email verified successfully",
    });
  } catch (error) {
    console.log("VERIFY EMAIL ERROR:", error);

    return res.status(500).json({
      message: "Server error",
    });
  }
};


// resend verify link 
const resendVerificationEmail = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        message: "Email is required",
      });
    }

    const user = await userModel.findOne({ email });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({
        message: "Email is already verified",
      });
    }

    const emailVerificationToken = crypto.randomBytes(32).toString("hex");

    user.emailVerificationToken = emailVerificationToken;

    await user.save();

    const verifyUrl = `${process.env.FRONTEND_URL}/verify-email/${emailVerificationToken}`;

    await sendEmail({
      to: user.email,
      subject: "Verify your SkinCare account",
      html: `
        <div style="font-family: Arial; padding: 20px;">
          <h2>Verify Your Email</h2>
          <p>Hello ${user.username},</p>
          <p>Click below to verify your account.</p>

          <a href="${verifyUrl}"
            style="display:inline-block; padding:12px 20px; background:#ec4899; color:white; text-decoration:none; border-radius:30px;">
            Verify Email
          </a>
        </div>
      `,
    });

    return res.status(200).json({
      message: "Verification email sent again",
    });
  } catch (error) {
    console.log("RESEND VERIFICATION ERROR:", error);

    return res.status(500).json({
      message: "Server error",
    });
  }
};
module.exports = {
     register,
     login, logout,forgotPassword,resetPassword,verifyEmail,resendVerificationEmail,adminLogin,adminLogout,getAdminProfile
};