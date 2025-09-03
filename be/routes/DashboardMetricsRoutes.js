const express = require("express");
const router = express.Router();
const { getMaterialRequestCount, getDailySiteReportCount, getProjectCounts, getInspectionReportsCount } = require("../controllers/DashboardMetricsController");

// Route to get the total count of material requests
router.get("/material-requests/count", (req, res, next) => {
    console.log("GET /api/dashboard/material-requests/count requested");
    next();
}, getMaterialRequestCount);

// Route to get the total count of daily site reports (is_deleted = 0)
router.get("/daily-site-reports/count", (req, res, next) => {
    console.log("GET /api/dashboard/daily-site-reports/count requested");
    next();
}, getDailySiteReportCount);

// Route to get all project counts
router.get("/projects/counts", (req, res, next) => {
    console.log("GET /api/dashboard/projects/counts requested");
    next();
}, getProjectCounts);

router.get("/inspection-reports/count", (req, res, next) => {
    console.log("GET /api/dashboard/inspection-reports/count requested");
    next();
}, getInspectionReportsCount);

module.exports = router;
