// In adminSiteReportRoutes.js
const express = require('express');
const router = express.Router();
const { fetchAllReportDetails, deleteReportById  } = require('../controllers/adminSiteReportController');

  
router.get('/getAllReportDetails', fetchAllReportDetails );

router.delete('/deleteReport/:report_id', deleteReportById); 


module.exports = router;
