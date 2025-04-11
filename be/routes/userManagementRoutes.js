const express = require("express");
const router = express.Router();
const {
    getAllUsers,
    deleteUserAccount,
    getUserAccountById,
    addUserAccount,
    updateUserAccount,
    getUserNamesAndEmails 
} = require("../controllers/userManagementController");
const { verifyToken } = require('../middleware/authMiddleware'); // Assuming you want to protect this route


router.get("/", getAllUsers);
router.delete("/:id", deleteUserAccount);
router.get("/:id", getUserAccountById);
router.post("/", addUserAccount);
router.put("/:id", updateUserAccount);

router.get("/names-and-emails", verifyToken, getUserNamesAndEmails);
    

module.exports = router;
