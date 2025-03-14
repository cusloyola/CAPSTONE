const express = require("express");
const dotenv = require("dotenv");
const mysql = require("mysql");
const cors = require("cors");
const bcrypt = require("bcryptjs"); // ✅ For password hashing
const jwt = require("jsonwebtoken"); // ✅ Fix package name

dotenv.config();

const app = express();
app.use(cors()); // ✅ Allow frontend requests
app.use(express.json()); // ✅ Parse JSON request bodies
app.use(express.urlencoded({ extended: true })); // ✅ Parse URL-encoded data

const protectedRoutes = require("./routes/protectedRoutes");

// ✅ Database Connection
const db = mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "drl_construction_database"
});

db.connect((err) => {
    if (err) {
        console.error("Database connection failed:", err);
    } else {
        console.log("✅ Connected to MySQL database");
    }


});
app.post("/api/Auth/Login", (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: "Email and Password are required." });
    }

    db.query("SELECT * FROM users WHERE email = ?", [email], async (err, results) => {
        if (err) {
            console.error("❌ Database error:", err);
            return res.status(500).json({ message: "Internal server error." });
        }

        if (results.length === 0) {
            return res.status(401).json({ message: "Invalid email or password." });
        }

        const user = results[0];

        console.log("✅ Retrieved user:", user); // DEBUGGING

        if (!user.password) {
            console.error("❌ User record found, but password is missing.");
            return res.status(500).json({ message: "User password is missing from the database." });
        }

        try {
            // ✅ Compare hashed password
            const passwordMatch = await bcrypt.compare(password, user.password);
            if (!passwordMatch) {
                return res.status(401).json({ message: "Invalid email or password." });
            }

            // ✅ Generate JWT Token
            const token = jwt.sign(
                { userId: user.user_id, role: user.role }, 
                process.env.JWT_SECRET || "default_secret_key",
                { expiresIn: "1h" }
            );

            res.json({
                message: "Login successful",
                token, 
                user: { id: user.user_id, email: user.email, role: user.role }
            });
        } catch (error) {
            console.error("❌ Password comparison error:", error);
            res.status(500).json({ message: "Internal server error." });
        }
    });
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

// ✅ Add new user (with hashed password)
app.post("/api/users", async (req, res) => {
    console.log("Received data:", req.body); // ✅ Debugging

    try {
        const { name, email, role, password } = req.body;
        const validRoles = ["admin", "software engineer", "safety engineer"];

        if (!name || !email || !role || !password) {
            return res.status(400).json({ error: "All fields (name, email, role, password) are required." });
        }

        if (!validRoles.includes(role)) {
            return res.status(400).json({ error: `Invalid role. Allowed roles: ${validRoles.join(", ")}` });
        }

        // ✅ Hash password before storing in database
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
});

// ✅ Start server
const PORT = 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
