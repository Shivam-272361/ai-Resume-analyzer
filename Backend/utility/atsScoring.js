/**
 * atsScoring.js
 * 
 * Comprehensive ATS (Applicant Tracking System) scoring engine.
 * Handles skill matching, structure analysis, content quality evaluation,
 * and final weighted ATS score calculation.
 */

// ─────────────────────────────────────────────
// ROLE DEFINITIONS
// ─────────────────────────────────────────────

const roleSkills = {
    frontend: {
        core: ["html", "css", "javascript", "react", "typescript"],
        bonus: ["redux", "tailwind", "next.js", "vue", "angular", "sass", "webpack", "vite", "figma", "responsive design", "jest", "cypress", "storybook", "graphql", "bootstrap", "material ui", "framer motion"]
    },
    backend: {
        core: ["nodejs", "express", "mongodb", "sql", "api", "docker"],
        bonus: ["postgresql", "redis", "graphql", "rabbitmq", "kafka", "nginx", "python", "java", "go", "microservices", "rest", "grpc", "prisma", "sequelize", "mongoose", "jest", "ci/cd", "kubernetes", "aws"]
    },
    fullstack: {
        core: ["html", "css", "javascript", "react", "nodejs", "mongodb", "express"],
        bonus: ["typescript", "next.js", "tailwind", "redux", "sql", "postgresql", "docker", "graphql", "git", "api", "aws", "firebase", "prisma", "jest", "ci/cd", "vercel"]
    },
    data: {
        core: ["python", "sql", "pandas", "numpy", "data visualization"],
        bonus: ["excel", "tableau", "powerbi", "r", "statistics", "jupyter", "matplotlib", "seaborn", "spark", "hadoop", "etl", "data cleaning", "data modeling", "bigquery", "snowflake", "airflow", "dbt"]
    },
    ml: {
        core: ["python", "machine learning", "tensorflow", "scikit-learn", "numpy"],
        bonus: ["pytorch", "keras", "pandas", "deep learning", "nlp", "computer vision", "opencv", "huggingface", "mlops", "mlflow", "docker", "jupyter", "statistics", "linear algebra", "feature engineering", "xgboost", "neural networks"]
    },
    devops: {
        core: ["docker", "kubernetes", "ci/cd", "linux", "aws", "terraform"],
        bonus: ["ansible", "jenkins", "github actions", "gitlab ci", "prometheus", "grafana", "nginx", "bash", "python", "azure", "gcp", "helm", "istio", "argocd", "cloudformation", "pulumi", "vault", "datadog"]
    },
    mobile: {
        core: ["react native", "javascript", "typescript", "mobile development"],
        bonus: ["flutter", "dart", "swift", "kotlin", "ios", "android", "expo", "firebase", "redux", "graphql", "rest api", "app store", "play store", "push notifications", "sqlite", "realm"]
    },
    android: {
        core: ["kotlin", "java", "android", "android studio", "xml"],
        bonus: ["jetpack compose", "retrofit", "room", "firebase", "mvvm", "dagger", "hilt", "coroutines", "gradle", "material design", "rest api", "sqlite", "play store", "git"]
    },
    ios: {
        core: ["swift", "xcode", "ios", "uikit", "swiftui"],
        bonus: ["objective-c", "cocoapods", "core data", "combine", "alamofire", "firebase", "mvvm", "storyboard", "auto layout", "testflight", "app store", "ci/cd", "git"]
    },
    cybersecurity: {
        core: ["network security", "linux", "python", "penetration testing", "firewalls"],
        bonus: ["ethical hacking", "siem", "ids/ips", "owasp", "burp suite", "wireshark", "metasploit", "nmap", "encryption", "compliance", "soc", "incident response", "vulnerability assessment", "bash", "powershell", "splunk", "kali linux"]
    },
    cloud: {
        core: ["aws", "azure", "gcp", "cloud computing", "linux"],
        bonus: ["docker", "kubernetes", "terraform", "serverless", "lambda", "s3", "ec2", "cloudformation", "vpc", "iam", "ci/cd", "networking", "load balancing", "cdn", "cloud security", "cost optimization"]
    },
    uiux: {
        core: ["figma", "user research", "wireframing", "prototyping", "usability testing"],
        bonus: ["sketch", "adobe xd", "invision", "design thinking", "information architecture", "interaction design", "accessibility", "responsive design", "design systems", "user personas", "a/b testing", "heuristic evaluation", "miro", "typography", "color theory"]
    },
    qa: {
        core: ["testing", "selenium", "test automation", "manual testing", "bug tracking"],
        bonus: ["cypress", "jest", "playwright", "postman", "jira", "agile", "api testing", "performance testing", "jmeter", "load testing", "regression testing", "test cases", "ci/cd", "python", "javascript", "sql"]
    },
    blockchain: {
        core: ["solidity", "ethereum", "smart contracts", "web3", "blockchain"],
        bonus: ["hardhat", "truffle", "ipfs", "defi", "nft", "rust", "javascript", "typescript", "metamask", "openzeppelin", "chainlink", "polygon", "layer 2", "consensus", "cryptography", "dapps"]
    },
    gamedev: {
        core: ["unity", "c#", "game design", "3d modeling", "game development"],
        bonus: ["unreal engine", "c++", "blender", "godot", "opengl", "vulkan", "directx", "physics engine", "shader programming", "animation", "ai pathfinding", "multiplayer", "steam", "git"]
    },
    embedded: {
        core: ["c", "c++", "embedded systems", "microcontrollers", "rtos"],
        bonus: ["arduino", "raspberry pi", "arm", "iot", "i2c", "spi", "uart", "pcb design", "vhdl", "verilog", "fpga", "linux", "assembly", "debugging", "oscilloscope", "can bus", "mqtt"]
    },
    productmanager: {
        core: ["product management", "roadmap", "agile", "stakeholder management", "user stories"],
        bonus: ["scrum", "jira", "confluence", "a/b testing", "data analysis", "sql", "analytics", "okrs", "kpis", "market research", "competitive analysis", "wireframing", "figma", "prioritization", "go-to-market", "sprint planning"]
    }
};

const roleAliases = {
    ds: "data",
    datascience: "data",
    "data science": "data",
    "data scientist": "data",
    "data analyst": "data",
    machinelearning: "ml",
    "machine learning": "ml",
    "ml engineer": "ml",
    "ai engineer": "ml",
    ai: "ml",
    fs: "fullstack",
    "full stack": "fullstack",
    "full-stack": "fullstack",
    be: "backend",
    fe: "frontend",
    "front end": "frontend",
    "front-end": "frontend",
    "back end": "backend",
    "back-end": "backend",
    "dev ops": "devops",
    "dev-ops": "devops",
    sre: "devops",
    "site reliability": "devops",
    "react native": "mobile",
    "mobile developer": "mobile",
    "mobile dev": "mobile",
    "android developer": "android",
    "android dev": "android",
    "ios developer": "ios",
    "ios dev": "ios",
    security: "cybersecurity",
    "cyber security": "cybersecurity",
    infosec: "cybersecurity",
    "information security": "cybersecurity",
    "cloud engineer": "cloud",
    "cloud architect": "cloud",
    "ui/ux": "uiux",
    "ui ux": "uiux",
    "ux designer": "uiux",
    "ui designer": "uiux",
    "product designer": "uiux",
    tester: "qa",
    "quality assurance": "qa",
    "test engineer": "qa",
    sdet: "qa",
    "web3": "blockchain",
    "smart contract": "blockchain",
    "game developer": "gamedev",
    "game dev": "gamedev",
    "game programmer": "gamedev",
    "embedded engineer": "embedded",
    "firmware engineer": "embedded",
    "iot engineer": "embedded",
    pm: "productmanager",
    "product manager": "productmanager",
    "product owner": "productmanager"
};

// ─────────────────────────────────────────────
// SKILL SYNONYMS (normalizes variant spellings)
// ─────────────────────────────────────────────

const skillSynonyms = {
    "node.js": "nodejs",
    "node": "nodejs",
    "react.js": "react",
    "reactjs": "react",
    "vue.js": "vue",
    "vuejs": "vue",
    "next.js": "next.js",
    "nextjs": "next.js",
    "nuxt.js": "nuxt",
    "nuxtjs": "nuxt",
    "express.js": "express",
    "expressjs": "express",
    "angular.js": "angular",
    "angularjs": "angular",
    "mongo": "mongodb",
    "mongo db": "mongodb",
    "postgres": "postgresql",
    "pg": "postgresql",
    "js": "javascript",
    "ts": "typescript",
    "py": "python",
    "tf": "tensorflow",
    "k8s": "kubernetes",
    "k8": "kubernetes",
    "kube": "kubernetes",
    "ci cd": "ci/cd",
    "cicd": "ci/cd",
    "continuous integration": "ci/cd",
    "continuous deployment": "ci/cd",
    "restful": "rest",
    "rest api": "api",
    "restful api": "api",
    "apis": "api",
    "amazon web services": "aws",
    "google cloud": "gcp",
    "google cloud platform": "gcp",
    "microsoft azure": "azure",
    "scikit learn": "scikit-learn",
    "sklearn": "scikit-learn",
    "tailwindcss": "tailwind",
    "tailwind css": "tailwind",
    "material-ui": "material ui",
    "mui": "material ui",
    "power bi": "powerbi",
    "react-native": "react native",
    "jetpack-compose": "jetpack compose",
    "objective c": "objective-c",
    "obj-c": "objective-c",
    "c sharp": "c#",
    "csharp": "c#"
};

// ─────────────────────────────────────────────
// SKILL NORMALIZATION
// ─────────────────────────────────────────────

const normalizeSkill = (skill) => {
    if (!skill) return "";
    let normalized = skill.toLowerCase().trim();
    // Strip trailing ".js" for generic comparison
    normalized = normalized.replace(/\.js$/g, "").trim();
    // Apply synonym mapping
    return skillSynonyms[normalized] || normalized;
};

// ─────────────────────────────────────────────
// SKILL MATCH SCORE  (0–100)
// ─────────────────────────────────────────────

const calculateSkillScore = (role, extractedSkills) => {
    const roleDef = roleSkills[role];
    if (!roleDef) return { score: 0, matchedSkills: [], missingSkills: [] };

    const normalizedExtracted = extractedSkills.map(s => normalizeSkill(s));

    // Check core skills (high weight)
    const matchedCore = roleDef.core.filter(skill =>
        normalizedExtracted.includes(normalizeSkill(skill))
    );
    const missingCore = roleDef.core.filter(skill =>
        !normalizedExtracted.includes(normalizeSkill(skill))
    );

    // Check bonus skills (lower weight)
    const matchedBonus = roleDef.bonus.filter(skill =>
        normalizedExtracted.includes(normalizeSkill(skill))
    );
    const missingBonus = roleDef.bonus.filter(skill =>
        !normalizedExtracted.includes(normalizeSkill(skill))
    );

    // Core skills account for 70% of the skill score, bonus for 30%
    const coreScore = roleDef.core.length > 0
        ? (matchedCore.length / roleDef.core.length) * 70
        : 0;

    // Cap bonus contribution — matching even a few bonus skills is good
    const bonusScore = roleDef.bonus.length > 0
        ? Math.min((matchedBonus.length / roleDef.bonus.length) * 30, 30)
        : 0;

    const score = Math.round(coreScore + bonusScore);

    return {
        score: Math.min(score, 100),
        matchedSkills: [...matchedCore, ...matchedBonus],
        missingSkills: [...missingCore, ...missingBonus.slice(0, 5)], // Limit missing bonus to top 5
        coreMatched: matchedCore.length,
        coreTotal: roleDef.core.length,
        bonusMatched: matchedBonus.length,
        bonusTotal: roleDef.bonus.length
    };
};

// ─────────────────────────────────────────────
// STRUCTURE SCORE  (0–100)
// ─────────────────────────────────────────────

const calculateStructureScore = (text) => {
    const lowerText = text.toLowerCase();
    let score = 0;

    // 1. Essential sections (max 40 pts)
    const essentialSections = [
        { keywords: ["experience", "work experience", "employment", "professional experience"], weight: 10 },
        { keywords: ["education", "academic", "qualification", "degree"], weight: 10 },
        { keywords: ["skills", "technical skills", "technologies", "competencies"], weight: 10 },
        { keywords: ["projects", "personal projects", "key projects", "portfolio"], weight: 10 },
    ];
    essentialSections.forEach(section => {
        if (section.keywords.some(kw => lowerText.includes(kw))) {
            score += section.weight;
        }
    });

    // 2. Valuable additional sections (max 15 pts)
    const additionalSections = [
        { keywords: ["summary", "objective", "profile", "about me", "professional summary"], weight: 5 },
        { keywords: ["certifications", "certificates", "certification"], weight: 5 },
        { keywords: ["achievements", "awards", "accomplishments", "honors"], weight: 5 },
    ];
    additionalSections.forEach(section => {
        if (section.keywords.some(kw => lowerText.includes(kw))) {
            score += section.weight;
        }
    });

    // 3. Contact information present (max 15 pts)
    const contactPatterns = [
        { regex: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/, weight: 5 },  // Email
        { regex: /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/, weight: 5 },  // Phone
        { regex: /linkedin\.com|github\.com|portfolio|website/i, weight: 5 },  // Links
    ];
    contactPatterns.forEach(p => {
        if (p.regex.test(text)) {
            score += p.weight;
        }
    });

    // 4. Formatting quality (max 20 pts)
    const lines = text.split("\n").filter(l => l.trim().length > 0);

    // Bullet points / list items
    const bulletLines = lines.filter(l => /^\s*[•\-\*\u2022\u25E6\u25AA\u2013\u2014>]\s/.test(l));
    if (bulletLines.length >= 5) score += 10;
    else if (bulletLines.length >= 2) score += 5;

    // Consistent line lengths (not too short, not too long) — indicates good formatting
    const avgLineLength = lines.reduce((sum, l) => sum + l.trim().length, 0) / (lines.length || 1);
    if (avgLineLength > 30 && avgLineLength < 120) score += 5;

    // Sufficient number of lines (not too sparse)
    if (lines.length >= 20) score += 5;
    else if (lines.length >= 10) score += 3;

    // 5. Resume length check (max 10 pts)
    const wordCount = text.split(/\s+/).filter(Boolean).length;
    if (wordCount >= 200 && wordCount <= 1000) score += 10;  // Ideal range
    else if (wordCount >= 100 && wordCount <= 1500) score += 5;
    // Too short or too long gets 0

    return Math.min(score, 100);
};

// ─────────────────────────────────────────────
// CONTENT SCORE  (0–100)
// ─────────────────────────────────────────────

const calculateContentScore = (text) => {
    const lowerText = text.toLowerCase();
    let score = 0;

    // 1. Action verbs (max 25 pts)
    const actionVerbs = [
        "developed", "built", "created", "implemented", "designed", "optimized",
        "led", "managed", "spearheaded", "analyzed", "architected", "deployed",
        "automated", "integrated", "refactored", "launched", "engineered",
        "improved", "reduced", "increased", "achieved", "delivered", "coordinated",
        "streamlined", "established", "maintained", "configured", "migrated",
        "collaborated", "mentored", "supervised", "resolved", "troubleshot",
        "contributed", "published", "presented", "researched", "tested",
        "documented", "facilitated", "scaled", "transformed", "pioneered"
    ];
    const actionRegex = new RegExp(`\\b(${actionVerbs.join("|")})\\b`, "gi");
    const actionMatches = text.match(actionRegex) || [];
    const uniqueActions = new Set(actionMatches.map(v => v.toLowerCase()));
    if (uniqueActions.size >= 8) score += 25;
    else if (uniqueActions.size >= 5) score += 18;
    else if (uniqueActions.size >= 3) score += 12;
    else if (uniqueActions.size >= 1) score += 5;

    // 2. Quantifiable metrics (max 25 pts)
    const percentages = text.match(/\d+\s*%/g) || [];
    const dollarAmounts = text.match(/\$[\d,]+/g) || [];
    const multipliers = text.match(/\d+x\b/gi) || [];
    const largeNumbers = text.match(/\b\d{3,}\b/g) || [];  // Numbers with 3+ digits (e.g., "500 users")
    const metricCount = percentages.length + dollarAmounts.length + multipliers.length + Math.min(largeNumbers.length, 5);

    if (metricCount >= 6) score += 25;
    else if (metricCount >= 4) score += 20;
    else if (metricCount >= 2) score += 12;
    else if (metricCount >= 1) score += 5;

    // 3. Technical depth — specific technologies, tools, versions mentioned (max 15 pts)
    const techPatterns = [
        /v\d+(\.\d+)*/gi,                           // Version numbers like v2.0, v16.8
        /\b(api|sdk|cli|orm|cdn|ci|cd)\b/gi,         // Technical acronyms
        /\b(aws|gcp|azure|docker|kubernetes)\b/gi,    // Cloud / infra
        /\b(sql|nosql|graphql|rest|grpc)\b/gi,        // Data / protocol patterns
    ];
    let techHits = 0;
    techPatterns.forEach(p => {
        const matches = text.match(p) || [];
        techHits += matches.length;
    });
    if (techHits >= 8) score += 15;
    else if (techHits >= 4) score += 10;
    else if (techHits >= 1) score += 5;

    // 4. Impact language — words that indicate outcome/result (max 15 pts)
    const impactWords = [
        "result", "impact", "outcome", "growth", "revenue", "efficiency",
        "performance", "scalability", "uptime", "throughput", "latency",
        "conversion", "engagement", "retention", "satisfaction", "adoption",
        "accuracy", "coverage", "reduction", "improvement", "savings"
    ];
    const impactRegex = new RegExp(`\\b(${impactWords.join("|")})\\b`, "gi");
    const impactMatches = text.match(impactRegex) || [];
    const uniqueImpact = new Set(impactMatches.map(w => w.toLowerCase()));
    if (uniqueImpact.size >= 5) score += 15;
    else if (uniqueImpact.size >= 3) score += 10;
    else if (uniqueImpact.size >= 1) score += 5;

    // 5. Content richness — word count & sentence quality (max 10 pts)
    const wordCount = text.split(/\s+/).filter(Boolean).length;
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 10);
    const avgWordsPerSentence = sentences.length > 0
        ? wordCount / sentences.length
        : 0;

    if (wordCount >= 250 && avgWordsPerSentence >= 8 && avgWordsPerSentence <= 25) score += 10;
    else if (wordCount >= 150) score += 5;

    // 6. Avoids filler / fluff (max 10 pts — start with 10, deduct for fluff)
    let fluffScore = 10;
    const fluffPhrases = [
        "hard worker", "team player", "go-getter", "self-starter",
        "think outside the box", "synergy", "leverage", "guru",
        "passionate about everything", "responsible for everything",
        "duties included", "tasks included"
    ];
    fluffPhrases.forEach(phrase => {
        if (lowerText.includes(phrase)) fluffScore -= 2;
    });
    score += Math.max(fluffScore, 0);

    return Math.min(score, 100);
};

// ─────────────────────────────────────────────
// FINAL ATS SCORE  (weighted combination)
// ─────────────────────────────────────────────

const calculateATSScore = (skillScore, structureScore, contentScore) => {
    // Weights: Skills 50%, Structure 25%, Content 25%
    return Math.round(
        (0.50 * skillScore) +
        (0.25 * structureScore) +
        (0.25 * contentScore)
    );
};

// ─────────────────────────────────────────────
// ROLE RESOLUTION
// ─────────────────────────────────────────────

const resolveRole = (requestedRole) => {
    const normalized = String(requestedRole || "").trim().toLowerCase();
    return roleAliases[normalized] || normalized;
};

const isValidRole = (role) => {
    return !!roleSkills[role];
};

const getSupportedRoles = () => {
    return Object.keys(roleSkills);
};

// ─────────────────────────────────────────────
// EXPORTS
// ─────────────────────────────────────────────

module.exports = {
    roleSkills,
    roleAliases,
    normalizeSkill,
    calculateSkillScore,
    calculateStructureScore,
    calculateContentScore,
    calculateATSScore,
    resolveRole,
    isValidRole,
    getSupportedRoles
};
