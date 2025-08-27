const db = require("../../config/db");

const saveGanttTask = async (req, res) => {
  try {
    const {
      gantt_chart_id,
      sow_proposal_id,
      work_quantity,
      production_rate,
      start_date,
      finish_date,
    } = req.body;

    if (!gantt_chart_id || !sow_proposal_id) {
      return res.status(400).json({ error: "gantt_chart_id and sow_proposal_id are required." });
    }

    // Check if row exists
    const existing = await new Promise((resolve, reject) => {
      db.query(
        `SELECT gantt_task_id FROM gantt_tasks WHERE gantt_chart_id = ? AND sow_proposal_id = ?`,
        [gantt_chart_id, sow_proposal_id],
        (err, results) => {
          if (err) return reject(err);
          resolve(results);
        }
      );
    });

    if (existing.length > 0) {
      // Update existing
      const updates = [];
      const values = [];

      if (work_quantity !== undefined) {
        updates.push("work_quantity = ?");
        values.push(work_quantity);
      }
      if (production_rate !== undefined) {
        updates.push("production_rate = ?");
        values.push(production_rate);
      }
      if (start_date !== undefined) {
        updates.push("start_date = ?");
        values.push(start_date);
      }
      if (finish_date !== undefined) {
        updates.push("finish_date = ?");
        values.push(finish_date); // ✅ fixed typo
      }

      if (updates.length === 0) {
        return res.status(400).json({ error: "No fields provided to update." });
      }

      values.push(gantt_chart_id, sow_proposal_id);

      await new Promise((resolve, reject) => {
        db.query(
          `UPDATE gantt_tasks SET ${updates.join(", ")}, updated_at = NOW() WHERE gantt_chart_id = ? AND sow_proposal_id = ?`,
          values,
          (err, result) => {
            if (err) return reject(err);
            resolve(result);
          }
        );
      });

      return res.json({ message: "Gantt task updated successfully" });
    } else {
      // Insert new
      await new Promise((resolve, reject) => {
        db.query(
          `INSERT INTO gantt_tasks 
          (gantt_chart_id, sow_proposal_id, work_quantity, production_rate, start_date, finish_date, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())`,
          [
            gantt_chart_id,
            sow_proposal_id,
            work_quantity || 0,
            production_rate || 0,
            start_date || null,
            finish_date || null,
          ],
          (err, result) => {
            if (err) return reject(err);
            resolve(result);
          }
        );
      });

      return res.status(201).json({ message: "Gantt task created successfully" });
    }
  } catch (error) {
    console.error("saveGanttTask error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

module.exports = {
  saveGanttTask,
};
