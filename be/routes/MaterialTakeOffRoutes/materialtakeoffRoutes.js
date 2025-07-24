const express = require("express");
const router = express.Router();
const MaterialTakeOffController = require("../../controllers/MaterialTakeOff/MaterialTakeOffController");

router.get("/qto-children-by-proposal", MaterialTakeOffController.getQtoChildrenTotalsByProposal);
router.get("/resources", MaterialTakeOffController.getResources);
router.post("/save/:proposal_id", MaterialTakeOffController.saveFullMaterialTakeOff);
router.get("/list/:proposal_id", MaterialTakeOffController.getFullMaterialTakeOff);
router.get("/list-parent/:proposal_id", MaterialTakeOffController.getMaterialtakeOffParent);


router.put('/update/:proposal_id', MaterialTakeOffController.updateFullMaterialTakeOff);

module.exports = router;
