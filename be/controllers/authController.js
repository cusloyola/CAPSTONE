const db = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.login = (req, res) => {
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

        try {
            const passwordMatch = await bcrypt.compare(password, user.password);
            if (!passwordMatch) {
                return res.status(401).json({ message: "Invalid email or password." });
            }

            const token = jwt.sign(
                { userId: user.user_id, role: user.role }, 
                process.env.JWT_SECRET || "default_secret_key",
                { expiresIn: "1h" }
            );

            res.json({
                message: "Login successful",
                token,
                user: { id: user.user_id, email: user.email, role: user.role },
            });
        } catch (error) {
            console.error("❌ Password comparison error:", error);
            res.status(500).json({ message: "Internal server error." });
        }
    });
};
