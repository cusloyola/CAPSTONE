const express = require("express");
const router = express.Router();
const { getRequestMaterialItems, createRequestedMaterials, getRequestedMaterialsHistory } = require("../controllers/requestMaterialController"); // Adjust the path


router.post("/create", createRequestedMaterials);
router.get("/items", getRequestMaterialItems);
router.get("/history", getRequestedMaterialsHistory);


module.exports = router;