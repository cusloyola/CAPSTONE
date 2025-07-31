const express = require('express');
const router = express.Router();
const { submitInspectionReport } = require('../controllers/inspectionReportController');

router.post('/inspection-reports', submitInspectionReport);

module.exports = router;
