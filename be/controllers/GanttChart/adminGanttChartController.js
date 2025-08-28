const db = require("../../config/db");


const createNewGanttChart = (req, res) => {
  const { proposal_id, notes, title, approved_by, created_by } = req.body;

  if (!proposal_id || !approved_by || created_by) {
    return res.status(400).json({ error: "Proposal and approved_by are required." });
  }

  const sql = `
        INSERT INTO gantt_charts (proposal_id, title, notes, approved_by, created_by, created_at)
        VALUES (?, ?, ?, ?, ?, NOW())
    `;

  db.query(sql, [proposal_id, title, notes, approved_by, created_by], (err, result) => {
    if (err) {
      console.error("Error inserting Gantt Chart:", err);
      return res.status(500).json({ error: "Failed to create Gantt Chart." });
    }

    return res.status(201).json({ message: "Gantt Chart created successfully", gantt_chart_id: result.insertId });
  });
};


const getAllGanttCharts = (req, res) => {
  const { project_id } = req.params;

  const sql = `
    SELECT gc.*,
    u.full_name
    FROM gantt_charts gc
    JOIN proposals p ON gc.proposal_id = p.proposal_id
    JOIN users u ON gc.approved_by = u.user_id
    WHERE p.project_id = ?
  `;

  db.query(sql, [project_id], (err, results) => {
    if (err) {
      console.error("Error fetching Gantt Charts", err);
      return res.status(500).json({ message: "Failed to fetch Gantt Charts" });
    }

    return res.status(200).json({
      message: "Gantt Charts fetched successfully",
      data: results
    });
  });
};


















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
  swt.type_name,
  swt.work_type_id,
  swi.work_item_id,
  IFNULL(rt.rebar_overall_weight, 0) AS rebar_overall_weight,
  pr.start_date,
  pr.end_date,
  gt.work_quantity,
  gt.production_rate,
  gt.start_date AS start_week,
  gt.finish_date AS finish_week,
  
  CASE
  WHEN gt.work_quantity IS NOT NULL AND gt.production_rate IS NOT NULL
  THEN gt.work_quantity / gt.production_rate
  ELSE NULL
END AS duration

FROM sow_proposal AS sp
JOIN sow_work_items AS swi ON sp.work_item_id = swi.work_item_id
LEFT JOIN final_estimation_details AS fed ON fed.sow_proposal_id = sp.sow_proposal_id
LEFT JOIN rebar_totals AS rt ON rt.sow_proposal_id = sp.sow_proposal_id
LEFT JOIN gantt_tasks AS gt ON gt.sow_proposal_id = sp.sow_proposal_id
JOIN sow_work_types AS swt ON swi.work_type_id = swt.work_type_id
JOIN proposals AS p ON sp.proposal_id = p.proposal_id
JOIN projects AS pr ON p.project_id = pr.project_id
WHERE p.project_id = ? 
AND p.status = 'approved'

ORDER BY swt.work_type_id, sp.sow_proposal_id;



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
  createNewGanttChart,
  getAllGanttCharts
};
