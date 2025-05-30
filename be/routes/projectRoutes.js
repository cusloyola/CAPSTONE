const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');  // Ensure the path is correct

// Define your routes
router.get('/', projectController.getAllProjects); 
// router.get('/proposals', projectController.getProjectProposals); 

router.post('/', projectController.createProject); 
router.put('/:project_id', projectController.updateProject); 
router.delete('/:project_id', projectController.deleteProject); 

module.exports = router;
