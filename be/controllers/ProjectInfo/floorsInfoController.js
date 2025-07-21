/**
 * @file floorsInfoController.js
 * @description Controller for managing floor information related to projects,
 * interacting directly with the database.
 * This version focuses on get (read) and update (edit) functionalities.
 */

const db = require("../../config/db"); // Assuming your database connection is exported from here

/**
 * @desc Retrieves all floor records from the database.
 * @route GET /api/floor-info
 * @access Public (or add verifyToken middleware if authentication is needed)
 * @param {Object} req - The Express request object.
 * @param {Object} res - The Express response object.
 */
const getAllFloors = (req, res) => {
    const query = `SELECT * FROM project_floors`;
    db.query(query, (err, results) => {
        if (err) {
            console.error("Error fetching all floors:", err);
            return res.status(500).json({ message: "Error fetching floors", error: err.message });
        }
        res.status(200).json(results);
    });
};

/**
 * @desc Retrieves a single floor record by its ID from the database.
 * @route GET /api/floor-info/:id
 * @access Public (or add verifyToken middleware if authentication is needed)
 * @param {Object} req - The Express request object, containing `id` in `req.params`.
 * @param {Object} res - The Express response object.
 */
const getFloorById = (req, res) => {
    const { id } = req.params;
    const query = `SELECT * FROM project_floors WHERE floor_id = ?`;
    db.query(query, [id], (err, results) => {
        if (err) {
            console.error(`Error fetching floor with ID ${id}:`, err);
            return res.status(500).json({ message: "Error fetching floor", error: err.message });
        }
        if (results.length === 0) {
            return res.status(404).json({ message: "Floor not found" });
        }
        res.status(200).json(results[0]);
    });
};

/**
 * @desc Updates an existing floor record by its ID in the database.
 * @route PUT /api/floor-info/:id
 * @access Public (or add verifyToken middleware if authentication is needed)
 * @param {Object} req - The Express request object, containing `id` in `req.params` and update data in `req.body`.
 * @param {Object} res - The Express response object.
 */
const updateFloor = (req, res) => {
    const { id } = req.params;
    const {
        project_id,
        floor_code,
        floor_label,
    } = req.body;

    // Constructing the UPDATE query dynamically for provided fields
    const fields = [];
    const values = [];

    if (project_id !== undefined) { fields.push("project_id = ?"); values.push(project_id); }
    if (floor_code !== undefined) { fields.push("floor_code = ?"); values.push(floor_code); }
    if (floor_label !== undefined) { fields.push("floor_label = ?"); values.push(floor_label); }

    // Check if any fields were provided for update
    if (fields.length === 0) {
        return res.status(400).json({ message: "No fields provided for update." });
    }

    const query = `UPDATE project_floors SET ${fields.join(", ")} WHERE floor_id = ?`;
    values.push(id); // Add the ID to the end of the values array

    db.query(query, values, (err, result) => {
        if (err) {
            console.error(`Error updating floor with ID ${id}:`, err);
            return res.status(500).json({ message: "Error updating floor", error: err.message });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Floor not found or no changes made" });
        }
        res.status(200).json({ message: "Floor updated successfully", floor_id: id });
    });
};

module.exports = {
    getAllFloors,
    getFloorById,
    updateFloor,
};
