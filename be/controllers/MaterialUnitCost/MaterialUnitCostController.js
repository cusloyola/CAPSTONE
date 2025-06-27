const db = require("../../config/db");

const AddMaterialDetails = (req, res) => {
    const { sow_proposal_id, market_value, allowance, material_uc } = req.body;
   

    if (!sow_proposal_id || market_value == null || allowance == null || material_uc == null) {
        return res.status(400).json({ message: "Missing required fields" });
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
        if (err) {
            console.error("DB Error: ", err)
            return res.status(500).json({ message: "Failed to save material cost" });
        }

        return res.status(200).json({ message: "Material cost saved successfully" });
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

const updateMaterialDetails = (req, res) => {
    const { material_cost_id, market_value, allowance, material_uc } = req.body;

    if (
        !material_cost_id ||
        market_value == null ||
        allowance == null ||
        material_uc == null
    ) {
        return res.status(400).json({ message: "Missing required fields" });
    }

    const query = `
        UPDATE material_costs
        SET market_value = ?, allowance = ?, material_uc = ?
        WHERE material_cost_id = ?
    `;

    db.query(
        query,
        [market_value, allowance, material_uc, material_cost_id],
        (err, result) => {
            if (err) {
                console.error("Update Error: ", err);
                return res.status(500).json({ message: "Database error" });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({ message: "No row found to update" });
            }

            return res.status(200).json({
                message: "Updated successfully",
                updated_uc: material_uc
            });
        }
    );
};


const deleteMaterialDetails = (req, res) => {
    const { material_cost_id } = req.params;

    if (!material_cost_id) {
        return res.status(400).json({ message: "Material ID is missing" });
    }


    const query =
        `DELETE FROM material_costs
    WHERE material_cost_id = ?
    `;

    db.query(query, [material_cost_id], (err, result) => {
        if (err) {
            console.error("DB Error during delete", err);
            return res.status(500).json({ message: "Failed to delete material cost" });
        }

        return res.status(200).json({ message: "Material cost deleted successfully" });
    })
};


module.exports = {
    AddMaterialDetails,
    getMaterialDetails,
    deleteMaterialDetails,
    updateMaterialDetails
}