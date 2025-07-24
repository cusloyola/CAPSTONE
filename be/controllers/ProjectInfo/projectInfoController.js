// controllers/ProjectInfo/projectInfoController.js
const db = require("../../config/db"); // Assuming your database connection is exported from here

// @desc    Get all projects
// @route   GET /api/project-info
// @access  Public (or add verifyToken middleware if authentication is needed)
const getAllProjects = (req, res) => {
  const query = `SELECT * FROM projects`;
  db.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching all projects:", err);
      return res.status(500).json({ message: "Error fetching projects", error: err.message });
    }
    res.status(200).json(results);
  });
};

// @desc    Get a single project by ID
// @route   GET /api/project-info/:id
// @access  Public (or add verifyToken middleware if authentication is needed)
const getProjectById = (req, res) => {
  const { id } = req.params;
  // Modified query to include client_name from 'clients' table and floor_labels from 'project_floors' table
  const query = `
    SELECT
        p.*,
        c.client_name,
        (SELECT GROUP_CONCAT(pf.floor_label ORDER BY pf.floor_code ASC) FROM project_floors pf WHERE pf.project_id = p.project_id) AS floor_labels
    FROM
        projects p
    LEFT JOIN
        clients c ON p.client_id = c.client_id
    WHERE
        p.project_id = ?`;
  db.query(query, [id], (err, results) => {
    if (err) {
      console.error(`Error fetching project with ID ${id}:`, err);
      return res.status(500).json({ message: "Error fetching project", error: err.message });
    }
    if (results.length === 0) {
      return res.status(404).json({ message: "Project not found" });
    }
    res.status(200).json(results[0]);
  });
};

// @desc    Update a project by ID
// @route   PUT /api/project-info/:id
// @access  Public (or add verifyToken middleware if authentication is needed)
const updateProject = (req, res) => {
  const { id } = req.params;
  const {
    client_id, // client_id might be sent but not directly updated here if client_name is updated separately
    user_id,
    project_name,
    location,
    locationArea,
    priority,
    projectManager,
    start_date,
    end_date,
    status,
    budget,
    actual_cost,
    progress_percent,
    completed_at,
    category_id,
    // floor_labels is NOT handled here directly as it belongs to project_floors table
    // client_name is NOT handled here directly as it belongs to clients table
  } = req.body;

  // Constructing the UPDATE query dynamically for provided fields
  const fields = [];
  const values = [];

  // Note: client_id and user_id are typically not updated via this endpoint
  // as they represent relationships or creation attribution.
  // If they need to be updated, ensure proper validation and authorization.
  if (client_id !== undefined) { fields.push("client_id = ?"); values.push(client_id); }
  if (user_id !== undefined) { fields.push("user_id = ?"); values.push(user_id); }

  if (project_name !== undefined) { fields.push("project_name = ?"); values.push(project_name); }
  if (location !== undefined) { fields.push("location = ?"); values.push(location); }
  if (locationArea !== undefined) { fields.push("locationArea = ?"); values.push(locationArea); }
  if (priority !== undefined) { fields.push("priority = ?"); values.push(priority); }
  if (projectManager !== undefined) { fields.push("projectManager = ?"); values.push(projectManager); }
  if (start_date !== undefined) { fields.push("start_date = ?"); values.push(start_date); }
  if (end_date !== undefined) { fields.push("end_date = ?"); values.push(end_date); }
  if (status !== undefined) { fields.push("status = ?"); values.push(status); }
  if (budget !== undefined) { fields.push("budget = ?"); values.push(budget); }
  if (actual_cost !== undefined) { fields.push("actual_cost = ?"); values.push(actual_cost); }
  if (progress_percent !== undefined) { fields.push("progress_percent = ?"); values.push(progress_percent); }
  if (completed_at !== undefined) { fields.push("completed_at = ?"); values.push(completed_at); }
  if (category_id !== undefined) { fields.push("category_id = ?"); values.push(category_id); }

  if (fields.length === 0) {
    return res.status(400).json({ message: "No fields provided for update" });
  }

  const query = `UPDATE projects SET ${fields.join(", ")} WHERE project_id = ?`;
  values.push(id); // Add the ID to the end of the values array

  db.query(query, values, (err, result) => {
    if (err) {
      console.error(`Error updating project with ID ${id}:`, err);
      return res.status(500).json({ message: "Error updating project", error: err.message });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Project not found or no changes made" });
    }
    res.status(200).json({ message: "Project updated successfully", project_id: id });
  });
};

module.exports = {
  getAllProjects,
  getProjectById,
  updateProject,
};
