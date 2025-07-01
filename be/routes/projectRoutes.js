const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');  // Ensure the path is correct

router.get('/', projectController.getAllProjects); 
router.post('/', projectController.createProject); 
router.put('/:project_id', projectController.updateProject); 
router.delete('/:project_id', projectController.deleteProject);
router.get('/floors' , projectController.getProjectFloors);

module.exports = router;
