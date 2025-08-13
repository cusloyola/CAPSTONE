const db = require("../config/db");

const getProposalByProject = (req, res) => {
    const { project_id } = req.params; 

    const sql = "SELECT * FROM proposals WHERE project_id = ?";

    db.query(sql, [project_id], (err, results) => {
        if(err){
            console.error("Error fetching proposals:", err);
            return res.status(500).json({error: "Failed to fetch proposals"});
        }

        return res.status(200).json(results);
    });
};



const addProposalByProject = (req, res) => {
    const { project_id } = req.params;
    const { proposal_title, description, proposalStatus = "pending" } = req.body;

    const insertProposalSQL = `
        INSERT INTO proposals (project_id, proposal_title, description, status)
        VALUES (?, ?, ?, ?)
    `;

    db.query(insertProposalSQL, [project_id, proposal_title, description, proposalStatus], (err, result) => {
        if (err) {
            console.error("Error adding proposal:", err);
            return res.status(500).json({ error: "Failed to add proposal" });
        }

        const proposal_id = result.insertId;

        return res.status(201).json({
            message: "Proposal created successfully",
            proposal_id
        });
    });
};

const deleteProposalByProject = (req, res) => {
  const { project_id, proposal_id } = req.params;

  const deleteBillingSql = `DELETE FROM progress_billing WHERE proposal_id = ?`;

  db.query(deleteBillingSql, [proposal_id], (err) => {
    if (err) {
      console.error("Error deleting related progress billing:", err);
      return res.status(500).json({ error: "Failed to delete related records" });
    }

    const deleteProposalSql = `
      DELETE FROM proposals
      WHERE proposal_id = ? AND project_id = ?
    `;

    db.query(deleteProposalSql, [proposal_id, project_id], (err, result) => {
      if (err) {
        console.error("Error deleting proposal:", err);
        return res.status(500).json({ error: "Failed to delete proposal" });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Proposal not found or does not belong to this project" });
      }

      return res.status(200).json({ message: "Proposal deleted successfully" });
    });
  });
};



const editProposalByProject = (req, res) => {
  const { project_id, proposal_id } = req.params;
  const { proposal_title, description, status } = req.body;

  const sql = `
    UPDATE proposals
    SET proposal_title = ?, description = ?, status = ?
    WHERE proposal_id = ? AND project_id = ?
  `;

  db.query(sql, [proposal_title, description, status, proposal_id, project_id], (err, results) => {
    if (err) {
      console.error("Failed to update proposal:", err);
      return res.status(500).json({ message: "DB Error" });
    }

    if (results.affectedRows === 0) {
      return res.status(404).json({
        message: "Proposal not found or does not belong to this project"
      });
    }

    return res.status(200).json({ message: "Successfully updated proposal table" });
  });
};


module.exports = {
    getProposalByProject,
    addProposalByProject,
    deleteProposalByProject,
    editProposalByProject
};
