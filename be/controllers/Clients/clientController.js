const db = require("../../config/db");
const generateStructuredId = require("../../generated/GenerateCodes/generatecode"); 

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

const createClient = async (req, res, next) => {
  try {
    const { client_name, email, phone_number, industry, website } = req.body;

    if (!client_name || !email || !phone_number || !industry) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Generate structured client_id
    const client_id = await generateStructuredId("101", "clients", "client_id");

    const query = `
      INSERT INTO clients (client_id, client_name, email, phone_number, industry, website)
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    db.query(
      query,
      [client_id, client_name, email, phone_number, industry, website],
      (err, result) => {
        if (err) {
          return next(err);
        }

        res.status(201).json({
          message: "Client created successfully",
          clientId: client_id,
          client: {
            client_id,
            client_name,
            email,
            phone_number,
            industry,
            website,
          },
        });
      }
    );
  } catch (err) {
    next(err);
  }
};

// Update client information
const updateClient = async (req, res) => {
  const { clientId } = req.params;
  const { client_name, phone_number, email } = req.body; // Change contact_number to phone_number

  if (!client_name && !phone_number && !email) {
    return res.status(400).json({ message: "At least one field (client_name, phone_number, or email) must be provided" });
  }

  try {
    const result = await db.query(
      "UPDATE clients SET client_name = ?, phone_number = ?, email = ? WHERE client_id = ?",
      [client_name, phone_number, email, clientId] // Use phone_number here as well
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
