const { parse } = require("dotenv");
const db = require("../../config/db");

const getRebarMasterlist = (req, res) => {
  const sql = `SELECT * FROM rebar_masterlist ORDER BY diameter_mm, length_m, label`;

  db.query(sql, (err, results) => {
    if (err) {
      console.error("❌ Error fetching rebar masterlist:", err);
      return res.status(500).json({ message: "Database error" });
    }

    // ✅ Here 'results' is defined as the second argument of db.query
    return res.status(200).json(results);
  });
};


const addRebarEntries = async (req, res) => {
  try {
    const { rebar_entries, sow_proposal_id } = req.body;

    console.log("📥 Received rebar payload:", req.body);

    if (!sow_proposal_id) {
      return res.status(400).json({ message: "Missing sow_proposal_id" });
    }

    if (!Array.isArray(rebar_entries) || rebar_entries.length === 0) {
      return res.status(400).json({ message: "No rebars to submit" });
    }

    // 1. Insert each rebar entry
    const insertPromises = rebar_entries.map(item => {
      const {
        quantity,
        total_weight,
        rebar_masterlist_id,
        work_item_id,
        location,
        floor_id
      } = item;

      const qty = parseFloat(quantity) || 0;
      const weight = parseFloat(total_weight) || 0;

      if (!rebar_masterlist_id || qty <= 0) {
        return Promise.resolve(); // Skip invalid rows
      }

      return db.query(
        `INSERT INTO rebar_details 
          (rebar_masterlist_id, work_item_id, sow_proposal_id, total_weight, location, quantity, floor_id)
          VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [rebar_masterlist_id, work_item_id, sow_proposal_id, weight, location, qty, floor_id]
      );
    });

    await Promise.all(insertPromises);
    console.log("✅ All rebar entries inserted.");

    // 2. Get the total weight properly
    // The [rowsWeight] destructuring here will correctly make rowsWeight the RowDataPacket.
    // This assumes db.query for a single row result (like SUM) returns [RowDataPacket, fields].
    const [rowsWeight] = await db.query(
      `SELECT SUM(total_weight) AS rebar_total
       FROM rebar_details
       WHERE sow_proposal_id = ?`,
      [sow_proposal_id]
    );

    console.log("DEBUG: rowsWeight from SUM query:", rowsWeight); // This correctly shows RowDataPacket { rebar_total: ... }

    // FIX IS HERE: Access rebar_total directly from rowsWeight (remove [0])
    const totalWeight = parseFloat(rowsWeight?.rebar_total ?? 0); // Corrected line
    console.log("📊 Total Rebar Weight:", totalWeight);

    // 3. Ensure only one row per sow_proposal_id
    await db.query(
      `INSERT INTO rebar_totals (sow_proposal_id, rebar_overall_weight)
       VALUES (?, ?)
       ON DUPLICATE KEY UPDATE rebar_overall_weight = VALUES(rebar_overall_weight)`,
      [sow_proposal_id, totalWeight]
    );
    console.log("✅ Rebar total inserted/updated for sow_proposal_id", sow_proposal_id);

    return res.status(201).json({ message: "Rebar successfully added and total updated" });

  } catch (error) {
    console.error("❌ Error adding rebar in database", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
const getRebarByProposalId = (req, res) => {
  const { proposal_id } = req.params;

  if (!proposal_id) {
    return res.status(400).json({ message: "Missing proposal_id" });
  }

  const sql = `
    SELECT 
  rd.rebar_details_id,
  rd.rebar_masterlist_id,
  rm.label AS rebar_label,
  rd.work_item_id,
  child.item_title AS item_title,
  parent.item_title AS parent_title,
  rd.total_weight,
  rd.location,
  rd.quantity,
  pf.floor_code,
  pf.floor_label
FROM rebar_details rd
JOIN sow_proposal sp ON rd.sow_proposal_id = sp.sow_proposal_id
JOIN sow_work_items child ON rd.work_item_id = child.work_item_id
JOIN sow_work_items parent ON child.parent_id = parent.work_item_id
JOIN rebar_masterlist rm ON rd.rebar_masterlist_id = rm.rebar_masterlist_id
LEFT JOIN project_floors pf ON rd.floor_id = pf.floor_id
WHERE sp.proposal_id = ?

  `;

  db.query(sql, [proposal_id], (err, results) => {
    if (err) {
      console.error("❌ Error fetching rebar details by proposal_id:", err);
      return res.status(500).json({ message: "Database error" });
    }

    return res.status(200).json({
      message: "✅ Rebar details fetched successfully",
      data: results,
    });
  });
};

const getRebarTotalUsed = async (req, res) => {
  const { proposal_id } = req.params;

  try {
    
    const rows = await db.query( 
      `SELECT 
        rd.rebar_masterlist_id,
        rm.label AS rebar_label,
        SUM(rd.quantity) AS total_quantity_used,
        SUM(rd.total_weight) AS total_weight_used
      FROM rebar_details rd
      JOIN rebar_masterlist rm ON rd.rebar_masterlist_id = rm.rebar_masterlist_id
      JOIN sow_proposal sp ON rd.sow_proposal_id = sp.sow_proposal_id
      WHERE sp.proposal_id = ?
      GROUP BY rd.rebar_masterlist_id`,
      [proposal_id]
    );

    res.status(200).json({ message: "Rebar totals fetched", data: rows });
  } catch (err) {
    console.error("Error fetching rebar totals", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
    getRebarMasterlist,
    addRebarEntries,
    getRebarByProposalId,
    getRebarTotalUsed
};