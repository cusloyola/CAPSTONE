const db = require('../../config/db');

// Get all SOW Work Types (only not deleted)
const getSOWWorkTypes = (req, res) => {
  const sql = `
    SELECT work_type_id, type_name, type_description, sequence_order 
    FROM sow_work_types 
    WHERE isDeleted = 0
    ORDER BY sequence_order
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error("Error fetching SOW Work Types:", err);
      return res.status(500).json({ error: "Database error" });
    }

    res.status(200).json(results);
  });
};

// Get a specific SOW Work Type by ID (for editing)
const getSOWWorkTypeById = (req, res) => {
  const { id } = req.params;

  const sql = `
    SELECT work_type_id, type_name, type_description, sequence_order
    FROM sow_work_types
    WHERE work_type_id = ? AND isDeleted = 0
  `;

  db.query(sql, [id], (err, results) => {
    if (err) {
      console.error("Error fetching work type:", err);
      return res.status(500).json({ error: "Failed to fetch work type" });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: "Work type not found" });
    }

    res.status(200).json(results[0]);
  });
};

// Update (edit) a specific SOW Work Type
const updateSOWWorkType = (req, res) => {
  const { id } = req.params;
  const { type_name, type_description, sequence_order } = req.body;

  if (!type_name || !type_description || sequence_order == null) {
    return res.status(400).json({ error: "type_name, type_description, and sequence_order are required" });
  }

  const sql = `
    UPDATE sow_work_types
    SET type_name = ?, type_description = ?, sequence_order = ?, updated_at = CURRENT_TIMESTAMP()
    WHERE work_type_id = ? AND isDeleted = 0
  `;

  db.query(sql, [type_name, type_description, sequence_order, id], (err, result) => {
    if (err) {
      console.error("Error updating work type:", err);
      return res.status(500).json({ error: "Failed to update work type" });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Work type not found or already deleted" });
    }

    res.status(200).json({ message: "Work type updated successfully" });
  });
};

// Soft delete a SOW Work Type
const softDeleteSOWWorkType = (req, res) => {
  const { id } = req.params;

  const sql = `UPDATE sow_work_types SET isDeleted = 1 WHERE work_type_id = ?`;

  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error("Error soft deleting work type:", err);
      return res.status(500).json({ error: "Failed to soft delete work type" });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Work type not found" });
    }

    res.status(200).json({ message: "Work type soft deleted successfully" });
  });
};

// Add new SOW Work Type
const addSOWWorkType = (req, res) => {
  const { type_name, type_description, sequence_order } = req.body;

  if (!type_name || !type_description || sequence_order == null) {
    return res.status(400).json({ error: "type_name, type_description, and sequence_order are required" });
  }

  const sql = `
    INSERT INTO sow_work_types (type_name, type_description, sequence_order, isDeleted)
    VALUES (?, ?, ?, 0)
  `;

  db.query(sql, [type_name, type_description, sequence_order], (err, result) => {
    if (err) {
      console.error("Error adding new work type:", err);
      return res.status(500).json({ error: "Failed to add new work type" });
    }

    res.status(201).json({
      message: "Work type added successfully",
      work_type_id: result.insertId,
    });
  });
};

module.exports = {
  getSOWWorkTypes,
  getSOWWorkTypeById,   // ⬅️ New
  updateSOWWorkType,    // ⬅️ New
  softDeleteSOWWorkType,
  addSOWWorkType,
};
