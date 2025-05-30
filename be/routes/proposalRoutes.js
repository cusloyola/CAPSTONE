const express = require('express');
const router = express.Router();
const proposalController = require('../controllers/proposalController');  


router.get('/:project_id', proposalController.getProposalByProject);


module.exports = router;