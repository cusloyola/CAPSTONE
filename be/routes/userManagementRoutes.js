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

router.get("/", getAllUsers);
router.delete("/:id", deleteUserAccount);
router.get("/:id", getUserAccountById);
router.post("/", addUserAccount);
router.put("/:id", updateUserAccount);

router.get("/names-and-emails", getUserNamesAndEmails);

module.exports = router;
