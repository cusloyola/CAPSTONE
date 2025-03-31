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



// Backend (saveBOM function)
const saveBOM = async (req, res) => {
    console.log("📌 Request received: POST /api/bom/save", req.body);

    const { bom_id, user_id, date, rowData } = req.body;

    if (!bom_id) {
        return res.status(400).json({ error: "Missing bom_id. Please create a BOM first." });
    }

    if (!rowData || rowData.length === 0) {
        try {
            await db.query('DELETE FROM bom_details WHERE bom_id = ?', [bom_id]);
            console.log(`✅ All rows deleted for bom_id: ${bom_id}`);
            return res.status(200).json({ message: "All rows deleted successfully." });
        } catch (error) {
            console.error('❌ Error deleting rows:', error);
            return res.status(500).json({ error: "Error deleting rows." });
        }
    }

    try {
        const updateOrInsertPromises = rowData.map(row => {
            return new Promise((resolve, reject) => {
                let { row_id, scope_of_works, quantity, unit, materialUC, laborUC, total_cost, row_type, subtotal_cost } = row;

                row_id = parseInt(row_id);

                console.log(`Processing row: row_id=${row_id}, scope_of_works="${scope_of_works}"`);

                const checkQuery = "SELECT row_id FROM bom_details WHERE row_id = ? AND bom_id = ?";
                console.log(`Executing query: ${checkQuery} with params [${row_id}, ${bom_id}]`);

                db.query(checkQuery, [row_id, bom_id], (err, checkResults) => {
                    if (err) {
                        console.error(`❌ Error checking BOM row (row_id=${row_id}):`, err);
                        reject(err);
                        return;
                    }

                    if (checkResults.length > 0) {
                        // Row exists, perform an UPDATE
                        let updateQuery = `
                            UPDATE bom_details
                            SET scope_of_works = ?, quantity = ?, unit = ?, mc_uc = ?, lc_uc = ?, total_cost = ?, row_type = ?, date = ?
                            WHERE row_id = ? AND bom_id = ?;
                        `;
                        console.log(`Executing query: ${updateQuery} with params [${scope_of_works}, ${quantity}, ${unit}, ${materialUC}, ${laborUC}, ${total_cost}, ${row_type}, ${date}, ${row_id}, ${bom_id}]`);
                        console.log(`UPDATE param types: [${typeof scope_of_works}, ${typeof quantity}, ${typeof unit}, ${typeof materialUC}, ${typeof laborUC}, ${typeof total_cost}, ${typeof row_type}, ${typeof date}, ${typeof row_id}, ${typeof bom_id}]`);

                        db.query(updateQuery, [scope_of_works, quantity, unit, materialUC, laborUC, total_cost, row_type, date, row_id, bom_id], (updateErr, updateResults) => {
                            if (updateErr) {
                                console.error(`❌ Error updating BOM row (row_id=${row_id}):`, updateErr);
                                console.error("❌ Full updateErr object:", updateErr);
                                reject(updateErr);
                            } else {
                                console.log(`✅ BOM row updated successfully (row_id=${row_id})`);

                                // Update bom_subtotals if subtotal_cost is provided
                                if (subtotal_cost !== undefined) {
                                    const subtotalQuery = `
                                        INSERT INTO bom_subtotals (bom_id, subtotal_cost) VALUES (?, ?)
                                        ON DUPLICATE KEY UPDATE subtotal_cost = ?;
                                    `;

                                    db.query(subtotalQuery, [bom_id, subtotal_cost, subtotal_cost], (subtotalErr, subtotalResults) => {
                                        if (subtotalErr) {
                                            console.error(`❌ Error updating bom_subtotals:`, subtotalErr);
                                            reject(subtotalErr);
                                        } else {
                                            console.log(`✅ bom_subtotals updated successfully for bom_id=${bom_id}`);
                                            resolve();
                                        }
                                    });
                                } else {
                                    resolve();
                                }
                            }
                        });
                    } else {
                        // Row doesn't exist, perform an INSERT
                        const insertQuery = `
                            INSERT INTO bom_details (bom_id, user_id, row_id, scope_of_works, quantity, unit, mc_uc, lc_uc, total_cost, row_type, date)
                            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
                        `;
                        console.log(`Executing query: ${insertQuery} with params [${bom_id}, ${user_id}, ${row_id}, ${scope_of_works}, ${quantity}, ${unit}, ${materialUC}, ${laborUC}, ${total_cost}, ${row_type}, ${date}]`);
                        console.log(`INSERT param types: [${typeof bom_id}, ${typeof user_id}, ${typeof row_id}, ${typeof scope_of_works}, ${typeof quantity}, ${typeof unit}, ${typeof materialUC}, ${typeof laborUC}, ${typeof total_cost}, ${typeof row_type}, ${typeof date}]`);

                        db.query(insertQuery, [bom_id, user_id, row_id, scope_of_works, quantity, unit, materialUC, laborUC, total_cost, row_type, date], (insertErr, insertResults) => {
                            if (insertErr) {
                                console.error(`❌ Error inserting BOM row (row_id=${row_id}):`, insertErr);
                                console.error("❌ Full insertErr object:", insertErr); // Log full error
                                reject(insertErr);
                            } else {
                                console.log(`✅ BOM row inserted successfully (row_id=${row_id})`);
                                resolve();
                            }
                        });
                    }
                });
            });
        });

        Promise.all(updateOrInsertPromises)
            .then(() => res.json({ message: "BOM rows updated/inserted successfully!" }))
            .catch(err => {
                console.error("❌ Error processing all BOM rows:", err);
                console.error("❌ Full Error Object", err);
                res.status(500).json({ error: "Error updating/inserting BOM rows", details: err });
            });

    } catch (error) {
        console.error("❌ Error processing BOM rows:", error);
        console.error("❌ Full Error Object", error);
        res.status(500).json({ error: "Error processing BOM rows" });
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
    bd.row_id, -- Include row_id
    bd.scope_of_works, 
    bd.quantity, 
    bd.unit, 
    bd.mc_uc, 
    bd.lc_uc, 
    bd.mc_amount, 
    bd.lc_amount, 
    bd.row_total, 
    COALESCE(bsc.subtotal_cost, 0) AS subtotal_cost
FROM 
    bom_list AS bl
LEFT JOIN 
    bom_details AS bd ON bl.bom_id = bd.bom_id
LEFT JOIN 
    bom_subtotals AS bsc ON bl.bom_id = bsc.bom_id
WHERE 
    bl.bom_id = ?;

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
            subtotal_cost: results[0].subtotal_cost,
        };

        const bomDetails = results
    .filter(row => row.scope_of_works !== null) // 🔥 Prevents empty BOMs
    .map(row => ({
        row_id: row.row_id, // Ensure row_id is included
        no: row.no || 0,
        scope_of_works: row.scope_of_works,
        quantity: row.quantity,
        unit: row.unit,
        mc_uc: row.mc_uc,
        lc_uc: row.lc_uc,
        mc_amount: row.mc_amount,
        lc_amount: row.lc_amount,
        row_total: row.row_total,
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




module.exports = { getLatestBomId, saveBOM, getNextBomId, createBOM, getBOMList, getBOMData, deleteAllBom };



