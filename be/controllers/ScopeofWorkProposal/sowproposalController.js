const db = require('../../config/db');

const getAllSOWWorkItems = (req, res) => {
  const proposal_id = req.query.proposal_id;
  if (!proposal_id) {
    return res.status(400).json({ error: "Missing proposal_id" });
  }

  const sql = `
    SELECT s.work_item_id, s.item_title, s.unit_of_measure, s.sequence_order,
           t.type_name AS category
    FROM sow_work_items s
    JOIN sow_work_types t ON s.work_type_id = t.work_type_id
    WHERE s.work_item_id NOT IN (
      SELECT work_item_id FROM sow_proposal WHERE proposal_id = ?
    )
    ORDER BY s.sequence_order
  `;

  db.query(sql, [proposal_id], (err, results) => {
    if (err) {
      console.error("DB error:", err);
      return res.status(500).json({ error: "DB error" });
    }
    res.json(results);
  });
};


const getSowWorkItemsByProposal = (req, res) => {
  const { proposal_id } = req.params;

  if (!proposal_id) {
    return res.status(400).json({ error: "proposal_id is required" });
  }

  const sql = `
    SELECT s.work_item_id, s.item_title, s.unit_of_measure, s.sequence_order,
           t.type_name AS category
    FROM sow_work_items s
    JOIN sow_work_types t ON s.work_type_id = t.work_type_id
    JOIN sow_proposal p ON s.work_item_id = p.work_item_id
    WHERE p.proposal_id = ?
    ORDER BY s.sequence_order
  `;

  db.query(sql, [proposal_id], (err, results) => {
    if (err) {
      console.error("Failed to fetch SOW work items by proposal:", err);
      return res.status(500).json({ error: "Server error fetching work items" });
    }
    res.status(200).json(results);
  });
};


const addSOWWorkItems = async (req, res) => {
  try {
    const { proposal_id, work_item_ids } = req.body;

    if (!proposal_id) {
      return res.status(400).json({ message: "proposal_id is required" });
    }

    if (!work_item_ids || !Array.isArray(work_item_ids) || work_item_ids.length === 0) {
      return res.status(400).json({ message: "No work items selected" });
    }

    const insertPromises = work_item_ids.map(work_item_id => {
      return db.query(
        "INSERT INTO sow_proposal (proposal_id, work_item_id) VALUES (?, ?)",
        [proposal_id, work_item_id]
      );
    });

    await Promise.all(insertPromises);

    res.status(201).json({ message: "Work items added to proposal successfully" });
  } catch (error) {
    console.error("Error inserting work items:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getAllWorkItemsRaw = (req, res) => {
  const sql = `
    SELECT work_item_id, item_title, item_description, unit_of_measure, sequence_order
    FROM sow_work_items
    ORDER BY sequence_order
  `;
  db.query(sql, (err, results) => {
    if (err) {
      console.error("DB error:", err);
      return res.status(500).json({ error: "DB error" });
    }
    res.json(results);
  });
};

// ADD
const addWorkItem = (req, res) => {
  const { item_title, item_description, unit_of_measure, sequence_order, work_type_id } = req.body;
  const sql = `
    INSERT INTO sow_work_items (work_type_id, item_title, item_description, unit_of_measure, sequence_order)
    VALUES (?, ?, ?, ?, ?)
  `;
  db.query(sql, [work_type_id, item_title, item_description, unit_of_measure, sequence_order], (err, result) => {
    if (err) {
      console.error("Add Work Item DB error:", err);
      return res.status(500).json({ error: "DB error", details: err });
    }
    res.json({ success: true, id: result.insertId });
  });
};

// UPDATE
const updateWorkItem = (req, res) => {
  const { id } = req.params;
  const { item_title, item_description, unit_of_measure, sequence_order } = req.body;
  const sql = `
    UPDATE sow_work_items
    SET item_title=?, item_description=?, unit_of_measure=?, sequence_order=?
    WHERE work_item_id=?
  `;
  db.query(sql, [item_title, item_description, unit_of_measure, sequence_order, id], (err) => {
    if (err) return res.status(500).json({ error: "DB error" });
    res.json({ success: true });
  });
};

// DELETE
const deleteWorkItem = (req, res) => {
  const { id } = req.params;
  const sql = `DELETE FROM sow_work_items WHERE work_item_id=?`;
  db.query(sql, [id], (err) => {
    if (err) return res.status(500).json({ error: "DB error" });
    res.json({ success: true });
  });
};

const getAllWorkTypes = (req, res) => {
  const sql = "SELECT work_type_id, type_name, type_description, sequence_order FROM sow_work_types ORDER BY sequence_order";
  db.query(sql, (err, results) => {
    if (err) {
      console.error("DB error:", err);
      return res.status(500).json({ error: "DB error" });
    }
    res.json(results);
  });
};

module.exports = {
  getAllSOWWorkItems,
  addSOWWorkItems,
  getSowWorkItemsByProposal,
  getAllWorkItemsRaw,
  addWorkItem,
  updateWorkItem,
  deleteWorkItem,
  getAllWorkTypes,

};
