const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

// Initialize the SDK with your API Key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

exports.analyzeResume = async (resumeText) => {
    try {

        const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash",
            generationConfig: {
                responseMimeType: "application/json",
                temperature: 0.4
            }
        });

        const prompt = `
You are an expert career advisor.

Analyze the resume text below and perform the following:

1. Identify the TOP 3 most relevant job roles based ONLY on the candidate's skills and experience.
2. Identify 3-5 important skills or tools the candidate is missing.
3. Provide one short professional advice sentence.

RESUME TEXT:
${resumeText}

IMPORTANT:
- Do NOT add extra explanation
- Do NOT hallucinate skills
- Return ONLY valid JSON

FORMAT:
{
  "topRoles": ["", "", ""],
  "missingSkills": ["", "", ""],
  "briefAdvice": ""
}
`;

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();

        return JSON.parse(responseText);

    } catch (error) {
        console.error("Gemini Analysis Error:", error);
        throw new Error("Failed to process resume with AI");
    }
};