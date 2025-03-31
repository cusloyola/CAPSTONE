const express = require("express");
const router = express.Router();
const {
  getInventoryInformation,
  getLowestStockItems,
} = require("../controllers/inventoryInformationController"); // Import both functions

console.log("inventoryInformationRoutes.js loaded"); // Log that the route file is loaded

router.get("/information", (req, res, next) => {
  console.log("GET /api/inventory-information/information requested");
  next();
}, getInventoryInformation);

router.get("/lowest-stocks", (req, res, next) => {
  console.log("GET /api/inventory-information/lowest-stocks requested");
  next();
}, getLowestStockItems);

module.exports = router;