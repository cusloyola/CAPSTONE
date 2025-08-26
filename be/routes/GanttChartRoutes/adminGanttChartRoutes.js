const express = require('express');
const router = express.Router();

const adminGanttChartController = require('../../controllers/GanttChart/adminGanttChartController');
const adminGanttTaskController = require('../../controllers/GanttChart/adminGanttTaskController');


router.get('/work-details', adminGanttChartController.getFinalEstimationDetails);

router.get('/:project_id', adminGanttChartController.getAllGanttCharts);
router.post('/', adminGanttChartController.createNewGanttChart);




router.post('/save-duration', adminGanttTaskController.saveDuration);


module.exports = router;
