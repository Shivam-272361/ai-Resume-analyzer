const mongoose = require("mongoose");

const resumeSchema = new mongoose.Schema({
    fileName: {
        type: String,
        required: true,
    },
    fileURL: {
        type: String,
        required: true,
    },
    fileType: {
        type: String,
    },
    extractedText: {
        type: String,
    },
    aiResult: {
        topRoles: [String],
        missingSkills: [String],
        briefAdvice: String
    },
    expiresAt: {
        type: Date,
        default: () => new Date(Date.now() + 24 * 60 * 60 * 1000),
        index: { expires: 0 }
    }
},
    {

        timestamps: true
    }
)
const Resume = mongoose.model("Resume", resumeSchema);
module.exports = Resume;