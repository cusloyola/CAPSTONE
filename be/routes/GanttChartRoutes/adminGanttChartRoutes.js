const express = require('express');
const router = express.Router();

const adminGanttChartController = require('../../controllers/GanttChart/adminGanttChartController');


router.get('/work-details', adminGanttChartController.getFinalEstimationDetails);

router.get('/:project_id', adminGanttChartController.getAllGanttCharts);
router.post('/', adminGanttChartController.createNewGanttChart);


module.exports = router;
