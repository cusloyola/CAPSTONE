const db = require("../../config/db");

// Fetch budget overview for a project
const getMaterialCostOverview = (req, res) => {
    const { project_id } = req.params;

    const sql = `
  SELECT 
  swi.item_title,
  fed.amount AS original_amount,
  fed.remaining_amount,
  swt.type_name,
  swt.work_type_id
FROM final_estimation_details fed
JOIN sow_proposal sp ON fed.sow_proposal_id = sp.sow_proposal_id
JOIN sow_work_items swi ON sp.work_item_id = swi.work_item_id
LEFT JOIN sow_work_types swt ON swi.work_type_id = swt.work_type_id
JOIN proposals p ON sp.proposal_id = p.proposal_id
WHERE p.project_id = ?

  `;

    db.query(sql, [project_id], (err, results) => {
        if (err) {
            console.error("Error fetching material cost overview:", err);
            return res.status(500).json({ error: "Failed to fetch data" });
        }

        // Transform results to match frontend expectations
        const budget = results.map(row => ({
            item_title: row.item_title,
            amount: row.original_amount,
            remaining_amount: row.remaining_amount,
            work_type_id: row.work_type_id, // include this
            type_name: row.type_name        // include this
        }));


        res.status(200).json({ budget });
    });
};

module.exports = { getMaterialCostOverview };









module.exports = {
    getMaterialCostOverview
};