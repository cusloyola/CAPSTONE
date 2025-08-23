const express = require('express');
const router = express.Router();

const adminGanttChartController = require('../../controllers/GanttChart/adminGanttChartController');


router.get('/work-details', adminGanttChartController.getFinalEstimationDetails);


module.exports = router;
