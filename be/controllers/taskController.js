const db = require('../config/db'); // adjust this if your db path is different

// Get all tasks (with project name)
const getAllTasks = (req, res) => {
    const query = `
      SELECT t.*, p.project_name
      FROM tasks t
      LEFT JOIN projects p ON t.project_id = p.project_id
      ORDER BY t.start_date
    `;

    db.query(query, (err, results) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        res.json(results);
    });
};

// Get task by ID (with project name)
const getTaskById = (req, res) => {
    const { id } = req.params;

    const query = `
    SELECT tasks.*, projects.project_name 
    AS project_name 
    FROM tasks 
    LEFT JOIN projects ON tasks.project_id = projects.project_id 
    WHERE tasks.id = ?
  `;

    db.query(query, [id], (err, results) => {
        if (err) {
            console.error('❌ Error fetching task:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        if (results.length === 0) {
            return res.status(404).json({ error: 'Task not found' });
        }
        res.json(results[0]);
    });
};

// Create a new task
const createTask = (req, res) => {
    const { name, description, status, deadline, project_id } = req.body;

    // Validate required fields
    if (!name || !description || !status || !deadline || !project_id) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    const query = `
    INSERT INTO tasks (name, description, status, deadline, project_id)
    VALUES (?, ?, ?, ?, ?)
  `;

    db.query(query, [name, description, status, deadline, project_id], (err, result) => {
        if (err) {
            console.error('❌ Error creating task:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        res.status(201).json({ message: 'Task created successfully', task_id: result.insertId });
    });
};

// Update an existing task
const updateTask = (req, res) => {
    const { id } = req.params;
    const { name, description, status, deadline, project_id } = req.body;

    // Validate required fields
    if (!name || !description || !status || !deadline || !project_id) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    const query = `
    UPDATE tasks 
    SET name = ?, description = ?, status = ?, deadline = ?, project_id = ? 
    WHERE id = ?
  `;

    db.query(query, [name, description, status, deadline, project_id, id], (err, result) => {
        if (err) {
            console.error('❌ Error updating task:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Task not found' });
        }
        res.json({ message: 'Task updated successfully' });
    });
};

// Delete a task
const deleteTask = (req, res) => {
    const { id } = req.params;

    db.query('DELETE FROM tasks WHERE id = ?', [id], (err, result) => {
        if (err) {
            console.error('❌ Error deleting task:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Task not found' });
        }
        res.json({ message: 'Task deleted successfully' });
    });
};

module.exports = {
    getAllTasks,
    getTaskById,
    createTask,
    updateTask,
    deleteTask
};
