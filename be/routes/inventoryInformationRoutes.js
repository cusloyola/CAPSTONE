const express = require("express");
const router = express.Router();
const {
  getInventoryInformation,
  getLowestStockItems,
  getTotalItemsCount,
  getTotalStockQuantity,
  getOutOfStockCount,
  getTotalCategoriesCount
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


router.get("/total-items", getTotalItemsCount);

router.get("/total-stock", getTotalStockQuantity);

router.get("/out-of-stock", getOutOfStockCount);

router.get("/total-categories", getTotalCategoriesCount);

module.exports = router;