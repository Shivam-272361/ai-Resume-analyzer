const { GoogleGenerativeAI } = require("@google/generative-ai");
const OpenAI = require("openai");
require("dotenv").config();

// Initialize SDKs dynamically based on what keys are present
const genAI = process.env.GEMINI_API_KEY ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY) : null;

const groq = process.env.GROQ_API_KEY ? new OpenAI({
    apiKey: process.env.GROQ_API_KEY,
    baseURL: "https://api.groq.com/openai/v1"
}) : null;

const openai = process.env.OPENAI_API_KEY ? new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
}) : null;

// List of providers to attempt in order
const providers = [
    {
        name: "Gemini",
        active: () => !!genAI,
        run: async (prompt) => {
            const models = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-2.5-flash-lite", "gemini-3.1-flash-lite"];
            let lastErr;
            for (const modelName of models) {
                try {
                    console.log(`[AI] Attempting Gemini model: ${modelName}`);
                    const model = genAI.getGenerativeModel({
                        model: modelName,
                        generationConfig: {
                            responseMimeType: "application/json",
                            temperature: 0.4
                        }
                    });
                    const result = await model.generateContent(prompt);
                    return result.response.text();
                } catch (err) {
                    console.warn(`[AI] Gemini ${modelName} failed: ${err.message}`);
                    lastErr = err;
                }
            }
            throw lastErr;
        }
    },
    {
        name: "Groq",
        active: () => !!groq,
        run: async (prompt) => {
            const models = ["llama-3.3-70b-specdec", "llama-3.1-8b-instant", "mixtral-8x7b-32768", "gemma2-9b-it"];
            let lastErr;
            for (const modelName of models) {
                try {
                    console.log(`[AI] Attempting Groq model: ${modelName}`);
                    const response = await groq.chat.completions.create({
                        model: modelName,
                        messages: [{ role: "user", content: prompt }],
                        response_format: { type: "json_object" },
                        temperature: 0.4
                    });
                    return response.choices[0].message.content;
                } catch (err) {
                    console.warn(`[AI] Groq ${modelName} failed: ${err.message}`);
                    lastErr = err;
                }
            }
            throw lastErr;
        }
    },
    {
        name: "OpenAI",
        active: () => !!openai,
        run: async (prompt) => {
            try {
                console.log(`[AI] Attempting OpenAI model: gpt-4o-mini`);
                const response = await openai.chat.completions.create({
                    model: "gpt-4o-mini",
                    messages: [{ role: "user", content: prompt }],
                    response_format: { type: "json_object" },
                    temperature: 0.4
                });
                return response.choices[0].message.content;
            } catch (err) {
                console.warn(`[AI] OpenAI failed: ${err.message}`);
                throw err;
            }
        }
    }
];

const generateContentWithFallback = async (prompt) => {
    let lastError;
    for (const provider of providers) {
        if (provider.active()) {
            try {
                const responseText = await provider.run(prompt);
                console.log(`[AI] Success using provider: ${provider.name}`);
                return responseText;
            } catch (error) {
                console.warn(`[AI] Provider ${provider.name} failed entirely.`);
                lastError = error;
            }
        }
    }
    throw lastError || new Error("No active AI providers available or all failed.");
};

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

        const responseText = await generateContentWithFallback(prompt);
        return JSON.parse(responseText);

    } catch (error) {
        console.error("AI Analysis Error:", error);
        throw new Error("Failed to process resume with AI");
    }
};

exports.extractSkillsAI = async (resumeText) => {
    try {
        const prompt = `You are a precise resume parser.

Extract ONLY technical and professional skills explicitly mentioned in the resume.

Rules:
- Include programming languages, frameworks, tools, databases, libraries, and technologies
- Do NOT include soft skills (e.g., communication, leadership, teamwork)
- Do NOT guess or infer anything not written
- Normalize skills to lowercase
- Remove duplicates
- Keep skill names short and standard (e.g., "javascript", not "advanced javascript programming")

Return ONLY valid JSON in this format:
{
  "skills": ["skill1", "skill2", "skill3"]
}
RESUME TEXT:
${resumeText}`;

        const responseText = await generateContentWithFallback(prompt);
        const parsed = JSON.parse(responseText);

        return parsed.skills || [];

    } catch (error) {
         console.error("AI Analysis Error:", error);
        throw new Error("Failed to process resume with AI");
    }
}

