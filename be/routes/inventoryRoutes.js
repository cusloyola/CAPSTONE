const express = require("express");
const router = express.Router();
const { getAllInventory, addInventoryItem, deleteInventoryItem, getInventoryItemById } = require("../controllers/inventoryController");

router.get("/", getAllInventory);
router.post("/", addInventoryItem);
router.delete("/:id", deleteInventoryItem);
router.get("/:id", getInventoryItemById); // Corrected route
module.exports = router;