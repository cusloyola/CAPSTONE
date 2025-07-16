// routes/ProjectInfoRoutes/projectInfoRoutes.js
const express = require("express");
const router = express.Router();
const {
  getAllProjects,
  getProjectById,
  updateProject,
} = require("../../controllers/ProjectInfo/projectInfoController"); // Import functions using destructuring
// const { verifyToken } = require('../../middleware/authMiddleware'); // Uncomment if you want to protect these routes

// GET all projects
router.get("/all", (req, res, next) => {
  console.log("GET /api/project-info/all requested");
  next();
}, getAllProjects);
// router.get("/all", verifyToken, getAllProjects); // Example with authentication

// GET a single project by ID
router.get("/:id", (req, res, next) => {
  console.log(`GET /api/project-info/${req.params.id} requested`);
  next();
}, getProjectById);
// router.get("/:id", verifyToken, getProjectById); // Example with authentication

// UPDATE a project by ID
router.put("/:id", (req, res, next) => {
  console.log(`PUT /api/project-info/${req.params.id} requested`);
  next();
}, updateProject);
// router.put("/:id", verifyToken, updateProject); // Example with authentication

module.exports = router;
