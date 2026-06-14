const Resume = require("../models/resume");
const { extractText } = require("../utility/extractText");
const { analyzeResume, extractSkillsAI } = require("../services/geminiAI");
const {
    calculateSkillScore,
    calculateStructureScore,
    calculateContentScore,
    calculateATSScore,
    resolveRole,
    isValidRole,
    getSupportedRoles
} = require("../utility/atsScoring");
const fs = require("fs/promises");

exports.uploadResume = async (req, res) => {
    const file = req.file;
    const role = resolveRole(req.body.role);

    try {
        // 1. Validate role
        if (!role || !isValidRole(role)) {
            return res.status(400).json({
                success: false,
                message: `Invalid or missing role. Supported roles: ${getSupportedRoles().join(", ")}`
            });
        }

        // 2. Validate file
        if (!file) {
            return res.status(400).json({
                success: false,
                message: "No file uploaded",
            });
        }

        console.log("Processing resume for role:", role);

        const fileUrl = `/uploads/${file.filename}`;

        // 3. Extract text from file
        const text = await extractText(file.path, file.mimetype);

        // 4. Extract skills using AI
        let extractedSkills = [];
        try {
            extractedSkills = await extractSkillsAI(text);
        } catch (err) {
            console.error("AI Skill Extraction failed:", err.message);
            extractedSkills = [];
        }

        // 5. Calculate scores using the scoring engine
        const skillAnalysis = calculateSkillScore(role, extractedSkills);
        const structureScore = calculateStructureScore(text);
        const contentScore = calculateContentScore(text);
        const atsScore = calculateATSScore(skillAnalysis.score, structureScore, contentScore);

        // 6. Detailed AI Analysis (Feedback)
        let aiResult;
        try {
            aiResult = await analyzeResume(text);
        } catch (aiError) {
            console.error("AI feedback analysis failed:", aiError.message);
            aiResult = {
                topRoles: [role],
                missingSkills: skillAnalysis.missingSkills.slice(0, 5),
                briefAdvice: "Improve role-specific skills, resume structure, and measurable impact to increase your ATS score."
            };
        }

        // 7. Save to Database
        const savedResume = await Resume.create({
            fileName: file.originalname,
            fileURL: fileUrl,
            fileType: file.mimetype,
            fileSize: file.size,
            aiResult: aiResult,
            analysis: {
                structureScore: structureScore,
                contentScore: contentScore,
                skillScore: skillAnalysis.score,
                ATSscore: atsScore,
                matchedSkills: skillAnalysis.matchedSkills,
                missingSkills: skillAnalysis.missingSkills,
                extractedSkills: extractedSkills
            }
        });

        // 8. Respond to client
        return res.status(200).json({
            success: true,
            message: "Resume analyzed successfully",
            id: savedResume._id,
            fileURL: fileUrl,
            ATSscore: atsScore,
            ATSbreakDown: {
                skillScore: Math.round(skillAnalysis.score),
                structureScore: structureScore,
                contentScore: contentScore,
            },
            matchedSkills: skillAnalysis.matchedSkills,
            missingSkills: skillAnalysis.missingSkills,
            extractedSkills: extractedSkills,
            aiResult: aiResult
        });

    } catch (error) {
        console.error("Controller Error:", error);

        // Cleanup uploaded file if an error occurs
        if (file && file.path) {
            try {
                await fs.unlink(file.path);
            } catch (err) {
                console.error("File cleanup failed:", err);
            }
        }

        return res.status(500).json({
            success: false,
            message: "Something went wrong during resume processing",
            error: error.message
        });
    }
};