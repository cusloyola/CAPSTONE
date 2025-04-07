const express = require("express");
const router = express.Router();
const {
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
} = require("../controllers/folderController");

// Folder Routes
router.get("/:clientId", getAllFolders); // Get all folders by client ID
router.get("/:clientId/:folderId", getFolderById); // Get a specific folder by folder ID
router.post("/", createFolder); // Create a new folder (with or without parent folder ID)
router.put("/:folderId", updateFolder); // Update a folder by folder ID
router.delete("/:folderId", deleteFolder); // Delete a folder by folder ID

// Get all subfolders under a folder
router.get('/subfolders/:clientId/:folderId', getSubfolders);

// Create a subfolder under a folder
router.post('/subfolders/:clientId/:folderId', createSubfolder);

// Get a specific subfolder by ID
router.get('/subfolder/:clientId/:folderId', getSubfolderById);

// Update a subfolder by folder ID
router.put('/subfolder/:clientId/:folderId', updateSubfolder);

// Delete a subfolder by folder ID
router.delete('/subfolder/:clientId/:folderId', deleteSubfolder);

module.exports = router;
