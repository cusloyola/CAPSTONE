const express = require("express");
const router = express.Router();
const {
  uploadDocument,
  getAllDocuments
} = require("../controllers/documentController");

// Document Routes
router.post("/", uploadDocument); // Upload a new document
router.get("/:folderId", getAllDocuments); // Get all documents by folder ID

module.exports = router;
