// Updated and complete MongoDB-based User Controller (preserving all functionality from your Sequelize version)

import User from "../model/user.model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import Skill from "../model/Skill.model.js";
import sendVerificationEmail from "../utils/sendEmail.js";
import sendVerificationotp from "../utils/sendOtpMail.js";
import Project from "../model/Project.model.js";
import Technology from "../model/Technology.model.js";
import admin from "../middleware/firebase.js";

export const resendVerificationEmail = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required." });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found." });
    if (user.emailVerified) return res.status(400).json({ message: "Email is already verified." });

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: "1h" });
    await sendVerificationEmail(user.email, user.id, token);
    res.status(200).json({ message: "Verification email resent." });
  } catch (error) {
    console.error("Error resending verification email:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const verifyEmail = async (req, res) => {
  try {
    const { userId, token } = req.params;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.userId !== userId) return res.status(400).json({ message: "Invalid verification link." });
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found." });
    if (user.emailVerified) return res.status(400).json({ message: "Email already verified." });

    user.emailVerified = true;
    await user.save();
    res.status(200).json({ message: "Email verified successfully." });
  } catch (error) {
    console.error("Verification error:", error);
    res.status(400).json({ message: "Invalid or expired token." });
  }
};

export const registerUser = async (req, res) => {
  try {
    const { name, email, password, confirmPassword } = req.body;
    if (!name || !email || !password || !confirmPassword) return res.status(400).json({ message: "All fields are required." });
    if (password !== confirmPassword) return res.status(400).json({ message: "Passwords do not match." });

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(409).json({ message: "Email already exists." });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({ name, email, password: hashedPassword, emailVerified: false });

    const token = jwt.sign({ userId: newUser.id }, process.env.JWT_SECRET, { expiresIn: "1h" });
    await sendVerificationEmail(newUser.email, newUser.id, token);

    res.status(201).json({
      message: "User registered successfully.",
      user: { userId: newUser.id, name: newUser.name, email: newUser.email }
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: "Email and password are required." });

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: "Invalid email or password." });
    if (!user.emailVerified) return res.status(403).json({ message: "Please verify your email to log in." });

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) return res.status(401).json({ message: "Invalid email or password." });

    const token = jwt.sign({ userId: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: "2d" });
    user.password = undefined;
    res.status(200).json({ message: "Login successful.", token, user });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    const updateData = req.body;
    if (req.files?.profile_photo) updateData.profile_photo = `/uploads/${req.files.profile_photo[0].filename}`;
    if (req.files?.resume) updateData.resume = `/uploads/${req.files.resume[0].filename}`;

    const updatedUser = await User.findByIdAndUpdate(userId, updateData, { new: true }).select("-password");
    if (!updatedUser) return res.status(404).json({ message: "User not found." });

    res.status(200).json({ message: "Profile updated successfully.", user: updatedUser });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getProfile = async (req, res) => {
  try {
    const userId= req.params.id;
    const user = await User.findById(userId).select("-password");
    if (!user) return res.status(404).json({ message: "User not found." });
    res.status(200).json(user);
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.status(200).json({ success: true, users });
  } catch (error) {
    console.error("Get users error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch users." });
  }
};

export const changePassword = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { oldPassword, newPassword } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found." });

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) return res.status(401).json({ message: "Old password is incorrect." });

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
    res.status(200).json({ message: "Password changed successfully." });
  } catch (error) {
    console.error("Change password error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found." });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

    user.otp = otp;
    user.otpExpiresAt = otpExpiresAt;
    await user.save();

    await sendVerificationotp(user.email, otp);
    res.status(200).json({ message: "OTP sent successfully." });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email });
    if (!user || user.otp !== otp || new Date() > user.otpExpiresAt) {
      return res.status(400).json({ message: "Invalid or expired OTP." });
    }
    res.status(200).json({ message: "OTP verified." });
  } catch (error) {
    console.error("Verify OTP error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found." });

    user.password = await bcrypt.hash(newPassword, 10);
    user.otp = null;
    user.otpExpiresAt = null;
    await user.save();

    res.status(200).json({ message: "Password updated successfully." });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
export const searchUsersBySkill = async (req, res) => {
  const { skillName } = req.query;

  if (!skillName) {
    return res.status(400).json({ success: false, message: "Skill name is required" });
  }

  try {
    // Step 1: Find technologies matching the skill name
    const matchingTechnologies = await Technology.find({
      name: { $regex: skillName, $options: "i" }, // case-insensitive match
    });

    if (matchingTechnologies.length === 0) {
      return res.status(200).json({ success: true, projects: [] });
    }

    const techIds = matchingTechnologies.map((tech) => tech.id);

    // Step 2: Find projects using those technologies
    const projects = await Project.find({
      technologies: { $in: techIds },
    })
      .populate("technologies", "name") // populate technology names
      .populate("created_by", "userId name email") // populate user info
      .select("title description technical_stack deadline"); // select project fields

    res.status(200).json({ success: true, projects });
  } catch (error) {
    console.error("Error searching projects by skill:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
export const firebaseLogin = async (req, res) => {
  try {
    const { token } = req.body;
    const decoded = await admin.auth().verifyIdToken(token);
    const { email, name, picture } = decoded;

    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({ name, email, profile_photo: picture });
    }

    const appToken = jwt.sign({ userId: user.id, email: user.email }, process.env.JWT_SECRET, {
      expiresIn: "2d",
    });

    res.json({ token: appToken, user });
  } catch (err) {
    console.error("Firebase login error", err);
    res.status(401).json({ message: "Invalid Firebase token" });
  }
};
