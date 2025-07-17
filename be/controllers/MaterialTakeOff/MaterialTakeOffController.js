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

// ✅ Correct export
module.exports = {
  getQtoChildrenTotalsByProposal,
};
