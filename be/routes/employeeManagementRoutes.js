// employeeManagementRoutes.js

const express = require("express");
const router = express.Router();
const {
    getAllEmployees,
    deleteEmployeeAccount,
    getEmployeeAccountById,
    addEmployeeAccount,
    updateEmployeeAccount
} = require("../controllers/employeeManagementController");

router.get("/employee-accounts", getAllEmployees); // Changed route to be more specific to employees
router.delete("/employee-accounts/:id", deleteEmployeeAccount); // Changed route to be more specific
router.get("/employee-accounts/:id", getEmployeeAccountById); // Changed route to be more specific
router.post("/employee-accounts", addEmployeeAccount); // Changed route to be more specific
router.put("/employee-accounts/:id", updateEmployeeAccount); // Changed route to be more specific

module.exports = router;