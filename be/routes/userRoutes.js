const express = require("express");
const { getAllUsers, addUser } = require("../controllers/userController");
const { verifyToken } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", verifyToken, getAllUsers); // Protected route
router.post("/", addUser); // Public route

module.exports = router;
