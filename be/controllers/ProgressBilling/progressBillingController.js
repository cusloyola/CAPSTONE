const db = require("./../../config/db");

const addProgressBillList = async (req, res) => {
    const { proposal_id, subject, billing_no, billing_date, status, revision, user_id, notes } = req.body;

    if (!proposal_id || user_id == null) {
        return res.status(400).json({ message: "Missing required fields" });
    }


    const insertSql = `
            INSERT INTO progress_billing
            (proposal_id, subject, billing_date, status, revision, user_id, billing_no, notes)
            VALUES (?, ?, ?, ?, ?, ?, ?,?)
        `;

    db.query(
        insertSql,
        [proposal_id, subject, billing_date, status, revision, user_id, billing_no, notes],
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
    pb.notes,
    pb.billing_no,
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
        if (err) {
            console.error("Failed to get progress billing list!", err);
            return res.status(500).json({ message: "Failed to fetch progress billings" });
        }
        return res.status(200).json({ message: "Progress Billing List Fetched!", data: results });
    });

};

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


const copyProgressBilling = (req, res) => {
    const { billing_id } = req.params;

    const getSql = `SELECT * FROM progress_billing WHERE billing_id = ?`;
    db.query(getSql, [billing_id], (err, results) => {
        if (err || results.length === 0) {
            return res.status(404).json({ message: "Billing not found" });
        }

        const original = results[0];

        // Step 1: Count existing copies
        const baseBillingNo = original.billing_no.replace(/-copy(-\d+)?$/, '');
        const countSql = `SELECT COUNT(*) AS count FROM progress_billing WHERE billing_no LIKE ?`;
        const likePattern = `${baseBillingNo}-copy%`;

        db.query(countSql, [likePattern], (countErr, countResults) => {
            if (countErr) {
                console.error("Count failed:", countErr);
                return res.status(500).json({ message: "Failed to count copies" });
            }

            const copyCount = countResults[0].count;
            const newBillingNo = `${baseBillingNo}-copy-${copyCount + 1}`;

            const insertSql = `
                INSERT INTO progress_billing 
                (proposal_id, subject, billing_date, status, revision, user_id, billing_no, notes)
                VALUES ( ?, ?, ?, ?, ?, ?, ?, ?)
            `;

            const values = [
                original.proposal_id,
                original.subject + " (Copy)",
                new Date().toISOString().split("T")[0],
                "Draft",
                original.revision,
                original.user_id,
                newBillingNo,
                original.notes || "",
            ];

            db.query(insertSql, values, (insertErr, result) => {
                if (insertErr) {
                    console.error("Copy failed:", insertErr);
                    return res.status(500).json({ message: "Failed to create copy" });
                }
                return res.status(200).json({ message: "Copy created", data: result });
            });
        });
    });
};

const getFinalEstimationSummary = async (req, res) => {
  const { billing_id } = req.params;

  try {
    db.query(
      `
      SELECT 
        sp.sow_proposal_id,
        swi.item_title,
        swt.type_name,
        uom.unitCode AS unit,
        fed.amount,
        fes.grand_total,

        rt.rebar_overall_weight,

        CASE 
          WHEN swt.work_type_id = 39 THEN IFNULL(rt.rebar_overall_weight, 0)
          ELSE IFNULL(qpt.total_with_allowance, 0)
        END AS quantity,

        qpt.total_with_allowance,
        qpt.total_value

      FROM progress_billing pb
      JOIN final_estimation_summary fes 
        ON pb.proposal_id = fes.proposal_id
      JOIN sow_proposal sp 
        ON sp.proposal_id = pb.proposal_id
      JOIN sow_work_items swi 
        ON sp.work_item_id = swi.work_item_id
      JOIN sow_work_types swt 
        ON swi.work_type_id = swt.work_type_id
      JOIN unit_of_measure uom 
        ON swi.unitID = uom.unitID
      JOIN final_estimation_details fed 
        ON fed.sow_proposal_id = sp.sow_proposal_id
      LEFT JOIN qto_parent_totals qpt 
        ON qpt.sow_proposal_id = sp.sow_proposal_id
      LEFT JOIN rebar_totals rt 
        ON rt.sow_proposal_id = sp.sow_proposal_id

      WHERE pb.billing_id = ?
      ORDER BY swt.sequence_order, swi.sequence_order
      `,
      [billing_id],
      (err, rows) => {
        if (err) {
          console.error("❌ MySQL Error:", err);
          return res.status(500).json({ message: "Server error" });
        }

        console.log("✅ Final Estimation Summary Rows:", rows.length);
        console.table(rows);
        res.json(rows);
      }
    );
  } catch (err) {
    console.error("❌ Unexpected Error:", err);
    res.status(500).json({ message: "Server exception" });
  }
};


module.exports = {
    addProgressBillList,
    getProgressBillList,
    getApprovedProposalByProject,
    copyProgressBilling,
    getFinalEstimationSummary
}