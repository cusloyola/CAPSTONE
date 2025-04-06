// controllers/projectController.js
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

// Add a new project
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
    INSERT INTO projects 
    (project_name, location, owner, start_date, end_date, status, budget, actual_cost, progress_percent)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
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
      progress_percent
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
const deleteProject = (req, res) => {
  const { id } = req.params;

  const query = 'DELETE FROM projects WHERE project_id = ?';
  db.query(query, [id], (err, result) => {
    if (err) {
      console.error('❌ Error deleting project:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }
    res.json({ message: 'Project deleted successfully' });
  });
};

// Export the functions
module.exports = {
  getAllProjects,
  createProject,
  updateProject,
  deleteProject
};
