const express = require('express');
const router = express.Router();
const dailySiteReportController = require("../../controllers/DailySiteReports/dailySiteReportController");



router.get('/getSiteReport',dailySiteReportController.getSiteDailyReportforSite);
router.put('/updateSiteReport', dailySiteReportController.updateDailySiteReport);


router.post('/submit', dailySiteReportController.submitDailySiteReport);



module.exports = router;
