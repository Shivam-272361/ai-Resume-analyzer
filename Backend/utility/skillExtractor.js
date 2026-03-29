const skillsDB = [
  "c", "c++", "java", "python", "javascript",
  "react", "node", "express", "mongodb",
  "sql", "html", "css", "git", "docker",
  "aws", "machine learning", "tensorflow", "pytorch"
];

const escapeRegex = (str) => {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

const extractSkills = (text) => {
  const lowerText = text.toLowerCase();
  let found = [];

  skillsDB.forEach(skill => {
    const escapedSkill = escapeRegex(skill);
    const regex = new RegExp(`\\b${escapedSkill}\\b`, "i");

    if (regex.test(lowerText)) {
      found.push(skill);
    }
  });

  return [...new Set(found)];
};

module.exports = { extractSkills };