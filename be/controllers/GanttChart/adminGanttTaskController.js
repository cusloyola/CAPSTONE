const db = require('../../config/db'); 

const saveDuration = async (req, res) => {
  try {
    const { sow_proposal_id, work_quantity, production_rate } = req.body;

    if (!sow_proposal_id || !work_quantity || !production_rate) {
      return res.status(400).json({ error: "All fields are required." });
    }

   const result = await db.query(
  `INSERT INTO gantt_tasks (sow_proposal_id, work_quantity, production_rate, created_at, updated_at)
   VALUES (?, ?, ?, NOW(), NOW())`,
  [sow_proposal_id, work_quantity, production_rate]
);


    res.status(201).json({
      message: "Gantt task created successfully",
      gantt_task_id: result.insertId,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};


module.exports = {
  saveDuration,
};
