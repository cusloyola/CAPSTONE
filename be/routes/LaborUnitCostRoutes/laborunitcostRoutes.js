const express = require('express');
const router = express.Router();
const LaborUnitCostController = require('../../controllers/LaborUnitCost/LaborUnitCostController');


router.get('/labor-rate', LaborUnitCostController.getLaborDetails);
router.post('/add', LaborUnitCostController.addLaborDetails);
router.get('/labor-rate/details/:proposal_id', LaborUnitCostController.fetchLaborDetails);
router.delete('/delete/:labor_entry_id', LaborUnitCostController.deleteSingleLaborEntry);
router.put('/update/:labor_entry_id', LaborUnitCostController.updateLaborDetails);


module.exports = router;

