const db = require("../config/db"); // ✅ CommonJS import
const fs = require("fs");
const path = require("path");


// 📌 Create Safety Report
const createSafetyReport = (req, res) => {
  try {
    console.log("📥 POST /api/safetyReports hit!");
    console.log("📦 Request body:", req.body);

    const { project_id, report_date, description, user_id } = req.body;
    const image1 = req.files?.image1 ? `/uploads/weeklySafetyReports/${req.files.image1[0].filename}` : null;
    const image2 = req.files?.image2 ? `/uploads/weeklySafetyReports/${req.files.image2[0].filename}` : null;

    db.query(
      `INSERT INTO weekly_safety_report 
       (project_id, report_date, description, image1, image2, user_id) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [project_id, report_date, description, image1, image2, user_id],
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
          user_id
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
    `SELECT 
       wsr.safety_report_id,
       wsr.project_id,
       p.project_name,
       wsr.report_date,
       wsr.description,
       wsr.image1,
       wsr.image2,
       wsr.user_id,
       wsr.status,
       u.full_name     -- 👈 from users
     FROM weekly_safety_report wsr
     JOIN projects p ON wsr.project_id = p.project_id
     JOIN users u ON wsr.user_id = u.user_id
     ORDER BY wsr.report_date DESC`,
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
    `SELECT 
       wsr.safety_report_id,
       wsr.project_id,
       p.project_name,
       wsr.report_date,
       wsr.description,
       wsr.status,
       wsr.image1,
       wsr.image2,
       wsr.user_id,
       u.full_name
     FROM weekly_safety_report wsr
     JOIN projects p ON wsr.project_id = p.project_id
     JOIN users u ON wsr.user_id = u.user_id
     WHERE wsr.safety_report_id = ?`,
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

// 📌 Delete Report by ID (with image cleanup)
const deleteSafetyReport = (req, res) => {
  const { id } = req.params;
  console.log(`📥 DELETE /api/safetyReports/${id} hit!`);

  // 1️⃣ Fetch the report first to know its images
  db.query(
    `SELECT image1, image2 FROM weekly_safety_report WHERE safety_report_id = ?`,
    [id],
    (err, rows) => {
      if (err) {
        console.error("❌ SQL Error (fetch before delete):", err);
        return res.status(500).json({ error: "Server error while checking report" });
      }

      if (rows.length === 0) {
        console.warn(`⚠️ Report not found for deletion: ID ${id}`);
        return res.status(404).json({ error: "Report not found" });
      }

      const { image1, image2 } = rows[0];

      // 2️⃣ Delete the record
      db.query(
        `DELETE FROM weekly_safety_report WHERE safety_report_id = ?`,
        [id],
        (err, result) => {
          if (err) {
            console.error("❌ SQL Error (deleteSafetyReport):", err);
            return res.status(500).json({ error: "Server error while deleting report" });
          }

          if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Report not found" });
          }

          console.log(`✅ Report deleted: ID ${id}`);

          // 3️⃣ Delete the images from filesystem if they exist
          [image1, image2].forEach((imgPath) => {
            if (imgPath) {
              const fullPath = path.join(__dirname, "..", imgPath); // adjust if needed
              fs.unlink(fullPath, (err) => {
                if (err) {
                  console.warn(`⚠️ Could not delete file ${fullPath}:`, err.message);
                } else {
                  console.log(`🗑️ Deleted file: ${fullPath}`);
                }
              });
            }
          });

          res.json({ message: "Report and images deleted successfully", deletedId: id });
        }
      );
    }
  );
};

const bulkDeleteSafetyReports = (req, res) => {
  const { ids } = req.body; // expecting an array of IDs

  if (!Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ error: "No report IDs provided" });
  }

  // 1️⃣ Fetch reports first to get image paths
  db.query(
    `SELECT image1, image2 FROM weekly_safety_report WHERE safety_report_id IN (?)`,
    [ids],
    (err, rows) => {
      if (err) {
        console.error("❌ SQL Error (fetch before bulk delete):", err);
        return res.status(500).json({ error: "Server error while checking reports" });
      }

      // 2️⃣ Delete reports from DB
      db.query(
        `DELETE FROM weekly_safety_report WHERE safety_report_id IN (?)`,
        [ids],
        (err, result) => {
          if (err) {
            console.error("❌ SQL Error (bulkDeleteSafetyReports):", err);
            return res.status(500).json({ error: "Server error while deleting reports" });
          }

          console.log(`✅ Bulk deleted ${result.affectedRows} reports`);

          // 3️⃣ Delete images from filesystem (safe cleanup)
          rows.forEach(({ image1, image2 }) => {
            [image1, image2].forEach((imgPath) => {
              if (imgPath) {
                try {
                  const fullPath = path.join(__dirname, "..", imgPath);
                  fs.unlink(fullPath, (err) => {
                    if (err) {
                      console.warn(`⚠️ Could not delete file ${fullPath}:`, err.message);
                    } else {
                      console.log(`🗑️ Deleted file: ${fullPath}`);
                    }
                  });
                } catch (e) {
                  console.warn(`⚠️ Error resolving path for ${imgPath}:`, e.message);
                }
              }
            });
          });

          // 4️⃣ Respond to frontend
          res.json({
            message: `Deleted ${result.affectedRows} report(s) successfully`,
            deletedIds: ids,
          });
        }
      );
    }
  );
};

module.exports = {
  createSafetyReport,
  getSafetyReports,
  getSafetyReportById,
  deleteSafetyReport,
  bulkDeleteSafetyReports
};
