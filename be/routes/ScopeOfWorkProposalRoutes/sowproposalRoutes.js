const express = require('express');
const router = express.Router();
const sowproposalController = require('../../controllers/ScopeofWorkProposal/sowproposalController');

router.get("/sow-work-items", sowproposalController.getAllSOWWorkItems);

module.exports = router;