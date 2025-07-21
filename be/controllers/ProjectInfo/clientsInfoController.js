/**
 * @file clientInfoController.js
 * @description Controller for managing client information, interacting directly with the database.
 * This version focuses on get (read) and update (edit) functionalities.
 */

const db = require("../../config/db"); // Assuming your database connection is exported from here

/**
 * @desc Retrieves all client records from the database.
 * @route GET /api/client-info
 * @access Public (or add verifyToken middleware if authentication is needed)
 * @param {Object} req - The Express request object.
 * @param {Object} res - The Express response object.
 */
const getAllClients = (req, res) => {
    const query = `SELECT * FROM clients`;
    db.query(query, (err, results) => {
        if (err) {
            console.error("Error fetching all clients:", err);
            return res.status(500).json({ message: "Error fetching clients", error: err.message });
        }
        res.status(200).json(results);
    });
};

/**
 * @desc Retrieves a single client record by its ID from the database.
 * @route GET /api/client-info/:id
 * @access Public (or add verifyToken middleware if authentication is needed)
 * @param {Object} req - The Express request object, containing `id` in `req.params`.
 * @param {Object} res - The Express response object.
 */
const getClientById = (req, res) => {
    const { id } = req.params;
    const query = `SELECT * FROM clients WHERE client_id = ?`;
    db.query(query, [id], (err, results) => {
        if (err) {
            console.error(`Error fetching client with ID ${id}:`, err);
            return res.status(500).json({ message: "Error fetching client", error: err.message });
        }
        if (results.length === 0) {
            return res.status(404).json({ message: "Client not found" });
        }
        res.status(200).json(results[0]);
    });
};

/**
 * @desc Updates an existing client record by its ID in the database.
 * @route PUT /api/client-info/:id
 * @access Public (or add verifyToken middleware if authentication is needed)
 * @param {Object} req - The Express request object, containing `id` in `req.params` and update data in `req.body`.
 * @param {Object} res - The Express response object.
 */
const updateClient = (req, res) => {
    const { id } = req.params;
    const {
        client_name,
        email,
        phone_number,
        website,
        industry,
    } = req.body;

    // Constructing the UPDATE query dynamically for provided fields
    const fields = [];
    const values = [];

    if (client_name !== undefined) { fields.push("client_name = ?"); values.push(client_name); }
    if (email !== undefined) { fields.push("email = ?"); values.push(email); }
    if (phone_number !== undefined) { fields.push("phone_number = ?"); values.push(phone_number); }
    if (website !== undefined) { fields.push("website = ?"); values.push(website); }
    if (industry !== undefined) { fields.push("industry = ?"); values.push(industry); }

    // Always update the updated_at timestamp
    fields.push("updated_at = ?");
    values.push(new Date().toISOString().slice(0, 19).replace('T', ' '));

    if (fields.length === 1 && fields[0].startsWith('updated_at')) { // Only updated_at was implicitly added
        return res.status(400).json({ message: "No fields provided for update other than timestamp." });
    }

    const query = `UPDATE clients SET ${fields.join(", ")} WHERE client_id = ?`;
    values.push(id); // Add the ID to the end of the values array

    db.query(query, values, (err, result) => {
        if (err) {
            console.error(`Error updating client with ID ${id}:`, err);
            return res.status(500).json({ message: "Error updating client", error: err.message });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Client not found or no changes made" });
        }
        res.status(200).json({ message: "Client updated successfully", client_id: id });
    });
};

module.exports = {
    getAllClients,
    getClientById,
    updateClient,
};
