const express = require("express");
const router = express.Router();
const { getAllInventory, addInventoryItem, deleteInventoryItem, getInventoryItemById,  updateInventoryItem, } = require("../controllers/inventoryController");

router.get("/", getAllInventory);
router.post("/", addInventoryItem);
router.delete("/:id", deleteInventoryItem);
router.get("/:id", getInventoryItemById); // Corrected route

router.put("/:id", updateInventoryItem);

module.exports = router;