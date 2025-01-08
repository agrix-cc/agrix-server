const express = require("express");
const {sendEmail} = require("../utils/emailService");
const User = require("../database/models/User");
const bcrypt = require("bcrypt");
const router = express.Router();

const generateVerificationCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

router.post("/send-email", async (req, res) => {
  try {
    const { to, subject} = req.body;

    if (!to) {
      return res
        .status(400)
        .json({ success: false, message: "Email is required." });
    }

    const user = await User.findOne({ where: { email: to } });

    if (!user) {
      return res.status(404).json({
        status: "failed",
        message: "Invalid email!",
      });
      return;
    }

    const uname = user.first_name+" "+ user.last_name;
    
    const verificationCode = generateVerificationCode();
    const result = await sendEmail(to, subject, uname, verificationCode);

    const [updatedRows] = await User.update(
      { verification_code: verificationCode }, // Set the verification_code
      { where: { email: to } } // Find user by email
    );

    if (updatedRows === 0) {
      return res
        .status(404)
        .json({ success: false, message: "User not found." });
    }

    if (result.success) {
      res.status(200).json({ success: true });
    } else {
      res.status(500).json({ success: false, error: result.error });
    }

    // Update the user's verification code in the database
  } catch (error) {
    res.status(404).json({
      status: "failed",
      message: error.message,
    });
  }
});

// Verification route
router.post("/verify-code", async (req, res) => {
  const { email, verifycode } = req.body;

  if (!email || !verifycode) {
    return res.status(400).json({
      success: false,
      message: "Email and verification code are required.",
    });
  }

  try {
    const user = await User.findOne({
      where: { email: email, verification_code: verifycode },
    });

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "Verification code does not match." });
    }

    res.json({ success: true, message: "User verified successfully." });
  } catch (error) {
    console.error("Error verifying code:", error);
    res.status(500).json({ success: false, message: "Server error." });
  }
});

router.post("/reset-password", async (req, res) => {
  try {
    const { email, password } = req.body;
    // console.log("wrkoing", email + password);

    // return res.json({ success: true, message: "User verified successfully."+email +"_"+ password });

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Something went wrong..",
      });
    }

    // try {
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    const [updatedRows] = await User.update(
      { password: hashedPassword }, // Set the verification_code
      { where: { email: email } } // Find user by email
    );

    if (updatedRows === 0) {
      return res
        .status(404)
        .json({ success: false, message: "User not found." });
    }

    res
      .status(200)
      .json({ success: true, message: "Password reset successful." });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
});

module.exports = router;
