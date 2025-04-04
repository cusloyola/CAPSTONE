const db = require("../config/db");

const getProjectDetailsForDailyReport = (req, res) => {
    const query = `
      SELECT 
        p.project_name, 
        p.location, 
        p.owner, 
        u.full_name AS prepared_by
      FROM 
        projects p
      JOIN 
        users u ON u.user_id = 2 
      WHERE 
        TRIM(LOWER(p.status)) = 'in progress'
    `;
    
    db.query(query, (err, result) => {
      if (err) {
        console.error("❌ Database error:", err);
        return res.status(500).json({ error: "Database error" });
      }
    
      const projects = result || [];
      
      // Send only the project details in the response
      res.json({ projects });
    });
};

// Function to fetch worker roles
const getWorkerRoles = (req, res) => {
    const rolesQuery = 'SELECT DISTINCT role FROM workers';
    
    db.query(rolesQuery, (err, result) => {
        if (err) {
            console.error("❌ Error fetching roles:", err);
            return res.status(500).json({ error: "Error fetching worker roles" });
        }
        
        const roles = result.map(row => row.role);
        console.log("Roles fetched:", roles);  // Add this line
        res.json({ roles });
    });
};

const getEquipment = (req, res) => {
    const equipmentQuery = 'SELECT DISTINCT equipment_name FROM equipment';
    
    db.query(equipmentQuery, (err, result) => {
        if (err) {
            console.error("❌ Error fetching equipment:", err);
            return res.status(500).json({ error: "Error fetching equipment names" });
        }

        console.log("Raw query result:", result);  // Log the entire result

        if (result && result.length > 0) {
            const equipment = result.map(row => row.equipment_name);
            console.log("Equipment fetched:", equipment);  // Log the mapped data
            res.json({ equipment });
        } else {
            console.log("No equipment found or all values are null");
            res.json({ equipment: [] });  // Return empty array if no equipment found
        }
    });
};



const submitDailySiteReport = (req, res) => {
    const { 
      report_id, 
      date, 
      projectName, 
      location, 
      owner, 
      activities, 
      weatherAM, 
      weatherPM, 
      manpower, 
      selectedEquipment, 
      visitors, 
      remarks, 
      preparedBy 
    } = req.body;  // Assuming all fields are sent from the frontend as part of the request body
  
    // Query to insert or update daily site report
    const query = `
      INSERT INTO daily_site_reports (
        report_id, 
        report_date, 
        project_name, 
        location, 
        owner, 
        activities, 
        weather_am, 
        weather_pm, 
        manpower, 
        selected_equipment, 
        visitors, 
        remarks, 
        prepared_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE 
        report_date = VALUES(report_date),
        project_name = VALUES(project_name),
        location = VALUES(location),
        owner = VALUES(owner),
        activities = VALUES(activities),
        weather_am = VALUES(weather_am),
        weather_pm = VALUES(weather_pm),
        manpower = VALUES(manpower),
        selected_equipment = VALUES(selected_equipment),
        visitors = VALUES(visitors),
        remarks = VALUES(remarks),
        prepared_by = VALUES(prepared_by);
    `;
    
    const values = [
      report_id, 
      date, 
      projectName, 
      location, 
      owner, 
      activities, 
      weatherAM, 
      weatherPM, 
      JSON.stringify(manpower), 
      JSON.stringify(selectedEquipment), 
      visitors, 
      remarks, 
      preparedBy
    ];
  
    db.query(query, values, (err, result) => {
      if (err) {
        console.error("❌ Error saving daily site report:", err);
        return res.status(500).json({ error: "Error saving daily site report" });
      }
  
      console.log("Daily site report saved successfully:", result);
      res.json({ message: "Report submitted successfully", result });
    });
  };
  


module.exports = {
    getProjectDetailsForDailyReport, getWorkerRoles, getEquipment
};
