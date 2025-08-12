const express = require('express');
const router = express.Router();
const proposalController = require('../controllers/proposalController');  


router.get('/:project_id', proposalController.getProposalByProject);
router.post('/:project_id', proposalController.addProposalByProject);
router.delete('/:project_id/:proposal_id', proposalController.deleteProposalByProject);
router.put('/:project_id/:proposal_id', proposalController.editProposalByProject);

module.exports = router;