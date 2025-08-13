const db = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
require('dotenv').config(); // Ensure environment variables are loaded

exports.login = (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: "Email and Password are required." });
    }

    // Query database to check if the email exists
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
            // Check if the password matches the hashed password in the database
            const passwordMatch = await bcrypt.compare(password, user.password);
            if (!passwordMatch) {
                return res.status(401).json({ message: "Invalid email or password." });
            }

            // Generate JWT token with userId and role
            const token = jwt.sign(
                { userId: user.user_id, role: user.role },
                process.env.JWT_SECRET || "default_secret_key", // Use your secret key here
                { expiresIn: "1h" }
            );

            // Return success message along with the token and user data
            res.json({
                message: "Login successful",
                token,
                user: { id: user.user_id, name: user.full_name, phone: user.phone_number, email: user.email, role: user.role },
            });
        } catch (error) {
            console.error("❌ Password comparison error:", error);
            res.status(500).json({ message: "Internal server error." });
        }
    });
};


exports.requestPasswordReset = async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ message: "Email is required" });
    }

    try {
        let rows;

        // Query user
        [rows] = await db.query("SELECT * FROM users WHERE email = ?", [email]);
        if (!rows || rows.length === 0) {
            return res.status(404).json({ message: "No account with that email found" });
        }

        const token = crypto.randomBytes(32).toString("hex");

        // Store token in DB (valid for 1 hour)
        await db.query(
            "UPDATE users SET reset_token = ?, reset_token_expiry = DATE_ADD(NOW(), INTERVAL 1 HOUR) WHERE email = ?",
            [token, email]
        );

        // Set up NodeMailer transporter
        const transporter = nodemailer.createTransport({
            host: "smtp.gmail.com", // Or your SMTP host
            port: 465,
            secure: true,
            auth: {
                user: process.env.EMAIL_USER, // your email
                pass: process.env.EMAIL_PASS, // your email app password
            },
        });

        const resetLink = `http://localhost:5173/reset-password/${token}`;

        const mailOptions = {
            from: `"CloudConstruct" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: "Password Reset Request",
            html: `<p>You requested a password reset.</p>
                   <p>Click the link below to reset your password:</p>
                   <a href="${resetLink}">${resetLink}</a>
                   <p>This link will expire in 1 hour.</p>`,
        };

        await transporter.sendMail(mailOptions);

        res.json({ message: "Password reset link has been sent to your email" });
    } catch (error) {
        console.error("Error in requestPasswordReset:", error);
        res.status(500).json({ message: "Server error" });
    }
};

exports.resetPassword = async (req, res) => {
  const { token } = req.params;
  const { newPassword } = req.body;

  try {
    const [rows] = await db.query(
      "SELECT * FROM users WHERE reset_token = ? AND reset_token_expiry > NOW()",
      [token]
    );

    if (rows.length === 0) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await db.query(
      "UPDATE users SET password = ?, reset_token = NULL, reset_token_expiry = NULL WHERE reset_token = ?",
      [hashedPassword, token]
    );

    res.json({ message: "Password has been reset successfully" });
  } catch (error) {
    console.error("Error resetting password:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.verifyResetToken = async (req, res) => {
  const { token } = req.params;

  try {
    const rows = await new Promise((resolve, reject) => {
      db.query(
        "SELECT * FROM users WHERE reset_token = ? AND reset_token_expiry > NOW()",
        [token],
        (err, result) => {
          if (err) return reject(err);
          resolve(result); // result is an array of rows
        }
      );
    });

    if (!rows || rows.length === 0) {
      return res.status(400).json({ message: "Invalid or expired reset token" });
    }

    res.json({ message: "Token is valid" });
  } catch (error) {
    console.error("Error verifying token:", error);
    res.status(500).json({ message: "Server error" });
  }
};
