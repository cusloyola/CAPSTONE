/**
 * @file routes/FloorsInfoRoutes/floorInfoRoutes.js
 * @description Defines API routes for floor information, mapping them to controller functions.
 */

const express = require("express");
const router = express.Router();
const {
    getAllFloors,
    getFloorById,
    updateFloor,
} = require("../../controllers/ProjectInfo/floorsInfoController"); // Import functions using destructuring
// const { verifyToken } = require('../../middleware/authMiddleware'); // Uncomment if you want to protect these routes

// GET all floors
router.get("/all", (req, res, next) => {
    console.log("GET /api/floor-info/all requested");
    next(); // Pass control to the next middleware/route handler
}, getAllFloors);
// router.get("/all", verifyToken, getAllFloors); // Example with authentication

// GET a single floor by ID
router.get("/:id", (req, res, next) => {
    console.log(`GET /api/floor-info/${req.params.id} requested`);
    next(); // Pass control to the next middleware/route handler
}, getFloorById);
// router.get("/:id", verifyToken, getFloorById); // Example with authentication

// UPDATE a floor by ID
router.put("/:id", (req, res, next) => {
    console.log(`PUT /api/floor-info/${req.params.id} requested`);
    next(); // Pass control to the next middleware/route handler
}, updateFloor);
// router.put("/:id", verifyToken, updateFloor); // Example with authentication

module.exports = router;
