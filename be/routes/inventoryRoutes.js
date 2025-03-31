const express = require("express");
const router = express.Router();
const {
  getAllInventory,
  addInventoryItem,
  deleteInventoryItem,
  getInventoryItemById,
  updateInventoryItem,
  getLowestStockItems,
} = require("../controllers/inventoryController");

console.log("inventoryRoutes.js loaded"); // Log that the route file is loaded

router.get("/", (req, res, next) => {
  console.log("GET /api/inventory/ requested");
  next();
}, getAllInventory);

router.post("/", (req, res, next) => {
  console.log("POST /api/inventory/ requested");
  next();
}, addInventoryItem);

router.delete("/:id", (req, res, next) => {
  console.log(`DELETE /api/inventory/${req.params.id} requested`);
  next();
}, deleteInventoryItem);

router.get("/:id", (req, res, next) => {
  console.log(`GET /api/inventory/${req.params.id} requested`);
  next();
}, getInventoryItemById);

router.put("/:id", (req, res, next) => {
  console.log(`PUT /api/inventory/${req.params.id} requested`);
  next();
}, updateInventoryItem);

// router.get("/low", (req, res, next) => {
//   console.log("GET /api/inventory/low requested");
//   next();
// }, getLowestStockItems);

module.exports = router;