const Resume = require("../models/resume");
const { extractText } = require("../utility/extractText");
const {analyzeResume} = require("../services/geminiAI")

exports.uploadResume = async (req, res) => {
    try {
        console.log("START");

        const file = req.file;
        console.log("File info:", file);

        if (!file) {
            return res.status(400).json({
                success: false,
                message: "No file uploaded",
            });
        }
        const text = await extractText(file.path,file.mimetype);
        console.log(file.mimetype);

        const aiResult = await analyzeResume(text);

        console.log("AI RESULT:", aiResult);

        const savedResume = await Resume.create({
            fileName: file.originalname,
            filePath: file.path,
            fileType: file.mimetype,
            fileSize: file.size,
            extractedText: text,
            aiResult : aiResult,
        })



        return res.status(200).json({
            success: true,
            message: "Resume saved successfully",
            id: savedResume._id,
            ai: aiResult
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Something went wrong during resume processing"
        });
    }
};