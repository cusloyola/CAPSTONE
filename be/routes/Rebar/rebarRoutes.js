const express = require('express');
const router = express.Router();
const RebarController = require('../../controllers/Rebars/RebarController'); // adjust path as needed

router.get('/masterlist', RebarController.getRebarMasterlist);
router.post('/add', RebarController.addRebarEntries);
router.get('/by-proposal/:proposal_id', RebarController.getRebarByProposalId);
router.get('/total-used/:proposal_id', RebarController.getRebarTotalUsed);


module.exports = router;