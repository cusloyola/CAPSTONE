const db = require("../../config/db");

// Controller to get all resources, joining with brand and unit tables for full details
const getAllResources = (req, res) => {
    // A more comprehensive query to include brand and unit names
    const query = `
        SELECT 
            r.*, 
            rb.brand_name, 
            u.unitName /* CHANGED: Corrected column name from u.unit_name to u.unitName */
        FROM 
            resource r
        JOIN 
            resource_brand rb ON r.brand_id = rb.brand_id
        JOIN 
            unit_of_measure u ON r.unitId = u.unitId /* CHANGED: Corrected table name from 'unit' to 'unit_of_measure' */
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

// Controller to add a new resource
const addResource = (req, res) => {
    const { material_name, unitId, default_unit_cost, brand_id } = req.body;
    
    // Validate that all required fields are present
    if (!material_name || !unitId || !default_unit_cost || !brand_id) {
        return res.status(400).json({ error: "All fields (material_name, unitId, default_unit_cost, brand_id) are required." });
    }

    const query = "INSERT INTO resource (material_name, unitId, default_unit_cost, brand_id, created_at, isDeleted) VALUES (?, ?, ?, ?, NOW(), 0)";
    db.query(query, [material_name, unitId, default_unit_cost, brand_id], (err, result) => {
        if (err) {
            console.error("❌ Error adding resource:", err);
            return res.status(500).json({ error: "Failed to add resource." });
        }
        console.log("📌 Resource added:", result);
        return res.status(201).json({ message: "Resource added successfully", resourceId: result.insertId });
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

// Controller to get a single resource by its ID
const getResourceById = (req, res) => {
    const resourceId = req.params.id;
    const query = `
        SELECT 
            r.*, 
            rb.brand_name, 
            u.unitName /* CHANGED: Corrected column name from u.unit_name to u.unitName */
        FROM 
            resource r
        JOIN 
            resource_brand rb ON r.brand_id = rb.brand_id
        JOIN 
            unit_of_measure u ON r.unitId = u.unitId /* CHANGED: Corrected table name from 'unit' to 'unit_of_measure' */
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

// Controller to update an existing resource
const updateResource = (req, res) => {
    console.log("updateResource: Request received for resource ID:", req.params.id);
    console.log("updateResource: Request body:", req.body);

    const resourceId = req.params.id;
    const { material_name, unitId, default_unit_cost, brand_id } = req.body;

    const query = "UPDATE resource SET material_name = ?, unitId = ?, default_unit_cost = ?, brand_id = ? WHERE resource_id = ? AND isDeleted = 0";
    db.query(query, [material_name, unitId, default_unit_cost, brand_id, resourceId], (err, result) => {
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
    addResource, 
    deleteResource, 
    getResourceById, 
    updateResource 
};
