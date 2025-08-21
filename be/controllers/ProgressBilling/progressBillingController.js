const db = require("./../../config/db");

const addProgressBillList = async (req, res) => {
  const {
    proposal_id,
    subject,
    billing_no,
    billing_date,
    status,
    revision,
    user_id,
    notes,
    previous_billing_id,
  } = req.body;

  if (!proposal_id || user_id == null) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  const insertSql = `
        INSERT INTO progress_billing
        (proposal_id, subject, billing_date, status, revision, user_id, billing_no, notes)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

  db.query(
    insertSql,
    [proposal_id, subject, billing_date, status, revision, user_id, billing_no, notes],
    (err, results) => {
      if (err) {
        console.error("❌ Failed to add progress billing list!", err);
        return res.status(500).json({ message: "Server Error", error: err });
      }

      const new_billing_id = results.insertId;

      if (!previous_billing_id) {
        // ✅ No previous billing; just return
        return res.status(200).json({
          message: "✅ Progress billing added (no accomplishments copied)",
          billing_id: new_billing_id,
        });
      }

      // ✅ Copy accomplishments from previous billing
      const copyAccomplishmentsSql = `
                INSERT INTO progress_accomplishments (billing_id, sow_proposal_id, percent_previous, percent_present)
                SELECT ?, sow_proposal_id, (percent_previous + percent_present), 0
                FROM progress_accomplishments
                WHERE billing_id = ?
            `;

      db.query(copyAccomplishmentsSql, [new_billing_id, previous_billing_id], (copyErr, copyResult) => {
        if (copyErr) {
          console.error("❌ Failed to copy previous accomplishments!", copyErr);
          return res.status(500).json({
            message: "Billing added but failed to copy accomplishments",
            error: copyErr,
            billing_id: new_billing_id,
          });
        }

        return res.status(200).json({
          message: "✅ Progress billing and accomplishments copied successfully!",
          billing_id: new_billing_id,
        });
      });
    }
  );
};


// ✅ fetch billings by project_id instead of proposal_id
const getProgressBillList = async (req, res) => {
  const { project_id } = req.params;

  const sql = `
        SELECT 
            pb.billing_id,
            pb.subject,
            pb.billing_date,
            pb.notes,
            pb.billing_no,
            pb.status,
            pb.proposal_id,
            u.full_name AS evaluated_by,
            p.proposal_title,
            pr.project_name
        FROM progress_billing pb
        JOIN users u ON pb.user_id = u.user_id
        JOIN final_estimation_summary fes ON pb.proposal_id = fes.proposal_id
        JOIN proposals p ON fes.proposal_id = p.proposal_id
        JOIN projects pr ON p.project_id = pr.project_id
        WHERE pr.project_id = ?
        ORDER BY pb.billing_date ASC
    `;

  db.query(sql, [project_id], (err, results) => {
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
      WITH items AS (
        SELECT 
          sp.sow_proposal_id,
          swi.item_title,
          swt.type_name,
          uom.unitCode AS unit,
          IFNULL(fed.amount, 0) AS amount,
          rt.rebar_overall_weight,
        CASE 
  WHEN swt.work_type_id = 39 THEN IFNULL(rt.rebar_overall_weight, 0)
  ELSE IFNULL(qpt.total_with_allowance, 0)
END AS quantity,

          qpt.total_with_allowance,
          qpt.total_value,
          swt.sequence_order AS wt_order,
          swi.sequence_order AS item_order
FROM progress_billing pb
JOIN sow_proposal sp ON sp.proposal_id = pb.proposal_id
LEFT JOIN sow_work_items swi ON sp.work_item_id = swi.work_item_id
LEFT JOIN sow_work_types swt ON swi.work_type_id = swt.work_type_id
LEFT JOIN unit_of_measure uom ON swi.unitID = uom.unitID

        LEFT JOIN final_estimation_details fed ON fed.sow_proposal_id = sp.sow_proposal_id
        LEFT JOIN qto_parent_totals qpt ON qpt.sow_proposal_id = sp.sow_proposal_id
        LEFT JOIN rebar_totals rt ON rt.sow_proposal_id = sp.sow_proposal_id
        WHERE pb.billing_id = ?
      )
      SELECT 
        *,
ROUND((IFNULL(amount,0) / SUM(IFNULL(amount,0)) OVER ()) * 100, 6) AS wt_percent
      FROM items
      ORDER BY wt_order, item_order
      `,
      [billing_id],
      (err, rows) => {
        if (err) {
          console.error("❌ MySQL Error:", err);
          return res.status(500).json({ message: "Server error" });
        }

        const totalWt = rows.reduce((sum, r) => sum + parseFloat(r.wt_percent || 0), 0);
        const roundedTotal = Math.round(totalWt * 1000000) / 1000000;

        if (Math.abs(roundedTotal - 100) < 0.0001) {
          console.log(`✅ Total wt_percent is approximately 100%: ${roundedTotal}`);
        } else {
          console.warn(`⚠️ Total wt_percent is NOT 100%: ${roundedTotal}`);
        }

        res.json(rows);
      }
    );
  } catch (err) {
    console.error("❌ Unexpected Error:", err);
    res.status(500).json({ message: "Server exception" });
  }
};



const saveProgressAccomp = (req, res) => {
  const { billing_id, sow_proposal_id, percent_present, percent_previous } = req.body;

  if (
    billing_id == null ||
    sow_proposal_id == null ||
    percent_present == null ||
    percent_previous == null
  ) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  const query = `
    INSERT INTO progress_accomplishments 
      (billing_id, sow_proposal_id, percent_present, percent_previous)
    VALUES (?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE 
      percent_present = VALUES(percent_present),
      percent_previous = VALUES(percent_previous)
  `;

  db.query(
    query,
    [billing_id, sow_proposal_id, percent_present, percent_previous],
    (err, results) => {
      if (err) {
        console.error("DB Error:", err);
        return res.status(500).json({ message: "Failed to save accomplishment" });
      }

      return res.status(200).json({
        message: "Accomplishment saved (inserted or updated)",
        data: results,
      });
    }
  );
};



const getProgressAccomp = (req, res) => {
  const { billing_id } = req.params;

  const sql =
    `SELECT
  sow_proposal_id,
  percent_previous,
  percent_present
  FROM
  progress_accomplishments
  WHERE billing_id = ?

  `;

  db.query(sql, [billing_id], (err, results) => {
    if (err) {
      console.error("DB Error:", err);
      return res.status(500).json({ message: "Progress Accomp failed to fetched" });
    }
    return res.status(200).json({
      message: "Progress Accomp fetched successfully",
      data: results,
    });
  });
};





const addAccompLogs = (req, res) => {
  console.log("📥 Incoming request body:", req.body);

  const { billing_id, sow_proposal_id, percent_present, user_id, note, week_no } = req.body;


  if (!billing_id || !sow_proposal_id || !percent_present || user_id == null) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  const query = `
  INSERT INTO progress_accomplishment_logs
  (billing_id, sow_proposal_id, percent_present, user_id, note, week_no)
  VALUES(?,?,?,?,?,?)
  `;

  db.query(query, [billing_id, sow_proposal_id, percent_present, user_id, note, week_no], (err, results) => {
    if (err) {
      console.error("DB Error: ", err);
      return res.status(500).json({ message: "Failed to insert accomp logs" });
    }
    return res.status(200).json({ message: "Accomplishment Logs Inserted Successfully", data: results });
  });
};





module.exports = {
  addProgressBillList,
  getProgressBillList,
  getApprovedProposalByProject,
  copyProgressBilling,
  getFinalEstimationSummary,
  saveProgressAccomp,


  getProgressAccomp,
  addAccompLogs
}