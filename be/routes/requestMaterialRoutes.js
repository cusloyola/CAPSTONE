const express = require("express");
const router = express.Router();
const { 
  getRequestMaterialItems, 
  createRequestedMaterials, 
  getRequestedMaterialsHistory,
  approveRequest,
  rejectRequest,
} = require("../controllers/requestMaterialController"); 


router.post("/create", createRequestedMaterials);
router.get("/items", getRequestMaterialItems);
router.get("/history", getRequestedMaterialsHistory);
router.put("/:requestId/approve", approveRequest);
router.put("/:requestId/reject", rejectRequest);

module.exports = router;