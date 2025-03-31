const express = require("express");
const router = express.Router();
const {
   getAllUsers,
   deleteUserAccount,
   getUserAccountById,
   addUserAccount,
  } = require("../controllers/userManagementController");

  router.get("/",getAllUsers);
  router.delete("/:id", deleteUserAccount);
  router.get("/:id", getUserAccountById);
  router.post("/", addUserAccount);


module.exports = router;