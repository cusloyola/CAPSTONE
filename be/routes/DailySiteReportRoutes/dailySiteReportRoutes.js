const express = require('express');
const router = express.Router();
const dailySiteReportController = require("../../controllers/DailySiteReports/dailySiteReportController");
const adminDailySiteReportController = require("../../controllers/DailySiteReports/adminDailySiteReportController");


router.get('/getSiteReport',dailySiteReportController.getSiteDailyReportforSite);
router.put('/updateSiteReport', dailySiteReportController.updateDailySiteReport);


router.post('/submit', dailySiteReportController.submitDailySiteReport);


router.get('/getAdminSiteReport/:project_id', adminDailySiteReportController.getSiteDailyReportforAdmin);

router.put('/editStatus/:dailysite_report_id', adminDailySiteReportController.editStatus);
router.put('/markViewed/:dailysite_report_id', adminDailySiteReportController.updateLastViewed);


module.exports = router;
