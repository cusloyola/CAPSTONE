const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const db = require("./config/db"); // Ensure DB connection is initialized

dotenv.config(); // Load environment variables

const app = express();

// ✅ Middleware
app.use(cors());  // Allow Cross-Origin Resource Sharing
app.use(express.json()); // Parse incoming JSON data
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded data

// ✅ Request logging middleware (added to log every request)
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);  // Log the request method and URL
    next();  // This allows the request to continue to the next middleware/route
});

// ✅ Import Routes
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const inventoryRoutes = require("./routes/inventoryRoutes");
const contractRoutes = require("./routes/contractRoutes");

// ✅ Use Routes
app.use("/api/auth", authRoutes);        // Route for authentication
app.use("/api/users", userRoutes);      // Route for users
app.use("/api/inventory", inventoryRoutes); // Route for inventory items
app.use("/api/contracts", contractRoutes); // Route for contracts

// ✅ Health Check Route (This can be useful for monitoring services)
app.get("/", (req, res) => {
    res.send("🚀 API is running...");
});

// ✅ Global Error Handling (Order matters: must be last)
app.use((err, req, res, next) => {
    console.error("❌ Server Error:", err.message);  // Log the error message to console
    res.status(err.status || 500).json({ error: err.message || "Internal Server Error" });  // Send error response
});

// ✅ Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
