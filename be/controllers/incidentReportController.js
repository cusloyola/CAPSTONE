const db = require("../config/db"); // ✅ CommonJS import
const fs = require("fs");
const path = require("path");
const generateStructuredId = require("../generated/GenerateCodes/generatecode"); // adjust path

// 📌 Create Incident Report
const createIncidentReport = async (req, res) => {
  try {
    const { project_id, report_date, description, user_id } = req.body;

    const image1 = req.files?.image1
      ? `uploads/incidentReports/${req.files.image1[0].filename}`
      : null;
    const image2 = req.files?.image2
      ? `uploads/incidentReports/${req.files.image2[0].filename}`
      : null;
    const image3 = req.files?.image3
      ? `uploads/incidentReports/${req.files.image3[0].filename}`
      : null;
    const image4 = req.files?.image4
      ? `uploads/incidentReports/${req.files.image4[0].filename}`
      : null;

    // Generate structured ID
    const incident_report_id = await generateStructuredId(
      "109",
      "incident_report",
      "incident_report_id"
    );

    db.query(
      `INSERT INTO incident_report 
      (incident_report_id, project_id, report_date, description, image1, image2, image3, image4, user_id) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        incident_report_id,
        project_id,
        report_date,
        description,
        image1,
        image2,
        image3,
        image4,
        user_id,
      ],
      (err, result) => {
        if (err) {
          console.error("❌ SQL Error (createIncidentReport):", err);
          if (err.code === "ER_DUP_ENTRY") {
            return res
              .status(400)
              .json({ error: "A report already exists for this project and date." });
          }
          return res.status(500).json({ error: "Server error while creating report" });
        }

        console.log("✅ Incident Report inserted with ID:", incident_report_id);

        // Fetch project name and user full_name
        db.query(
          `SELECT p.project_name, u.full_name 
           FROM projects p 
           JOIN users u ON u.user_id = ? 
           WHERE p.project_id = ?`,
          [user_id, project_id],
          (fetchErr, rows) => {
            if (fetchErr) {
              console.warn("⚠️ Could not fetch project/user info:", fetchErr);
              return res.status(201).json({
                incident_report_id,
                project_id,
                report_date,
                description,
                image1,
                image2,
                image3,
                image4,
                user_id,
                project_name: null,
                full_name: null,
                status: "Pending",
              });
            }

            const project_name = rows[0]?.project_name || "Unknown Project";
            const full_name = rows[0]?.full_name || "Unknown User";

            res.status(201).json({
              incident_report_id,
              project_id,
              report_date,
              description,
              image1,
              image2,
              image3,
              image4,
              user_id,
              project_name,
              full_name,
              status: "Pending",
            });
          }
        );
      }
    );
  } catch (err) {
    console.error("❌ Unexpected Error (createIncidentReport):", err);
    res.status(500).json({ error: "Unexpected server error" });
  }
};

// 📌 Get All Incident Reports
const getIncidentReports = (req, res) => {
  db.query(
    `SELECT 
       ir.incident_report_id,
       ir.project_id,
       p.project_name,
       ir.report_date,
       ir.description,
       ir.image1,
       ir.image2,
       ir.image3,
       ir.image4,
       ir.user_id,
       ir.status,
       u.full_name
     FROM incident_report ir
     JOIN projects p ON ir.project_id = p.project_id
     JOIN users u ON ir.user_id = u.user_id
     ORDER BY ir.report_date DESC`,
    (err, rows) => {
      if (err) {
        console.error("❌ SQL Error (getIncidentReports):", err);
        return res.status(500).json({ error: "Server error while fetching reports" });
      }
      res.json(rows);
    }
  );
};

// 📌 Get Incident Report by ID
const getIncidentReportById = (req, res) => {
  const { id } = req.params;
  console.log(`📥 GET /api/incidentReports/${id} hit!`);

  db.query(
    `SELECT 
       ir.incident_report_id,
       ir.project_id,
       p.project_name,
       ir.report_date,
       ir.description,
       ir.status,
       ir.image1,
       ir.image2,
       ir.image3,
       ir.image4,
       ir.user_id,
       u.full_name
     FROM incident_report ir
     JOIN projects p ON ir.project_id = p.project_id
     JOIN users u ON ir.user_id = u.user_id
     WHERE ir.incident_report_id = ?`,
    [id],
    (err, rows) => {
      if (err) {
        console.error("❌ SQL Error (getIncidentReportById):", err);
        return res.status(500).json({ error: "Server error while fetching report" });
      }

      if (rows.length === 0) {
        console.warn(`⚠️ Report not found: ID ${id}`);
        return res.status(404).json({ error: "Report not found" });
      }

      console.log("✅ Incident Report fetched:", rows[0]);
      res.json(rows[0]);
    }
  );
};

// 📌 Update Incident Report
const updateIncidentReport = (req, res) => {
  const { id } = req.params;
  const { description, status, project_id, report_date } = req.body;

  const image1 = req.files?.image1 ? `/uploads/incidentReports/${req.files.image1[0].filename}` : null;
  const image2 = req.files?.image2 ? `/uploads/incidentReports/${req.files.image2[0].filename}` : null;
  const image3 = req.files?.image3 ? `/uploads/incidentReports/${req.files.image3[0].filename}` : null;
  const image4 = req.files?.image4 ? `/uploads/incidentReports/${req.files.image4[0].filename}` : null;

  console.log(`📥 PUT /api/incidentReports/${id} hit!`);
  console.log("📦 Request body:", req.body);
  console.log("🖼️ New files:", req.files);

  db.query(
    "SELECT image1, image2, image3, image4 FROM incident_report WHERE incident_report_id = ?",
    [id],
    (err, rows) => {
      if (err) {
        console.error("❌ SQL Error (fetch before update):", err);
        return res.status(500).json({ error: "Server error while fetching report for update" });
      }

      if (rows.length === 0) {
        console.warn(`⚠️ Report not found for update: ID ${id}`);
        return res.status(404).json({ error: "Report not found" });
      }

      const oldImages = rows[0];
      let updateFields = { description, status, project_id, report_date };
      let updateValues = [];

      // Handle replacing old images
      [image1, image2, image3, image4].forEach((img, idx) => {
        if (img) {
          updateFields[`image${idx + 1}`] = img;
          if (oldImages[`image${idx + 1}`]) {
            const oldPath = path.join(__dirname, "..", oldImages[`image${idx + 1}`]);
            fs.unlink(oldPath, (unlinkErr) => {
              if (unlinkErr) console.warn(`⚠️ Could not delete old file ${oldPath}:`, unlinkErr.message);
            });
          }
        }
      });

      // Build dynamic SQL
      const setClause = Object.keys(updateFields)
        .filter(key => updateFields[key] !== undefined)
        .map(key => {
          updateValues.push(updateFields[key]);
          return `${key} = ?`;
        }).join(", ");

      updateValues.push(id);

      const sql = `UPDATE incident_report SET ${setClause} WHERE incident_report_id = ?`;

      db.query(sql, updateValues, (updateErr, result) => {
        if (updateErr) {
          console.error("❌ SQL Error (updateIncidentReport):", updateErr);
          return res.status(500).json({ error: "Server error while updating report" });
        }
        if (result.affectedRows === 0) {
          return res.status(404).json({ error: "Report not found or no changes were made." });
        }
        console.log(`✅ Incident Report updated: ID ${id}`);

        res.json({
          message: "Incident Report updated successfully",
          updatedId: id,
          ...updateFields,
        });
      });
    }
  );
};

// 📌 Delete Incident Report by ID
const deleteIncidentReport = (req, res) => {
  const { id } = req.params;
  console.log(`📥 DELETE /api/incidentReports/${id} hit!`);

  db.query(
    `SELECT image1, image2, image3, image4 FROM incident_report WHERE incident_report_id = ?`,
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

      const { image1, image2, image3, image4 } = rows[0];

      db.query(
        `DELETE FROM incident_report WHERE incident_report_id = ?`,
        [id],
        (err, result) => {
          if (err) {
            console.error("❌ SQL Error (deleteIncidentReport):", err);
            return res.status(500).json({ error: "Server error while deleting report" });
          }

          if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Report not found" });
          }

          console.log(`✅ Incident Report deleted: ID ${id}`);

          [image1, image2, image3, image4].forEach((imgPath) => {
            if (imgPath) {
              const fullPath = path.join(__dirname, "..", imgPath);
              fs.unlink(fullPath, (err) => {
                if (err) {
                  console.warn(`⚠️ Could not delete file ${fullPath}:`, err.message);
                } else {
                  console.log(`🗑️ Deleted file: ${fullPath}`);
                }
              });
            }
          });

          res.json({ message: "Incident Report and images deleted successfully", deletedId: id });
        }
      );
    }
  );
};

// 📌 Bulk Delete Incident Reports
const bulkDeleteIncidentReports = (req, res) => {
  const { ids } = req.body;

  if (!Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ error: "No report IDs provided" });
  }

  db.query(
    `SELECT image1, image2, image3, image4 FROM incident_report WHERE incident_report_id IN (?)`,
    [ids],
    (err, rows) => {
      if (err) {
        console.error("❌ SQL Error (fetch before bulk delete):", err);
        return res.status(500).json({ error: "Server error while checking reports" });
      }

      db.query(
        `DELETE FROM incident_report WHERE incident_report_id IN (?)`,
        [ids],
        (err, result) => {
          if (err) {
            console.error("❌ SQL Error (bulkDeleteIncidentReports):", err);
            return res.status(500).json({ error: "Server error while deleting reports" });
          }

          console.log(`✅ Bulk deleted ${result.affectedRows} incident reports`);

          rows.forEach(({ image1, image2, image3, image4 }) => {
            [image1, image2, image3, image4].forEach((imgPath) => {
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

          res.json({
            message: `Deleted ${result.affectedRows} incident report(s) successfully`,
            deletedIds: ids,
          });
        }
      );
    }
  );
};

module.exports = {
  createIncidentReport,
  getIncidentReports,
  getIncidentReportById,
  updateIncidentReport,
  deleteIncidentReport,
  bulkDeleteIncidentReports,
};
