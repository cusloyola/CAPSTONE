const express = require("express");
const router = express.Router();
const { getAllInventory, addInventoryItem } = require("../controllers/inventoryController");

router.get("/", getAllInventory);
router.post("/", addInventoryItem);

module.exports = router;
