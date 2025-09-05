const express = require("express");
const router = express.Router();
const {
  createIncidentReport,
  getIncidentReports,
  getIncidentReportById,
  deleteIncidentReport,
  bulkDeleteIncidentReports,
  updateIncidentReport,
} = require("../controllers/incidentReportController");
const upload = require("../middleware/upload"); // <-- this must be multer instance

// POST - create new incident report
router.post(
  "/",
  upload.fields([
    { name: "image1" },
    { name: "image2" },
    { name: "image3" },
    { name: "image4" },
  ]),
  createIncidentReport
);

// GET - fetch all incident reports
router.get("/", getIncidentReports);

// GET - fetch single report by id
router.get("/:id", getIncidentReportById);

// POST - bulk delete incident reports
router.post("/bulk-delete", bulkDeleteIncidentReports);

// DELETE - delete single report by id
router.delete("/:id", deleteIncidentReport);

// PUT - update incident report
router.put(
  "/:id",
  upload.fields([
    { name: "image1" },
    { name: "image2" },
    { name: "image3" },
    { name: "image4" },
  ]),
  updateIncidentReport
);

module.exports = router;
