const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const path = require('path');
const fs = require('fs'); // Add this line at the top of your file
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
    console.log(`${req.method} ${req.url}`);
    next();
});

// ✅ Import Routes

const sowWorkTypesRoutes = require('./routes/ScopeOfWorkProposalRoutes/sowWorkTypesRoutes');
const sowproposalRoutes = require('./routes/ScopeOfWorkProposalRoutes/sowproposalRoutes')

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
const materialtakeoffRoutes = require('./routes/MaterialTakeOffRoutes/materialtakeoffRoutes');




const employeeManagementRoutes = require("./routes/employeeManagementRoutes");

const taskRoutes = require('./routes/taskRoutes');

const bomRoutes = require("./routes/bomRoutes");
const dailySiteReportRoutes = require("./routes/DailySiteReportRoutes/dailySiteReportRoutes");

const adminSiteReport = require("./routes/adminSiteReportRoutes");
const clientRoutes = require("./routes/clientRoutes"); // Existing client routes

const subclientRoutes = require("./routes/subclientRoutes");
const folderRoutes = require("./routes/folderRoutes");
const documentRoutes = require("./routes/documentRoutes");

const fileRoutes = require('./routes/fileRoutes');

const proposalRoutes = require('./routes/proposalRoutes');

const quantitytakeoffRoutes = require('./routes/QuantityTakeOffRoutes/quantitytakeoffRoutes');

const rebarRoutes = require('./routes/Rebar/rebarRoutes');


const laborunitcostRoutes = require('./routes/LaborUnitCostRoutes/laborunitcostRoutes');

const materialunitcostRoutes = require('./routes/MaterialUnitCostRoutes/materialunitcostRoutes');

const finalcostestimationRoutes = require('./routes/FinalCostEstimationRoutes/finalcostestimationRoutes');


const progressbillingRoutes = require('./routes/ProgressBillingRoutes/progressbillingRoutes');


const dashboardRoutes = require('./routes/DashboardRoutes/dashboardRoutes');

const incidentreportRoutes = require('./routes/IncidentReportsRoutes/incidentreportRoutes');


const projectInfoRoutes = require('./routes/ProjectInfoRoutes/projectInfoRoutes');

// Import the clientInfoRoutes for the /api/client-info endpoint
const clientInfoRoutes = require('./routes/ProjectInfoRoutes/clientInfoRoutes');

// NEW: Import the floorInfoRoutes for the /api/floor-info endpoint
const floorInfoRoutes = require('./routes/ProjectInfoRoutes/floorsInfoRoutes');


// Ensure the uploads directory exists
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir); // Create uploads folder if it doesn't exist
}


app.use('/api/work-types', sowWorkTypesRoutes);


app.use("/api", employeeManagementRoutes);
app.use("/api/request-materials", requestMaterialRoutes);
app.use("/api/user-accounts", userManagementController);
app.use("/api/inventory-information", inventoryInformationRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/reports", reportsRoutes);
app.use("/api/contracts", contractRoutes);
app.use("/api/leave-contract", leaveContractRoutes);
app.use('/api/projects', projectRoutes);

app.use('/api/events', eventRoutes);

app.use("/api/bom", bomRoutes);

app.use("/api/daily-site-report", dailySiteReportRoutes);


app.use("/api/admin-site-reports", adminSiteReport);
app.use("/api/clients", clientRoutes); // Existing client routes mapping

app.use("/api/subclients", subclientRoutes);
app.use("/api/folders", folderRoutes);
app.use('/api/tasks', taskRoutes);
app.use("/api/documents", documentRoutes);

app.use("/api/files", fileRoutes);


app.use("/api/proposals", proposalRoutes);

app.use("/api/sowproposal", sowproposalRoutes);

app.use("/api/qto", quantitytakeoffRoutes);


app.use('/api/rebar', rebarRoutes);

app.use('/api/laborunitcost', laborunitcostRoutes);

app.use('/api/materialunitcost', materialunitcostRoutes);

app.use('/api/mto', materialtakeoffRoutes);

app.use('/api/cost-estimation', finalcostestimationRoutes);

app.use('/api/progress-billing',progressbillingRoutes );

app.use('/api/dashboard', dashboardRoutes);


app.use('/api/incident-report', incidentreportRoutes);


app.use('/api/project-info', projectInfoRoutes);

// Use the clientInfoRoutes for the /api/client-info endpoint
app.use('/api/client-info', clientInfoRoutes);

// NEW: Use the floorInfoRoutes for the /api/floor-info endpoint
app.use('/api/floor-info', floorInfoRoutes);


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
