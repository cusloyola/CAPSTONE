// userManagementRoutes.js

const express = require("express");
const router = express.Router();
const {
    getAllUsers,
    deleteUserAccount,
    getUserAccountById,
    addUserAccount,
    updateUserAccount
} = require("../controllers/userManagementController");

router.get("/", getAllUsers);
router.delete("/:id", deleteUserAccount);
router.get("/:id", getUserAccountById);
router.post("/", addUserAccount);
router.put("/:id", updateUserAccount);

module.exports = router;