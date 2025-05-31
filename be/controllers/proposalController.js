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

        // Now insert into estimation table and link it to the proposal
        const insertEstimationSQL = `
            INSERT INTO estimation_proposal (proposal_id)
            VALUES (?)
        `;

        db.query(insertEstimationSQL, [proposal_id], (estimationErr, estimationResult) => {
            if (estimationErr) {
                console.error("Error creating estimation:", estimationErr);
                return res.status(500).json({ error: "Proposal added but failed to create estimation" });
            }

            return res.status(201).json({
                message: "Proposal and estimation created",
                proposal_id,
                estimation_id: estimationResult.insertId
            });
        });
    });
};

const deleteProposalByProject = (req, res) => {
  const { project_id, proposal_id } = req.params;

  const sql = `
    DELETE FROM proposals
    WHERE proposal_id = ? AND project_id = ?
  `;

  db.query(sql, [proposal_id, project_id], (err, result) => {
    if (err) {
      console.error("Error deleting proposal:", err);
      return res.status(500).json({ error: "Failed to delete proposal" });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Proposal not found or does not belong to this project" });
    }

    return res.status(200).json({ message: "Proposal deleted successfully" });
  });
};


module.exports = {
    getProposalByProject,
    addProposalByProject,
    deleteProposalByProject
};
