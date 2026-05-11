const skills = require("./skills");

const extractSkills = (text) => {
  if (!text) return [];

  const lowerText = text.toLowerCase();

  return skills.filter((skill) =>
    lowerText.includes(skill.toLowerCase())
  );
};

module.exports = extractSkills;