/**
 * @file routes/ClientInfoRoutes/clientInfoRoutes.js
 * @description Defines API routes for client information, mapping them to controller functions.
 */

const express = require("express");
const router = express.Router();
const {
    getAllClients,
    getClientById,
    updateClient,
} = require("../../controllers/ProjectInfo/clientsInfoController"); // const { verifyToken } = require('../../middleware/authMiddleware'); // Uncomment if you want to protect these routes

// GET all clients
router.get("/all", (req, res, next) => {
    console.log("GET /api/client-info/all requested");
    next(); // Pass control to the next middleware/route handler
}, getAllClients);
// router.get("/all", verifyToken, getAllClients); // Example with authentication

router.get("/:id", (req, res, next) => {
    console.log(`GET /api/client-info/${req.params.id} requested`);
    next(); // Pass control to the next middleware/route handler
}, getClientById);

router.put("/:id", (req, res, next) => {
    console.log(`PUT /api/client-info/${req.params.id} requested`);
    next(); // Pass control to the next middleware/route handler
}, updateClient);

module.exports = router;
