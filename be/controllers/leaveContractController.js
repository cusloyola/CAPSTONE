const path = require("path");
const fs = require("fs").promises;
const { generateLeaveContractDocx, convertToPDF } = require("../utils/leaveContractUtils");
const leaveContractUtils = require("../utils/leaveContractUtils");

// Ensure function is correctly accessed
const generateLeaveContract = async (contractData) => {
    try {
        // ✅ Use leaveContractUtils to access the function
        const docxPath = await leaveContractUtils.generateLeaveContractDocx(contractData);
        const fileName = path.basename(docxPath);

        return { outputPath: docxPath, fileName };
    } catch (error) {
        console.error("Error generating leave contract:", error);
        throw new Error("Failed to generate leave contract.");
    }
};


// 🔹 API: Download Leave Contract (DOCX or PDF)
const downloadLeaveContract = async (req, res) => {
    try {
        const { fileName, format } = req.query;
        if (!fileName) {
            return res.status(400).json({ error: "File name is required." });
        }

        const filePath = path.join(__dirname, "../generated/leave_contracts", fileName);
        console.log("🔍 Checking File Path:", filePath);
        
        // Ensure file exists
        try {
            await fs.access(filePath);
        } catch {
            return res.status(404).json({ error: "File not found." });
        }

        let downloadPath = filePath;
        let downloadName = fileName;

        // Convert to PDF if requested
        if (format === "pdf") {
            try {
                downloadPath = await convertToPDF(filePath);
                downloadName = path.basename(downloadPath);
            } catch (conversionError) {
                console.error("PDF conversion error:", conversionError);
                return res.status(500).json({ error: "Failed to convert leave contract to PDF." });
            }
        }

        res.setHeader("Content-Disposition", `attachment; filename*=UTF-8''${encodeURIComponent(downloadName)}`);
        res.setHeader("Content-Type", format === "pdf" ? "application/pdf" : "application/vnd.openxmlformats-officedocument.wordprocessingml.document");

        res.download(downloadPath, downloadName, async (err) => {
            if (err) {
                console.error("Error sending file:", err);
                return res.status(500).send("Failed to download leave contract.");
            }

            // Cleanup: Delete generated files after sending
            // try {
            //     await fs.unlink(filePath);
            //     if (format === "pdf") await fs.unlink(downloadPath);
            // } catch (unlinkErr) {
            //     console.error("Error deleting file:", unlinkErr);
            // }
        });
    } catch (error) {
        console.error("Error downloading leave contract:", error);
        res.status(500).json({ error: "Failed to download leave contract." });
    }
};

module.exports = { generateLeaveContract, downloadLeaveContract };
