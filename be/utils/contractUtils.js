const fs = require("fs").promises;
const path = require("path");
const PizZip = require("pizzip");
const DocxTemplater = require("docxtemplater");

// Ensure "generated/leave_contracts" directory exists
const generatedDir = path.join(__dirname, "../generated/leave_contracts");
fs.mkdir(generatedDir, { recursive: true }).catch(console.error);

// Function to load the leave contract template
const loadTemplate = async () => {
    try {
        const templatePath = path.join(__dirname, "../templates/leave_template.docx");
        await fs.access(templatePath); // Ensure the template exists
        return await fs.readFile(templatePath, "binary");
    } catch (error) {
        console.error("Error loading leave contract template:", error.message);
        throw new Error("Leave contract template not found.");
    }
};

// Function to sanitize filenames to prevent invalid characters
const sanitizeFileName = (name) => {
    return name.replace(/[^a-zA-Z0-9_-]/g, "").trim() || "Employee";
};

// Function to generate a leave contract (DOCX)
const generateLeaveContractDocx = async (data) => {
    const content = await loadTemplate();
    const zip = new PizZip(content);

    try {
        const doc = new DocxTemplater(zip, { delimiters: { start: "{{", end: "}}" } });

        // Pass leave contract data to the template
        doc.setData(data);
        doc.render();

        const buffer = doc.getZip().generate({ type: "nodebuffer" });

        const employeeName = sanitizeFileName(data.employee_name);
        const fileName = `${employeeName}_Leave_Contract.docx`;
        const outputPath = path.join(generatedDir, fileName);

        await fs.writeFile(outputPath, buffer);

        return outputPath;
    } catch (error) {
        console.error("Error processing leave contract template:", error);
        throw new Error("Failed to generate leave contract.");
    }
};

// Placeholder function for PDF conversion
const convertToPDF = async (filePath) => {
    console.log("PDF conversion not implemented yet.");
    return filePath; // Return the same path for now
};

module.exports = { generateLeaveContractDocx, convertToPDF };
