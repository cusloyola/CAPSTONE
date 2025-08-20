const db = require("../config/db"); // ✅ CommonJS import

// 📌 Create Safety Report
const createSafetyReport = (req, res) => {
  try {
    console.log("📥 POST /api/safetyReports hit!");
    console.log("📦 Request body:", req.body);

    const { project_id, report_date, description } = req.body;
    const image1 = req.files?.image1 ? `/uploads/weeklySafetyReports/${req.files.image1[0].filename}` : null;
    const image2 = req.files?.image2 ? `/uploads/weeklySafetyReports/${req.files.image2[0].filename}` : null;

    db.query(
      `INSERT INTO weekly_safety_report 
       (project_id, report_date, description, image1, image2) 
       VALUES (?, ?, ?, ?, ?)`,
      [project_id, report_date, description, image1, image2],
      (err, result) => {
        if (err) {
          console.error("❌ SQL Error (createSafetyReport):", err);
          if (err.code === "ER_DUP_ENTRY") {
            return res.status(400).json({ error: "A report already exists for this project and date." });
          }
          return res.status(500).json({ error: "Server error while creating report" });
        }

        console.log("✅ Report inserted with ID:", result.insertId);

        res.status(201).json({
          safety_report_id: result.insertId,
          project_id,
          report_date,
          description,
          image1,
          image2,
        });
      }
    );
  } catch (err) {
    console.error("❌ Unexpected Error (createSafetyReport):", err);
    res.status(500).json({ error: "Unexpected server error" });
  }
};

// 📌 Get All Reports
const getSafetyReports = (req, res) => {

  db.query(
    `SELECT wsr.*, p.project_name 
     FROM weekly_safety_report wsr
     JOIN projects p ON wsr.project_id = p.project_id
     ORDER BY report_date DESC`,
    (err, rows) => {
      if (err) {
        console.error("❌ SQL Error (getSafetyReports):", err);
        return res.status(500).json({ error: "Server error while fetching reports" });
      }

      res.json(rows);
    }
  );
};

// 📌 Get Report by ID
const getSafetyReportById = (req, res) => {
  const { id } = req.params;
  console.log(`📥 GET /api/safetyReports/${id} hit!`);

  db.query(
    `SELECT * FROM weekly_safety_report WHERE safety_report_id = ?`,
    [id],
    (err, rows) => {
      if (err) {
        console.error("❌ SQL Error (getSafetyReportById):", err);
        return res.status(500).json({ error: "Server error while fetching report" });
      }

      if (rows.length === 0) {
        console.warn(`⚠️ Report not found: ID ${id}`);
        return res.status(404).json({ error: "Report not found" });
      }

      console.log("✅ Report fetched:", rows[0]);
      res.json(rows[0]);
    }
  );
};

module.exports = {
  createSafetyReport,
  getSafetyReports,
  getSafetyReportById,
};
