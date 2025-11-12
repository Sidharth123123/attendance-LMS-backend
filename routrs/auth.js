// routes/auth.js
const express = require("express");
const router = express.Router();
const User = require("../models/User");

// GET /api/auth/users
router.get("/users", async (req, res) => {
  try {
    const users = await User.find({}, "username email"); // sirf username & email
    res.json(users); // 🔹 ye hi JSON return karega
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
