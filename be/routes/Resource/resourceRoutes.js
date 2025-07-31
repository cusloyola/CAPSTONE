const express = require("express");
const router = express.Router();
const {
    getAllResources,
    addResource,
    deleteResource,
    getResourceById,
    updateResource,
} = require("../../controllers/Resource/resourceController");


// Route to get all resources
router.get("/", (req, res, next) => {
    console.log("GET /api/resource/ requested");
    next();
}, getAllResources);

// Route to add a new resource
router.post("/", (req, res, next) => {
    console.log("POST /api/resource/ requested");
    next();
}, addResource);

// Route to soft delete a resource by ID
router.delete("/:id", (req, res, next) => {
    console.log(`DELETE /api/resource/${req.params.id} requested`);
    next();
}, deleteResource);

// Route to get a single resource by ID
router.get("/:id", (req, res, next) => {
    console.log(`GET /api/resource/${req.params.id} requested`);
    next();
}, getResourceById);

// Route to update a resource by ID
router.put("/:id", (req, res, next) => {
    console.log(`PUT /api/resource/${req.params.id} requested`);
    next();
}, updateResource);

module.exports = router;
