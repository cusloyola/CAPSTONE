const db = require("../config/db");

// Controller to get the total count of material requests for the dashboard.
const getMaterialRequestCount = (req, res) => {
    const query = "SELECT COUNT(*) AS totalRequests FROM requested_materials";

    db.query(query, (err, results) => {
        if (err) {
            console.error("❌ Error fetching total material requests:", err);
            return res.status(500).json({ error: "Server error while fetching material request count" });
        }
        
        // The count is in the first result row.
        const totalRequests = results[0].totalRequests;
        
        console.log("📌 Sending total material request count:", totalRequests);
        return res.status(200).json({ totalRequests });
    });
};

// Controller to get the total count of daily site reports where is_deleted = 0.
const getDailySiteReportCount = (req, res) => {
    const query = "SELECT COUNT(*) AS totalReports FROM daily_site_reports WHERE is_deleted = 0";

    db.query(query, (err, results) => {
        if (err) {
            console.error("❌ Error fetching total daily site reports:", err);
            return res.status(500).json({ error: "Server error while fetching daily site report count" });
        }
        
        // The count is in the first result row.
        const totalReports = results[0].totalReports;
        
        console.log("📌 Sending total daily site report count:", totalReports);
        return res.status(200).json({ totalReports });
    });
};

// Controller to get the total counts for all projects, projects in progress, and completed projects.
const getProjectCounts = (req, res) => {
    // Queries to count projects by different statuses
    const totalProjectsQuery = "SELECT COUNT(*) AS totalProjects FROM projects";
    const inProgressProjectsQuery = "SELECT COUNT(*) AS inProgressProjects FROM projects WHERE status = 'In Progress'";
    const completedProjectsQuery = "SELECT COUNT(*) AS completedProjects FROM projects WHERE status = 'Completed'";

    // Execute the queries sequentially to collect all counts
    db.query(totalProjectsQuery, (err, totalResults) => {
        if (err) {
            console.error("❌ Error fetching total project count:", err);
            return res.status(500).json({ error: "Server error while fetching project counts" });
        }
        const totalProjects = totalResults[0].totalProjects;

        db.query(inProgressProjectsQuery, (err, inProgressResults) => {
            if (err) {
                console.error("❌ Error fetching in progress project count:", err);
                return res.status(500).json({ error: "Server error while fetching project counts" });
            }
            const inProgressProjects = inProgressResults[0].inProgressProjects;

            db.query(completedProjectsQuery, (err, completedResults) => {
                if (err) {
                    console.error("❌ Error fetching completed project count:", err);
                    return res.status(500).json({ error: "Server error while fetching project counts" });
                }
                const completedProjects = completedResults[0].completedProjects;

                const responseData = {
                    totalProjects,
                    inProgressProjects,
                    completedProjects,
                };

                console.log("📌 Sending project counts:", responseData);
                return res.status(200).json(responseData);
            });
        });
    });
};

module.exports = { 
    getMaterialRequestCount,
    getDailySiteReportCount,
    getProjectCounts
};
