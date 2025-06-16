const express = require('express');
const router = express.Router();
const quantitytakeoffController = require('../../controllers/QuantityTakeOff/quantitytakeoffController');

router.post('/add', quantitytakeoffController.addQtoEntries);
router.post('/save-totals', quantitytakeoffController.saveQtoTotals); 
router.get('/:proposal_id',quantitytakeoffController.getQtoDimensions);




module.exports = router;
