const db = require ('../../config/db');

const getAllSOWWorkItems = (req, res) => {
    const sql = `
      SELECT s.work_item_id, s.item_title, s.unit_of_measure, s.sequence_order,
             t.type_name AS category
      FROM sow_work_items s
      JOIN sow_work_types t ON s.work_type_id = t.work_type_id
      ORDER BY s.sequence_order
    `;

    db.query(sql, (err, results) => {
        if (err) {
            console.error("Failed to fetch SOW work items:", err);
            return res.status(500).json({ error: "Server error fetching work items" });
        }

        return res.status(200).json(results);
    });
};




// const AddSOWProposal = (req, res) => {
//     const 
// }


module.exports = {
  getAllSOWWorkItems,

};
