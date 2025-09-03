const express = require("express");
const router = express.Router();
const {
  getAllClients,
  getClientById,
  createClient,
  updateClient,
  deleteClient,
} = require("../../controllers/Clients/clientController");

// Remove verifyToken middleware for testing
router.get("/", getAllClients); // Now no token required
router.get("/:clientId", getClientById); // Now no token required
router.post("/", createClient); // Now no token required
router.put("/:clientId", updateClient); // Now no token required
router.delete("/:clientId", deleteClient); // Now no token required

module.exports = router;
