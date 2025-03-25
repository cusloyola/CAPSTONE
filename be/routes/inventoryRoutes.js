const express = require("express");
const router = express.Router();
const { getAllInventory, addInventoryItem } = require("../controllers/inventoryController");

// ✅ Route for fetching all inventory items
router.get("/", getAllInventory);

// ✅ Route for adding a new inventory item (make sure this exists!)
router.post("/", addInventoryItem);  // This should match the POST request you're making

module.exports = router;



//TAMAAAA NA TO    