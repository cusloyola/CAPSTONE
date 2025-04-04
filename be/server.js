const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const db = require("./config/db"); // Ensure DB connection is initialized

dotenv.config(); // Load environment variables

const app = express();

// ✅ Middleware
app.use(cors()); // Allow Cross-Origin Resource Sharing
app.use(express.json()); // Parse incoming JSON data
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded data

// ✅ Request logging middleware
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`); // Log the request method and URL
    next();
});

// ✅ Import Routes
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const inventoryRoutes = require("./routes/inventoryRoutes");
const contractRoutes = require("./routes/contractRoutes");
const leaveContractRoutes = require("./routes/leaveContractRoutes");
const inventoryInformationRoutes = require("./routes/inventoryInformationRoutes");
const userManagementController = require("./routes/userManagementRoutes")
const eventRoutes = require('./routes/eventRoutes');
const reportsRoutes = require("./routes/reportsRoutes");
const requestMaterialRoutes = require("./routes/requestMaterialRoutes");


const bomRoutes = require("./routes/bomRoutes");



// ✅ Use Routes
app.use("/api/request-materials", requestMaterialRoutes);
app.use("/api/user-accounts", userManagementController);
app.use("/api/inventory-information", inventoryInformationRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/reports", reportsRoutes); 
// No changes needed here, assuming your inventoryRoutes is correctly setup
app.use("/api/contracts", contractRoutes);
app.use("/api/leave-contract", leaveContractRoutes);

app.use('/api/events', eventRoutes);

app.use("/api/bom", bomRoutes);


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