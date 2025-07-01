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
    ELSE 
        IF(qpt.total_with_allowance = 0, qpt.total_value, qpt.total_with_allowance)
END AS quantity,

    uom.unitCode AS unit,
    mc.material_uc,
    ROUND(
        (CASE WHEN swi.work_item_id = 185 THEN rt.rebar_overall_weight ELSE qpt.total_value END) * mc.material_uc,
        2
    ) AS material_amount,
    lc.labor_uc,
    ROUND(
        (CASE WHEN swi.work_item_id = 185 THEN rt.rebar_overall_weight ELSE qpt.total_value END) * lc.labor_uc,
        2
    ) AS labor_amount,
  ROUND(
  ((CASE WHEN swi.work_item_id = 185 THEN IFNULL(rt.rebar_overall_weight, 0) ELSE IFNULL(qpt.total_value, 0) END) * IFNULL(mc.material_uc, 0)) +
  ((CASE WHEN swi.work_item_id = 185 THEN IFNULL(rt.rebar_overall_weight, 0) ELSE IFNULL(qpt.total_value, 0) END) * IFNULL(lc.labor_uc, 0)),
  2
) AS total_amount

FROM sow_proposal sp
JOIN sow_work_items swi ON sp.work_item_id = swi.work_item_id
LEFT JOIN sow_work_types swt ON swi.work_type_id = swt.work_type_id
LEFT JOIN qto_parent_totals qpt ON qpt.sow_proposal_id = sp.sow_proposal_id
LEFT JOIN unit_of_measure uom ON swi.unitID = uom.unitID
LEFT JOIN material_costs mc ON mc.sow_proposal_id = sp.sow_proposal_id
LEFT JOIN labor_cost lc ON lc.sow_proposal_id = sp.sow_proposal_id
LEFT JOIN rebar_totals rt ON rt.sow_proposal_id = sp.sow_proposal_id
WHERE sp.proposal_id = ?
ORDER BY swt.sequence_order, swi.sequence_order


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

module.exports = {
    getFinalCostByProposalId
};