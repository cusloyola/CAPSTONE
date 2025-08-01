const db = require('../config/db');

// Get all projects (joined with client info)
// const getAllProjects = (req, res) => {
//   const query = `
//     SELECT 
//       p.*,
//       c.client_name AS owner_name,
//       c.email AS owner_email
//     FROM projects p
//     JOIN clients c ON p.client_id = c.client_id
//     ORDER BY p.start_date
//   `;

//   db.query(query, (err, results) => {
//     if (err) {
//       console.error('❌ Error fetching projects:', err);
//       return res.status(500).json({ error: 'Database error' });
//     }
//     res.json(results);
//   });
// };

const createProject = (req, res) => {
  const {
    project_name,
    category_id,
    projectCategory,
    location,
    locationArea,
    priority,
    projectManager,
    start_date,
    end_date,
    status,
    budget,
    client_id,
    number_of_floors
  } = req.body;


  // Check required fields
  if (
    project_name == null ||
       category_id == null ||
    location == null ||
    locationArea == null ||
    priority == null ||
    projectManager == null ||
    start_date == null ||
    end_date == null ||
    status == null ||
    budget == null ||
    client_id == null ||
    number_of_floors == null
  ) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

    const projectQuery = `
    INSERT INTO projects 
    (project_name, category_id, location, locationArea, priority, projectManager, start_date, end_date, status, budget, client_id)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(
    projectQuery,
    [
      project_name,
      category_id,
      location,
      locationArea,
      priority,
      projectManager,
      start_date,
      end_date,
      status,
      budget,
      client_id
    ],
    (err, result) => {
      if (err) {
        console.error('❌ Error inserting project:', err);
        return res.status(500).json({ error: 'Database error' });
      }

      const project_id = result.insertId;

      // Step 2: Insert floors dynamically
      const floorValues = [];
      for (let i = 1; i <= number_of_floors; i++) {
        const floorCode = `Floor ${i}`;
        const floorLabel = `Floor ${i}`;
        floorValues.push([project_id, floorCode, floorLabel]);
      }

      const floorQuery = `
        INSERT INTO project_floors (project_id, floor_code, floor_label)
        VALUES ?
      `;

      db.query(floorQuery, [floorValues], (floorErr) => {
        if (floorErr) {
          console.error('❌ Error inserting project floors:', floorErr);
          return res.status(500).json({ error: 'Error inserting floors' });
        }

        res.status(201).json({
          message: 'Project and floors created successfully',
          project_id
        });
      });
    }
  );
};


const updateProject = (req, res) => {
  const { project_id } = req.params; // The project ID from the URL (e.g., /projects/:id)
  const {
    project_name,
    category_id,
    location,
    locationArea,
    priority,
    projectManager,
    start_date,
    end_date,
    client_id
  } = req.body; // The project details sent in the body of the request



  const query = `
  UPDATE projects
  SET 
    project_name = ?, 
    category_id = ?,
    location = ?, 
    locationArea = ?,
    priority = ?,
    projectManager = ?,
    start_date = ?, 
    end_date = ?, 
    client_id = ?
  WHERE project_id = ?;
`;

  db.query(
    query,
    [
      project_name,
      category_id,
      location,
      locationArea,
      priority,
      projectManager,
      start_date,
      end_date,
      client_id,
      project_id, 
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


const getAllProjects = (req, res, next) => {
  const query = `
   SELECT 
  p.project_id,
  p.project_name,
  pc.project_type AS projectCategory,
  p.projectManager,
  p.location,
  p.priority,
  p.status,
  c.client_id,
  c.client_name,
  c.phone_number AS client_contact
FROM projects p
JOIN clients c ON p.client_id = c.client_id
JOIN project_categories pc ON p.category_id = pc.category_id
  `;

  db.query(query, (err, results) => {
    if (err) {
      return next(err);
    }

    res.json(results);
  });
};



const getProjectFloors = (req, res) => {
  const { project_id } = req.query;

  if (!project_id) {
    return res.status(400).json({ message: "Missing project_id in query" });
  }

  const sql = `
    SELECT floor_id, floor_code, floor_label 
    FROM project_floors 
    WHERE project_id = ?`;

  db.query(sql, [project_id], (err, results) => {
    if (err) {
      console.error("❌ Failed to fetch project floors:", err);
      return res.status(500).json({ message: "Server Error" });
    }

    return res.status(200).json({
      message: "✅ Project floors fetched successfully",
      data: results,
    });
  });
};


const getprojectCategories = (req,res) => {
  const sql = 
  `SELECT 
  category_id,
  project_type 
  FROM project_categories
  `;

  db.query(sql, (err, results) => {
    if(err){
      console.error("Failed to fetch project categories", err);
      return res.status(500).json({message: "Server Error"});

    }
    return res.status(200).json({message: "Project Categories fetch successfully", data: results});
  })
};

module.exports = {
  getAllProjects,
  createProject,
  updateProject,
  deleteProject,
  getProjectFloors,
  getprojectCategories
};
