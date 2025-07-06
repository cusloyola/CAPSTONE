const db = require("./../../config/db");

    const addProgressBillList = async (req, res) => {
        const { proposal_id, subject, billing_no, billing_date, status, revision, user_id } = req.body;

        if (!proposal_id || user_id == null) {
            return res.status(400).json({ message: "Missing required fields" });
        }


        const insertSql = `
            INSERT INTO progress_billing
            (proposal_id, subject, billing_date, status, revision, user_id, billing_no)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;

        db.query(
            insertSql,
            [proposal_id, subject, billing_date, status, revision, user_id, billing_no],
            (err, results) => {
                if (err) {
                    console.error("❌ Failed to add progress billing list!", err);
                    return res.status(500).json({ message: "Server Error", error: err });
                }
                return res.status(200).json({ message: "✅ Progress billing successfully added!", data: results });
            }
        );
    };



const getProgressBillList = async (req, res) => {
    const { proposal_id } = req.params;

    const sql = 
    `SELECT 
    pb.billing_id,
    pb.subject,
    pb.billing_date,
    pb.status,
    pb.proposal_id,
    u.full_name AS evaluated_by,
    p.proposal_title

    FROM progress_billing pb
    JOIN users u ON pb.user_id = u.user_id
    JOIN final_estimation_summary fes ON pb.proposal_id = fes.proposal_id
    JOIN proposals p ON fes.proposal_id = p.proposal_id

    `;

    db.query(sql, [proposal_id], (err, results) => {
        if(err){
            console.error("Failed to get progress billing list!", err);
            return res.status(500).json({message: "Failed to fetch progress billings"});
        }
        return res.status(200).json({message: "Progress Billing List Fetched!", data: results});
    });

};

// GET /api/progress-billing/approved-proposal/:project_id
const getApprovedProposalByProject = (req, res) => {
    const { project_id } = req.params;

    const sql = `
        SELECT 
            p.proposal_id,
            p.proposal_title,
            pr.project_name
        FROM proposals p
        JOIN projects pr ON p.project_id = pr.project_id
        WHERE p.project_id = ?
          AND p.status = 'approved'
          AND pr.status = 'in progress'
        LIMIT 1
    `;

    db.query(sql, [project_id], (err, results) => {
        if (err) {
            console.error("DB error:", err);
            return res.status(500).json({ message: "Database error" });
        }
        if (results.length === 0) {
            return res.status(404).json({ message: "No approved proposal found for this project" });
        }
        res.status(200).json({ message: "Found approved proposal", data: results[0] });
    });
};

module.exports = {
    addProgressBillList,
    getProgressBillList,
    getApprovedProposalByProject
}