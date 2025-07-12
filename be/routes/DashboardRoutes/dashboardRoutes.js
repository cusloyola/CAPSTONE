const express = require('express');
const router = express.Router();

const dashboardController = require('../../controllers/Dashboard/dashboardController');


router.get('/project-billing-trend',dashboardController.dashboardLineGraph );


module.exports = router;
