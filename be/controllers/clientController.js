const db = require("../config/db");

const getAllClients = (req, res) => {
    console.log("Attempting to fetch clients...");
    
    db.query("SELECT * FROM clients", (err, results) => {
      if (err) {
        console.error("Database error:", err);
        return res.status(500).json({ error: "Failed to fetch clients" });
      }
  
      if (results.length === 0) {
        console.log("No clients found");
        return res.status(404).json({ message: "No clients found" });
      }
  
      console.log(`${results.length} clients fetched successfully`);
      res.status(200).json(results); // Return the results as JSON
    });
  };
  
  

// Get client by ID
const getClientById = async (req, res) => {
  const { clientId } = req.params;
  
  try {
    const [result] = await db.query("SELECT * FROM clients WHERE client_id = ?", [clientId]);

    if (result.length === 0) {
      return res.status(404).json({ message: "Client not found" });
    }

    res.status(200).json(result[0]); // Return the first client object
  } catch (err) {
    console.error("Error fetching client by ID:", err);
    res.status(500).json({ message: "Failed to fetch client", error: err.message });
  }
};

// controllers/clientController.js
const createClient = (req, res, next) => {
    const { client_name, email, phone_number, industry } = req.body;
    
    if (!client_name || !email || !phone_number || !industry) {
      return res.status(400).json({ message: "Missing required fields" });
    }
  
    const query = "INSERT INTO clients (client_name, email, phone_number, industry) VALUES (?, ?, ?, ?)";
    db.query(query, [client_name, email, phone_number, industry], (err, result) => {
      if (err) {
        return next(err); // Call error handler if something goes wrong
      }
  
      res.status(201).json({ message: "Client created successfully", clientId: result.insertId });
    });
  };


// Update client information
const updateClient = async (req, res) => {
  const { clientId } = req.params;
  const { client_name, contact_number, email } = req.body;

  if (!client_name && !contact_number && !email) {
    return res.status(400).json({ message: "At least one field (client_name, contact_number, or email) must be provided" });
  }

  try {
    const result = await db.query(
      "UPDATE clients SET client_name = ?, contact_number = ?, email = ? WHERE client_id = ?",
      [client_name, contact_number, email, clientId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Client not found" });
    }

    res.status(200).json({ message: "Client updated successfully" });
  } catch (err) {
    console.error("Error updating client:", err);
    res.status(500).json({ message: "Failed to update client", error: err.message });
  }
};

// Delete a client
const deleteClient = async (req, res) => {
  const { clientId } = req.params;

  try {
    const result = await db.query("DELETE FROM clients WHERE client_id = ?", [clientId]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Client not found" });
    }

    res.status(200).json({ message: "Client deleted successfully" });
  } catch (err) {
    console.error("Error deleting client:", err);
    res.status(500).json({ message: "Failed to delete client", error: err.message });
  }
};

module.exports = {
  getAllClients,
  getClientById,
  createClient,
  updateClient,
  deleteClient,
};
