const db = require('../config/db');



// Get all subclients for a client
const getAllSubclients = (req, res) => {
  const { clientId } = req.params;
  db.query('SELECT * FROM subclients WHERE client_id = ?', [clientId], (err, results) => {
    if (err) {
      console.error('❌ Error fetching subclients:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(results);
  });
};

// Get a specific subclient by ID
const getSubclientById = (req, res) => {
  const { clientId, subclientId } = req.params;
  db.query('SELECT * FROM subclients WHERE client_id = ? AND subclient_id = ?', [clientId, subclientId], (err, result) => {
    if (err) {
      console.error('❌ Error fetching subclient by ID:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    if (result.length === 0) {
      return res.status(404).json({ error: 'Subclient not found' });
    }
    res.json(result[0]);
  });
};


// Get all subclients for a client
const getSubclients = (req, res) => {
  const { client_id } = req.params;
  db.query('SELECT * FROM subclients WHERE client_id = ?', [client_id], (err, results) => {
    if (err) {
      console.error('❌ Error fetching subclients:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(results);
  });
};

// Create a new subclient for a client
const createSubclient = (req, res) => {
  const { client_id, subclient_name } = req.body;

  if (!subclient_name || !client_id) {
    return res.status(400).json({ error: 'Subclient name and client_id are required' });
  }

  const query = 'INSERT INTO subclients (subclient_name, client_id) VALUES (?, ?)';
  db.query(query, [subclient_name, client_id], (err, result) => {
    if (err) {
      console.error('❌ Error adding subclient:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    res.status(201).json({ message: 'Subclient added successfully', subclient_id: result.insertId });
  });
};

// Update an existing subclient
const updateSubclient = (req, res) => {
  const { id } = req.params;
  const { subclient_name } = req.body;

  if (!subclient_name) {
    return res.status(400).json({ error: 'Subclient name is required' });
  }

  const query = 'UPDATE subclients SET subclient_name = ? WHERE subclient_id = ?';
  db.query(query, [subclient_name, id], (err, result) => {
    if (err) {
      console.error('❌ Error updating subclient:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Subclient not found' });
    }
    res.json({ message: 'Subclient updated successfully' });
  });
};

// Delete an existing subclient
const deleteSubclient = (req, res) => {
  const { id } = req.params;

  const query = 'DELETE FROM subclients WHERE subclient_id = ?';
  db.query(query, [id], (err, result) => {
    if (err) {
      console.error('❌ Error deleting subclient:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Subclient not found' });
    }
    res.json({ message: 'Subclient deleted successfully' });
  });
};

module.exports = { getSubclients, createSubclient, updateSubclient, deleteSubclient, getSubclientById, getAllSubclients };
