const db = require("../../config/db");

const getQtoChildrenTotalsByProposal = (req, res) => {
  const { proposal_id } = req.query;
  console.log("📡 API HIT: /qto-children-by-proposal with proposal_id =", proposal_id);

  if (!proposal_id) {
    return res.status(400).json({ message: "Missing proposal_id" });
  }

  const query = `
    SELECT q.qto_total_id, q.sow_proposal_id, q.work_item_id, q.total_volume
    FROM qto_children_totals q
    JOIN sow_proposal sp ON q.sow_proposal_id = sp.sow_proposal_id
    WHERE sp.proposal_id = ?
  `;

  db.query(query, [proposal_id], (err, results) => {
    if (err) {
      console.error("❌ Error fetching QTO child totals by proposal:", err);
      return res.status(500).json({ message: "DB error" });
    }
    console.log("✅ DB Results:", results);
    return res.status(200).json({ message: "✅ Success", data: results });
  });
};


const getResources = (req, res) => {
  const { work_item_id } = req.query;

  const query = `
    SELECT 
      r.resource_id,
      r.material_name,
      r.brand_name,
      uom.unitCode,
      r.default_unit_cost,
      r.unitId
    FROM resource r
    JOIN unit_of_measure uom ON r.unitId = uom.unitId
    WHERE r.resource_id NOT IN (
      SELECT resource_id
      FROM mto_materiallists mm
      JOIN sow_work_items swi ON mm.work_item_id = swi.work_item_id
      WHERE mm.work_item_id = ? AND swi.parent_id IS NOT NULL
    )
  `;

  db.query(query, [work_item_id], (err, results) => {
    if (err) {
      console.error("Failed to fetch resources for child work item:", err);
      return res.status(500).json({ message: "DB Error", error: err });
    }

    return res.status(200).json({
      message: "Available resources not yet used in child MTO",
      data: results
    });
  });
};

const saveFullMaterialTakeOff = (req, res) => {
  const { materialTakeOff } = req.body;

  if (!Array.isArray(materialTakeOff) || materialTakeOff.length === 0) {
    return res.status(400).json({ message: "Missing material takeoff data" });
  }

  const sow_proposal_id = materialTakeOff[0].sow_proposal_id; // ✅ Real source

  const mtoValues = materialTakeOff.map(item => [
    item.sow_proposal_id,
    item.work_item_id,
    item.resource_id,
    item.multiplier || 1,
    item.actual_qty,
    item.material_cost
  ]);

  const mtoQuery = `
    INSERT INTO mto_materiallists (
      sow_proposal_id,
      work_item_id,
      resource_id,
      multiplier,
      actual_qty,
      material_cost
    )
    VALUES ?
    ON DUPLICATE KEY UPDATE
      actual_qty = actual_qty + VALUES(actual_qty),
      material_cost = material_cost + VALUES(material_cost)
  `;

  db.query(mtoQuery, [mtoValues], (err1, result1) => {
    if (err1) {
      console.error("❌ Error saving MTO:", err1);
      return res.status(500).json({ message: "Failed to save MTO", error: err1 });
    }

    console.log("✅ MTO Saved, running parent total query...");

    const parentTotalQuery = `
      SELECT 
        m.sow_proposal_id,
        p.work_item_id AS parent_work_item_id,
        SUM(m.material_cost) AS mto_parent_grandTotal
      FROM mto_materiallists m
      JOIN sow_work_items c ON m.work_item_id = c.work_item_id
      JOIN sow_work_items p ON c.parent_id = p.work_item_id
      WHERE m.sow_proposal_id = ?
      GROUP BY p.work_item_id
    `;

    db.query(parentTotalQuery, [sow_proposal_id], (err2, rows) => {
      if (err2) {
        console.error("❌ Error fetching parent totals:", err2);
        return res.status(500).json({ message: "Failed to calculate parent totals", error: err2 });
      }

      if (!rows.length) {
        console.warn("⚠️ No parent totals found to update.");
        return res.status(200).json({
          message: "MTO saved, but no parent totals to update.",
          mtoInserted: result1.affectedRows,
          parentUpdated: 0
        });
      }

      const replaceValues = rows.map(row => [
        row.sow_proposal_id,
        row.parent_work_item_id,
        row.mto_parent_grandTotal
      ]);

      const replaceQuery = `
        REPLACE INTO mto_parent_totals (sow_proposal_id, work_item_id, mto_parent_grandTotal)
        VALUES ?
      `;

      db.query(replaceQuery, [replaceValues], (err3, result3) => {
        if (err3) {
          console.error("❌ Error updating parent totals:", err3);
          return res.status(500).json({ message: "Failed to update parent totals", error: err3 });
        }

        return res.status(201).json({
          message: "Material Take-Off and Parent Totals saved successfully",
          mtoInserted: result1.affectedRows,
          parentUpdated: result3.affectedRows
        });
      });
    });
  });
};



const getFullMaterialTakeOff = (req, res) => {
  const { proposal_id } = req.params;

  const sql = `
  SELECT 
  'child' AS item_type,
  ml.mto_id,
  ml.sow_proposal_id,
  ml.work_item_id, 
  r.resource_id,
  r.material_name,
  r.brand_name,
  r.default_unit_cost,
  u.unitCode,
  ml.multiplier,
  ml.actual_qty,
  qct.total_volume,
  ml.material_cost AS total_cost,
  swi.item_title AS item_title,
  parent.work_item_id AS parent_work_item_id, 
  parent.item_title AS parent_title
FROM mto_materiallists ml
JOIN sow_proposal sp ON ml.sow_proposal_id = sp.sow_proposal_id
JOIN sow_work_items swi ON ml.work_item_id = swi.work_item_id
LEFT JOIN sow_work_items parent ON swi.parent_id = parent.work_item_id
LEFT JOIN resource r ON ml.resource_id = r.resource_id
LEFT JOIN unit_of_measure u ON r.unitId = u.unitId
LEFT JOIN qto_children_totals qct 
    ON qct.sow_proposal_id = ml.sow_proposal_id 
    AND qct.work_item_id = ml.work_item_id  
WHERE sp.proposal_id = ?

  `;

  db.query(sql, [proposal_id, proposal_id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });

    res.json({ items: result });
  });
};


const getMaterialtakeOffParent = (req, res) => {
  const { proposal_id } = req.params;

  if (!proposal_id) {
    return res.status(400).json({ error: "Missing proposal_id" });
  }

  const sql = `
    SELECT 
      mpt.mto_parent_id,
      mpt.sow_proposal_id,
      mpt.work_item_id,
      swi.item_title AS parent_title,
      mpt.mto_parent_grandTotal
    FROM mto_parent_totals mpt
    JOIN sow_proposal sp ON mpt.sow_proposal_id = sp.sow_proposal_id
    JOIN sow_work_items swi ON mpt.work_item_id = swi.work_item_id
    WHERE sp.proposal_id = ?
  `;

  db.query(sql, [proposal_id], (err, rows) => {
    if (err) {
      console.error("Error fetching parent totals:", err);
      return res.status(500).json({ error: err.message });
    }

    return res.json(rows);
  });
};


const updateFullMaterialTakeOff = (req, res) => {
  const { proposal_id } = req.params;
  const { materialTakeOff, parentTotals } = req.body;

  if (!Array.isArray(materialTakeOff) || materialTakeOff.length === 0 ||
      !Array.isArray(parentTotals) || parentTotals.length === 0) {
    return res.status(400).json({ message: "Missing material or parent total data" });
  }

  // Begin transaction
  db.beginTransaction(err => {
    if (err) return res.status(500).json({ message: "Transaction start failed", error: err });

    const updateMtoQuery = `
      UPDATE mto_materiallists SET
        resource_id = ?, multiplier = ?, actual_qty = ?, material_cost = ?
      WHERE mto_id = ?
    `;

    const updateMtoTasks = materialTakeOff.map(item => {
      return new Promise((resolve, reject) => {
        db.query(updateMtoQuery, [
          item.resource_id,
          item.multiplier,
          item.actual_qty,
          item.material_cost,
          item.mto_id 
        ], (err, result) => {
          if (err) return reject(err);
          resolve(result);
        });
      });
    });

    const parentQuery = `
      INSERT INTO mto_parent_totals (
        sow_proposal_id, work_item_id, mto_parent_grandTotal
      )
      VALUES ? 
      ON DUPLICATE KEY UPDATE mto_parent_grandTotal = VALUES(mto_parent_grandTotal)
    `;
    const parentTotalValues = parentTotals.map(item => [
      item.sow_proposal_id,
      item.work_item_id,
      item.mto_parent_grandTotal
    ]);

    Promise.all(updateMtoTasks)
      .then(() => {
        db.query(parentQuery, [parentTotalValues], (err2, result2) => {
          if (err2) {
            return db.rollback(() => {
              res.status(500).json({ message: "Failed to update parent totals", error: err2 });
            });
          }

          db.commit(err => {
            if (err) return db.rollback(() => res.status(500).json({ message: "Commit failed", error: err }));
            res.status(200).json({ message: "Material Take-Off updated successfully" });
          });
        });
      })
      .catch(err => {
        db.rollback(() => {
          res.status(500).json({ message: "Failed to update MTO entries", error: err });
        });
      });
  });
};





// ✅ Correct export
module.exports = {
  getQtoChildrenTotalsByProposal,
  getResources,
  saveFullMaterialTakeOff,
  getFullMaterialTakeOff,
  getMaterialtakeOffParent,
  updateFullMaterialTakeOff
};
