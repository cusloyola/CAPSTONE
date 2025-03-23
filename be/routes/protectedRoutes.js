const express = require("express");
const authenticateToken = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/protected-file", authenticateToken, (req, res) => {
  const allowedRoles = ["admin", "site engineer", "safety engineer"];

  // Normalize role (lowercase comparison for consistency)
  if (!allowedRoles.includes(req.user.role.toLowerCase())) {
    return res.status(403).json({
      success: false,
      message: "Access forbidden. Your role does not have permission to view this file.",
    });
  }

  res.json({
    success: true,
    message: "Access granted. This is a protected file for Admin, Site Engineers, and Safety Engineers.",
  });
});

module.exports = router;
