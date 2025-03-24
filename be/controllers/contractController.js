const path = require("path");
const fs = require("fs").promises;
const { generateContractDocx, convertToPDF } = require("../utils/contractUtils");

// 🔹 Function: Generate Contract (DOCX)
const generateContract = async (contractData) => {
    try {
        // Generate DOCX contract
        const docxPath = await generateContractDocx(contractData);
        const fileName = path.basename(docxPath);

        return { outputPath: docxPath, fileName };
    } catch (error) {
        console.error("Error generating contract:", error);
        throw new Error("Failed to generate contract.");
    }
};

// 🔹 API: Download Contract (DOCX or PDF)
const downloadContract = async (req, res) => {
    try {
        const { fileName, format } = req.query;
        if (!fileName) {
            return res.status(400).json({ error: "File name is required." });
        }

        const filePath = path.join(__dirname, "../generated", fileName);

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
                return res.status(500).json({ error: "Failed to convert contract to PDF." });
            }
        }

        res.setHeader("Content-Disposition", `attachment; filename*=UTF-8''${encodeURIComponent(downloadName)}`);
        res.setHeader("Content-Type", format === "pdf" ? "application/pdf" : "application/vnd.openxmlformats-officedocument.wordprocessingml.document");

        res.download(downloadPath, downloadName, async (err) => {
            if (err) {
                console.error("Error sending file:", err);
                return res.status(500).send("Failed to download contract.");
            }

            // Cleanup: Delete generated files after sending
            try {
                await fs.unlink(filePath);
                if (format === "pdf") await fs.unlink(downloadPath);
            } catch (unlinkErr) {
                console.error("Error deleting file:", unlinkErr);
            }
        });
    } catch (error) {
        console.error("Error downloading contract:", error);
        res.status(500).json({ error: "Failed to download contract." });
    }
};

module.exports = { generateContract, downloadContract };
