const express = require('express');
const router = express.Router();

// const Progress
const progressBillingController = require('../../controllers/ProgressBilling/progressBillingController');

router.post(`/add/:proposal_id`, progressBillingController.addProgressBillList);
router.get('/fetch/:proposal_id', progressBillingController.getProgressBillList);
// routes/progressBillingRoutes.js
router.get("/approved-proposal/:project_id", progressBillingController.getApprovedProposalByProject);

module.exports = router;
