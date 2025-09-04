const express = require('express');
const router = express.Router();
const quantitytakeoffController = require('../../controllers/QuantityTakeOff/quantitytakeoffController');

router.post('/save-full', quantitytakeoffController.saveFullQto);

router.get('/:proposal_id', quantitytakeoffController.getQtoDimensions);

router.put('/update', quantitytakeoffController.UpdateQtoDimension);
router.delete('/delete/:qto_id', quantitytakeoffController.deleteQtoDimension);
router.post('/add-allowance', quantitytakeoffController.addAllowanceToQtoParent);

router.get('/parent-totals/:project_id', quantitytakeoffController.getQtoParentTotals);
module.exports = router;
