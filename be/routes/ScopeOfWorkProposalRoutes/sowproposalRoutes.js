const express = require('express');
const router = express.Router();

const sowproposalController = require('../../controllers/ScopeofWorkProposal/sowproposalController');

router.get('/sow-work-items/all-work-items', sowproposalController.getAllSOWWorkItems);  // full list
router.get('/sow-list/:proposal_id', sowproposalController.getSowWorkItemsByProposal);
router.get('/sow-work-items/sow-table/', sowproposalController.getSOWfromTable);



router.post('/sow-work-items/add', sowproposalController.addSOWWorkItems);
router.get('/sow-work-items/raw', sowproposalController.getAllWorkItemsRaw);
router.post('/sow-work-items', sowproposalController.addWorkItem);
router.put('/sow-work-items/:id', sowproposalController.updateWorkItem);
router.delete('/sow-work-items/:id', sowproposalController.deleteWorkItem);
router.get("/work-types", sowproposalController.getAllWorkTypes);



module.exports = router;
