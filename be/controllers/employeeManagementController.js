const express = require("express");
const router = express.Router();
const db = require("../config/db");
const path = require('path');

const getAllEmployees = async (req, res) => {
    try {
        const results = await new Promise((resolve, reject) => {
            db.query(
                "SELECT * FROM workers WHERE is_deleted = 0", // Select all columns where is_deleted is 0
                (err, results) => {
                    if (err) {
                        reject(err);
                    } else {
                        // Format the results to include worker_id, full_name, role, and contact_details
                        const formattedResults = results.map((row) => ({
                            worker_id: row.worker_id,
                            full_name: `${row.first_name} ${row.last_name}`,
                            role: row.role,
                            contact_details: row.contact_details, // Include contact_details
                        }));
                        resolve(formattedResults);
                    }
                }
            );
        });

        if (!results || results.length === 0) {
            console.warn("⚠️ No active employee accounts found.");
            return res.status(404).json({ message: "No active employee accounts found." });
        }
        console.log("📌 Sending Active Employees Data:", results);
        return res.json(results);
    } catch (err) {
        console.error("❌ Error fetching active employees:", err);
        return res.status(500).json({ error: "Server error while fetching active employees", details: err.message });
    }
};

const getEmployeeAccountById = (req, res) => {
    const workerId = req.params.id;
    const query = "SELECT worker_id, first_name, last_name, role, contact_details, hire_date FROM workers WHERE worker_id = ? AND is_deleted = 0";
    db.query(query, [workerId], (err, results) => {
        if (err) {
            console.error("❌ Error fetching active employee account:", err);
            return res.status(500).json({ error: "Server error while fetching active employee account" });
        }
        if (!results || results.length === 0) {
            return res.status(404).json({ message: "Active employee account not found." });
        }
        const employeeData = results[0];
        const fullName = `${employeeData.first_name} ${employeeData.last_name}`;
        const responseData = {
            worker_id: employeeData.worker_id,
            full_name: fullName,
            role: employeeData.role,
            contact_details: employeeData.contact_details,
            hire_date: employeeData.hire_date,
            // You can include other fields if needed
        };
        console.log("📌 Sending Active Employee Account Data:", responseData);
        return res.json(responseData); // Send the constructed employee data with full name
    });
};

const deleteEmployeeAccount = (req, res) => {
    const workerId = req.params.id;
    const query = "UPDATE workers SET is_deleted = 1 WHERE worker_id = ?";
    db.query(query, [workerId], (err, result) => {
        if (err) {
            console.error("❌ Error soft-deleting employee account:", err);
            return res.status(500).json({ error: "Failed to soft-delete employee account." });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Employee account not found." });
        }
        console.log("📌 Employee account soft-deleted:", result);
        return res.json({ message: "Employee account soft-deleted successfully." });
    });
};

const addEmployeeAccount = (req, res) => {
    const { first_name, last_name, role, contact_details, hire_date } = req.body;

    if (!first_name || !last_name || !role || !hire_date) {
        return res.status(400).json({ error: "First name, last name, role, and hire date are required." });
    }

    const query = "INSERT INTO workers (first_name, last_name, role, contact_details, hire_date, created_at) VALUES (?, ?, ?, ?, ?, NOW())";

    db.query(query, [first_name, last_name, role, contact_details, hire_date], (err, result) => {
        if (err) {
            console.error("❌ Error adding employee account:", err);
            return res.status(500).json({ error: "Failed to add employee account." });
        }
        console.log("📌 Employee account added:", result);
        return res.status(201).json({ message: "Employee account added successfully", workerId: result.insertId });
    });
};

module.exports = {
    getAllEmployees,
    getEmployeeAccountById,
    deleteEmployeeAccount,
    addEmployeeAccount
};

