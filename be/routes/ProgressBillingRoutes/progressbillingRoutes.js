const express = require('express');
const router = express.Router();

// const Progress
const progressBillingController = require('../../controllers/ProgressBilling/progressBillingController');

router.post(`/add/:proposal_id`, progressBillingController.addProgressBillList);
router.get('/fetch/:proposal_id', progressBillingController.getProgressBillList);

router.get("/approved-proposal/:project_id", progressBillingController.getApprovedProposalByProject);
router.post('/copy/:billing_id', progressBillingController.copyProgressBilling);
router.get('/summary/:billing_id', progressBillingController.getFinalEstimationSummary);


router.post('/accomp', progressBillingController.saveProgressAccomp);
router.get('/accomp/:billing_id', progressBillingController.getProgressAccomp);

router.post('/accomp/log', progressBillingController.addAccompLogs);

module.exports = router;
