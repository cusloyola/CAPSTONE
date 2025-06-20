const express = require('express');
const router = express.Router();
const RebarController = require('../../controllers/Rebars/RebarController'); // adjust path as needed

router.get('/masterlist', RebarController.getRebarMasterlist);
router.post('/add', RebarController.addRebarEntries);


module.exports = router;