// requestMaterialController.js

const db = require("../config/db"); // Adjust the path as needed
const moment = require('moment');


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
  const { selectedProject, urgency, notes, selectedMaterials } = req.body;

  console.log("Received request to create materials:", req.body); // Debugging log

  if (!selectedProject || !urgency || !selectedMaterials || selectedMaterials.length === 0) {
    return res.status(400).json({ error: "Missing required fields." });
  }

  // Input validation for selectedMaterials
  if (!Array.isArray(selectedMaterials) || selectedMaterials.some(item => !item.item_id || !item.request_quantity)) {
    return res.status(400).json({ error: "Invalid selectedMaterials format." });
  }

  db.beginTransaction((err) => {
    if (err) {
      console.error("Database transaction error:", err); // Debugging Log
      return res.status(500).json({ error: "Database transaction error." });
    }

    db.query(
      "INSERT INTO requested_materials (project_name, urgency, notes) VALUES (?, ?, ?)",
      [selectedProject, urgency, notes],
      (err, requestResults) => {
        if (err) {
          console.error("❌ Error inserting requested materials:", err);
          return db.rollback(() => {
            return res.status(500).json({ error: "Error creating request." });
          });
        }

        const request_id = requestResults.insertId;
        console.log("Inserted requested materials, request ID:", request_id); // Debugging log

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
              console.error("❌ Error inserting requested material items:", err);
              return db.rollback(() => {
                return res.status(500).json({ error: "Error adding items to request." });
              });
            }

            console.log("Inserted requested material items"); // Debugging log

            db.commit((err) => {
              if (err) {
                console.error("❌ Error committing transaction:", err);
                return db.rollback(() => {
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


const getRequestedMaterialsHistory = (req, res) => {
  db.query(
    `SELECT 
      rm.request_id, 
      rm.project_name, 
      rm.urgency, 
      rm.notes, 
      rm.is_approved, 
      rm.request_date,
      rm.approved_at, 
      rmi.item_id, 
      ii.item_name, 
      rmi.request_quantity 
    FROM requested_materials rm
    JOIN requested_material_items rmi ON rm.request_id = rmi.request_id
    JOIN inventory_items ii ON rmi.item_id = ii.item_id
    ORDER BY rm.request_id`,
    (err, results) => {
      if (err) {
        console.error("❌ Error fetching requested materials history:", err);
        return res.status(500).json({ error: "Server error while fetching history" });
      }

      if (!results || results.length === 0) {
        console.warn("⚠️ No requested materials history found.");
        return res.status(404).json({ message: "No requested materials history found." });
      }

      const formattedResults = results.reduce((acc, row) => {
        const existingRequest = acc.find(item => item.request_id === row.request_id);
        if (existingRequest) {
          existingRequest.items.push({
            item_id: row.item_id,
            item_name: row.item_name,
            request_quantity: row.request_quantity,
          });
        } else {
          acc.push({
            request_id: row.request_id,
            project_name: row.project_name,
            urgency: row.urgency,
            notes: row.notes,
            status:
              row.is_approved === 1
                ? 'approved'
                : row.is_approved === 2
                ? 'rejected'
                : 'pending',
            request_date: row.request_date,
            approved_at: row.approved_at, 
            items: [{
              item_id: row.item_id,
              item_name: row.item_name,
              request_quantity: row.request_quantity,
            }],
          });
        }
        return acc;
      }, []);

      console.log("📌 Sending Requested Materials History Data:", formattedResults);
      return res.json(formattedResults);
    }
  );
};

const approveRequest = (req, res) => {
  const requestId = req.params.requestId;
  const approvedBy = 'Admin'; 
  const approvedAt = moment().format('YYYY-MM-DD HH:mm:ss');

  db.query(
    'UPDATE requested_materials SET is_approved = 1, approved_by = ?, approved_at = ? WHERE request_id = ?',
    [approvedBy, approvedAt, requestId],
    (err, results) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Failed to approve request' });
      }
      if (results.affectedRows === 0) {
        return res.status(404).json({ error: 'Request not found' });
      }
      res.json({ message: 'Request approved successfully' });
    }
  );
};

const rejectRequest = (req, res) => {
  const requestId = req.params.requestId;
  const rejectedAt = moment().format('YYYY-MM-DD HH:mm:ss'); // Get the current date and time

  db.query(
    'UPDATE requested_materials SET is_approved = 2, approved_at = ? WHERE request_id = ?', // 2 represents rejected
    [rejectedAt, requestId],
    (err, results) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Failed to reject request' });
      }
      if (results.affectedRows === 0) {
        return res.status(404).json({ error: 'Request not found' });
      }
      res.json({ message: 'Request rejected successfully' });
    }
  );
};
module.exports = { getRequestMaterialItems, createRequestedMaterials, getRequestedMaterialsHistory, approveRequest, rejectRequest };