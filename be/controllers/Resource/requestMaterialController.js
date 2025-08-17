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
 * @description Adds a new resource to the database.
 * @param {object} req - The request object containing resource data.
 * @param {object} res - The response object.
 */
const addResource = (req, res) => {
    const { material_name, default_unit_cost, stocks, reorder_level, brand_id, unitId } = req.body;

    // Validate required fields
    if (!material_name || !default_unit_cost || !stocks || !reorder_level || !brand_id || !unitId) {
        return res.status(400).json({ error: "Missing required fields." });
    }

    const newResource = {
        material_name,
        default_unit_cost,
        stocks,
        reorder_level,
        brand_id,
        unitId,
        status: stocks < reorder_level ? 'Low Stock' : 'In Stock'
    };

    db.query("INSERT INTO resource SET ?", newResource, (err, results) => {
        if (err) {
            console.error("❌ Error adding resource:", err);
            return res.status(500).json({ error: "Server error while adding resource." });
        }
        console.log("✅ Resource added successfully:", results);
        res.status(201).json({ message: "Resource added successfully.", resourceId: results.insertId });
    });
};

/**
 * @description Updates an existing resource in the database.
 * @param {object} req - The request object with resource data and ID.
 * @param {object} res - The response object.
 */
const updateResource = (req, res) => {
    const { id } = req.params;
    const { material_name, default_unit_cost, stocks, reorder_level, brand_id, unitId } = req.body;

    // Validate required fields and resource ID
    if (!id || !material_name || !default_unit_cost || !stocks || !reorder_level || !brand_id || !unitId) {
        return res.status(400).json({ error: "Missing required fields." });
    }

    const updatedResource = {
        material_name,
        default_unit_cost,
        stocks,
        reorder_level,
        brand_id,
        unitId,
        status: stocks < reorder_level ? 'Low Stock' : 'In Stock'
    };

    db.query("UPDATE resource SET ? WHERE resource_id = ?", [updatedResource, id], (err, results) => {
        if (err) {
            console.error("❌ Error updating resource:", err);
            return res.status(500).json({ error: "Server error while updating resource." });
        }

        if (results.affectedRows === 0) {
            return res.status(404).json({ error: "Resource not found." });
        }

        console.log("✅ Resource updated successfully:", results);
        res.json({ message: "Resource updated successfully." });
    });
};

/**
 * @description "Soft deletes" a resource by setting the isDeleted flag.
 * @param {object} req - The request object with the resource ID.
 * @param {object} res - The response object.
 */
const deleteResource = (req, res) => {
    const { id } = req.params;

    if (!id) {
        return res.status(400).json({ error: "Resource ID is required." });
    }

    db.query("UPDATE resource SET isDeleted = 1 WHERE resource_id = ?", [id], (err, results) => {
        if (err) {
            console.error("❌ Error deleting resource:", err);
            return res.status(500).json({ error: "Server error while deleting resource." });
        }

        if (results.affectedRows === 0) {
            return res.status(404).json({ error: "Resource not found." });
        }

        console.log("✅ Resource deleted successfully:", results);
        res.json({ message: "Resource deleted successfully." });
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


module.exports = {
    getAllResources,
    addResource,
    updateResource,
    deleteResource,
    getBrands,
    getUnits
};
