const express = require("express");
const router = express.Router();
const {
  getAllSubclients,
  getSubclientById,
  createSubclient,
  updateSubclient,
  deleteSubclient,
} = require("../controllers/subclientController");

// Subclient Routes
router.get("/:clientId", getAllSubclients); // Get all subclients by client ID
router.get("/:clientId/:subclientId", getSubclientById); // Get a specific subclient by subclient ID
router.post("/", createSubclient); // Create a new subclient
router.put("/:subclientId", updateSubclient); // Update a subclient by subclient ID
router.delete("/:subclientId", deleteSubclient); // Delete a subclient by subclient ID

module.exports = router;
