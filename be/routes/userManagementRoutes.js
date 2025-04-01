// userManagementRoutes.js

const express = require("express");
const router = express.Router();
const {
    getAllUsers,
    deleteUserAccount,
    getUserAccountById,
    addUserAccount,
    updateUserAccount
    // uploadUserImage,
    // upload,
} = require("../controllers/userManagementController");

router.get("/", getAllUsers);
router.delete("/:id", deleteUserAccount);
router.get("/:id", getUserAccountById);
router.post("/", addUserAccount);
router.put("/:id", updateUserAccount);
// router.put("/:id/image", (req, res, next) => {
//     upload.single('image')(req, res, (err) => {
//         if (err) {
//             console.error("❌ Multer Error:", err);
//             return res.status(500).json({ error: "Image upload failed." });
//         }
//         next();
//     });
// }, uploadUserImage);

module.exports = router;