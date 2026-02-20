const fs = require("fs");
const pdfParse = require("pdf-parse");

// Industry skill sets
const skillSets = {
  programming: ["python", "java", "c++", "javascript", "sql"],
  web: ["react", "node", "express", "html", "css", "api", "rest"],
  ai_ml: [
    "machine learning",
    "deep learning",
    "nlp",
    "computer vision",
    "opencv",
    "scikit-learn",
    "pandas",
    "numpy",
    "tensorflow",
    "pytorch",
  ],
  databases: ["mongodb", "mysql", "postgresql"],
  tools: ["git", "github", "docker", "aws", "cloud", "power bi", "tableau"],
  fundamentals: [
    "data structures",
    "algorithms",
    "dbms",
    "operating systems",
    "computer networks",
  ],
};

// Count matches
const countMatches = (text, keywords) => {
  return keywords.filter((k) => text.includes(k)).length;
};

// Section-wise scoring
const evaluateSections = (text) => {
  const scores = {};

  scores.skills = countMatches(text, skillSets.programming.concat(skillSets.web, skillSets.ai_ml)) * 2;
  scores.projects = text.includes("project") ? 15 : 5;
  scores.experience = text.includes("intern") || text.includes("experience") ? 15 : 5;
  scores.achievements = /\d+%|\d+\+|\d+\s*(users|accuracy|projects)/i.test(text) ? 15 : 5;
  scores.formatting = text.includes("education") && text.includes("skills") ? 10 : 5;

  return scores;
};

// Missing skill detection
const detectMissingSkills = (text) => {
  const missing = [];

  Object.entries(skillSets).forEach(([category, skills]) => {
    const absent = skills.filter((s) => !text.includes(s));
    if (absent.length > 0) {
      missing.push(`${category.toUpperCase()}: ${absent.slice(0, 5).join(", ")}`);
    }
  });

  return missing;
};

// Generate realistic suggestions
const generateSuggestions = (text) => {
  const suggestions = [];

  if (!/\d+%|\d+\+|\d+\s*(users|accuracy|models)/i.test(text)) {
    suggestions.push(
      "Add quantified achievements (e.g., improved accuracy by 15%, handled 1000+ users)."
    );
  }

  if (!text.includes("github")) {
    suggestions.push("Include GitHub links to showcase project implementations.");
  }

  if (!text.includes("impact") && !text.includes("improved")) {
    suggestions.push(
      "Describe the impact of your projects (e.g., optimized performance, increased efficiency)."
    );
  }

  if (!text.includes("cloud") && !text.includes("aws")) {
    suggestions.push(
      "Consider adding cloud or deployment experience (AWS, Docker, CI/CD) to strengthen profile."
    );
  }

  return suggestions;
};

exports.uploadResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No resume file uploaded" });
    }

    const buffer = fs.readFileSync(req.file.path);
    const pdfData = await pdfParse(buffer);
    const text = pdfData.text.toLowerCase();

    // Section scoring
    const sectionScores = evaluateSections(text);
    const totalScore = Math.min(
      Object.values(sectionScores).reduce((a, b) => a + b, 0),
      100
    );

    const missingSkills = detectMissingSkills(text);
    const suggestions = generateSuggestions(text);

    const analysis = `
📊 AI Resume Analysis Report

🔢 Overall ATS Score: ${totalScore}/100

📌 Section-wise Evaluation:
• Skills Coverage: ${sectionScores.skills}/30
• Projects Quality: ${sectionScores.projects}/15
• Experience Strength: ${sectionScores.experience}/15
• Quantified Achievements: ${sectionScores.achievements}/15
• ATS Formatting & Structure: ${sectionScores.formatting}/10

🧩 Missing Skills (based on industry expectations):
${missingSkills.map((m) => `- ${m}`).join("\n")}

📌 Actionable Improvement Suggestions:
${suggestions.map((s) => `- ${s}`).join("\n")}

🧠 Summary:
Your resume demonstrates relevant technical exposure and project experience.
Enhancing quantified impact, adding advanced tools, and highlighting deployment/cloud skills
will significantly improve ATS ranking and recruiter appeal.

📄 Extracted Text Length: ${text.length} characters
`;

    res.status(200).json({ analysis });
  } catch (error) {
    console.error("Resume Upload Error:", error);
    res.status(500).json({ error: "Server error while analyzing resume" });
  }
};