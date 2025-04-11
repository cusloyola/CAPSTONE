const db = require('../config/db');

// Get all projects
const getAllProjects = (req, res) => {
  db.query('SELECT * FROM projects ORDER BY start_date', (err, results) => {
    if (err) {
      console.error('❌ Error fetching projects:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(results);
  });
};
const createProject = (req, res) => {
  const {
    project_name,
    location,
    owner,
    start_date,
    end_date,
    status,
    budget,
    actual_cost,
    progress_percent,
    client_id // new client_id field

  } = req.body;

  // Validate the required fields
  if (
    !project_name ||
    !location ||
    !owner ||
    !start_date ||
    !end_date ||
    !status ||
    !budget ||
    !actual_cost ||
    !progress_percent ||
    !client_id // ensure client_id is provided


  ) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const query = `
    INSERT INTO projects 
    (project_name, location, owner, start_date, end_date, status, budget, actual_cost, progress_percent, client_id) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(
    query,
    [
      project_name,
      location,
      owner,
      start_date,
      end_date,
      status,
      budget,
      actual_cost,
      progress_percent,
      client_id // insert client_id
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


// Update an existing project
const updateProject = (req, res) => {
  const { id } = req.params;
  const {
    project_name,
    location,
    owner,
    start_date,
    end_date,
    status,
    budget,
    actual_cost,
    progress_percent
  } = req.body;

  // Validate the required fields
  if (
    !project_name ||
    !location ||
    !owner ||
    !start_date ||
    !end_date ||
    !status ||
    !budget ||
    !actual_cost ||
    !progress_percent
  ) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const query = `
    UPDATE projects 
    SET 
      project_name = ?, 
      location = ?, 
      owner = ?, 
      start_date = ?, 
      end_date = ?, 
      status = ?, 
      budget = ?, 
      actual_cost = ?, 
      progress_percent = ? 
    WHERE project_id = ?
  `;

  db.query(
    query,
    [
      project_name,
      location,
      owner,
      start_date,
      end_date,
      status,
      budget,
      actual_cost,
      progress_percent,
      id
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
    // Step 1: Delete related records in worker_projects
    await db.query("DELETE FROM worker_projects WHERE project_id = ?", [projectId]);

    // Step 2: Delete the project
    await db.query("DELETE FROM projects WHERE project_id = ?", [projectId]);

    res.status(200).json({ message: "Project deleted successfully" });
  } catch (error) {
    console.error("Error deleting project:", error);
    res.status(500).json({ error: error.message });
  }
};



// Export the functions
module.exports = {
  getAllProjects,
  createProject,
  updateProject,
  deleteProject
};
