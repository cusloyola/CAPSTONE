const db = require("../config/db");
const bcrypt = require("bcryptjs");

exports.getAllUsers = (req, res) => {
    db.query("SELECT * FROM users", (err, results) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ error: "Failed to fetch users" });
        }
        res.json(results);
    });
};

exports.addUser = async (req, res) => {
    try {
        const { name, email, role, password } = req.body;
        const validRoles = ["admin", "software engineer", "safety engineer"];

        if (!name || !email || !role || !password) {
            return res.status(400).json({ error: "All fields (name, email, role, password) are required." });
        }

        if (!validRoles.includes(role)) {
            return res.status(400).json({ error: `Invalid role. Allowed roles: ${validRoles.join(", ")}` });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        db.query("INSERT INTO users (name, email, role, password) VALUES (?, ?, ?, ?)", 
            [name, email, role, hashedPassword], 
            (err, result) => {
                if (err) {
                    if (err.code === "ER_DUP_ENTRY") {
                        return res.status(409).json({ error: "Email already exists. Please use a different email." });
                    }
                    console.error("Database error:", err);
                    return res.status(500).json({ error: "An unexpected error occurred while adding the user." });
                }

                res.status(201).json({ message: "User added successfully", userId: result.insertId });
            }
        );
    } catch (error) {
        console.error("Server error:", error);
        res.status(500).json({ error: "Internal server error." });
    }
};
