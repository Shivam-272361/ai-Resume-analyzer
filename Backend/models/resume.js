const mongoose = require("mongoose");

const resumeSchema = new mongoose.Schema({
    fileName: {
        type: String,
        required: true,
    },
    filePath: {
        type: String,
        required: true,
    },
    fileType: {
        type: String,
    },
    extractedText: {
        type: String,
        required: true,
    },
    aiResult: {
    topRoles: [String],
    missingSkills: [String],
    briefAdvice: String
    }
},
    {
       
        timestamps: true
    }
)
const Resume = mongoose.model("Resume",resumeSchema);
module.exports = Resume ;