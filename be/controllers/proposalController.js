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





module.exports = {
    getProposalByProject
};
