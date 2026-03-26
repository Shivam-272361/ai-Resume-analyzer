const Resume = require("../models/resume");
const { extractText } = require("../utility/extractText");
const { analyzeResume, extractSkillsAI , calculateToneScore } = require("../services/geminiAI");
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
    const role = req.body.role;

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
        const skillResponse = await extractSkillsAI(text);
        const extractedSkills = skillResponse.skills || [];

        const normalizedExtracted = extractedSkills.map(normalizeSkill);

        // 🔹 Calculate skill score
        const requiredSkills = roleSkills[role];
        const skillAnalysis = checkSkillScore(requiredSkills, normalizedExtracted);

        let structureScore = 0;

        if (text.toLowerCase().includes("education")) structureScore += 25;
        if (text.toLowerCase().includes("experience")) structureScore += 25;
        if (text.toLowerCase().includes("skills")) structureScore += 25;

        const hasBullets = /•|-|\*/.test(text);
        if (hasBullets) structureScore += 10;

        const contentScore = calculateContentScore(text);



        // 🔹 Optional: your existing AI analysis
        const aiResult = await analyzeResume(text);
        
        const toneScore = 100;;
        const overallScore =
            0.3 * skillAnalysis.score +
            0.25 * contentScore +
            0.25 * structureScore +
            0.2 * toneScore;

        // 🔹 Save to DB
        const savedResume = await Resume.create({
            fileName: file.originalname,
            fileURL: fileUrl,
            fileType: file.mimetype,
            fileSize: file.size,
            extractedText: text,
            aiResult: aiResult,
            analysis: {
                skillScore: skillAnalysis.score,
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
            skillScore: skillAnalysis.score,
            structureScore: structureScore,
            contentScore: contentScore,
            toneScore:toneScore,
            overallScore : overallScore,
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