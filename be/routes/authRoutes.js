const express = require("express");
const authController = require("../controllers/authController"); // import the whole controller

const router = express.Router();

router.post("/login", authController.login);
router.post("/forgot-password", authController.requestPasswordReset);
router.post("/reset-password/:token", authController.resetPassword);
router.get("/verify-reset-token/:token", authController.verifyResetToken);

module.exports = router;
