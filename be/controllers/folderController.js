const db = require('../config/db');

// Create a folder or a subfolder
const createFolder = (req, res) => {
  const { folder_name, client_id, parent_folder_id } = req.body;

  if (!folder_name || !client_id) {
    return res.status(400).json({ error: 'Folder name and client ID are required' });
  }

  // If there's no parent_folder_id, it's a main folder; if there's one, it's a subfolder
  const query = `
    INSERT INTO folders (folder_name, client_id, parent_folder_id) 
    VALUES (?, ?, ?)
  `;

  db.query(query, [folder_name, client_id, parent_folder_id || null], (err, result) => {
    if (err) {
      console.error('❌ Error creating folder:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    res.status(201).json({ message: 'Folder created successfully', folder_id: result.insertId });
  });
};

// Get all folders for a specific client
const getAllFolders = (req, res) => {
  const { clientId } = req.params; // Get clientId from URL params

  const query = `
    SELECT * FROM folders WHERE client_id = ?
  `;

  db.query(query, [clientId], (err, results) => {
    if (err) {
      console.error('❌ Error fetching folders:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(results);
  });
};

// Get a specific folder by folderId
const getFolderById = (req, res) => {
  const { clientId, folderId } = req.params;

  const query = `
    SELECT * FROM folders WHERE client_id = ? AND folder_id = ?
  `;

  db.query(query, [clientId, folderId], (err, result) => {
    if (err) {
      console.error('❌ Error fetching folder:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    if (!result.length) {
      return res.status(404).json({ error: 'Folder not found' });
    }
    res.json(result[0]);
  });
};

// Update folder by folderId
const updateFolder = (req, res) => {
  const { folderId } = req.params;
  const { folder_name, parent_folder_id } = req.body;

  if (!folder_name) {
    return res.status(400).json({ error: 'Folder name is required' });
  }

  const query = `
    UPDATE folders
    SET folder_name = ?, parent_folder_id = ?
    WHERE folder_id = ?
  `;

  db.query(query, [folder_name, parent_folder_id, folderId], (err, result) => {
    if (err) {
      console.error('❌ Error updating folder:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    res.json({ message: 'Folder updated successfully' });
  });
};

// Delete folder by folderId
const deleteFolder = (req, res) => {
  const { folderId } = req.params;

  const query = `
    DELETE FROM folders WHERE folder_id = ?
  `;

  db.query(query, [folderId], (err, result) => {
    if (err) {
      console.error('❌ Error deleting folder:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Folder not found' });
    }
    res.json({ message: 'Folder deleted successfully' });
  });
};

const getSubfolders = (req, res) => {
    const { clientId, folderId } = req.params; // Get clientId and folderId from URL params
  
    const query = `
      SELECT * FROM folders WHERE client_id = ? AND parent_folder_id = ?
    `;
  
    db.query(query, [clientId, folderId], (err, results) => {
      if (err) {
        console.error('❌ Error fetching subfolders:', err);
        return res.status(500).json({ error: 'Database error' });
      }
      res.json(results);
    });
  };
  
  // Create a subfolder under a specific folder
  const createSubfolder = (req, res) => {
    const { folder_name, client_id, folderId } = req.body;
  
    if (!folder_name || !client_id || !folderId) {
      return res.status(400).json({ error: 'Folder name, client ID, and parent folder ID are required' });
    }
  
    const query = `
      INSERT INTO folders (folder_name, client_id, parent_folder_id) 
      VALUES (?, ?, ?)
    `;
  
    db.query(query, [folder_name, client_id, folderId], (err, result) => {
      if (err) {
        console.error('❌ Error creating subfolder:', err);
        return res.status(500).json({ error: 'Database error' });
      }
      res.status(201).json({ message: 'Subfolder created successfully', folder_id: result.insertId });
    });
  };
  
  // Get a specific subfolder by folderId (and ensure it's a subfolder)
  const getSubfolderById = (req, res) => {
    const { clientId, folderId } = req.params;
  
    const query = `
      SELECT * FROM folders WHERE client_id = ? AND folder_id = ? AND parent_folder_id IS NOT NULL
    `;
  
    db.query(query, [clientId, folderId], (err, result) => {
      if (err) {
        console.error('❌ Error fetching subfolder:', err);
        return res.status(500).json({ error: 'Database error' });
      }
      if (!result.length) {
        return res.status(404).json({ error: 'Subfolder not found' });
      }
      res.json(result[0]);
    });
  };
  
  // Update a subfolder by folderId
  const updateSubfolder = (req, res) => {
    const { folderId } = req.params;
    const { folder_name, parent_folder_id } = req.body;
  
    if (!folder_name || !parent_folder_id) {
      return res.status(400).json({ error: 'Folder name and parent folder ID are required' });
    }
  
    const query = `
      UPDATE folders
      SET folder_name = ?, parent_folder_id = ?
      WHERE folder_id = ? AND parent_folder_id IS NOT NULL
    `;
  
    db.query(query, [folder_name, parent_folder_id, folderId], (err, result) => {
      if (err) {
        console.error('❌ Error updating subfolder:', err);
        return res.status(500).json({ error: 'Database error' });
      }
      res.json({ message: 'Subfolder updated successfully' });
    });
  };
  
  // Delete a subfolder by folderId
  const deleteSubfolder = (req, res) => {
    const { folderId } = req.params;
  
    const query = `
      DELETE FROM folders WHERE folder_id = ? AND parent_folder_id IS NOT NULL
    `;
  
    db.query(query, [folderId], (err, result) => {
      if (err) {
        console.error('❌ Error deleting subfolder:', err);
        return res.status(500).json({ error: 'Database error' });
      }
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Subfolder not found' });
      }
      res.json({ message: 'Subfolder deleted successfully' });
    });
  };

  
  
module.exports = {
  getAllFolders,
  getFolderById,
  createFolder,
  updateFolder,
  deleteFolder,

  getSubfolders,
  createSubfolder,
  getSubfolderById,
  updateSubfolder,
  deleteSubfolder
};
