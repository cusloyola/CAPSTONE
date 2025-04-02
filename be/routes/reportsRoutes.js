// routes/reportsRoutes.js
const express = require('express');
const router = express.Router();
const reportsController = require('../controllers/reportsController');

// Define routes for reports
router.get('/lowest-stocks', reportsController.getLowestStockItemsForChart);
router.get('/project-progress', reportsController.getProjectProgressForChart);
router.get('/project-completion', reportsController.getProjectCompletionForChart);
router.get('/total-categories', reportsController.getTotalCategoriesCount);
router.get('/out-of-stock', reportsController.getOutOfStockCount);
router.get('/total-stock', reportsController.getTotalStockQuantity);
router.get('/total-items', reportsController.getTotalItemsCount);

module.exports = router;