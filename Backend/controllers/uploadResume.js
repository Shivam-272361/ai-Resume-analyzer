const Resume = require("../models/resume");
const { extractText } = require("../utility/extractText");
const { extractSkills } = require("../utility/skillExtractor");
const { analyzeResume } = require("../services/geminiAI");
const fs = require("fs/promises");


const normalizeSkill = (skill) => {
    return skill.toLowerCase()
        .replace(".js", "")
        .replace("apis", "api")
        .replace("api", "api")
        .trim();
};

// 🔹 Skill Score Function
const checkSkillScore = (requiredSkills, extractedSkills) => {
    const normalizedExtracted = extractedSkills.map(s => s.toLowerCase());

    const matched = requiredSkills.filter(skill =>
        normalizedExtracted.includes(skill.toLowerCase())
    );

    return {
        score: (matched.length / requiredSkills.length) * 100,
        matchedSkills: matched,
        missingSkills: requiredSkills.filter(skill =>
            !normalizedExtracted.includes(skill.toLowerCase())
        )
    };
};

const calculateContentScore = (text) => {

    const numberMatches = text.match(/\d+%|\d+/g) || [];
    const numberScore = Math.min(numberMatches.length * 5, 20);

    const actionMatches = text.match(/(developed|built|created|implemented|designed|optimized|led)/gi) || [];
    const actionScore = Math.min(actionMatches.length * 5, 20);

    let lengthScore = 0;
    if (text.length > 500) lengthScore = 5;
    if (text.length > 1000) lengthScore = 10;
    if (text.length > 1500) lengthScore = 15;


    const contentScore = actionScore + numberScore + lengthScore;

    return contentScore;
};

exports.uploadResume = async (req, res) => {
    const roleSkills = {
        frontend: ["html", "css", "javascript", "react", "redux"],
        backend: ["nodejs", "express", "mongodb", "apis", "sql"],
        fullstack: ["html", "css", "javascript", "react", "nodejs", "mongodb"],
        data: ["python", "sql", "excel", "pandas", "tableau"],
        ml: ["python", "machine learning", "tensorflow", "pytorch", "numpy"]
    };

    const file = req.file;
    const roleAliases = {
        ds: "data",
        datascience: "data",
        "data science": "data",
        machinelearning: "ml",
        "machine learning": "ml",
    };
    const requestedRole = String(req.body.role || "").trim().toLowerCase();
    const role = roleAliases[requestedRole] || requestedRole;

    try {
        // 🔴 Validate role
        if (!role || !roleSkills[role]) {
            return res.status(400).json({
                success: false,
                message: "Invalid or missing role"
            });
        }

        // 🔴 Validate file
        if (!file) {
            return res.status(400).json({
                success: false,
                message: "No file uploaded",
            });
        }

        console.log("Uploading:", file.originalname);

        const fileUrl = `/uploads/${file.filename}`;

        // 🔹 Extract text
        const text = await extractText(file.path, file.mimetype);

        // 🔹 Extract skills using AI
        const extractedSkills = extractSkills(text);

        const normalizedExtracted = extractedSkills.map(normalizeSkill);

        // 🔹 Calculate skill score
        const requiredSkills = roleSkills[role];
        const skillAnalysis = checkSkillScore(requiredSkills, normalizedExtracted);

        let structureScore = 0;

        const lowerText = text.toLowerCase();

        const sections = ["education", "experience", "skills", "projects"];

        sections.forEach(section => {
            if (lowerText.includes(section)) {
                structureScore += 20;
            }
        });

        if (/•|-|\*/.test(text)) structureScore += 20;
        const contentScore = calculateContentScore(text);



        // 🔹 Optional: your existing AI analysis
        let aiResult;
        try {
            aiResult = await analyzeResume(text);
        } catch (aiError) {
            console.error("AI analysis failed, falling back to default response:", aiError.message);
            aiResult = {
                topRoles: [role],
                missingSkills: skillAnalysis.missingSkills.slice(0, 5),
                briefAdvice: "Improve role-specific skills, resume structure, and measurable impact to increase your ATS score."
            };
        }

        const atsScore =
            0.5 * skillAnalysis.score +
            0.25 * contentScore +
            0.25 * structureScore

        // 🔹 Save to DB
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

        return res.status(200).json({
            success: true,
            message: "Resume analyzed successfully",
            id: savedResume._id,
            fileURL: fileUrl,
            ATSscore: atsScore,
            ATSbreakDown: {
                skillScore: skillAnalysis.score,
                structureScore: structureScore,
                contentScore: contentScore,
            },
            matchedSkills: skillAnalysis.matchedSkills,
            missingSkills: skillAnalysis.missingSkills,
            extractedSkills: extractedSkills,
            aiResult: aiResult,
            expiresAt: savedResume.expiresAt
        });

    } catch (error) {
        console.error(error);

        // 🔹 Cleanup uploaded file
        if (file?.path) {
            try {
                await fs.unlink(file.path);
            } catch (err) {
                console.error("File cleanup failed:", err);
            }
        }

        return res.status(500).json({
            success: false,
            message: "Something went wrong during resume processing",
            error: error
        });
    }
};
