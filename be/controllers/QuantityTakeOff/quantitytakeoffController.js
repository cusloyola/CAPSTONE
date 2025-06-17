const db = require('../../config/db');

const addQtoEntries = async (req, res) => {
  try {
    const { qto_entries } = req.body;

    if (!qto_entries || !Array.isArray(qto_entries) || qto_entries.length === 0) {
      return res.status(400).json({ message: "No QTO entries provided" });
    }

    const insertPromises = qto_entries.map(entry => {
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

      const l = parseFloat(length) || 0;
      const w = parseFloat(width) || 0;
      const d = parseFloat(depth) || 0;
      const u = parseFloat(units) || 1;

      const calculated_value = l * w * d * u;

      return db.query(
        `INSERT INTO qto_dimensions 
          (sow_proposal_id, work_item_id, label, length, width, depth, floor_id ,units, calculated_value) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [sow_proposal_id, work_item_id, label, length, width, depth, floor_id, units, calculated_value]
      );
    });

    await Promise.all(insertPromises);

    res.status(201).json({ message: "QTO entries added successfully" });

  } catch (error) {
    console.error("Error adding QTO entries:", error);
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

const saveQtoParentTotals = async (req, res) => {
  const { proposal_id } = req.body;

  if (!proposal_id) {
    return res.status(400).json({ message: "Missing proposal_id" });
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
  JOIN sow_proposal sp ON sp.sow_proposal_id = qct.sow_proposal_id
WHERE qct.sow_proposal_id = ?
  GROUP BY qct.sow_proposal_id, sw.parent_id
  ON DUPLICATE KEY UPDATE total_value = VALUES(total_value)
`;


    await db.query(sql, [proposal_id]);

    res.status(200).json({ message: "Parent totals updated" });
  } catch (err) {
    console.error("Failed to save parent totals:", err);
    res.status(500).json({ message: "Error saving parent totals" });
  }
};



const getQtoDimensions = (req, res) => {
  const proposal_id = req.params.proposal_id;


  if (!proposal_id) {
    return res.status(400).json({ error: "Missing proposal_id" });
  }

  const sql = `
   SELECT 
  pw.item_title AS parent_title, 
  cw.item_title AS item_title,
  qd.label,
  qd.length,
  qd.width,
  qd.depth,
  qd.units,
  qd.calculated_value,
  pf.floor_code,
  pf.floor_label,
qpt.total_value AS parent_total_value

    FROM qto_dimensions qd
    JOIN sow_proposal sp ON qd.sow_proposal_id = sp.sow_proposal_id
    JOIN sow_work_items cw ON qd.work_item_id = cw.work_item_id
    JOIN sow_work_items pw ON cw.parent_id = pw.work_item_id
    JOIN proposals p ON sp.proposal_id = p.proposal_id
    LEFT JOIN project_floors pf ON qd.floor_id = pf.floor_id
  LEFT JOIN qto_parent_totals qpt 
  ON qpt.sow_proposal_id = qd.sow_proposal_id AND qpt.work_item_id = pw.work_item_id

    WHERE p.proposal_id = ?

  `;

  db.query(sql, [proposal_id], (err, results) => {
    if (err) {
      console.error("DB error:", err);
      return res.status(500).json({ error: "Internal server error" });
    }
    res.json(results);
  });
};




module.exports = {
  addQtoEntries,
  saveQtoTotals,
  saveQtoParentTotals,
  getQtoDimensions

};
