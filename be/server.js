const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const db = require("./config/db"); // Ensure DB connection is initialized

dotenv.config(); // Load environment variables

const app = express();

// ✅ Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Import Routes
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const inventoryRoutes = require("./routes/inventoryRoutes");

// ✅ Use Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/inventory", inventoryRoutes);

// ✅ Health Check Route
app.get("/", (req, res) => {
    res.send("🚀 API is running...");
});

// ✅ Global Error Handling
app.use((err, req, res, next) => {
    console.error("❌ Server Error:", err.message);
    res.status(err.status || 500).json({ error: err.message || "Internal Server Error" });
});

// ✅ Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
