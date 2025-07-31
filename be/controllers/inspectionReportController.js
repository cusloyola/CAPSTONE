const db = require("../config/db");

exports.submitInspectionReport = async (req, res) => {
    try {
        // Log the request body for debugging
        console.log("Request body:", req.body);

        const { project_name, report_date, inspector, checklist } = req.body;

        // Validate required fields with specific messages
        if (!project_name) {
            return res.status(400).json({ message: "Missing project_name." });
        }
        if (!report_date) {
            return res.status(400).json({ message: "Missing report_date." });
        }
        if (!inspector) {
            return res.status(400).json({ message: "Missing inspector." });
        }
        if (!checklist) {
            return res.status(400).json({ message: "Missing checklist." });
        }

        // Ensure checklist is an array
        let checklistArray = checklist;
        if (!Array.isArray(checklistArray) && checklistArray && Array.isArray(checklistArray.checklist)) {
            checklistArray = checklistArray.checklist;
        }
        if (!Array.isArray(checklistArray) || checklistArray.length === 0) {
            return res.status(400).json({ message: "Checklist must be a non-empty array." });
        }

        // 1. Get project_id and inspector_id
        const [projectRows] = await db.query(
            "SELECT project_id FROM projects WHERE project_name = ?",
            [project_name]
        );
        const [inspectorRows] = await db.query(
            "SELECT user_id FROM users WHERE full_name = ?",
            [inspector]
        );
        if (!projectRows.length) {
            return res.status(400).json({ message: "Invalid project." });
        }
        if (!inspectorRows.length) {
            return res.status(400).json({ message: "Invalid inspector." });
        }
        const projectId = projectRows[0].project_id;
        const inspectorId = inspectorRows[0].user_id;

        // 2. Insert into checklist_inspection_reports
        const [reportResult] = await db.query(
            "INSERT INTO checklist_inspection_reports (project_id, report_date, inspection_by_user_id) VALUES (?, ?, ?)",
            [projectId, report_date, inspectorId]
        );
        const reportId = reportResult.insertId;

        // 3. Insert all checklist responses
        const dataEntries = [];
        checklistArray.forEach(section => {
            if (section.items && Array.isArray(section.items)) {
                section.items.forEach(item => {
                    if (item.id) {
                        dataEntries.push([
                            item.data_id,
                            reportId,
                            item.response || '',
                            item.actionRequired || ''
                        ]);
                    }
                });
            }
        });

        if (dataEntries.length === 0) {
            return res.status(400).json({ message: "No checklist items to insert." });
        }

        // Bulk insert checklist data entries
        // Note: MySQL expects [ [row1], [row2], ... ] for VALUES ?
        await db.query(
            "INSERT INTO checklist_data_entries (data_id, report_id, response, action_required) VALUES ?",
            [dataEntries]
        );

        res.status(201).json({ message: "Inspection report submitted successfully." });
    } catch (err) {
        console.error("Error submitting inspection report:", err);
        res.status(500).json({ message: "Server error" });
    }
};