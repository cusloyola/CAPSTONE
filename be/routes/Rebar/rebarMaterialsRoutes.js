const express = require("express");
const router = express.Router();
const RebarMaterialTakeoffController = require("../../controllers/Rebars/RebarMaterialTakeoffController");

router.get("/:proposal_id", RebarMaterialTakeoffController.getRebarDetails);
router.get("/resource", RebarMaterialTakeoffController.getResourceDetails);
router.get("/rebars/:proposal_id", RebarMaterialTakeoffController.getFullRebarTakeOff);
router.post("/save/:proposal_id", RebarMaterialTakeoffController.submitRebarResources);


router.put("/update/:proposal_id", RebarMaterialTakeoffController.updateRebarResources);

module.exports = router;
