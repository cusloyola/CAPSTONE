const db = require('../config/db');

// Upload a document
const uploadDocument = (req, res) => {
  const { document_name, document_type, file_path, folder_id } = req.body;

  if (!document_name || !folder_id || !file_path) {
    return res.status(400).json({ error: 'Document name, folder ID, and file path are required' });
  }

  const query = `
    INSERT INTO documents (document_name, document_type, file_path, folder_id) 
    VALUES (?, ?, ?, ?)
  `;

  db.query(query, [document_name, document_type, file_path, folder_id], (err, result) => {
    if (err) {
      console.error('❌ Error uploading document:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    res.status(201).json({ message: 'Document uploaded successfully', document_id: result.insertId });
  });
};

// Get all documents for a folder
const getAllDocuments = (req, res) => {
  const { folderId } = req.params;

  const query = `
    SELECT * FROM documents WHERE folder_id = ?
  `;

  db.query(query, [folderId], (err, results) => {
    if (err) {
      console.error('❌ Error fetching documents:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(results);
  });
};

module.exports = { uploadDocument, getAllDocuments };
