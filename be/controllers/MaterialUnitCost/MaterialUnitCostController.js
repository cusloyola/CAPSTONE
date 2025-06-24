const db = require("../../config/db");

const AddMaterialDetails = (req, res) => {

    const {sow_proposal_id, market_value, allowance, material_uc} = req.body;


    if(!sow_proposal_id || market_value == null || allowance == null || material_uc == null ){
        return res.status(400).json({message: "Missing required fields"});
    }

    const query =
    `INSERT INTO material_costs
    (sow_proposal_id, market_value, allowance, material_uc)
    VALUES(?,?,?,?)

    ON DUPLICATE KEY UPDATE
    market_value = VALUES(market_value),
    allowance = VALUES(allowance),
    material_uc = VALUES(material_uc)
    `;

    db.query(query, [sow_proposal_id, market_value, allowance, material_uc], (err) => {
        if(err) {
            console.error("DB Error: ", err)
            return res.status(500).json({   message: "Failed to save material cost"});
        }

        return res.status(200).json({message: "Material cost saved successfully"});
    });
};
 
const getMaterialDetails = (req, res) => {
    const { proposal_id } = req.params;

    const query = `
        SELECT 
            mc.*,
            swi.item_title
        FROM material_costs mc
        JOIN sow_proposal sow ON sow.sow_proposal_id = mc.sow_proposal_id
        JOIN sow_work_items swi ON sow.work_item_id = swi.work_item_id
        WHERE sow.proposal_id = ?
    `;

    db.query(query, [proposal_id], (err, results) => {
        if (err) {
            console.error("Error fetching material details: ", err);
            return res.status(500).json({ message: "Database Error" });
        }

        return res.status(200).json(results);
    });
};


module.exports = {
    AddMaterialDetails,
    getMaterialDetails
}