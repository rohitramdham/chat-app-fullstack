import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import { genrateToken } from "../lib/utils.js";
import { protectRoute } from "../middleware/auth.middleware.js";
import cloudinary from "../lib/cloudinary.js";
export const signup = async (req, res) => {
  console.log("Headers:", req.headers);
  console.log("Body:", req.body);

  console.log("req.body:", req.body);
  const { fullName, email, password } = req.body || {};
  try {
    if (!fullName || !email || !password) {
      return res.status(400).send("All fields are required");
    }
    if (password.length < 6) {
      return res.status(400).send("Password must be at least 6 characters");
    }
    const user = await User.findOne({ email });
    if (user) return res.status(400).send("User already exists");
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const newUser = new User({
      fullName,
      email,
      password: hashedPassword,
    });
    if (newUser) {
      genrateToken(newUser._id, res);
      await newUser.save();
      res.status(201).json({
        _id: newUser._id,
        fullName: newUser.fullName,
        email: newUser.email,
        profilePic: newUser.profilePic,
      });
    } else {
      return res.status(500).send("Something went wrong");
    }
  } catch (error) {
    console.log(error);
    return res.status(500).send("Something went wrong");
  }
};
export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Invalid password" });
    } else {
      genrateToken(user._id, res);
      res.status(200).json({
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        profilePic: user.profilePic,
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).send("Something went wrong");
  }
};
export const logout = (req, res) => {
  try {
    res.cookie("jwt", "", {
      maxAge: 0,
    });
    res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    res.status(500).send("Something went wrong");
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { profilePic } = req.body;
    const userId = req.user._id;

    if (!profilePic) {
      return res.status(400).json({ message: "Profile pic is required" });
    }
    const uploadResponse = await cloudinary.uploader.upload(profilePic, {
      folder: "profiles",
      allowed_formats: ["jpg", "png", "jpeg"],
    });

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { profilePic: uploadResponse.secure_url },
      { new: true }
    );

    res.status(200).json(updatedUser);
  } catch (error) {
    console.log("error in update profile:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
export const chcekAuth = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.status(200).json(req.user);
  } catch (error) {
    console.log(error);
    return res.status(500).send("Something went wrong");
  }
};
