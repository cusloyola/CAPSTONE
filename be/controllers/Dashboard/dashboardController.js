const db = require("./../../config/db");

const dashboardLineGraph = (req, res) => {
    // calculate a cumulative sum for the line graph
    const query = `
        WITH MonthlyProgress AS (
            SELECT 
                prj.project_name,
                DATE_FORMAT(pb.billing_date, '%Y-%m') AS billing_month,
                ROUND(SUM(
                    COALESCE(pa.percent_present, 0) 
                    * (fed.amount / totals.total_amount)
                ), 2) AS monthly_wt_accomp
            FROM progress_billing pb
            JOIN proposals p ON pb.proposal_id = p.proposal_id
            JOIN projects prj ON p.project_id = prj.project_id
            JOIN sow_proposal sp ON sp.proposal_id = pb.proposal_id
            JOIN final_estimation_details fed ON fed.sow_proposal_id = sp.sow_proposal_id
            
            -- Get total amount for normalization
            JOIN (
                SELECT 
                    sp.proposal_id,
                    SUM(fed.amount) AS total_amount
                FROM sow_proposal sp
                JOIN final_estimation_details fed ON fed.sow_proposal_id = sp.sow_proposal_id
                GROUP BY sp.proposal_id
            ) AS totals ON totals.proposal_id = pb.proposal_id
            
            LEFT JOIN progress_accomplishments pa 
                ON pa.billing_id = pb.billing_id 
                AND pa.sow_proposal_id = sp.sow_proposal_id
            
            WHERE prj.status = 'In Progress'
            GROUP BY prj.project_id, prj.project_name, billing_month
        )
        SELECT
            project_name,
            billing_month,
            SUM(monthly_wt_accomp) OVER (PARTITION BY project_name ORDER BY billing_month) AS wt_accomp_to_date
        FROM MonthlyProgress
        ORDER BY project_name, billing_month;
    `;

    console.log("📤 Executing dashboard line chart query...");

    db.query(query, (err, results) => {
        if (err) {
            console.error("❌ Dashboard line chart query error:", err);
            return res.status(500).json({ message: "Server error" });
        }

        console.log("✅ Dashboard query executed successfully.");
        console.log("📊 Query results:", results);

        return res.json(results);
    });
};

module.exports = {
    dashboardLineGraph,
};