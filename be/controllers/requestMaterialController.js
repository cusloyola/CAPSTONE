const db = require("../config/db");

const getRequestMaterialItems = (req, res) => {
  db.query(
    "SELECT item_id, item_name, stock_quantity FROM inventory_items WHERE isDeleted = 0",
    (err, results) => {
      if (err) {
        console.error("❌ Error fetching request material items:", err);
        return res
          .status(500)
          .json({ error: "Server error while fetching request material items" });
      }
      if (!results || results.length === 0) {
        console.warn("⚠️ No request material items found.");
        return res
          .status(404)
          .json({ message: "No request material items found." });
      }
      console.log("📌 Sending Request Material Items Data:", results);
      return res.json(results);
    }
  );
};

const createRequestedMaterials = (req, res) => {
  const { project_name, urgency, notes, selectedMaterials } = req.body;

  if (!project_name || !urgency || !selectedMaterials || selectedMaterials.length === 0) {
    return res.status(400).json({ error: "Missing required fields." });
  }

  db.beginTransaction((err) => {
    if (err) {
      return res.status(500).json({ error: "Database transaction error." });
    }

    db.query(
      "INSERT INTO requested_materials (project_name, urgency, notes) VALUES (?, ?, ?)",
      [project_name, urgency, notes],
      (err, requestResults) => {
        if (err) {
          return db.rollback(() => {
            console.error("❌ Error inserting requested materials:", err);
            return res.status(500).json({ error: "Error creating request." });
          });
        }

        const request_id = requestResults.insertId;

        const values = selectedMaterials.map((item) => [
          request_id,
          item.item_id,
          item.request_quantity,
        ]);

        db.query(
          "INSERT INTO requested_material_items (request_id, item_id, request_quantity) VALUES ?",
          [values],
          (err) => {
            if (err) {
              return db.rollback(() => {
                console.error("❌ Error inserting requested material items:", err);
                return res.status(500).json({ error: "Error adding items to request." });
              });
            }

            db.commit((err) => {
              if (err) {
                return db.rollback(() => {
                  console.error("❌ Error committing transaction:", err);
                  return res.status(500).json({ error: "Error completing request." });
                });
              }
              console.log("✅ Request created successfully.");
              return res.status(201).json({ message: "Request created successfully." });
            });
          }
        );
      }
    );
  });
};

module.exports = { getRequestMaterialItems, createRequestedMaterials };