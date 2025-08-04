const db = require("../config/db");

exports.submitInspectionReport = async (req, res) => {
    try {

        const { project_id, report_date, inspectorID, inspector, checklist } = req.body;

        // Validate required fields
        if (!project_id) {
            return res.status(400).json({ message: "Missing project_id." });
        }
        if (!report_date) {
            return res.status(400).json({ message: "Missing report_date." });
        }
        if (!inspectorID) {
            return res.status(400).json({ message: "Missing inspector ID." });
        }
        if (!checklist || !Array.isArray(checklist) || checklist.length === 0) {
            return res.status(400).json({ message: "Checklist must be a non-empty array." });
        }

        // 1. Insert into checklist_inspection_reports
        const reportResult = await db.query(
            "INSERT INTO checklist_inspection_reports (project_id, report_date, inspection_by_user_id) VALUES (?, ?, ?)",
            [project_id, report_date, inspectorID]
        );
        const reportId = reportResult.insertId;

      // 2. Prepare checklist data entries
const dataEntries = [];

checklist.forEach(section => {
    if (section.items && Array.isArray(section.items)) {
        section.items.forEach(item => {
            if (item.id) {
                dataEntries.push([
                    reportId,         // report_id
                    item.id,          // data_id
                    item.response || '',      // remarks
                    item.actionRequired || '' // action
                ]);
            }
        });
    }
});

if (dataEntries.length === 0) {
    return res.status(400).json({ message: "No checklist items to insert." });
}

// 3. Bulk insert checklist responses
await db.query(
    "INSERT INTO checklist_inspection_entries (report_id, data_id, remarks, action) VALUES ?",
    [dataEntries]
);

        res.status(201).json({ message: "Inspection report submitted successfully." });

    } catch (err) {
        console.error("Error submitting inspection report:", err);
        res.status(500).json({ message: "Server error" });
    }
};