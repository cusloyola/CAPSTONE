// requestMaterialController.js

const db = require("../../config/db");
const moment = require("moment");

/**
 * @description Retrieves a list of all resources with details from related tables, including search, filter, and pagination.
 * @param {object} req - The request object.
 * @param {object} res - The response object.
 */
const getAllResources = (req, res) => {
    // 1. Extract and sanitize query parameters from the request URL.
    // The frontend sends these as ?page=X&limit=Y&search=...&brand=...
    const page = parseInt(req.query.page) || 1; // Default to page 1
    const limit = parseInt(req.query.limit) || 10; // Default to 10 items per page
    const search = req.query.search ? req.query.search.toLowerCase() : ''; // Get search term, convert to lowercase
    const brandFilter = req.query.brand ? req.query.brand : ''; // Get brand filter

    // Calculate the offset for pagination
    const offset = (page - 1) * limit;

    // 2. Build the dynamic WHERE clause based on search and brand filters.
    let whereClause = "WHERE r.isDeleted = 0";

    // Add search condition if a search term is provided
    if (search) {
        whereClause += ` AND LOWER(r.material_name) LIKE '%${search}%'`;
    }

    // Add brand filter condition if a brand is selected
    if (brandFilter) {
        whereClause += ` AND rb.brand_name = '${brandFilter}'`;
    }

    // 3. Construct the main query for fetching the paginated data.
    const dataQuery = `
        SELECT 
            r.*, 
            rb.brand_name, 
            u.unitName
        FROM 
            resource r
        JOIN 
            resource_brand rb ON r.brand_id = rb.brand_id
        JOIN 
            unit_of_measure u ON r.unitId = u.unitId
        ${whereClause}
        LIMIT ? OFFSET ?;
    `;

    // 4. Construct a separate query to get the total count of filtered items.
    const countQuery = `
        SELECT COUNT(*) AS total
        FROM 
            resource r
        JOIN 
            resource_brand rb ON r.brand_id = rb.brand_id
        ${whereClause};
    `;

    // Execute the count query first to get the total number of items.
    db.query(countQuery, (err, countResults) => {
        if (err) {
            console.error("❌ Error fetching total count:", err);
            return res.status(500).json({ error: "Server error while fetching resource count." });
        }

        const totalItems = countResults[0].total;

        // Execute the main data query next.
        db.query(dataQuery, [limit, offset], (err, results) => {
            if (err) {
                console.error("❌ Error fetching resources:", err);
                return res.status(500).json({ error: "Server error while fetching resources." });
            }

            if (!results || results.length === 0) {
                console.warn("⚠️ No resources found matching criteria.");
                // Return an empty array and total count of 0 if no results are found.
                return res.json({ items: [], total: 0 });
            }

            console.log("📌 Sending Filtered and Paginated Resource Data:", results);
            // Return the paginated items and the total count.
            return res.json({
                items: results,
                total: totalItems
            });
        });
    });
};

/**
 * @description Fetches all available resource brands.
 * @param {object} req - The request object.
 * @param {object} res - The response object.
 */
const getBrands = (req, res) => {
    db.query("SELECT brand_id, brand_name FROM resource_brand", (err, results) => {
        if (err) {
            console.error("❌ Error fetching brands:", err);
            return res.status(500).json({ error: "Server error while fetching brands." });
        }
        console.log("📌 Sending Brands Data:", results);
        res.json(results);
    });
};

/**
 * @description Fetches all available units of measure.
 * @param {object} req - The request object.
 * @param {object} res - The response object.
 */
const getUnits = (req, res) => {
    db.query("SELECT unitId, unitName FROM unit_of_measure", (err, results) => {
        if (err) {
            console.error("❌ Error fetching units:", err);
            return res.status(500).json({ error: "Server error while fetching units." });
        }
        console.log("📌 Sending Units Data:", results);
        res.json(results);
    });
};

/**
 * @description Retrieves a list of materials for a new request.
 * @param {object} req - The request object.
 * @param {object} res - The response object.
 */
const getRequestMaterialItems = (req, res) => {
    db.query(
        "SELECT resource_id, material_name FROM resource WHERE isDeleted = 0",
        (err, results) => {
            if (err) {
                console.error("❌ Error fetching request material items:", err);
                return res
                    .status(500)
                    .json({ error: "Server error while fetching request material items" });
            }
            if (!results || results.length === 0) {
                console.warn("⚠️ No request material items found.");
                return res
                    .status(404)
                    .json({ message: "No request material items found." });
            }
            console.log("📌 Sending Request Material Items Data:", results);
            return res.json(results);
        }
    );
};


const createRequestedMaterials = (req, res) => {
    const { selectedProject, urgency, notes, selectedMaterials } = req.body;

    console.log("Received request to create materials:", req.body); // Debugging log

    if (!selectedProject || !urgency || !selectedMaterials || selectedMaterials.length === 0) {
        return res.status(400).json({ error: "Missing required fields." });
    }

    // Input validation for selectedMaterials
    if (!Array.isArray(selectedMaterials) || selectedMaterials.some(item => !item.item_id || !item.request_quantity)) {
        return res.status(400).json({ error: "Invalid selectedMaterials format." });
    }

    db.beginTransaction((err) => {
        if (err) {
            console.error("Database transaction error:", err); // Debugging Log
            return res.status(500).json({ error: "Database transaction error." });
        }

        db.query(
            "INSERT INTO requested_materials (project_name, urgency, notes) VALUES (?, ?, ?)",
            [selectedProject, urgency, notes],
            (err, requestResults) => {
                if (err) {
                    console.error("❌ Error inserting requested materials:", err);
                    return db.rollback(() => {
                        return res.status(500).json({ error: "Error creating request." });
                    });
                }

                const request_id = requestResults.insertId;
                console.log("Inserted requested materials, request ID:", request_id); // Debugging log

                const values = selectedMaterials.map((item) => [
                    request_id,
                    item.item_id,
                    item.request_quantity,
                ]);

                db.query(
                    "INSERT INTO requested_material_items (request_id, item_id, request_quantity) VALUES ?",
                    [values],
                    (err) => {
                        if (err) {
                            console.error("❌ Error inserting requested material items:", err);
                            return db.rollback(() => {
                                return res.status(500).json({ error: "Error adding items to request." });
                            });
                        }

                        console.log("Inserted requested material items"); // Debugging log

                        db.commit((err) => {
                            if (err) {
                                console.error("❌ Error committing transaction:", err);
                                return db.rollback(() => {
                                    return res.status(500).json({ error: "Error completing request." });
                                });
                            }
                            console.log("✅ Request created successfully.");
                            return res.status(201).json({ message: "Request created successfully." });
                        });
                    }
                );
            }
        );
    });
};

const getRequestedMaterialsHistory = (req, res) => {
    const query = `
  SELECT
    rm.request_id,
    rm.project_name,
    rm.urgency,
    rm.notes,
    rm.is_approved,
    rm.request_date,
    rm.approved_at,
    CONCAT(
        '[',
        GROUP_CONCAT(
            JSON_OBJECT(
                'item_request_id', rmi.item_request_id,
                'item_id', rmi.item_id,
                'request_quantity', rmi.request_quantity,
                'material_name', r.material_name,
                'brand_name', rb.brand_name,
                'unitName', u.unitName,
                'default_unit_cost', r.default_unit_cost
            )
        ),
        ']'
    ) AS items
FROM requested_materials rm
LEFT JOIN requested_material_items rmi ON rm.request_id = rmi.request_id
LEFT JOIN resource r ON rmi.item_id = r.resource_id
LEFT JOIN resource_brand rb ON r.brand_id = rb.brand_id
LEFT JOIN unit_of_measure u ON r.unitId = u.unitId
GROUP BY rm.request_id
ORDER BY rm.request_id DESC;
    `;

    db.query(query, (err, results) => {
        if (err) {
            console.error("❌ Error fetching requested materials history:", err);
            return res.status(500).json({ error: "Server error while fetching history" });
        }

        if (!results || results.length === 0) {
            console.warn("⚠️ No requested materials history found.");
            return res.status(404).json({ message: "No requested materials history found." });
        }

        console.log("📌 Sending Requested Materials History Data:", results);
        return res.json(results);
    });
};

const approveRequest = (req, res) => {
    const requestId = req.params.requestId;
    const approvedBy = 'Admin'; 
    const approvedAt = moment().format('YYYY-MM-DD HH:mm:ss');

    // NEW LOG: Log the start of the approval process
    console.log(`🚀 Starting approval process for Request ID: ${requestId}`);

    // Start a database transaction
    db.beginTransaction((err) => {
        if (err) {
            console.error('❌ Database transaction error:', err);
            return res.status(500).json({ error: 'Database transaction error.' });
        }

        // First query: Update the status of the request
        db.query(
            'UPDATE requested_materials SET is_approved = 1, approved_by = ?, approved_at = ? WHERE request_id = ?',
            [approvedBy, approvedAt, requestId],
            (err, results) => {
                if (err) {
                    console.error('❌ Database error during request update:', err);
                    return db.rollback(() => {
                        return res.status(500).json({ error: 'Failed to approve request' });
                    });
                }
                
                // NEW LOG: Log the affected rows from the initial update
                console.log(`✅ Initial request update successful. Affected rows: ${results.affectedRows}`);

                if (results.affectedRows === 0) {
                    console.warn(`⚠️ Request ID ${requestId} not found for approval. Rollback initiated.`);
                    return db.rollback(() => {
                        return res.status(404).json({ error: 'Request not found' });
                    });
                }
                
                // Second query: Get the list of items associated with the request
                db.query(
                    'SELECT item_id, request_quantity FROM requested_material_items WHERE request_id = ?',
                    [requestId],
                    (err, itemsResults) => {
                        if (err) {
                            console.error('❌ Database error during item fetch:', err);
                            return db.rollback(() => {
                                return res.status(500).json({ error: 'Failed to fetch items for stock update' });
                            });
                        }
                        
                        console.log(`🔎 Found ${itemsResults.length} items for request ID ${requestId}. Items:`, itemsResults);

                        if (!itemsResults || itemsResults.length === 0) {
                            console.warn(`⚠️ No items found for request ID ${requestId}. Committing approval without stock update.`);
                            db.commit((err) => {
                                if (err) {
                                    console.error('❌ Error committing transaction (no items):', err);
                                    return db.rollback(() => {
                                        return res.status(500).json({ error: 'Error completing transaction.' });
                                    });
                                }
                                return res.json({ message: 'Request approved successfully (no items to update).' });
                            });
                            return;
                        }

                        const updateStockPromises = itemsResults.map(item => {
                            return new Promise((resolve, reject) => {
                                console.log(`🔄 Attempting to update stock for resource_id: ${item.item_id}, quantity: ${item.request_quantity}`);
                                db.query(
                                    'UPDATE resource SET stocks = stocks - ? WHERE resource_id = ?',
                                    [item.request_quantity, item.item_id],
                                    (err, updateResults) => {
                                        if (err) {
                                            console.error(`❌ Error updating stock for item ${item.item_id}:`, err);
                                            reject(err);
                                        } else {
                                            if (updateResults.affectedRows === 0) {
                                                console.warn(`⚠️ Stock update for item ${item.item_id} failed: No matching resource_id found.`);
                                            } else {
                                                console.log(`✅ Stock updated for item ${item.item_id}. Affected rows: ${updateResults.affectedRows}`);
                                            }
                                            resolve(updateResults);
                                        }
                                    }
                                );
                            });
                        });

                        Promise.all(updateStockPromises)
                            .then(() => {
                                db.commit((err) => {
                                    if (err) {
                                        console.error('❌ Error committing transaction after stock update:', err);
                                        return db.rollback(() => {
                                            return res.status(500).json({ error: 'Error completing transaction.' });
                                        });
                                    }
                                    console.log('✅ Request approved and all stocks updated successfully.');
                                    res.json({ message: 'Request approved and stock updated successfully' });
                                });
                            })
                            .catch(err => {
                                console.error('❌ One or more stock updates failed. Rolling back transaction.', err);
                                return db.rollback(() => {
                                    return res.status(500).json({ error: 'Failed to update stock. Transaction rolled back.' });
                                });
                            });
                    }
                );
            }
        );
    });
};



const rejectRequest = (req, res) => {
    const requestId = req.params.requestId;
    const rejectedAt = moment().format('YYYY-MM-DD HH:mm:ss');

    db.beginTransaction((err) => {
        if (err) {
            console.error('❌ Database transaction error:', err);
            return res.status(500).json({ error: 'Database transaction error.' });
        }
        
        db.query(
            'UPDATE requested_materials SET is_approved = 2, approved_at = ? WHERE request_id = ?',
            [rejectedAt, requestId],
            (err, results) => {
                if (err) {
                    console.error('❌ Database error:', err);
                    return db.rollback(() => {
                        return res.status(500).json({ error: 'Failed to reject request' });
                    });
                }
                if (results.affectedRows === 0) {
                    console.warn(`⚠️ Request ID ${requestId} not found for rejection.`);
                    return db.rollback(() => {
                        return res.status(404).json({ error: 'Request not found' });
                    });
                }
                
                db.commit((err) => {
                    if (err) {
                        console.error('❌ Error committing rejection transaction:', err);
                        return db.rollback(() => {
                            return res.status(500).json({ error: 'Error completing transaction.' });
                        });
                    }
                    console.log(`✅ Request ID ${requestId} rejected successfully.`);
                    res.json({ message: 'Request rejected successfully' });
                });
            }
        );
    });
};


module.exports = {
    getAllResources,
    getBrands,
    getUnits,
    getRequestMaterialItems,
    createRequestedMaterials,
    getRequestedMaterialsHistory,
    approveRequest,
    rejectRequest
};
