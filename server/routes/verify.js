const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");

// Assuming you have a User model
const { User } = require("../models/user");

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
  const token = req.header("Authorization");
  if (!token) return res.status(401).send("Access denied. No token provided.");

  try {
    const decoded = jwt.verify(token.replace("Bearer ", ""), process.env.JWTPRIVATEKEY); // Replace "yourSecretKey" with your actual secret key
    req.user = decoded;
    next();
    
  } catch (ex) {
    res.status(400).send("Invalid token.");
  }
};

// Route to get user information
router.get("/", verifyToken, async (req, res) => {
  try {
    // Fetch user information based on the decoded token
    const user = await User.findById(req.user._id).select("-password");
    if (!user) return res.status(404).send("User not found.");

    res.status(200).json({
      nickname: user.firstName + " " + user.lastName,
      email: user.email,
    });
  } catch (error) {
    console.error("Error fetching user information:", error);
    res.status(500).send("Internal Server Error", error);
  }
});

module.exports = router;
