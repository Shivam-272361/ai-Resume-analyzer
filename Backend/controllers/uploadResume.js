const Resume = require("../models/resume");
const { extractText } = require("../utility/extractText");
const { analyzeResume } = require("../services/geminiAI");
const fs = require("fs/promises");

exports.uploadResume = async (req, res) => {
    const file = req.file;

    try {
        if (!file) {
            return res.status(400).json({
                success: false,
                message: "No file uploaded",
            });
        }

        console.log("Uploading:", file.originalname);

        const fileUrl = `/uploads/${file.filename}`;

        const text = await extractText(file.path, file.mimetype);
        const aiResult = await analyzeResume(text);

        const savedResume = await Resume.create({
            fileName: file.originalname,
            fileURL: fileUrl,
            fileType: file.mimetype,
            fileSize: file.size,
            extractedText: text,
            aiResult: aiResult,
        });

        

        return res.status(200).json({
            success: true,
            message: "Resume saved successfully",
            id: savedResume._id,
            fileURL: fileUrl,
            fileType: file.mimetype,
            aiResult: aiResult,
            expiresAt: savedResume.expiresAt
        });

    } catch (error) {
        console.log(error);

        // cleanup uploaded file if something fails
        if (file?.path) {
            try {
                await fs.unlink(file.path);
            } catch { }
        }

        return res.status(500).json({
            success: false,
            message: "Something went wrong during resume processing",
        });
    }
};