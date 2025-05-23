const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const path = require('path');
const fs = require('fs');  // Add this line at the top of your file
const {verifyToken} = require('./middleware/authMiddleware'); // Correct way for default export

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
const projectRoutes = require('./routes/projectRoutes');
const requestMaterialRoutes = require("./routes/requestMaterialRoutes");
const employeeManagementRoutes = require("./routes/employeeManagementRoutes"); // Import employee management routes

const taskRoutes = require('./routes/taskRoutes');

const bomRoutes = require("./routes/bomRoutes");
const dailySiteReportRoutes = require("./routes/dailySiteReportRoutes");

const adminSiteReport = require("./routes/adminSiteReportRoutes");
const clientRoutes = require("./routes/clientRoutes"); // Import the client routes

const dashboardRoutes = require('./routes/dashboard');

const subclientRoutes = require("./routes/subclientRoutes");
const folderRoutes = require("./routes/folderRoutes");
const documentRoutes = require("./routes/documentRoutes");

const fileRoutes = require('./routes/fileRoutes'); // Import fileRoutes


// Ensure the uploads directory exists
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir); // Create uploads folder if it doesn't exist
}


// ✅ Use Routes
app.use("/api", employeeManagementRoutes); // Mount employee management routes under /api
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
app.use('/api/projects', projectRoutes);

app.use('/api/events', eventRoutes);

app.use("/api/bom", bomRoutes);

app.use("/api/daily-site-report", dailySiteReportRoutes);


app.use("/api/admin-site-reports", adminSiteReport);
app.use("/api/clients", clientRoutes);



app.use("/api/subclients", subclientRoutes);

app.use('/api/dashboard', dashboardRoutes);

app.use("/api/folders", folderRoutes);


app.use('/api/tasks', taskRoutes); // now your endpoints will start with /api/tasks


app.use("/api/documents", documentRoutes);



// Use the fileRoutes for the POST request
app.use("/api/files", fileRoutes); // This includes /api/files/upload




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