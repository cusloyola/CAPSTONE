const db = require("../../config/db");



const getLaborDetails = (req, res) => {

    const sql = `
    SELECT labor_rate_id, labor_type, daily_rate FROM labor_rates`;

    db.query(sql, (err, results) => {

        if (err) {
            console.error("❌ Server Error:", err);
            return res.status(500).json({ error: "Server error while fetching labor details" });
        }


        return res.status(200).json(results);

    });
}


const saveLaborDetails = (req, res) => {
    const { sow_proposal_id, laborCost, totalLaborCost } = req.body;

    if (!sow_proposal_id || !Array.isArray(laborCost)) {
        return res.status(400).json({ message: "Missing or invalid data" });
    }


    const deleteEntries = "DELETE FROM labor_entries WHERE sow_proposal_id = ?";

    db.query(deleteEntries, [sow_proposal_id], (delErr) => {
        if (delErr) {
            console.error("Delete error: ", delErr);
            return res.status(500).json({ message: "Failed to delete old entries" });
        }

        const insertEntries =
            `INSERT INTO labor_entries
        (sow_proposal_id, labor_rate_id, quantity, allowance_percent, average_output, labor_row_cost)
        VALUES ?   
        `;

        const values = laborCost.map(row => [
            sow_proposal_id,
            row.selectedLaborRateId,
            row.quantity,
            row.allowance,
            row.averageOutput,
            row.laborCost
        ]);

        db.query(insertEntries, [values], (insertErr) => {
            if (insertErr) {
                console.error("Insert error: ", insertErr);
                return res.status(500).json({ message: "Failed to insert old entries" });

            }

            const upsertQuery =
                `INSERT INTO labor_cost 
            (sow_proposal_id, labor_uc)
            VALUES (?, ?)
            ON DUPLICATE KEY UPDATE labor_uc = VALUES(labor_uc)
            `;

            db.query(upsertQuery, [sow_proposal_id, totalLaborCost], (upsertErr) => {
                if (upsertErr) {
                    console.error("Upsert error: ", upsertErr);
                    return res.status(500).json("Failed to save total labor cost.");
                }

                return res.status(200).json({ message: "Labor data saved successfully" });

            });

        });
    });
}


const fetchLaborDetails = (req, res) => {
    const { proposal_id } = req.params;


    const query = `
    SELECT 
        le.labor_entry_id,
        le.sow_proposal_id,
        sp.proposal_id,
        swi.item_title,
        le.quantity,
        le.allowance_percent,
        le.average_output,
        le.labor_row_cost,
        lr.labor_type,
        lr.daily_rate,
        lc.labor_uc
        FROM labor_entries le
        JOIN labor_rates lr ON le.labor_rate_id = lr.labor_rate_id
        JOIN sow_proposal sp ON le.sow_proposal_id = sp.sow_proposal_id
        JOIN sow_work_items swi ON sp.work_item_id = swi.work_item_id
        LEFT JOIN labor_cost lc ON le.sow_proposal_id = lc.sow_proposal_id
        WHERE sp.proposal_id = ?

    `;

    db.query(query, [proposal_id], (err, results) => {
        if (err) {
            console.error("Failed to fetch labor details", err);
            return res.status(500).json({ message: "Server Error" });
        }
        return res.status(200).json(results);
    });


};

module.exports = {
    getLaborDetails,
    saveLaborDetails,
    fetchLaborDetails
};
