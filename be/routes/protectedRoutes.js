const express = require("express");
const authenticateToken = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/protected-file", authenticateToken, (req, res) => {
  const allowedRoles = ["admin", "site engineer", "safety engineer"];

  // Ensure req.user and req.user.role exist
  if (!req.user || !req.user.role) {
    console.error("❌ Unauthorized access attempt: No user role provided.");
    return res.status(403).json({
      success: false,
      message: "Access forbidden. User role is missing.",
    });
  }

  const userRole = req.user.role.toLowerCase();

  // Role-based access control
  if (!allowedRoles.includes(userRole)) {
    console.warn(`⚠️ Unauthorized access attempt by ${req.user.role}`);
    return res.status(403).json({
      success: false,
      message: `Access forbidden. Your role (${req.user.role}) does not have permission to view this file.`,
    });
  }

  // Access granted
  res.json({
    success: true,
    message: "✅ Access granted. This is a protected file for Admin, Site Engineers, and Safety Engineers.",
  });
});

module.exports = router;
