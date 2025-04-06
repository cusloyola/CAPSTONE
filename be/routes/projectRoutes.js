const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');  // Ensure the path is correct

// Define your routes
router.get('/', projectController.getAllProjects); // Get all projects
router.post('/', projectController.createProject); // Create a new project
router.put('/:id', projectController.updateProject); // Update a project
router.delete('/:id', projectController.deleteProject); // Delete a project

module.exports = router;
