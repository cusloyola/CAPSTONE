const db = require("../../config/db");

// Controller to get all resources, joining with brand and unit tables for full details
const getAllResources = (req, res) => {
    // A more comprehensive query to include brand, unit names, and the new stocks column
    const query = `
        SELECT 
            r.*, 
            rb.brand_name, 
            u.unitCode
        FROM 
            resource r
        JOIN 
            resource_brand rb ON r.brand_id = rb.brand_id
        JOIN 
            unit_of_measure u ON r.unitId = u.unitId
        WHERE 
            r.isDeleted = 0
    `;

    db.query(query, (err, results) => {
        if (err) {
            console.error("❌ Error fetching resources:", err);
            return res.status(500).json({ error: "Server error while fetching resources" });
        }
        if (!results || results.length === 0) {
            console.warn("⚠️ No resources found.");
            return res.status(404).json({ message: "No resources found." });
        }
        console.log("📌 Sending Resource Data:", results);
        return res.json(results);
    });
};

// Controller to get all brands for dropdown selection
const getAllBrands = (req, res) => {
    const query = "SELECT brand_id, brand_name FROM resource_brand";
    
    db.query(query, (err, results) => {
        if (err) {
            console.error("❌ Error fetching brands:", err);
            return res.status(500).json({ error: "Server error while fetching brands" });
        }
        if (!results || results.length === 0) {
            console.warn("⚠️ No brands found.");
            return res.status(404).json({ message: "No brands found." });
        }
        console.log("📌 Sending Brand Data:", results);
        return res.json(results);
    });
};

// ADDED: Controller to get all units for dropdown selection
const getAllUnits = (req, res) => {
    const query = "SELECT unitId, unitName FROM unit_of_measure";

    db.query(query, (err, results) => {
        if (err) {
            console.error("❌ Error fetching units:", err);
            return res.status(500).json({ error: "Server error while fetching units" });
        }
        if (!results || results.length === 0) {
            console.warn("⚠️ No units found.");
            return res.status(404).json({ message: "No units found." });
        }
        console.log("📌 Sending Unit Data:", results);
        return res.json(results);
    });
};

// Controller to add a new resource, now including the stocks column
const addResource = (req, res) => {
    // Correctly destructure all fields, including stocks, from the request body
    const { material_name, unitId, default_unit_cost, brand_id, stocks } = req.body;

    // --- DEBUGGING STEP ---
    // Check your server's console for this message. It should show '50' if Postman is correct.
    console.log('Received stocks value:', stocks);
    // ----------------------

    // The SQL query must explicitly list the 'stocks' column
    const sql = "INSERT INTO resource (material_name, unitId, default_unit_cost, brand_id, stocks) VALUES (?, ?, ?, ?, ?)";
    
    // The array of values must include the 'stocks' variable
    db.query(sql, [material_name, unitId, default_unit_cost, brand_id, stocks], (err, result) => {
        if (err) {
            console.error('Error adding resource:', err);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
        console.log('Resource added successfully:', result);
        res.status(201).json({ message: 'Resource added successfully', resourceId: result.insertId });
    });
};


// Controller for soft deleting a resource by its ID
const deleteResource = (req, res) => {
    const resourceId = req.params.id;
    const query = "UPDATE resource SET isDeleted = 1 WHERE resource_id = ?";
    db.query(query, [resourceId], (err, result) => {
        if (err) {
            console.error("❌ Error soft deleting resource:", err);
            return res.status(500).json({ error: "Failed to soft delete resource." });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Resource not found." });
        }
        console.log("📌 Resource soft deleted:", result);
        return res.json({ message: "Resource soft deleted successfully." });
    });
};

// Controller to get a single resource by its ID, now including the stocks column
const getResourceById = (req, res) => {
    const resourceId = req.params.id;
    const query = `
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
        WHERE 
            r.resource_id = ? AND r.isDeleted = 0
    `;
    
    db.query(query, [resourceId], (err, results) => {
        if (err) {
            console.error("❌ Error fetching resource:", err);
            return res.status(500).json({ error: "Server error while fetching resource" });
        }
        if (!results || results.length === 0) {
            return res.status(404).json({ message: "Resource not found." });
        }
        console.log("📌 Sending Resource Data:", results[0]);
        return res.json(results[0]);
    });
};

// Controller to update an existing resource, now allowing stocks to be updated
const updateResource = (req, res) => {
    console.log("updateResource: Request received for resource ID:", req.params.id);
    console.log("updateResource: Request body:", req.body);

    const resourceId = req.params.id;
    const { material_name, unitId, default_unit_cost, brand_id, stocks } = req.body;

    // The query now includes the 'stocks' column in the update statement
    const query = "UPDATE resource SET material_name = ?, unitId = ?, default_unit_cost = ?, brand_id = ?, stocks = ? WHERE resource_id = ? AND isDeleted = 0";
    db.query(query, [material_name, unitId, default_unit_cost, brand_id, stocks, resourceId], (err, result) => {
        if (err) {
            console.error("updateResource: Database error:", err);
            return res.status(500).json({ error: "Failed to update resource." });
        }

        console.log("updateResource: Database result:", result);

        if (result.affectedRows === 0) {
            console.log("updateResource: Resource not found or deleted");
            return res.status(404).json({ message: "Resource not found or already deleted." });
        }

        return res.json({ message: "Resource updated successfully." });
    });
};

module.exports = { 
    getAllResources, 
    getAllBrands, 
    getAllUnits,
    addResource, 
    deleteResource, 
    getResourceById, 
    updateResource 
};
