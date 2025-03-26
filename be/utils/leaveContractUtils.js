const fs = require("fs").promises;
const path = require("path");
const PizZip = require("pizzip");
const DocxTemplater = require("docxtemplater");

// Ensure directory exists
const generatedDir = path.join(__dirname, "../generated/leave_contracts");
fs.mkdir(generatedDir, { recursive: true }).catch(console.error);

// Function to sanitize file names
const sanitizeFileName = (name) => {
    return name.replace(/[^a-zA-Z0-9_-]/g, "").trim() || "Employee";
};

// Function to load the leave contract template
const loadTemplate = async () => {
    try {
        const templatePath = path.join(__dirname, "../templates/leave_template.docx");
        await fs.access(templatePath); // Ensure the file exists
        return await fs.readFile(templatePath, "binary");
    } catch (error) {
        console.error("Error loading template:", error.message);
        throw new Error("Leave contract template not found.");
    }
};

// Function to generate the leave contract document
const generateLeaveContractDocx = async (data) => {
    const content = await loadTemplate();
    const zip = new PizZip(content);

    try {
        const doc = new DocxTemplater(zip, { delimiters: { start: "{{", end: "}}" } });
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

// Placeholder for PDF conversion
const convertToPDF = async (filePath) => {
    console.log("PDF conversion not implemented yet.");
    return filePath; // Returning the same path for now
};

// ✅ Ensure correct export
module.exports = { generateLeaveContractDocx, convertToPDF };
