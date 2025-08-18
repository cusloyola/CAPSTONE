// router.js

const express = require("express");
const router = express.Router();
const {
    getAllResources,
    getBrands,
    getUnits,
    getRequestMaterialItems,
    createRequestedMaterials,
    getRequestedMaterialsHistory,
    approveRequest,
    rejectRequest
} = require("../../controllers/Resource/requestMaterialController");

// Route to get a list of all resources with optional pagination and search
router.get("/", (req, res, next) => {
    console.log("GET /api/resources/ requested");
    next();
}, getAllResources);

// Route to get a list of all resource brands
router.get("/brands", (req, res, next) => {
    console.log("GET /api/resources/brands requested");
    next();
}, getBrands);

// Route to get a list of all units of measure
router.get("/units", (req, res, next) => {
    console.log("GET /api/resources/units requested");
    next();
}, getUnits);

// Route to get a list of materials for a new request
router.get("/request-materials", (req, res, next) => {
    console.log("GET /api/resources/request-materials requested");
    next();
}, getRequestMaterialItems);

// Route to create a new materials request
router.post("/request-materials", (req, res, next) => {
    console.log("POST /api/resources/request-materials requested");
    next();
}, createRequestedMaterials);

// Route to get the history of all requested materials
router.get("/request-materials/history", (req, res, next) => {
    console.log("GET /api/resources/request-materials/history requested");
    next();
}, getRequestedMaterialsHistory);

// Route to approve a specific materials request by ID
router.put("/request-materials/:requestId/approve", (req, res, next) => {
    console.log(`PUT /api/resources/request-materials/approve/${req.params.requestId} requested`);
    next();
}, approveRequest);

// Route to reject a specific materials request by ID
router.put("/request-materials/reject/:requestId", (req, res, next) => {
    console.log(`PUT /api/resources/request-materials/reject/${req.params.requestId} requested`);
    next();
}, rejectRequest);

module.exports = router;
