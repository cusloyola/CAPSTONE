const express = require("express");
const multer = require("multer");
const fs = require("fs").promises;
const { generateLeaveContract } = require("../controllers/leaveContractController");

const router = express.Router();
const upload = multer();

// 🔹 API: Generate Leave Contract and Download
router.post("/generate", upload.none(), async (req, res) => {
    try {
        const { employee_name, start_date, end_date, reason_for_leave } = req.body;

        // Validate required fields
        if (!employee_name || !start_date || !end_date || !reason_for_leave) {
            return res.status(400).json({ error: "Missing required leave contract details (employee_name, start_date, end_date, reason)." });
        }

        const leaveContractData = {
            employee_name,
            start_date,
            end_date,
            reason_for_leave,
            contract_date: new Date().toISOString().split("T")[0], // YYYY-MM-DD
        };

        console.log("🔹 Generating Leave Contract with Data:", leaveContractData);

        // Generate leave contract document
        const { outputPath, fileName } = await generateLeaveContract(leaveContractData);

        if (!outputPath || !fileName) {
            throw new Error("Leave contract generation failed. No file generated.");
        }

        console.log(`✅ Leave contract generated: ${fileName}`);

        // Set response headers
        res.setHeader("Content-Disposition", `attachment; filename*=UTF-8''${encodeURIComponent(fileName)}`);
        res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.wordprocessingml.document");

        // Send file and ensure cleanup
        res.download(outputPath, fileName, async (err) => {
            if (err) {
                console.error("❌ Error sending file:", err);
                return res.status(500).send("Failed to download leave contract.");
            }

            console.log(`🗑️ Deleting file after download: ${outputPath}`);

            // Cleanup: Delete file after sending
            try {
                await fs.unlink(outputPath);
                console.log("✅ File deleted successfully.");
            } catch (unlinkErr) {
                console.error("❌ Error deleting file:", unlinkErr);
            }
        });

    } catch (error) {
        console.error("❌ Error:", error.message);
        res.status(500).json({ error: error.message || "Failed to generate leave contract." });
    }
});

module.exports = router;
