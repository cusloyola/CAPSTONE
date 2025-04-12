const db = require('../config/db');

// Get all projects (joined with client info)
const getAllProjects = (req, res) => {
  const query = `
    SELECT 
      p.*,
      c.client_name AS owner_name,
      c.email AS owner_email
    FROM projects p
    JOIN clients c ON p.client_id = c.client_id
    ORDER BY p.start_date
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error('❌ Error fetching projects:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(results);
  });
};

const createProject = (req, res) => {
  console.log(req.body); // Log the incoming request body

  const {
    project_name,
    location,
    start_date,
    end_date,
    status,
    budget,
    actual_cost,
    progress_percent,
    client_id
  } = req.body;

  if (
    project_name == null ||
    location == null ||
    start_date == null ||
    end_date == null ||
    status == null ||
    budget == null ||
    actual_cost == null ||
    progress_percent == null ||
    client_id == null
  )
  {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const query = `
    INSERT INTO projects 
    (project_name, location, start_date, end_date, status, budget, actual_cost, progress_percent, client_id) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(
    query,
    [
      project_name,
      location,
      start_date,
      end_date,
      status,
      budget,
      actual_cost,
      progress_percent,
      client_id
    ],
    (err, result) => {
      if (err) {
        console.error('❌ Error adding project:', err);
        return res.status(500).json({ error: 'Database error' });
      }
      res.status(201).json({ message: 'Project added successfully', project_id: result.insertId });
    }
  );
};

const updateProject = (req, res) => {
  const { id } = req.params; // The project ID from the URL (e.g., /projects/:id)
  const {
    project_name,
    location,
    start_date,
    end_date,
    status,
    budget,
    actual_cost,
    progress_percent,
    client_id
  } = req.body; // The project details sent in the body of the request

  // Check if all required fields are provided
  if (
    !project_name ||
    !location ||
    !start_date ||
    !end_date ||
    !status ||
    !budget ||
    !actual_cost ||
    !progress_percent ||
    !client_id
  ) {
    return res.status(400).json({ error: 'Missing required fields' }); // Return error if any field is missing
  }

  const query = `
  UPDATE projects
  SET 
    project_name = ?, 
    location = ?, 
    start_date = ?, 
    end_date = ?, 
    status = ?, 
    budget = ?, 
    actual_cost = ?, 
    progress_percent = ?, 
    client_id = ?
  WHERE project_id = ?;
`;

db.query(
  query,
  [
    project_name,
    location,
    start_date,
    end_date,
    status,
    budget,
    actual_cost,
    progress_percent, // Ensure this is being passed correctly
    client_id,
    id, // Project ID to update
  ],
  (err, result) => {
    if (err) {
      console.error('❌ Error updating project:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }
    res.json({ message: 'Project updated successfully' });
  }
);
};


// Delete a project
const deleteProject = async (req, res) => {
  const projectId = req.params.id;

  try {
    await db.query("DELETE FROM projects WHERE project_id = ?", [projectId]);
    await db.query("DELETE FROM projects WHERE project_id = ?", [projectId]);

    res.status(200).json({ message: "Project deleted successfully" });
  } catch (error) {
    console.error("❌ Error deleting project:", error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getAllProjects,
  createProject,
  updateProject,
  deleteProject
};
