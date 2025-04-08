// routes/dashboard.js
const express = require("express");
const router = express.Router();

// Simulated data - you'd normally fetch this from your database
router.get("/metrics", async (req, res) => {
  try {
    const metrics = {
      projects: { count: 12, change: 5.4 },
      workers: { count: 87, change: -2.3 },
      budget: { total: 1240000, change: 10.2 },
      hoursLogged: { total: 6540, change: 3.1 },
    };
    res.json(metrics);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
