const express = require("express");
const router = express.Router();
const MaterialTakeOffController = require("../../controllers/MaterialTakeOff/MaterialTakeOffController");

// ✅ Should turn yellow now if exported properly
router.get("/qto-children-by-proposal", MaterialTakeOffController.getQtoChildrenTotalsByProposal);

module.exports = router;
