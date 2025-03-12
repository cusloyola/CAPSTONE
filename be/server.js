const express = require("express");
const mysql = require("mysql");
const cors = require("cors");

const app = express();
app.use(cors()); // ✅ Allow frontend requests
app.use(express.json()); // ✅ Parse JSON request bodies

// ✅ Database Connection
const db = mysql.createConnection({
    host: "localhost",
    user: "root", // Change if needed
    password: "", // Change if needed
    database: "your_database_name"
});

db.connect((err) => {
    if (err) {
        console.error("Database connection failed:", err);
    } else {
        console.log("Connected to MySQL database");
    }
});

// ✅ Get all users
app.get("/api/users", (req, res) => {
    db.query("SELECT * FROM users", (err, results) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ error: "Failed to fetch users" });
        }
        res.json(results);
    });
});

// ✅ Add new user
app.post("/api/users", (req, res) => {
    console.log("Received data:", req.body); // ✅ Debugging

    try {
        const { name, email, role } = req.body;
        const validRoles = ["admin", "software engineer", "safety engineer"];

        if (!name || !email || !role) {
            return res.status(400).json({ error: "All fields (name, email, role) are required." });
        }

        if (!validRoles.includes(role)) {
            return res.status(400).json({ error: `Invalid role. Allowed roles: ${validRoles.join(", ")}` });
        }

        db.query("INSERT INTO users (name, email, role) VALUES (?, ?, ?)", 
            [name, email, role], 
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
});

// ✅ Start server
const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
