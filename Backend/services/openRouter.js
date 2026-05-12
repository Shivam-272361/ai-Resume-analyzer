const OpenAI = require("openai");
require("dotenv").config();

const openrouter = new OpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: process.env.OPENROUTER_API_KEY,
});

exports.analyzeResume = async (resumeText) => {
    try {

        const completion = await openrouter.chat.completions.create({
            model: "deepseek/deepseek-chat:free",

            messages: [
                {
                    role: "system",
                    content: `
You are an expert career advisor.

Analyze the resume text below and perform the following:

1. Identify the TOP 3 most relevant job roles based ONLY on the candidate's skills and experience.
2. Identify 3-5 important skills or tools the candidate is missing.
3. Provide one short professional advice sentence.

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
                    `
                },

                {
                    role: "user",
                    content: resumeText,
                }
            ],

            temperature: 0.4,
            max_tokens: 500,
        });

        const responseText = completion.choices[0].message.content;

        return JSON.parse(responseText);

    } catch (error) {
        console.error("OpenRouter Analysis Error:", error);

        throw new Error("Failed to process resume with AI");
    }
};

exports.extractSkillsAI = async (resumeText) => {
    try {

        const completion = await openrouter.chat.completions.create({
            model: "deepseek/deepseek-chat:free",

            messages: [
                {
                    role: "system",
                    content: `
You are a precise resume parser.

Extract ONLY technical and professional skills explicitly mentioned in the resume.

Rules:
- Include programming languages, frameworks, tools, databases, libraries, and technologies
- Do NOT include soft skills
- Do NOT guess or infer anything not written
- Normalize skills to lowercase
- Remove duplicates
- Keep skill names short and standard

Return ONLY valid JSON in this format:
{
  "skills": ["skill1", "skill2", "skill3"]
}
                    `
                },

                {
                    role: "user",
                    content: resumeText,
                }
            ],

            temperature: 0.2,
            max_tokens: 300,
        });

        const responseText = completion.choices[0].message.content;

        return JSON.parse(responseText);

    } catch (error) {
        console.error("OpenRouter Skills Extraction Error:", error);

        throw new Error("Failed to process resume with AI");
    }
};