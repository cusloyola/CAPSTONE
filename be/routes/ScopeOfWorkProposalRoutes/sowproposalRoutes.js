const express = require('express');
const router = express.Router();
const sowproposalController = require('../../controllers/ScopeofWorkProposal/sowproposalController');

router.get('/sow-work-items/all-work-items', sowproposalController.getAllSOWWorkItems);  // full list
router.get("/sow-list/:proposal_id", sowproposalController.getSowWorkItemsByProposal);
router.post('/sow-work-items/add', sowproposalController.addSOWWorkItems);

module.exports = router;
