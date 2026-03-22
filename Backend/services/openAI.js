const OpenAI = require("openai");
require('dotenv').config();

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

exports.analyzeResume = async (resumeText) => {
    try {
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

        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                { role: "user", content: prompt }
            ],
            temperature: 0.2
        });

        return response.choices[0].message.content;

    } catch (error) {
        console.error("AI Error:", error);
        throw new Error("AI analysis failed");
    }
};