const express = require('express');
const router = express.Router();
const { getProjectDetailsForDailyReport, getWorkerRoles, getEquipment, submitDailySiteReport  } = require('../controllers/dailySiteReportController');

// Make sure the route is correct
router.get('/projects', getProjectDetailsForDailyReport);
router.get('/roles', getWorkerRoles);

router.get('/equipment', getEquipment);

router.post('/submit', submitDailySiteReport);



module.exports = router;
