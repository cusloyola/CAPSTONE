// userManagementController.js

const express = require("express");
const router = express.Router();
const db = require("../config/db");
const bcrypt = require('bcrypt');
const path = require('path');

const getAllUsers = async (req, res) => {
    try {
        const results = await new Promise((resolve, reject) => {
            db.query("SELECT * FROM users WHERE is_active = 1", (err, results) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(results);
                }
            });
        });

        if (!results || results.length === 0) {
            console.warn("⚠️ No user accounts found.");
            return res.status(404).json({ message: "No user accounts found." });
        }
        console.log("📌 Sending Users Data:", results);
        return res.json(results);
    } catch (err) {
        console.error("❌ Error fetching users:", err);
        return res.status(500).json({ error: "Server error while fetching users", details: err.message });
    }
};

const deleteUserAccount = (req, res) => {
    const userId = req.params.id;
    const query = "UPDATE users SET is_active = 0 WHERE user_id = ?";
    db.query(query, [userId], (err, result) => {
        if (err) {
            console.error("❌ Error soft deleting user account:", err);
            return res.status(500).json({ error: "Failed to soft delete user account." });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "User account not found." });
        }
        console.log("📌 User account soft deleted:", result);
        return res.json({ message: "User account soft deleted successfully." });
    });
};

const getUserAccountById = (req, res) => {
    const userId = req.params.id;
    const query = "SELECT * FROM users WHERE user_id = ? AND is_active = 1"; // Assuming is_active = 1 means active
    db.query(query, [userId], (err, results) => {
        if (err) {
            console.error("❌ Error fetching user account:", err);
            return res.status(500).json({ error: "Server error while fetching user account" });
        }
        if (!results || results.length === 0) {
            return res.status(404).json({ message: "User account not found." });
        }
        console.log("📌 Sending User Account Data:", results[0]);
        return res.json(results[0]); // Send the first user from the results array
    });
};

const addUserAccount = (req, res) => {
    const { full_name, email, phone_number, role, password } = req.body;

    if (!full_name || !email || !role || !password) {
        return res.status(400).json({ error: "Full name, email, role, and password are required." });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ error: "Invalid email format." });
    }

    if (password.length < 6) {
        return res.status(400).json({ error: "Password must be at least 6 characters long." });
    }

    bcrypt.hash(password, 10, (err, hashedPassword) => {
        if (err) {
            console.error("❌ Error hashing password:", err);
            return res.status(500).json({ error: "Failed to hash password." });
        }

        const query = "INSERT INTO users (full_name, email, phone_number, role, password, created_at, is_active) VALUES (?, ?, ?, ?, ?, NOW(), 1)";

        db.query(query, [full_name, email, phone_number, role, hashedPassword], (err, result) => {
            if (err) {
                console.error("❌ Error adding user account:", err);
                if (err.code === 'ER_DUP_ENTRY') {
                    return res.status(409).json({ error: "Email already exists." });
                }
                return res.status(500).json({ error: "Failed to add user account." });
            }
            console.log("📌 User account added:", result);
            return res.status(201).json({ message: "User account added successfully", userId: result.insertId });
        });
    });
};

const updateUserAccount = (req, res) => {
    console.log("updateUserAccount: Request received for user ID:", req.params.id);
    console.log("updateUserAccount: Request body:", req.body);

    const userId = req.params.id;
    const { full_name, email, phone_number, role, password } = req.body; // Added password

    let query = "UPDATE users SET full_name = ?, email = ?, phone_number = ?, role = ?";
    const queryParams = [full_name, email, phone_number, role];

    if (password) {
        bcrypt.hash(password, 10, (err, hashedPassword) => {
            if (err) {
                console.error("updateUserAccount: Error hashing password:", err);
                return res.status(500).json({ error: "Failed to hash password." });
            }

            query += ", password = ?";
            queryParams.push(hashedPassword);
            queryParams.push(userId);
            query += " WHERE user_id = ? AND is_active = 1";

            db.query(query, queryParams, (dbErr, result) => {
                if (dbErr) {
                    console.error("updateUserAccount: Database error:", dbErr);
                    return res.status(500).json({ error: "Failed to update user account." });
                }

                console.log("updateUserAccount: Database result:", result);

                if (result.affectedRows === 0) {
                    console.log("updateUserAccount: User not found or inactive");
                    return res.status(404).json({ message: "User account not found or inactive." });
                }

                return res.json({ message: "User account updated successfully." });
            });
        });
    } else {
        queryParams.push(userId);
        query += " WHERE user_id = ? AND is_active = 1";

        db.query(query, queryParams, (dbErr, result) => {
            if (dbErr) {
                console.error("updateUserAccount: Database error:", dbErr);
                return res.status(500).json({ error: "Failed to update user account." });
            }

            console.log("updateUserAccount: Database result:", result);

            if (result.affectedRows === 0) {
                console.log("updateUserAccount: User not found or inactive");
                return res.status(404).json({ message: "User account not found or inactive." });
            }

            return res.json({ message: "User account updated successfully." });
        });
    }
};

module.exports = {
    getAllUsers,
    deleteUserAccount,
    getUserAccountById,
    addUserAccount,
    updateUserAccount
};