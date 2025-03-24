const express = require("express");
const router = express.Router();
const { getAllInventory } = require("../controllers/inventoryController"); // Ensure this import is correct

// ✅ Route for fetching all inventory items
router.get("/", getAllInventory);

module.exports = router;
