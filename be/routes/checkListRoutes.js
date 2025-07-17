const express = require('express');
const router = express.Router();
const checklistController = require('../controllers/checkListController');

router.get('/', checklistController.getChecklistData);

module.exports = router;