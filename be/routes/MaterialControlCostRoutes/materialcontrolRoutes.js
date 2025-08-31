const express = require('express');
const router = express.Router();
const MaterialControlCostController = require('../../controllers/MaterialControlCost/MaterialControlCostController');



router.get('/:project_id', MaterialControlCostController.getMaterialCostOverview);


module.exports = router;
