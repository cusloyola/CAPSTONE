const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');

router.get('/', projectController.getAllProjects); 
router.post('/', projectController.createProject); 
router.put('/:project_id', projectController.updateProject); 
router.delete('/:project_id', projectController.deleteProject);
router.get('/floors' , projectController.getProjectFloors);
router.get('/project-categories' , projectController.getprojectCategories);

module.exports = router;
