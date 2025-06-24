const express = require('express');
const router = express.Router();
const LaborUnitCostController = require('../../controllers/LaborUnitCost/LaborUnitCostController');


router.get('/labor-rate', LaborUnitCostController.getLaborDetails);
router.post('/save', LaborUnitCostController.saveLaborDetails);
router.get('/labor-rate/details/:proposal_id', LaborUnitCostController.fetchLaborDetails);



module.exports = router;

