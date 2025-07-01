const { parse } = require("dotenv");
const db = require("../../config/db");


const getRebarMasterlist = (req, res) => {
  const sql = `SELECT rebar_masterlist_id, label, diameter_mm, length_m, weight_per_meter FROM rebar_masterlist`;

  db.query(sql, (err, results) => {
    if (err) {
      console.error("Error:", err);
      return res.status(500).json({ message: "Server Error" });
    }
    return res.status(200).json(results); // ✅ This is what you should return
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
        return Promise.resolve(); 
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

   
    const [rowsWeight] = await db.query(
      `SELECT SUM(total_weight) AS rebar_total
       FROM rebar_details
       WHERE sow_proposal_id = ?`,
      [sow_proposal_id]
    );

    console.log("DEBUG: rowsWeight from SUM query:", rowsWeight); // This correctly shows RowDataPacket { rebar_total: ... }

    const totalWeight = parseFloat(rowsWeight?.rebar_total ?? 0); // Corrected line
    console.log("📊 Total Rebar Weight:", totalWeight);

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
  rd.sow_proposal_id, 
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


const updateRebarById = (req, res) => {
  const { rebar_details_id } = req.params;
  const {
    rebar_masterlist_id,
    work_item_id,
    total_weight,
    location,
    quantity,
    sow_proposal_id,
    floor_id,
  } = req.body;

  const updateSql = `
    UPDATE rebar_details SET 
      rebar_masterlist_id = ?, 
      work_item_id = ?, 
      total_weight = ?, 
      location = ?, 
      quantity = ?, 
      sow_proposal_id = ?, 
      floor_id = ?
    WHERE rebar_details_id = ?
  `;

  const updateValues = [
    rebar_masterlist_id,
    work_item_id,
    total_weight,
    location,
    quantity,
    sow_proposal_id,
    floor_id,
    rebar_details_id,
  ];

  db.query(updateSql, updateValues, (updateErr, updateResult) => {
    if (updateErr) {
      console.error("❌ Error updating rebar_details:", updateErr);
      return res.status(500).json({ message: "Failed to update rebar entry" });
    }

    // ✅ Recalculate rebar total for this sow_proposal_id
    const sumSql = `
      SELECT SUM(total_weight) AS total 
      FROM rebar_details 
      WHERE sow_proposal_id = ?
    `;

    db.query(sumSql, [sow_proposal_id], (sumErr, sumResult) => {
      if (sumErr) {
        console.error("❌ Error calculating total_weight:", sumErr);
        return res.status(500).json({ message: "Failed to calculate total rebar weight" });
      }

      const newTotal = parseFloat(sumResult[0]?.total || 0);

      const upsertSql = `
        INSERT INTO rebar_totals (sow_proposal_id, rebar_overall_weight)
        VALUES (?, ?)
        ON DUPLICATE KEY UPDATE rebar_overall_weight = ?
      `;

      db.query(upsertSql, [sow_proposal_id, newTotal, newTotal], (upsertErr) => {
        if (upsertErr) {
          console.error("❌ Error updating rebar_totals:", upsertErr);
          return res.status(500).json({ message: "Failed to update rebar_totals" });
        }

        console.log(`✅ Updated total weight for sow_proposal_id ${sow_proposal_id}: ${newTotal}`);
        return res.status(200).json({
          message: "✅ Rebar updated and total recalculated",
          updatedRebarId: rebar_details_id,
          new_total: newTotal,
        });
      });
    });
  });
};



const deleteRebarById = (req, res) => {
  const { rebar_details_id } = req.params;

  if (!rebar_details_id) {
    return res.status(400).json({ message: "Missing rebar_details_id" });
  }

  const fetchSql = `SELECT sow_proposal_id FROM rebar_details WHERE rebar_details_id = ?`;

  db.query(fetchSql, [rebar_details_id], (fetchErr, fetchResult) => {
    if (fetchErr || fetchResult.length === 0) {
      return res.status(500).json({ message: "Failed to find rebar entry to delete" });
    }

    const sow_proposal_id = fetchResult[0].sow_proposal_id;

    const deleteSql = `DELETE FROM rebar_details WHERE rebar_details_id = ?`;

    db.query(deleteSql, [rebar_details_id], (deleteErr, deleteResult) => {
      if (deleteErr) {
        return res.status(500).json({ message: "Failed to delete rebar entry" });
      }

      const sumSql = `
        SELECT SUM(total_weight) AS total 
        FROM rebar_details 
        WHERE sow_proposal_id = ?
      `;

      db.query(sumSql, [sow_proposal_id], (sumErr, sumResult) => {
        if (sumErr) {
          return res.status(500).json({ message: "Failed to recalculate total" });
        }

        const newTotal = parseFloat(sumResult[0]?.total || 0);

        const upsertSql = `
          INSERT INTO rebar_totals (sow_proposal_id, rebar_overall_weight)
          VALUES (?, ?)
          ON DUPLICATE KEY UPDATE rebar_overall_weight = ?
        `;

        db.query(upsertSql, [sow_proposal_id, newTotal, newTotal], (upsertErr) => {
          if (upsertErr) {
            return res.status(500).json({ message: "Failed to update rebar_totals" });
          }

          res.status(200).json({
            message: "✅ Rebar entry deleted and total updated",
            deletedRebarId: rebar_details_id,
            new_total: newTotal,
          });
        });
      });
    });
  });
};




module.exports = {
    getRebarMasterlist,
    addRebarEntries,
    getRebarByProposalId,
    getRebarTotalUsed,
    updateRebarById,
    deleteRebarById
};