const db = require ('../../config/db');

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




module.exports = {
  getAllSOWWorkItems,
  addSOWWorkItems,
  getSowWorkItemsByProposal

};
