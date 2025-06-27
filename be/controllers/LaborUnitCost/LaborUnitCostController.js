const db = require("../../config/db");


const addLaborDetails = (req, res) => {
    const { sow_proposal_id, laborCost } = req.body;

    if (!sow_proposal_id || !Array.isArray(laborCost)) {
        return res.status(400).json({ message: "Missing or invalid data" });
    }

    const insertEntries = `
        INSERT INTO labor_entries 
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
            return res.status(500).json({ message: "Failed to insert labor entries" });
        }

        // Now recalculate total labor cost for this SOW
        const totalQuery = `
            SELECT SUM(labor_row_cost) AS total FROM labor_entries
            WHERE sow_proposal_id = ?
        `;

        db.query(totalQuery, [sow_proposal_id], (totalErr, totalResult) => {
            if (totalErr) {
                console.error("Total labor cost calc error:", totalErr);
                return res.status(500).json({ message: "Failed to recalculate total labor cost" });
            }

            const total = totalResult[0].total || 0;

            const upsertQuery = `
                INSERT INTO labor_cost (sow_proposal_id, labor_uc)
                VALUES (?, ?)
                ON DUPLICATE KEY UPDATE labor_uc = VALUES(labor_uc)
            `;

            db.query(upsertQuery, [sow_proposal_id, total], (upsertErr) => {
                if (upsertErr) {
                    console.error("Upsert error:", upsertErr);
                    return res.status(500).json({ message: "Failed to save total labor cost." });
                }

                return res.status(200).json({
                    message: "Labor data added successfully",
                    updated_total: total
                });
            });
        });
    });
};



const fetchLaborDetails = (req, res) => {
    const { proposal_id } = req.params;

    const query = `
        SELECT 
            le.labor_entry_id,
            le.labor_rate_id, -- ✅ this was missing!
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


const deleteSingleLaborEntry = (req, res) => {
    const { labor_entry_id } = req.params;

    if (!labor_entry_id) {
        return res.status(400).json({ message: "Missing labor_entry_id" });
    }

    // First: Get the sow_proposal_id of the row to be deleted
    const getSowIdQuery = `SELECT sow_proposal_id FROM labor_entries WHERE labor_entry_id = ?`;

    db.query(getSowIdQuery, [labor_entry_id], (err, rows) => {
        if (err || rows.length === 0) {
            console.error("Failed to find labor entry:", err);
            return res.status(500).json({ message: "Failed to retrieve labor entry" });
        }

        const sow_proposal_id = rows[0].sow_proposal_id;

        // Second: Delete the labor entry
        const deleteQuery = `DELETE FROM labor_entries WHERE labor_entry_id = ?`;
        db.query(deleteQuery, [labor_entry_id], (err, result) => {
            if (err) {
                console.error("Delete error:", err);
                return res.status(500).json({ message: "Failed to delete labor entry" });
            }

            // Third: Recalculate total labor cost
            const sumQuery = `
                SELECT SUM(labor_row_cost) AS total_cost 
                FROM labor_entries 
                WHERE sow_proposal_id = ?
            `;

            db.query(sumQuery, [sow_proposal_id], (err, sumRows) => {
                if (err) {
                    console.error("Sum error:", err);
                    return res.status(500).json({ message: "Failed to recalculate labor cost" });
                }

                const totalCost = sumRows[0].total_cost || 0;

                // Fourth: Update labor_cost table
                const updateCostQuery = `
                    INSERT INTO labor_cost (sow_proposal_id, labor_uc)
                    VALUES (?, ?)
                    ON DUPLICATE KEY UPDATE labor_uc = VALUES(labor_uc)
                `;

                db.query(updateCostQuery, [sow_proposal_id, totalCost], (err) => {
                    if (err) {
                        console.error("Update error:", err);
                        return res.status(500).json({ message: "Failed to update total labor cost" });
                    }

                    return res.status(200).json({ message: "Labor entry deleted and total cost updated" });
                });
            });
        });
    });
};


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


const updateLaborDetails = (req, res) => {

    const { labor_entry_id } = req.params;
    const { labor_rate_id, quantity, allowance_percent, average_output, labor_row_cost } = req.body;

    console.log("PARAMS:", req.params);
    console.log("BODY:", req.body);

    if (!labor_entry_id || !labor_rate_id || quantity == null || allowance_percent == null || average_output == null || labor_row_cost == null) {
        return res.status(400).json({ message: "Missing required fields" });
    }

    const updateQuery = `
        UPDATE labor_entries 
        SET labor_rate_id = ?, quantity = ?, allowance_percent = ?, average_output = ?, labor_row_cost = ?
        WHERE labor_entry_id = ?
    `;

    db.query(updateQuery, [labor_rate_id, quantity, allowance_percent, average_output, labor_row_cost, labor_entry_id], (err, result) => {
        if (err) {
            console.error("Update error:", err);
            return res.status(500).json({ message: "Failed to update labor entry" });
        }

        // Step 2: Get the sow_proposal_id for this labor entry
        const getSowIdQuery = `SELECT sow_proposal_id FROM labor_entries WHERE labor_entry_id = ?`;

        db.query(getSowIdQuery, [labor_entry_id], (err, rows) => {
            if (err || rows.length === 0) {
                console.error("Failed to fetch sow_proposal_id:", err);
                return res.status(500).json({ message: "Error getting sow_proposal_id" });
            }

            const sow_proposal_id = rows[0].sow_proposal_id;

            // Step 3: Recalculate total
            const sumQuery = `
                SELECT SUM(labor_row_cost) AS total_cost 
                FROM labor_entries 
                WHERE sow_proposal_id = ?
            `;

            db.query(sumQuery, [sow_proposal_id], (err, sumRows) => {
                if (err) {
                    console.error("Failed to sum labor cost:", err);
                    return res.status(500).json({ message: "Error recalculating labor cost" });
                }

                const totalCost = sumRows[0].total_cost || 0;

                // Step 4: Update the total in labor_cost
                const updateLaborCostQuery = `
                    INSERT INTO labor_cost (sow_proposal_id, labor_uc)
                    VALUES (?, ?)
                    ON DUPLICATE KEY UPDATE labor_uc = VALUES(labor_uc)
                `;

                db.query(updateLaborCostQuery, [sow_proposal_id, totalCost], (err) => {
                    if (err) {
                        console.error("Failed to update labor_cost:", err);
                        return res.status(500).json({ message: "Error updating labor_cost table" });
                    }

                    return res.status(200).json({ message: "Labor entry updated and total labor cost recalculated" });
                });
            });
        });
    });
};


module.exports = {
    getLaborDetails,
    addLaborDetails,
    fetchLaborDetails,
    deleteSingleLaborEntry,
    updateLaborDetails
};
