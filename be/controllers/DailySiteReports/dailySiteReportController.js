const db = require("./../../config/db");

const getSiteDailyReportforSite = (req, res) => {
  const query = `
    SELECT
      dsr.dailysite_report_id AS report_id,
      dsr.report_date,
      dsr.activities,
      dsr.weather_am,
      dsr.weather_pm,
      dsr.manpower,
      dsr.selected_equipment,
      dsr.visitors,
      dsr.notes,
      dsr.status,
      p.project_id,
      p.project_name,
      p.location,
      c.client_name,
      u.full_name
    FROM 
      daily_site_reports dsr
    JOIN projects p ON p.project_id = dsr.project_id
    JOIN clients c ON c.client_id = p.client_id
    JOIN users u ON u.user_id = dsr.prepared_by_user_id
  `;

 db.query(query, (err, results) => {
    if (err) {
      console.error("Failed to fetch daily site reports: ", err);
      return res.status(500).json({ message: "DB Error" });
    }

    const parsedResults = results.map((r) => ({
      ...r,
      activities: safeJsonParse(r.activities),
      manpower: safeJsonParse(r.manpower),
      selected_equipment: safeJsonParse(r.selected_equipment),
    }));

    return res.status(200).json({
      message: "Successfully fetched daily site reports",
      data: parsedResults,
    });
  });
};

// Utility to handle invalid JSON gracefully
function safeJsonParse(value) {
  try {
    return JSON.parse(value);
  } catch {
    return []; // default to empty array
  }
};


const submitDailySiteReport = (req, res) => {
  console.log("Received request body:", req.body);

  const { 
    dailysite_report_id, 
    report_date, 
    project_id, 
    activities, 
    weather_am, 
    weather_pm, 
    manpower, 
    selected_equipment, 
    visitors, 
    notes, 
    prepared_by_user_id  
  } = req.body;

  console.log("Data to be inserted into database:", {
    dailysite_report_id, 
    report_date, 
    project_id, 
    activities, 
    weather_am, 
    weather_pm, 
    manpower, 
    selected_equipment, 
    visitors, 
    notes, 
    prepared_by_user_id  
  });

  const query = `
    INSERT INTO daily_site_reports (
      dailysite_report_id, 
      report_date, 
      project_id, 
      activities, 
      weather_am, 
      weather_pm, 
      manpower, 
      selected_equipment, 
      visitors, 
      notes, 
      prepared_by_user_id 
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE 
      report_date = VALUES(report_date),
      project_id = VALUES(project_id),
      activities = VALUES(activities),
      weather_am = VALUES(weather_am),
      weather_pm = VALUES(weather_pm),
      manpower = VALUES(manpower),
      selected_equipment = VALUES(selected_equipment),
      visitors = VALUES(visitors),
      notes = VALUES(notes),
      prepared_by_user_id = VALUES(prepared_by_user_id);
  `;

  db.query(query, [
    dailysite_report_id, 
    report_date, 
    project_id, 
    activities, 
    weather_am, 
    weather_pm, 
    JSON.stringify(manpower), 
    JSON.stringify(selected_equipment), 
    visitors, 
    notes, 
    prepared_by_user_id
  ], (err, result) => {
    if (err) {
      console.error("❌ Error saving daily site report:", err);
      return res.status(500).json({ error: "Error saving daily site report" });
    }

    console.log("✅ Daily site report saved successfully:", result);
    res.json({ message: "Report submitted successfully", result });
  });
};




module.exports = {
    getSiteDailyReportforSite,
     submitDailySiteReport
};
