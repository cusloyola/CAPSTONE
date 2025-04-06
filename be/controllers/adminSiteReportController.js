const db = require("../config/db");

// Fetch all report details with project information
const fetchAllReportDetails = async (req, res) => {
  console.log('Fetching all report details with project information...');
  try {
    const query = `
      SELECT 
        ds.report_id, 
        ds.report_date, 
        ds.activities, 
        ds.weather_am, 
        ds.weather_pm, 
        ds.manpower, 
        ds.selected_equipment, 
        ds.new_equipment, 
        ds.visitors, 
        ds.remarks, 
        ds.prepared_by,
        p.project_id, 
        p.project_name, 
        p.location, 
        p.owner
      FROM daily_site_reports ds
      JOIN projects p ON ds.project_id = p.project_id
    `;
    
    db.query(query, (err, result) => {
      if (err) {
        console.error('Error fetching report details:', err);
        return res.status(500).json({ message: 'Failed to fetch report details' });
      }

      console.log('Fetched report details:', result);  // Log the report details with project info
      res.status(200).json(result);
    });
  } catch (error) {
    console.error('Error fetching report details:', error);
    res.status(500).json({ message: 'Failed to fetch report details' });
  }
};

// In your controller (adminSiteReportController.js)
const deleteReportById = async (req, res) => {
  const { report_id } = req.params;
  
  try {
    // Delete the report from the database
    const result = await db.query('DELETE FROM daily_site_reports WHERE report_id = ?', [report_id]);
    
    // Check if the deletion was successful
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Report not found' });
    }
    
    res.status(200).json({ message: 'Report deleted successfully' });
  } catch (err) {
    console.error('Error deleting report:', err);
    res.status(500).json({ message: 'Failed to delete report' });
  }
};

module.exports = {
  fetchAllReportDetails, deleteReportById
};
