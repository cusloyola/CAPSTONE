const express = require("express");
const router = express.Router();
const {
    getAllResources,
    addResource,
    updateResource,
    deleteResource,
    getBrands,
    getUnits
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

// Route to add a new resource
router.post("/", (req, res, next) => {
    console.log("POST /api/resources/ requested");
    next();
}, addResource);

// Route to update an existing resource by its ID
router.put("/:id", (req, res, next) => {
    console.log(`PUT /api/resources/${req.params.id} requested`);
    next();
}, updateResource);

// Route to soft delete a resource by its ID
router.delete("/:id", (req, res, next) => {
    console.log(`DELETE /api/resources/${req.params.id} requested`);
    next();
}, deleteResource);

module.exports = router;
