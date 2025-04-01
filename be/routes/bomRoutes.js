const express = require("express");
const { getLatestBomId, getNextBomId, createBOM, getBOMList, deleteAllBom, getBOMData,
     saveBOM, calculateBOMSubtotal  } = require("../controllers/bomController");
const { verifyToken } = require("../middleware/authMiddleware");


const router = express.Router();


// ❌ This might be incorrect:
router.get("/latest-bom-id", getLatestBomId); // 🚨 If `getLatestBomId` is undefined, this will break

// router.post("/add", addBOMRow);// ✅ Matches the controller


router.get("/next-bom-id", getNextBomId);

router.post('/create', createBOM);

router.get("/", verifyToken, getBOMList); // Fetch all BOM records

// Route handler for getting both BOM list and BOM details for a given BOM ID
router.get("/:bomId", getBOMData);  // Handles dynamic bomId

router.get("/calculate-bom-subtotal/:bomId", calculateBOMSubtotal);  // Handles dynamic bomId


router.post("/save", saveBOM);

router.post("/deleteAll", deleteAllBom);

// router.post("/create-new", createNewBom);// ✅ Matches the controller


module.exports = router;



