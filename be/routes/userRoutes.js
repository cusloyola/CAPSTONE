const express = require("express");
const { getAllUsers, addUser } = require("../controllers/userController");
const { verifyToken } = require("../middleware/authMiddleware"); // ✅ Correct import

const router = express.Router();

// Debugging to check if verifyToken is properly imported
console.log("verifyToken:", typeof verifyToken === "function" ? "✅ Function Loaded" : "❌ Undefined");

router.get("/", verifyToken, getAllUsers); // ✅ Protected route
router.post("/", addUser); // ✅ Public route

module.exports = router;
