const express = require('express');
const router = express.Router();


const FinalCostEstimation = require('../../controllers/FinalCostEstimation/FinalCostEstimation');

router.get("/proposal/:proposal_id/final-cost", FinalCostEstimation.getFinalCostByProposalId);



module.exports = router;
