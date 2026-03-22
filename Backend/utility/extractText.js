const fs = require('fs').promises;
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');

exports.extractText = async (filePath, mimetype) => {
    try {
        if (mimetype === 'application/pdf') {
            const dataBuffer = await fs.readFile(filePath);
            const data = await pdfParse(dataBuffer);
            return data.text.trim();
        } 
        else if (mimetype === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
            const result = await mammoth.extractRawText({ path: filePath });
            return result.value.trim();
        }

        throw new Error("Unsupported file type: " + mimetype);

    } catch (error) {
        console.error("Extraction Error:", error);
        throw new Error("Failed to extract text from file.");
    }
};