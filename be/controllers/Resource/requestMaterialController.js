// requestMaterialController.js

const db = require("../../config/db");
const moment = require("moment");
const { generateStructuredId } = require("../../generated/GenerateCodes/generatecode");

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

    if (!selectedProject || !urgency || !selectedMaterials || selectedMaterials.length === 0) {
        return res.status(400).json({ error: "Missing required fields." });
    }

    db.beginTransaction((err) => {
        if (err) {
            console.error("❌ Transaction start error:", err);
            return res.status(500).json({ error: "Database transaction error." });
        }

        // Generate request_id for requested_materials (111)
        generateStructuredId("111", "requested_materials", "request_id", (err, request_id) => {
            if (err) {
                console.error("❌ Error generating request_id:", err);
                return db.rollback(() => res.status(500).json({ error: err }));
            }

            db.query(
                "INSERT INTO requested_materials (request_id, project_id, urgency, notes) VALUES (?, ?, ?, ?)",
                [request_id, selectedProject, urgency, notes],
                (err) => {
                    if (err) {
                        console.error("❌ Error inserting requested_materials:", err);
                        return db.rollback(() => res.status(500).json({ error: err }));
                    }

                    // Generate item_request_id for each item and prepare values
                    const values = [];
                    let count = 0;

                    selectedMaterials.forEach((item) => {
                        generateStructuredId("110", "requested_material_items", "item_request_id", (err, item_request_id) => {
                            if (err) {
                                console.error("❌ Error generating item_request_id:", err);
                                return db.rollback(() => res.status(500).json({ error: err }));
                            }

                            values.push([item_request_id, request_id, item.resource_id, item.request_quantity]);
                            count++;

                            // Once all items have generated IDs
                            if (count === selectedMaterials.length) {
                                db.query(
                                    "INSERT INTO requested_material_items (item_request_id, request_id, resource_id, request_quantity) VALUES ?",
                                    [values],
                                    (err) => {
                                        if (err) {
                                            console.error("❌ Error inserting requested_material_items:", err);
                                            return db.rollback(() => res.status(500).json({ error: err }));
                                        }

                                        db.commit((err) => {
                                            if (err) {
                                                console.error("❌ Error committing transaction:", err);
                                                return db.rollback(() => res.status(500).json({ error: err }));
                                            }
                                            console.log("✅ Request created successfully.");
                                            return res.status(201).json({ message: "Request created successfully.", request_id });
                                        });
                                    }
                                );
                            }
                        });
                    });
                }
            );
        });
    });
};


const getRequestedMaterialsHistory = (req, res) => {
    const query = `
SELECT
    rm.request_id,
    p.project_name,
    p.location,
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
                'resource_id', rmi.resource_id,
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
LEFT JOIN projects p ON rm.project_id = p.project_id
LEFT JOIN requested_material_items rmi ON rm.request_id = rmi.request_id
LEFT JOIN resource r ON rmi.resource_id = r.resource_id
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

// A simple helper function to promisify a MySQL query
const promisifyQuery = (db, sql, params) => {
    return new Promise((resolve, reject) => {
        db.query(sql, params, (err, results) => {
            if (err) {
                return reject(err);
            }
            resolve(results);
        });
    });
};

const approveRequest = async (req, res) => {
    const { requestId } = req.params;
    const approvedBy = 'Admin';
    const approvedAt = new Date();

    console.log(`🚀 Starting approval process for Request ID: ${requestId}`);

    // Create promise-based versions of the transaction methods
    const beginTransaction = () => new Promise((resolve, reject) => db.beginTransaction(err => (err ? reject(err) : resolve())));
    const commit = () => new Promise((resolve, reject) => db.commit(err => (err ? reject(err) : resolve())));
    const rollback = () => new Promise((resolve, reject) => db.rollback(err => (err ? reject(err) : resolve())));

    await beginTransaction();

    try {
        // First query: Update the status of the request
        const updateResult = await promisifyQuery(
            db,
            'UPDATE requested_materials SET is_approved = 1, approved_by = ?, approved_at = ? WHERE request_id = ?',
            [approvedBy, approvedAt, requestId]
        );
        
        if (updateResult.affectedRows === 0) {
            await rollback();
            return res.status(404).json({ error: 'Request not found' });
        }
        
        // Second query: Get the list of items
        const items = await promisifyQuery(
            db,
            'SELECT resource_id, request_quantity FROM requested_material_items WHERE request_id = ?',
            [requestId]
        );

        if (items.length > 0) {
            // Third query: Update the stock for each item concurrently
            const stockUpdatePromises = items.map(item =>
                promisifyQuery(
                    db,
                    'UPDATE resource SET stocks = stocks - ? WHERE resource_id = ?',
                    [item.request_quantity, item.resource_id]
                )
            );
            await Promise.all(stockUpdatePromises);
        }

        await commit();
        console.log('✅ Request approved and stocks updated successfully.');
        res.json({ message: 'Request approved and stock updated successfully' });

    } catch (err) {
        await rollback();
        console.error('❌ Transaction failed. Rolling back.', err);
        res.status(500).json({ error: 'Failed to complete request approval. Transaction rolled back.' });
    }
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
