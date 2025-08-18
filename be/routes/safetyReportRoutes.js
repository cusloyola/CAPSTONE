const express = require("express");
const router = express.Router();
const {
  createSafetyReport,
  getSafetyReports,
  getSafetyReportById,
} = require("../controllers/safetyReportController");
const upload = require("../middleware/upload"); // <-- this must be multer instance

// POST - create new weekly safety report
router.post(
  "/",
  upload.fields([{ name: "image1" }, { name: "image2" }]),
  createSafetyReport
);

// GET - fetch all safety reports
router.get("/", getSafetyReports);

// GET - fetch single report by id
router.get("/:id", getSafetyReportById);

module.exports = router;
