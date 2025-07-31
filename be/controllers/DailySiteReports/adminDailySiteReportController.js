const db = require("../../config/db");

const getSiteDailyReportforAdmin = (req, res) => {
  const { project_id } = req.params;

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
      dsr.last_viewed,
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
    WHERE p.project_id = ?
  `;

  db.query(query, [project_id], (err, results) => {
    if (err) {
      console.error("Failed to fetch daily site reports: ", err);
      return res.status(500).json({ message: "DB Error" });
    }

    const parsedResults = results.map((r) => ({
      ...r,
      manpower: safeJsonParse(r.manpower),
      selected_equipment: safeJsonParse(r.selected_equipment),
    }));

    // Stats
    const totalReports = parsedResults.length;
    const viewedReports = parsedResults.filter(r => r.last_viewed !== null).length;
    const unviewedReports = parsedResults.filter(r => r.last_viewed === null).length;

    return res.status(200).json({
      message: "Successfully fetched daily site reports",
      data: parsedResults,
      stats: {
        totalReports,
        viewedReports,
        unviewedReports,
      }
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

const editStatus = (req, res) => {
  const { dailysite_report_id } = req.params;
  const { status, admin_remarks } = req.body;

  const sql = `
    UPDATE daily_site_reports
    SET status = ?, admin_remarks = ?
    WHERE dailysite_report_id = ?
  `;

  db.query(sql, [status, admin_remarks || null, dailysite_report_id], (err, results) => {
    if (err) {
      console.error("Failed to update", err);
      return res.status(500).json({ message: "DB Error" });
    }
    return res.status(200).json({
      message: "Status and remarks updated successfully",
      data: results,
    });
  });
};



const updateLastViewed = (req, res) => {
    const { dailysite_report_id } = req.params;

    const sql = `
        UPDATE daily_site_reports
        SET last_viewed = NOW()
        WHERE dailysite_report_id = ?
    `;

    db.query(sql, [dailysite_report_id], (err, results) => {
        if (err) {
            console.error("Failed to update last viewed timestamp", err);
            return res.status(500).json({ message: "DB Error" });
        }
        return res.status(200).json({ message: "Last viewed timestamp updated", data: results });
    });
};





module.exports = {
    getSiteDailyReportforAdmin,
    editStatus,
    updateLastViewed
}