const express = require('express');
const router = express.Router();
const MaterialUnitCostController = require('../../controllers/MaterialUnitCost/MaterialUnitCostController');

router.post('/save', MaterialUnitCostController.AddMaterialDetails);
router.get('/material-cost/:proposal_id',MaterialUnitCostController.getMaterialDetails );
router.put('/update',MaterialUnitCostController.updateMaterialDetails );
router.delete('/delete/:material_cost_id',MaterialUnitCostController.deleteMaterialDetails );



module.exports = router;

