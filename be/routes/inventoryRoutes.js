const express = require("express");
const router = express.Router();
const { getAllInventory, addInventoryItem, deleteInventoryItem } = require("../controllers/inventoryController"); // Import the new delete function

router.get("/", getAllInventory);
router.post("/", addInventoryItem);
router.delete("/:id", deleteInventoryItem); // Add the new delete route

module.exports = router;