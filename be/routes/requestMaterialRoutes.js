const express = require("express");
const router = express.Router();
const { getRequestMaterialItems, createRequestedMaterials } = require("../controllers/requestMaterialController"); // Adjust the path

router.get("/items", getRequestMaterialItems);
router.post("/create", createRequestedMaterials);

module.exports = router;