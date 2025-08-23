const db = require("../../config/db");

const getFinalEstimationDetails = (req, res) => {
  const { project_id } = req.query;

  if (!project_id) {
    return res.status(400).json({ message: "project_id is required" });
  }

  const projId = Number(project_id);
  if (isNaN(projId)) {
    return res.status(400).json({ message: "project_id must be a number" });
  }

  try {
    const query = `
      SELECT 
        sp.sow_proposal_id,
        swi.item_title,
        IFNULL(fed.amount, 0) AS amount,
        swt.work_type_id,
        swi.work_item_id

      FROM sow_proposal AS sp
      JOIN sow_work_items AS swi ON sp.work_item_id = swi.work_item_id
      LEFT JOIN final_estimation_details AS fed ON fed.sow_proposal_id = sp.sow_proposal_id
      JOIN sow_work_types AS swt ON swi.work_type_id = swt.work_type_id
      JOIN proposals AS p ON sp.proposal_id = p.proposal_id
      WHERE p.project_id = ? AND p.status = 'approved'
      ORDER BY swt.work_type_id, sp.sow_proposal_id
    `;

    db.query(query, [projId], (err, rows) => {
      if (err) {
        console.error("❌ MySQL Error:", err);
        return res.status(500).json({ message: "Server error" });
      }
      res.json(Array.isArray(rows) ? rows : []);
    });
  } catch (err) {
    console.error("❌ Unexpected Error:", err);
    res.status(500).json({ message: "Server exception" });
  }
};

module.exports = {
  getFinalEstimationDetails,
};
