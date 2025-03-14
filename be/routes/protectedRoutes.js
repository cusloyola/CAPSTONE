const express = require("express");
const authenticateToken = require("../middleware/authMiddleware");
const router = express.Router();

router.get("/protected-file", authenticateToken, (req, res) => {
  const allowedRoles = ["Admin", "Site Engineer", "Safety Engineer"]; 

  if (!allowedRoles.includes(req.user.role)) {
    return res.status(403).json({ message: "Access forbidden. Unauthorized role." });
  }

  res.json({ message: "This is a protected file for Admin, Site Engineers, and Safety Engineers." });
});

module.exports = router;
