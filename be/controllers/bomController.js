const db = require("../config/db"); // ✅ Ensure this is correctly set up




const getLatestBomId = (req, res) => {
    const query = "SELECT MAX(bom_id) AS latest_bom_id FROM bom_details"; // Ensure table name is correct
    db.query(query, (err, result) => {
        if (err) {
            console.error("❌ Database error:", err);
            return res.status(500).json({ error: "Database error" });
        }




        const latestBOMId = result[0]?.latest_bom_id || 0;  // Default to 0 if no rows found
        const nextBOMId = latestBOMId + 1;  // Increment to get the next available BOM ID




        console.log("Latest BOM ID:", latestBOMId);  // Log the latest BOM ID
        console.log("Next BOM ID:", nextBOMId);     // Log the next BOM ID




        res.json({ latest_bom_id: nextBOMId });  // Send the next BOM ID
    });
};
/// Function to get the next BOM ID
const getNextBomId = (req, res) => {
    console.log("Received request for next BOM ID");




    const query = "SELECT MAX(bom_id) AS latest_bom_id FROM bom_details"; // Get the latest BOM ID
    db.query(query, (err, result) => {
        if (err) {
            console.error("❌ Database error:", err);
            return res.status(500).json({ error: "Database error" });
        }




        const nextBomId = (result[0].latest_bom_id || 0) + 1;  // Calculate the next BOM ID
        console.log("Max BOM ID found in the database:", result[0].latest_bom_id);
        console.log("Next BOM ID:", nextBomId);




        res.json({ next_bom_id: nextBomId });  // Send the response with the next BOM ID
    });
};




const createBOM = async (req, res) => {
    console.log("📌 Request received: POST /api/bom/create", req.body);

    const { user_id, date, project_name, location, subject, owner, remarks, prepared_by, submitted_by, professional } = req.body;

    if (!user_id) {
        console.warn("⚠️ user_id is missing!");
        return res.status(400).json({ message: "User ID is required" });
    }

    if (!date || !project_name || !location || !subject || !owner || !prepared_by || !submitted_by || !professional) {
        return res.status(400).json({ message: "All required fields must be filled" });
    }



    try {
        // Format date to "March 29, 2025"
        const formattedDate = new Date(date).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });




        const query = `
            INSERT INTO bom_list (user_id, date, project_name, location, subject, owner, remarks, prepared_by, submitted_by, professional)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
        `;
        const queryParams = [user_id, formattedDate, project_name, location, subject, owner, remarks, prepared_by, submitted_by, professional];




        db.query(query, queryParams, (err, result) => {
            if (err) {
                console.error("❌ Error creating BOM:", err);
                return res.status(500).json({ error: "Error creating BOM" });
            }
            console.log("✅ BOM created successfully! Inserted ID:", result.insertId);
            res.json({ message: "BOM created successfully!", bom_id: result.insertId });
        });




    } catch (error) {
        console.error("❌ Error processing BOM creation:", error);
        res.status(500).json({ error: "Error processing BOM creation" });
    }


};


const saveBOM = async (req, res) => {
    console.log("📌 Request received: POST /api/bom/save", req.body);


    const { bom_id, user_id, date, rowData } = req.body;


    if (!bom_id) {
        return res.status(400).json({ error: "Missing bom_id. Please create a BOM first." });
    }


    if (!rowData || rowData.length === 0) {
        // Delete all rows for the BOM if rowData is empty
        db.query('DELETE FROM bom_details WHERE bom_id = ?', [bom_id], (err, results) => {
            if (err) {
                console.error('❌ Error deleting rows:', err);
                return res.status(500).json({ error: "Error deleting rows." });
            }
            console.log(`✅ All rows deleted for bom_id: ${bom_id}`);
            return res.status(200).json({ message: "All rows deleted successfully." });
        });
        return;
    }


    let errors = [];
    let successfulUpdates = 0;
    let successfulInserts = 0;


    // Log the full rowData received
    console.log("Received rowData:", rowData);


    for (const row of rowData) {
        let { row_id, scope_of_works, quantity, unit, mc_uc, lc_uc, total_cost, row_type } = row;


        // Log the row data before processing
        console.log(`🔍 Processing row:`, row);


        // Validation
        if (typeof row_id !== 'number' || isNaN(row_id)) {
            errors.push(`Invalid row_id: ${row_id}`);
            continue; // Skip to the next row
        }


        row_id = parseInt(row_id);


        scope_of_works = scope_of_works || '';  // Ensure it's not undefined or null


        quantity = parseInt(quantity) || 0;
        mc_uc = parseFloat(mc_uc) || 0;
        lc_uc = parseFloat(lc_uc) || 0;
        total_cost = parseFloat(total_cost) || 0;


        // Check if the row exists
        const checkQuery = "SELECT row_id FROM bom_details WHERE row_id = ? AND bom_id = ?";


        try {
            const checkResults = await new Promise((resolve, reject) => {
                db.query(checkQuery, [row_id, bom_id], (err, results) => {
                    if (err) reject(err);
                    else resolve(results);
                });
            });


            if (checkResults.length > 0) {
                // Update existing row
                const updateQuery = `
                    UPDATE bom_details
                    SET scope_of_works = ?, quantity = ?, unit = ?, mc_uc = ?, lc_uc = ?, total_cost = ?, row_type = ?, date = ?
                    WHERE row_id = ? AND bom_id = ?;
                `;


                console.log("📝 Running UPDATE query:", updateQuery, [
                    scope_of_works, quantity, unit, mc_uc, lc_uc, total_cost, row_type, date, row_id, bom_id
                ]);


                const updateResult = await new Promise((resolve, reject) => {
                    db.query(updateQuery, [scope_of_works, quantity, unit, mc_uc, lc_uc, total_cost, row_type, date, row_id, bom_id], (err, result) => {
                        if (err) reject(err);
                        else resolve(result);
                    });
                });


                console.log(`✅ Update successful for row_id=${row_id}:`, updateResult);
                successfulUpdates++;
            } else {
                // Insert new row
                const insertQuery = `
                    INSERT INTO bom_details (bom_id, user_id, row_id, scope_of_works, quantity, unit, mc_uc, lc_uc, total_cost, row_type, date)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
                `;


                // Log the query before running it
                console.log("📝 Running INSERT query:", insertQuery, [
                    bom_id, user_id, row_id, scope_of_works, quantity, unit, mc_uc, lc_uc, total_cost, row_type, date
                ]);


                const insertResult = await new Promise((resolve, reject) => {
                    db.query(insertQuery, [bom_id, user_id, row_id, scope_of_works, quantity, unit, mc_uc, lc_uc, total_cost, row_type, date], (err, result) => {
                        if (err) reject(err);
                        else resolve(result);
                    });
                });


                console.log(`✅ Insert successful for row_id=${row_id}:`, insertResult);
                successfulInserts++;
            }
        } catch (err) {
            console.error(`❌ Error processing row (row_id=${row_id}):`, err);
            errors.push(err);
        }
    }


    if (errors.length > 0) {
        console.error("❌ Errors during BOM row processing:", errors);
        return res.status(500).json({ error: "Errors occurred during BOM row processing." });
    } else {
        return res.json({
            message: "BOM rows updated/inserted successfully!",
            successfulUpdates,
            successfulInserts
        });
    }
};




const getBOMData = (req, res) => {
    const bomId = req.params.bomId;
    console.log("Received BOM ID:", bomId);
    if (!bomId) {
        return res.status(400).json({ message: "BOM ID is required." });
    }
    if (!db) {
        console.error("Database connection not established.");
        return res.status(500).json({ message: "Database connection error." });
    }
    const query = `
        SELECT
            bl.bom_id,
            COALESCE(bl.title, 'Untitled') AS bom_name,
            bl.created_at,
            COALESCE(bd.no, 0) AS no,
            bd.row_id,
            bd.scope_of_works,
            bd.quantity,
            bd.unit,
            bd.mc_uc,
            bd.lc_uc,
            bd.mc_amount,
            bd.lc_amount,
            bd.row_total,
            COALESCE(bd.total_cost, 0) AS total_cost,
            bd.row_type,
            bd.total_cost_sum,
            bd.markup_percentage,
            bd.markup_amount,
            bd.grand_total
        FROM
            bom_list AS bl
        LEFT JOIN
            bom_details AS bd ON bl.bom_id = bd.bom_id
        WHERE
            bl.bom_id = ?
        ORDER BY bd.row_id;
    `;
    db.query(query, [bomId], (err, results) => {
        if (err) {
            console.error("Error fetching BOM data:", err);
            return res.status(500).json({ message: "Error fetching BOM data", error: err.message });
        }
        if (!results.length) {
            console.log("No BOM found for ID:", bomId);
            return res.status(404).json({ message: "BOM not found" });
        }
        console.log("BOM Data Result:", results);

        const bomList = {
            bom_id: results[0].bom_id,
            bom_name: results[0].bom_name,
            created_at: results[0].created_at,
        };

        const bomDetails = results.map(row => ({
            row_id: row.row_id,
            no: row.no || 0,
            scope_of_works: row.scope_of_works,
            quantity: row.quantity,
            unit: row.unit,
            mc_uc: row.mc_uc,
            lc_uc: row.lc_uc,
            mc_amount: row.mc_amount,
            lc_amount: row.lc_amount,
            row_total: row.row_total,
            total_cost: row.total_cost,
            row_type: row.row_type,
            total_cost_sum: row.row_id === 0 ? row.total_cost_sum : null,
            markup_percentage: row.row_id === 0 ? row.markup_percentage : null,
            markup_amount: row.row_id === 0 ? row.markup_amount : null,
            grand_total: row.row_id === 0 ? row.grand_total : null,
        }));

        res.json({
            bomList,
            bomDetails,
        });
    });
};





const deleteAllBom = async (req, res) => {
    const { bomId } = req.params;


    try {
        // Delete all rows from your database that match the bomId
        await db.query('DELETE FROM bom_details WHERE bom_id = ?', [bomId]);
        res.status(200).json({ message: 'All rows deleted successfully.' });
    } catch (error) {
        console.error('Error deleting rows:', error);
        res.status(500).json({ error: 'Internal server error.' });
    }
};






const getBOMList = (req, res) => {
    console.log("🔍 Decoded Token:", req.user); // Debugging




    db.query("SELECT bom_id, project_name, location, subject, owner FROM bom_list", (err, results) => {
        if (err) {
            console.error("❌ Database error:", err);
            return res.status(500).json({ message: "Internal server error." });
        }




        if (results.length === 0) {
            console.log("⚠ No BOM records found in the database.");
            return res.status(404).json({ message: "No BOM records found." });
        }




        res.json(results);
    });


   
};


// backend/routes/bomRoutes.js


const calculateBOMSubtotal = (req, res) => {
    const { bomId } = req.params;


    const query = `
        SELECT
            bd.mc_amount,
            bd.lc_amount,
            bd.row_type
        FROM
            bom_details AS bd
        WHERE
            bd.bom_id = ? AND bd.row_type != 'subtotal';
    `;


    db.query(query, [bomId], (err, results) => {
        if (err) {
            console.error("Error fetching BOM data:", err);
            return res.status(500).json({ message: "Error fetching BOM data", error: err.message });
        }


        let subtotal = 0;
        results.forEach(row => {
            subtotal += row.mc_amount + row.lc_amount;
        });


        // Store the subtotal in the bom_subtotals table.
        const insertQuery = `
            INSERT INTO bom_subtotals (bom_id, subtotal_cost)
            VALUES (?, ?)
            ON DUPLICATE KEY UPDATE subtotal_cost = ?;
        `;


        db.query(insertQuery, [bomId, subtotal, subtotal], (insertErr) => {
            if (insertErr) {
                console.error("Error saving subtotal:", insertErr);
                return res.status(500).json({ message: "Error saving subtotal", error: insertErr.message });
            }


            res.json({ subtotal_cost: subtotal });
        });
    });
};




module.exports = { getLatestBomId, saveBOM, getNextBomId, createBOM, getBOMList, getBOMData, deleteAllBom,
    calculateBOMSubtotal
 };









