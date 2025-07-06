const db = require('../../config/db');

const addQtoEntries = async (req, res) => {
  try {
    const { qto_entries } = req.body;

    if (!qto_entries || !Array.isArray(qto_entries) || qto_entries.length === 0) {
      return res.status(400).json({ message: "No QTO entries provided" });
    }

    // Step 1: Insert entries sequentially
    for (const entry of qto_entries) {
     const {
  sow_proposal_id,
  label = null,
  length = null,
  width = null,
  depth = null,
  floor_id = null,
  units = 1,
  work_item_id = null
} = entry;

const l = length === null ? 0 : parseFloat(length);
const w = width === null ? 0 : parseFloat(width);
const d = depth === null ? null : parseFloat(depth);
const u = units === null ? 1 : parseFloat(units);

const calculated_value = d === null || d === 0
  ? l * w * u
  : l * w * d * u;
  
    console.log('📦 Inserting with values:', {
  label, length, width, depth, floor_id, units, calculated_value
});


      await db.query(
        `INSERT INTO qto_dimensions 
         (sow_proposal_id, work_item_id, label, length, width, depth, floor_id, units, calculated_value) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [sow_proposal_id, work_item_id, label, length, width, depth, floor_id, units, calculated_value]
      );
    }

    // Step 2: Recalculate children totals (grouped by sow_proposal_id + work_item_id)
    const uniquePairs = new Set(qto_entries.map(e => `${e.sow_proposal_id}-${e.work_item_id}`));
    for (const key of uniquePairs) {
      const [sow_proposal_id, work_item_id] = key.split("-");
      await recalculateQtoChildrenTotal(sow_proposal_id, work_item_id);
    }

    // Step 3: Recalculate parent totals (only once per proposal)
    const proposalIds = [...new Set(qto_entries.map(e => e.sow_proposal_id))];
    for (const proposal_id of proposalIds) {
      await recalculateQtoParentTotals(proposal_id);
    }

    res.status(201).json({ message: "QTO entries and totals added successfully" });

  } catch (error) {
    console.error("❌ Error adding QTO entries:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};


const saveQtoTotals = async (req, res) => {
  try {
    const { totals } = req.body;

    if (!totals || !Array.isArray(totals) || totals.length === 0) {
      return res.status(400).json({ message: "No totals provided" });
    }

    const insertPromises = totals.map(({ sow_proposal_id, work_item_id, total_volume }) => {
      return db.query(
        `INSERT INTO qto_children_totals (sow_proposal_id, work_item_id, total_volume)
         VALUES (?, ?, ?)
         ON DUPLICATE KEY UPDATE total_volume = VALUES(total_volume)`,
        [sow_proposal_id, work_item_id, total_volume]
      );
    });

    await Promise.all(insertPromises);

    res.status(201).json({ message: "QTO totals saved successfully" });

  } catch (error) {
    console.error("Error saving QTO totals:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const saveQtoParentTotals = async (req, res = null) => {
  const proposal_id = req.body?.proposal_id || req;

  if (!proposal_id) {
    if (res) return res.status(400).json({ message: "Missing proposal_id" });
    throw new Error("Missing proposal_id");
  }

  try {
    const sql = `
      INSERT INTO qto_parent_totals (sow_proposal_id, work_item_id, total_value)
      SELECT 
        qct.sow_proposal_id,
        sw.parent_id AS work_item_id,
        SUM(qct.total_volume) AS total_value
      FROM qto_children_totals qct
      JOIN sow_work_items sw ON qct.work_item_id = sw.work_item_id
      WHERE qct.sow_proposal_id = ?
      GROUP BY qct.sow_proposal_id, sw.parent_id
      ON DUPLICATE KEY UPDATE total_value = VALUES(total_value)
    `;

    await db.query(sql, [proposal_id]);

    if (res) return res.status(200).json({ message: "Parent totals updated" });
  } catch (err) {
    console.error("❌ Failed to save parent totals:", err);
    if (res) return res.status(500).json({ message: "Error saving parent totals" });
  }
};


const recalculateQtoChildrenTotal = async (sow_proposal_id, work_item_id) => {
  const rows = await db.query(
    `SELECT SUM(calculated_value) AS total_volume
     FROM qto_dimensions
     WHERE sow_proposal_id = ? AND work_item_id = ?`,
    [sow_proposal_id, work_item_id]
  );

  const total_volume = rows[0]?.total_volume || 0;

  await db.query(
    `INSERT INTO qto_children_totals (sow_proposal_id, work_item_id, total_volume)
     VALUES (?, ?, ?)
     ON DUPLICATE KEY UPDATE total_volume = VALUES(total_volume)`,
    [sow_proposal_id, work_item_id, total_volume]
  );
};

const recalculateQtoParentTotals = async (proposal_id) => {
  await db.query(
    `INSERT INTO qto_parent_totals (sow_proposal_id, work_item_id, total_value)
     SELECT
       qct.sow_proposal_id,
       sw.parent_id AS work_item_id,
       SUM(qct.total_volume)
     FROM qto_children_totals qct
     JOIN sow_work_items sw ON qct.work_item_id = sw.work_item_id
     WHERE qct.sow_proposal_id = ?
     GROUP BY qct.sow_proposal_id, sw.parent_id
     ON DUPLICATE KEY UPDATE total_value = VALUES(total_value)`,
    [proposal_id]
  );
};

const getQtoDimensions = (req, res) => {
  const proposal_id = req.params.proposal_id;

  if (!proposal_id) {
    return res.status(400).json({ error: "Missing proposal_id" });
  }

  const sql = `
    SELECT 
  qd.qto_id, 
  qd.sow_proposal_id,                    -- add this
  pw.parent_id       AS work_item_id,    -- add this
  pw.item_title      AS parent_title, 
  cw.item_title      AS item_title,
  qd.label,
  qd.length,
  qd.width,
  qd.depth,
  qd.units,
  qd.calculated_value,
  pf.floor_code,
  pf.floor_label,
  qct.total_volume   AS child_total_volume,
  qpt.total_value    AS parent_total_value,
  qpt.allowance_percentage,
  qpt.total_with_allowance
FROM qto_dimensions qd
  JOIN sow_proposal sp   ON qd.sow_proposal_id = sp.sow_proposal_id
  JOIN sow_work_items cw ON qd.work_item_id    = cw.work_item_id
  JOIN sow_work_items pw ON cw.parent_id       = pw.work_item_id
  LEFT JOIN project_floors pf 
        ON qd.floor_id   = pf.floor_id
  LEFT JOIN qto_children_totals qct 
        ON qct.sow_proposal_id = qd.sow_proposal_id 
       AND qct.work_item_id    = qd.work_item_id
  LEFT JOIN qto_parent_totals qpt 
        ON qpt.sow_proposal_id = qd.sow_proposal_id 
       AND qpt.work_item_id    = pw.work_item_id
WHERE sp.proposal_id = ?

  `;

  db.query(sql, [proposal_id], (err, results) => {
    if (err) {
      console.error("DB error:", err);
      return res.status(500).json({ error: "Internal server error" });
    }
    res.json(results);
  });
};



const UpdateQtoDimension = async (req, res) => {
  const {
    qto_id,
    label,
    length,
    width,
    depth,
    units
  } = req.body;

  if (!qto_id) {
    return res.status(400).json({ message: "Missing qto_id" });
  }

  const l = parseFloat(length) || 0;
  const w = parseFloat(width) || 0;
  const d = parseFloat(depth) || 0;
  const u = parseFloat(units) || 1;
 const calculated_value = (!d || isNaN(d) || d === 0)
  ? (parseFloat(l) || 0) * (parseFloat(w) || 0) * (parseFloat(u) || 1)
  : (parseFloat(l) || 0) * (parseFloat(w) || 0) * (parseFloat(d) || 0) * (parseFloat(u) || 1);


  try {
    // 🔍 Fetch related sow_proposal_id and work_item_id
    const rows = await db.query(
      "SELECT sow_proposal_id, work_item_id FROM qto_dimensions WHERE qto_id = ?",
      [qto_id]
    );

    if (!rows || rows.length === 0) {
      return res.status(404).json({ message: "QTO entry not found" });
    }

    const { sow_proposal_id, work_item_id } = rows[0];

    // ✅ Update the row
    await db.query(
      `UPDATE qto_dimensions
       SET label = ?, length = ?, width = ?, depth = ?, units = ?, calculated_value = ?
       WHERE qto_id = ?`,
      [label, l, w, d, u, calculated_value, qto_id]
    );

    // 🔁 Recalculate children and parent totals
    await recalculateQtoChildrenTotal(sow_proposal_id, work_item_id);
    await recalculateQtoParentTotals(sow_proposal_id);

    res.status(200).json({ message: "QTO entry updated and totals recalculated" });

  } catch (err) {
    console.error("❌ Failed to update QTO entry", err);
    res.status(500).json({ message: "Server error" });
  }
};


const deleteQtoDimension = async (req, res) => {
  const qtoId = req.params.qto_id;
  console.log("🔍 Deleting qto_id:", qtoId);

  try {
    // This `await db.query` will now correctly return the results (an array of rows)
    const rows = await db.query(
      "SELECT sow_proposal_id, work_item_id FROM qto_dimensions WHERE qto_id = ?",
      [qtoId]
    );

    // Keep these debug logs for now to confirm the final fix!
    console.log("DEBUG: --- Inside deleteQtoDimension ---");
    console.log("DEBUG: Value of 'qtoId' from request:", qtoId);
    console.log("DEBUG: Raw result of SELECT query (value of 'rows'):", rows); // Should now be an array
    console.log("DEBUG: Type of 'rows':", typeof rows);
    console.log("DEBUG: Is 'rows' an Array?", Array.isArray(rows));
    if (Array.isArray(rows)) {
      console.log("DEBUG: Length of 'rows' array:", rows.length);
      if (rows.length > 0) {
        console.log("DEBUG: First element of 'rows' array:", rows[0]);
      }
    }
    console.log("DEBUG: --- End of SELECT debug ---");


    if (!rows || rows.length === 0) { // The `!Array.isArray(rows)` check is actually redundant if promisify works.
      console.warn(`⚠️ QTO with ID ${qtoId} not found.`); // Simplified message
      return res.status(404).json({ error: "QTO not found" });
    }

    const { sow_proposal_id, work_item_id } = rows[0]; // This line should now be safe

    // ... (rest of your logic for DELETE and recalculations, which should also work now)
    const deleteResult = await db.query(
      "DELETE FROM qto_dimensions WHERE qto_id = ?",
      [qtoId]
    );

    console.log("DEBUG: Delete Result (promisified):", deleteResult);
    console.log("DEBUG: Affected rows:", deleteResult ? deleteResult.affectedRows : 'N/A');


    if (!deleteResult || deleteResult.affectedRows === 0) {
      console.warn("⚠️ QTO not deleted (already gone?)");
      return res.status(404).json({ error: "QTO not found or already deleted" });
    }

    console.log("🧮 Recalculating totals...");
    await recalculateQtoChildrenTotal(sow_proposal_id, work_item_id);
    await recalculateQtoParentTotals(sow_proposal_id);

    return res.status(200).json({ message: "QTO deleted and totals recalculated" });
  } catch (error) {
    console.error("❌ Delete QTO failed:", error);
    return res.status(500).json({ error: "Failed to delete QTO entry", details: error.message });
  }
};

const addAllowanceToQtoParent = async (req, res) => {
  const { sow_proposal_id, allowance_percentage } = req.body;
  if (!sow_proposal_id || allowance_percentage == null) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    // Run the UPDATE — note: no destructuring
    const result = await db.query(
      `UPDATE qto_parent_totals
         SET
           allowance_percentage   = ?,
             total_with_allowance   = ROUND(total_value * ?, 2)
       WHERE sow_proposal_id = ?`,
      [allowance_percentage, allowance_percentage, sow_proposal_id]
    );

    // result.affectedRows tells us how many rows were updated
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "No parent totals found for that proposal" });
    }

    return res.status(200).json({
      message: "Allowance applied to all parent totals",
      rowsUpdated: result.affectedRows
    });
  } catch (err) {
    console.error("❌ Error applying allowance:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};



module.exports = {
  addQtoEntries,
  saveQtoTotals,
  saveQtoParentTotals,
  getQtoDimensions,
  UpdateQtoDimension,
  deleteQtoDimension,
  addAllowanceToQtoParent

};
