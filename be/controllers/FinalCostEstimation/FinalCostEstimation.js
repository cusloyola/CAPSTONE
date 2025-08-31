const db = require("../../config/db");


const getFinalCostByProposalId = (req, res) => {
  const { proposal_id } = req.params;

const sql = `
    SELECT 
      sp.sow_proposal_id,
      swt.type_name,
      swi.item_title AS description,

      CASE
        WHEN swi.work_item_id = 185 THEN rt.rebar_overall_weight
        ELSE IF(qpt.total_with_allowance = 0, qpt.total_value, qpt.total_with_allowance)
      END AS quantity,

      uom.unitCode AS unit,     
      lc.labor_uc,
      ROUND(
        (CASE 
          WHEN swi.work_item_id = 185 THEN rt.rebar_overall_weight 
          ELSE qpt.total_value 
        END) * lc.labor_uc,
        2
      ) AS labor_amount,

      ROUND(
        CASE 
          WHEN swi.work_item_id = 185 THEN IFNULL(mrt.rebar_grand_total, 0)
          ELSE IFNULL(mpt.mto_parent_grandTotal, 0)
        END,
        2
      ) AS total_amount,

      mpt.mto_parent_grandTotal AS mto_total_cost, 
      mrt.rebar_grand_total AS mto_rebar_total_cost,

      pc.markup_percent,
      pr.project_name,
      pr.location,
      pr.projectManager,
      cl.client_name

    FROM sow_proposal sp
    JOIN sow_work_items swi ON sp.work_item_id = swi.work_item_id
    LEFT JOIN sow_work_types swt ON swi.work_type_id = swt.work_type_id
    LEFT JOIN qto_parent_totals qpt ON qpt.sow_proposal_id = sp.sow_proposal_id
    LEFT JOIN unit_of_measure uom ON swi.unitID = uom.unitID
    LEFT JOIN labor_cost lc ON lc.sow_proposal_id = sp.sow_proposal_id
    LEFT JOIN rebar_totals rt ON rt.sow_proposal_id = sp.sow_proposal_id -- QTO quantity only

    LEFT JOIN mto_parent_totals mpt 
      ON mpt.sow_proposal_id = sp.sow_proposal_id 
      AND mpt.work_item_id = swi.work_item_id  

    LEFT JOIN mto_rebar_totals mrt
      ON mrt.sow_proposal_id = sp.sow_proposal_id

    JOIN proposals p ON sp.proposal_id = p.proposal_id
    JOIN projects pr ON p.project_id = pr.project_id
    JOIN project_categories pc ON pr.category_id = pc.category_id
    JOIN clients cl ON pr.client_id = cl.client_id
    WHERE sp.proposal_id = ?
    ORDER BY swt.sequence_order, swi.sequence_order;
  `;

  db.query(sql, [proposal_id], (err, results) => {
    if (err) {
      console.error("❌ Final cost query error:", err);
      return res.status(500).json({ message: "Error fetching cost estimation" });
    }

    const withIndex = results.map((row, index) => ({
      item_no: index + 1,
      ...row
    }));

    res.status(200).json(withIndex);
  });
};

const saveFinalEstimation = (req, res) => {
  const { proposal_id } = req.params;
  const { details, total, markup_percent, markup_amount, grand_total } = req.body;

  if (!proposal_id || !details || !Array.isArray(details)) {
    return res.status(400).json({ error: "Missing required data" });
  }

  // Step 1: Check if a summary already exists
  const checkQuery = `SELECT 1 FROM final_estimation_summary WHERE proposal_id = ? LIMIT 1`;
  db.query(checkQuery, [proposal_id], (checkErr, checkResults) => {
    if (checkErr) {
      console.error("❌ Error checking existing summary:", checkErr);
      return res.status(500).json({ error: "Failed to check existing summary" });
    }

    if (checkResults.length > 0) {
      return res.status(400).json({ error: "Final estimation for this proposal already exists. Delete it first to save again." });
    }

    // Step 2: Insert summary
    const summaryQuery = `
      INSERT INTO final_estimation_summary 
        (proposal_id, total, markup_percent, markup_amount, grand_total)
      VALUES (?, ?, ?, ?, ?)
    `;
    db.query(summaryQuery, [proposal_id, total, markup_percent, markup_amount, grand_total], (summaryErr, summaryResult) => {
      if (summaryErr) {
        console.error("❌ Error inserting summary:", summaryErr);
        return res.status(500).json({ error: "Failed to insert summary" });
      }

      // Step 3: Prepare details with remaining_amount = amount
      const values = details.map(item => [
        proposal_id, 
        item.sow_proposal_id, 
        item.amount, 
        item.amount // remaining_amount same as amount initially
      ]);

      const detailQuery = `
        INSERT INTO final_estimation_details (proposal_id, sow_proposal_id, amount, remaining_amount)
        VALUES ?
      `;
      db.query(detailQuery, [values], (detailErr) => {
        if (detailErr) {
          console.error("❌ Error inserting details:", detailErr);
          return res.status(500).json({ error: "Failed to insert details" });
        }

        return res.status(201).json({ message: "Final estimation saved successfully" });
      });
    });
  });
};

 

module.exports = {
    getFinalCostByProposalId,
    saveFinalEstimation
};