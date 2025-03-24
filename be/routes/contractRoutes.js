const express = require("express");
const multer = require("multer");
const fs = require("fs").promises; // Use the promises API
const { generateContract } = require("../controllers/contractController");

const router = express.Router();
const upload = multer(); // Handles form data without file uploads

// 🔹 API: Generate Contract and Download
router.post("/generate", upload.none(), async (req, res) => {
    try {
        const {
            employee_name,
            project_name,
            project_location,
            position,
            start_date,
            end_date,
            salary,
        } = req.body;

        // Validate required fields early
        if (!employee_name || !project_name || !position) {
            return res.status(400).json({ error: "Missing required contract details (employee_name, project_name, position)." });
        }

        const contractData = {
            employee_name,
            project_name,
            project_location,
            position,
            start_date,
            end_date,
            salary,
            contract_date: new Date().toISOString().split("T")[0], // YYYY-MM-DD
        };

        console.log("🔹 Generating Contract with Data:", contractData);

        // Generate contract document
        const { outputPath, fileName } = await generateContract(contractData);

        if (!outputPath || !fileName) {
            throw new Error("Contract generation failed. No file generated.");
        }

        console.log(`✅ Contract generated: ${fileName}`);

        // Set response headers
        res.setHeader("Content-Disposition", `attachment; filename*=UTF-8''${encodeURIComponent(fileName)}`);
        res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.wordprocessingml.document");

        // Send file and ensure cleanup
        res.download(outputPath, fileName, async (err) => {
            if (err) {
                console.error("❌ Error sending file:", err);
                return res.status(500).send("Failed to download contract.");
            }

            console.log(`🗑️ Deleting file after download: ${outputPath}`);
            
            // Cleanup: Delete file after sending, regardless of errors
            try {
                await fs.unlink(outputPath);
                console.log("✅ File deleted successfully.");
            } catch (unlinkErr) {
                console.error("❌ Error deleting file:", unlinkErr);
            }
        });

    } catch (error) {
        console.error("❌ Error:", error.message);
        res.status(500).json({ error: error.message || "Failed to generate contract." });
    }
});

module.exports = router;
